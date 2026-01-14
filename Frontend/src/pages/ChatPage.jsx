import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Search,
  MessageCircle,
  User,
  Check,
  CheckCheck,
  Loader,
  Circle,
  X,
  Trash2,
  MoreVertical,
  Pencil,
  Save,
  Lock,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  editMessage,
  deleteConversation,
} from '../api/messages';
import { getUserProfileById } from '../api/users';
import signalRService from '../services/signalrService';
import { useAuth } from '../context/AuthContext';
import { useSignalR } from '../context/SignalRContext';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

const ChatPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, emailConfirmed, resendConfirmationEmail } = useAuth();
  const [sendingVerification, setSendingVerification] = useState(false);
  const { 
    newMessage, 
    clearNewMessage, 
    onlineUserIds, 
    resetUnreadCount,
    joinConversation: signalRJoin,
    leaveConversation: signalRLeave,
    isConnected: signalRConnected,
    setCurrentConversationUser
  } = useSignalR();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // State
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [messageMenuOpen, setMessageMenuOpen] = useState(null); // Track which message's menu is open
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedMessageText, setEditedMessageText] = useState('');
  const [savingEditMessageId, setSavingEditMessageId] = useState(null);
  const [deletingConversationId, setDeletingConversationId] = useState(null);
  const [showDeleteConversationModal, setShowDeleteConversationModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  
  // Helper function to check if user is online
  const isUserOnline = (userId) => onlineUserIds.includes(userId);

  // Initialize SignalR and fetch conversations
  useEffect(() => {
    initializeChat();

    return () => {
      // Cleanup: leave conversation and clear current conversation user
      if (selectedConversation) {
        signalRService.leaveConversation(selectedConversation.otherUser?.id);
      }
      // Clear current conversation user so new messages will increment unread count
      setCurrentConversationUser(null);
    };
  }, []);

  // Handle URL query param OR navigation state for pre-selecting user OR auto-select first conversation
  useEffect(() => {
    // Don't do anything if still loading or already have a selected conversation
    if (loadingConversations || selectedConversation) return;
    
    // Check both URL params and navigation state
    const userId = searchParams.get('user') || location.state?.selectedUserId;
    
    if (userId) {
      // If user ID is specified, select that conversation or create virtual one
      const conv = conversations.find((c) => c.otherUser?.id === userId);
      if (conv) {
        handleSelectConversation(conv);
      } else {
        // No existing conversation found - create a virtual conversation
        createVirtualConversation(userId);
      }
    } else if (conversations.length > 0) {
      // Auto-select the first conversation only if we have conversations
      handleSelectConversation(conversations[0]);
    }
  }, [conversations, loadingConversations, searchParams, location.state]);

  // Create a virtual conversation when navigating to message a user with no existing conversation
  const createVirtualConversation = async (userId) => {
    try {
      const userProfile = await getUserProfileById(userId);
      
      // Create a virtual conversation object
      const virtualConversation = {
        id: `virtual-${userId}`, // Temporary ID
        otherUser: {
          id: userProfile.id,
          username: userProfile.username,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          profilePictureUrl: userProfile.profilePictureUrl,
        },
        lastMessageText: '',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        isVirtual: true, // Flag to indicate this is temporary
      };

      setSelectedConversation(virtualConversation);
      setShowMobileChat(true);
      setMessages([]);
      
      // Tell SignalR context which user we're chatting with
      setCurrentConversationUser(userProfile.id);
      
      // Join conversation
      if (userProfile.id) {
        await signalRJoin(userProfile.id);
      }
    } catch (error) {
      console.error('Error creating virtual conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close message menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (messageMenuOpen) {
        setMessageMenuOpen(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [messageMenuOpen]);

  // Reset unread count when entering chat page
  useEffect(() => {
    resetUnreadCount();
  }, []);

  // Handle new messages from global SignalR context
  useEffect(() => {
    if (newMessage) {
      handleNewMessage(newMessage);
      clearNewMessage();
    }
  }, [newMessage]);


  const initializeChat = async () => {
    // SignalR connection is managed by global SignalRContext
    // Just fetch conversations here
    await fetchConversations();
  };

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await getConversations(1, 50);
      setConversations(data?.items || []);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    // Leave previous conversation
    if (selectedConversation?.otherUser?.id) {
      await signalRLeave(selectedConversation.otherUser.id);
    }

    // Immediately reset unread count for this conversation in UI
    setConversations((prev) =>
      prev.map((c) => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
    );

    setSelectedConversation({ ...conversation, unreadCount: 0 });
    setShowMobileChat(true);

    // Tell SignalR context which user we're chatting with (to prevent unread increment)
    setCurrentConversationUser(conversation.otherUser?.id);

    // Join new conversation
    if (conversation.otherUser?.id) {
      await signalRJoin(conversation.otherUser.id);
    }

    // Fetch messages
    await fetchMessages(conversation);
  };

  const fetchMessages = async (conversation) => {
    const otherUserId = conversation?.otherUser?.id;
    const conversationId = conversation?.id;
    if (!otherUserId) return;

    try {
      setLoadingMessages(true);
      const data = await getMessages(otherUserId, 1, 100);
      const items = data?.items || [];
      // Reverse to show oldest first (API returns newest first)
      const sortedMessages = [...items].reverse();
      setMessages(sortedMessages);

      // Get the last message to update conversation
      const lastMessage = sortedMessages[sortedMessages.length - 1];

      // Mark unread messages as read
      const unreadMessages = items.filter(
        (m) => !m.isRead && m.senderId !== user?.id
      );
      for (const msg of unreadMessages) {
        await markAsRead(msg.id);
      }

      // Update conversation: reset unread count AND update last message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              unreadCount: 0,
              lastMessageText: lastMessage?.text || c.lastMessageText,
              lastMessageAt: lastMessage?.createdAt || c.lastMessageAt,
            };
          }
          return c;
        })
      );
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleNewMessage = (message) => {
    // Determine the other user ID in this message
    const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
    
    // Check if message is for current conversation
    const isCurrentConversation =
      selectedConversation &&
      selectedConversation.otherUser?.id === otherUserId;

    // Skip if this is our own message (we already handled it in handleSendMessage)
    if (message.senderId === user?.id) {
      // Still add to messages if not there (in case of page refresh)
      if (isCurrentConversation) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
      return;
    }

    if (isCurrentConversation) {
      // Add to messages if not already there (avoid duplicates)
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });

      // Mark as read if from other user
      markAsRead(message.id);
    }

    // Update conversation list with last message (only for incoming messages)
    // NOTE: Don't increment unreadCount here - SignalRContext already handles it
    setConversations((prev) =>
      prev.map((c) => {
        if (c.otherUser?.id === otherUserId) {
          return {
            ...c,
            lastMessageText: message.text,
            lastMessageAt: message.createdAt,
            // Reset unread count to 0 if current conversation (SignalRContext will handle increment for others)
            unreadCount: isCurrentConversation ? 0 : (c.unreadCount || 0),
          };
        }
        return c;
      })
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation?.otherUser?.id) return;

    const textToSend = messageText.trim();
    const otherUserId = selectedConversation.otherUser.id;
    const conversationId = selectedConversation.id;
    const isVirtual = selectedConversation.isVirtual;
    setMessageText(''); // Clear immediately for better UX

    try {
      setSending(true);
      const newMessage = await sendMessage(otherUserId, textToSend);

      // Add message to local state immediately
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });

      inputRef.current?.focus();

      // If this was a virtual conversation, refresh conversations to get the real one
      if (isVirtual) {
        const freshConversations = await getConversations(1, 50);
        const convList = freshConversations?.items || [];
        setConversations(convList);
        
        // Find and select the newly created conversation
        const newConv = convList.find((c) => c.otherUser?.id === otherUserId);
        if (newConv) {
          setSelectedConversation({
            ...newConv,
            unreadCount: 0,
          });
          setCurrentConversationUser(otherUserId);
        }
      } else {
        // Update existing conversation with the sent message text
        const sentText = newMessage.text || textToSend;
        
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === conversationId) {
              return {
                ...c,
                lastMessageText: sentText,
                lastMessageAt: newMessage.createdAt || new Date().toISOString(),
                unreadCount: 0,
              };
            }
            return c;
          })
        );
      }
    } catch (error) {
      toast.error('Failed to send message');
      setMessageText(textToSend); // Restore text on error
    } finally {
      setSending(false);
    }
  };

  // Delete message handler
  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;
    
    try {
      setDeletingMessageId(messageId);
      await deleteMessage(messageId);
      
      // Remove from local state
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      
      // Update conversation's last message if needed
      const remainingMessages = messages.filter((m) => m.id !== messageId);
      const lastMessage = remainingMessages[remainingMessages.length - 1];
      
      if (lastMessage) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === selectedConversation?.id) {
              return {
                ...c,
                lastMessageText: lastMessage.text,
                lastMessageAt: lastMessage.createdAt,
              };
            }
            return c;
          })
        );
      }
      
      toast.success('Message deleted');
      setMessageMenuOpen(null);
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const startEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditedMessageText(message.text || '');
    setMessageMenuOpen(null);
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditedMessageText('');
  };

  const handleSaveEditedMessage = async (messageId) => {
    const trimmedText = editedMessageText.trim();
    if (!trimmedText) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      setSavingEditMessageId(messageId);
      const updated = await editMessage(messageId, trimmedText);
      const updatedText = updated?.text || trimmedText;
      const isLastMessage = messages[messages.length - 1]?.id === messageId;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, ...updated, text: updatedText }
            : m
        )
      );

      if (isLastMessage) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation?.id
              ? {
                  ...c,
                  lastMessageText: updatedText,
                  lastMessageAt: updated?.updatedAt || updated?.createdAt || c.lastMessageAt,
                }
              : c
          )
        );
      }

      toast.success('Message updated');
      setEditingMessageId(null);
      setEditedMessageText('');
    } catch (error) {
      toast.error('Failed to update message');
    } finally {
      setSavingEditMessageId(null);
    }
  };

  const openDeleteConversation = (conversation, e) => {
    if (e) e.stopPropagation();
    setConversationToDelete(conversation);
    setShowDeleteConversationModal(true);
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;
    try {
      setDeletingConversationId(conversationToDelete.id);
      await deleteConversation(conversationToDelete.id);

      setConversations((prev) =>
        prev.filter((c) => c.id !== conversationToDelete.id)
      );

      if (selectedConversation?.id === conversationToDelete.id) {
        setSelectedConversation(null);
        setMessages([]);
        setShowMobileChat(false);
        setCurrentConversationUser(null);
      }

      toast.success('Conversation deleted');
      setShowDeleteConversationModal(false);
      setConversationToDelete(null);
    } catch (error) {
      toast.error('Failed to delete conversation');
    } finally {
      setDeletingConversationId(null);
    }
  };

  // Note: Using startEditMessage/handleSaveEditedMessage and openDeleteConversation functions above

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getProfilePicture = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const filteredConversations = conversations.filter((c) =>
    c.otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.otherUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.otherUser?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle resend verification from lock screen
  const handleResendVerification = async () => {
    setSendingVerification(true);
    await resendConfirmationEmail();
    setSendingVerification(false);
  };

  // Email verification lock screen
  if (!emailConfirmed) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-stone-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600" />
            </button>
            <h1 className="text-lg font-bold text-stone-900">Messages</h1>
          </div>
        </div>

        {/* Lock Screen */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-amber-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-stone-900 mb-3">
              Email Verification Required
            </h2>
            
            <p className="text-stone-600 mb-6">
              Please verify your email address to start chatting with other members. 
              Check your inbox for the verification link.
            </p>

            <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 text-left">
                <Mail className="w-5 h-5 text-stone-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-stone-500">Verification sent to</p>
                  <p className="font-medium text-stone-900 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleResendVerification}
              disabled={sendingVerification}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {sendingVerification ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Resend Verification Email
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/')}
              className="mt-4 text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600" />
            </button>
            <h1 className="text-lg font-bold text-stone-900">Messages</h1>
          </div>
          
          {signalRConnected ? (
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
              <Circle className="w-2 h-2 fill-current" />
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-stone-400 text-sm">
              <Circle className="w-2 h-2" />
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full">
        {/* Conversations Sidebar */}
        <div
          className={`w-full md:w-80 bg-white border-r border-stone-200 flex flex-col ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search */}
          <div className="p-3 border-b border-stone-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-stone-100 rounded-lg">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="flex-1 bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="flex items-center justify-center h-40">
                <Loader className="w-6 h-6 text-stone-400 animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                <MessageCircle className="w-10 h-10 text-stone-300 mb-2" />
                <p className="text-stone-500 text-sm">No conversations yet</p>
                <p className="text-stone-400 text-xs mt-1">
                  Start a conversation with someone
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectConversation(conv);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors text-left group cursor-pointer ${
                    selectedConversation?.id === conv.id ? 'bg-stone-100' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden">
                      {conv.otherUser?.profilePictureUrl ? (
                        <img
                          src={getProfilePicture(conv.otherUser.profilePictureUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-700 text-white text-lg font-medium">
                          {conv.otherUser?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    {isUserOnline(conv.otherUser?.id) && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-stone-900 truncate">
                        {conv.otherUser?.firstName
                          ? `${conv.otherUser.firstName} ${conv.otherUser.lastName || ''}`
                          : conv.otherUser?.username || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400">
                          {formatDate(conv.lastMessageAt)}
                        </span>
                        <button
                          onClick={(e) => openDeleteConversation(conv, e)}
                          className="p-1 rounded-md hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={deletingConversationId === conv.id}
                          aria-label="Delete conversation"
                        >
                          {deletingConversationId === conv.id ? (
                            <Loader className="w-3.5 h-3.5 text-stone-400 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 text-stone-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm text-stone-500 truncate">
                        {/* Show last message from messages array if this is selected conversation */}
                        {selectedConversation?.id === conv.id && messages.length > 0
                          ? messages[messages.length - 1]?.text
                          : conv.lastMessageText || 'No messages yet'}
                      </p>
                      {/* Hide badge if this is the currently selected conversation */}
                      {conv.unreadCount > 0 && selectedConversation?.id !== conv.id && (
                        <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-stone-50 ${
            !showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1 hover:bg-stone-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5 text-stone-600" />
                </button>

                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
                    {selectedConversation.otherUser?.profilePictureUrl ? (
                      <img
                        src={getProfilePicture(selectedConversation.otherUser.profilePictureUrl)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-700 text-white font-medium">
                        {selectedConversation.otherUser?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  {isUserOnline(selectedConversation.otherUser?.id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div>
                  <p className="font-medium text-stone-900">
                    {selectedConversation.otherUser?.firstName
                      ? `${selectedConversation.otherUser.firstName} ${selectedConversation.otherUser.lastName || ''}`
                      : selectedConversation.otherUser?.username || 'Unknown'}
                  </p>
                  <p className="text-xs text-stone-500">
                    {isUserOnline(selectedConversation.otherUser?.id)
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-6 h-6 text-stone-400 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="w-12 h-12 text-stone-300 mb-3" />
                    <p className="text-stone-500">No messages yet</p>
                    <p className="text-sm text-stone-400 mt-1">
                      Send a message to start the conversation
                    </p>
                  </div>
                ) : (
                  messages.map((message, idx) => {
                    const isOwn = message.senderId === user?.id;
                    const showDate =
                      idx === 0 ||
                      formatDate(message.createdAt) !==
                        formatDate(messages[idx - 1]?.createdAt);
                    const isMenuOpen = messageMenuOpen === message.id;
                    const isDeleting = deletingMessageId === message.id;

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 bg-stone-200 text-stone-600 text-xs rounded-full">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-1 group ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* Delete button - before message for own messages */}
                          {isOwn && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMessageMenuOpen(isMenuOpen ? null : message.id);
                                }}
                                className="p-1.5 rounded-full hover:bg-stone-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader className="w-4 h-4 text-stone-400 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-4 h-4 text-stone-400" />
                                )}
                              </button>
                              
                              {/* Dropdown Menu */}
                              {isMenuOpen && (
                                <div className="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-10 min-w-[140px]">
                                  <button
                                    onClick={() => startEditMessage(message)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                              isOwn
                                ? 'bg-stone-900 text-white rounded-br-md'
                                : 'bg-white text-stone-900 rounded-bl-md shadow-sm'
                            } ${isDeleting ? 'opacity-50' : ''}`}
                          >
                            {editingMessageId === message.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editedMessageText}
                                  onChange={(e) => setEditedMessageText(e.target.value)}
                                  rows={2}
                                  className="w-full text-sm bg-white text-stone-900 rounded-lg p-2 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={cancelEditMessage}
                                    disabled={savingEditMessageId === message.id}
                                    className="text-xs px-2 py-1 rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEditedMessage(message.id)}
                                    disabled={savingEditMessageId === message.id}
                                    className="text-xs px-2 py-1 rounded-md bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 flex items-center gap-1"
                                  >
                                    {savingEditMessageId === message.id ? (
                                      <>
                                        <Loader className="w-3 h-3 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      'Save'
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.text}
                              </p>
                            )}
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                isOwn ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <span
                                className={`text-xs ${
                                  isOwn ? 'text-stone-400' : 'text-stone-500'
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </span>
                              {isOwn && (
                                message.isRead ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-stone-400" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-stone-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      ref={inputRef}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-4 py-2.5 bg-stone-100 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                      style={{ maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    className="p-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-stone-400" />
              </div>
              <h2 className="text-xl font-semibold text-stone-900 mb-2">
                Your Messages
              </h2>
              <p className="text-stone-500 max-w-sm">
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Conversation Modal */}
      {showDeleteConversationModal && conversationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Delete Conversation
            </h3>
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete this conversation with{' '}
              <span className="font-medium">
                {conversationToDelete.otherUser?.firstName ||
                  conversationToDelete.otherUser?.username ||
                  'this user'}
              </span>
              ? This will remove all messages and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConversationModal(false);
                  setConversationToDelete(null);
                }}
                className="px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                disabled={deletingConversationId === conversationToDelete?.id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deletingConversationId === conversationToDelete?.id ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
