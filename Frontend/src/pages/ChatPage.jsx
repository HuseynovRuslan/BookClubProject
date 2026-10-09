import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
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
import { Avatar, Button, ButtonLink, Dialog, EmptyState, Eyebrow, Icon, SearchField } from '../components/app/ui';
import { displayName, formatDate } from '../components/app/format';
import '../styles/app/messages.css';

// Bookla 2.0 "Mesajlar" (Make "Messages"): conversations from the API, real-time updates through
// SignalR (new messages, online status, read receipts), edit/delete own messages, delete conversations
// and start a new conversation from ?user=<id> or from navigation state ({ selectedUserId }).

const pad = (value) => String(value).padStart(2, '0');

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Whole days between the date and today (0 = today, 1 = yesterday).
const daysAgo = (date) => {
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
};

const clockTime = (value) => {
  const date = toDate(value);
  return date ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : '';
};

const dayKey = (value) => toDate(value)?.toDateString() || '';

// Day separator in the conversation: "Bu gün", "Dünən", "9 okt 2026".
const dayLabel = (value) => {
  const date = toDate(value);
  if (!date) return '';
  const days = daysAgo(date);
  if (days === 0) return 'Bu gün';
  if (days === 1) return 'Dünən';
  return formatDate(date);
};

// Time of the last message in the conversation list: "14:05", "dünən", "9 okt".
const listTime = (value) => {
  const date = toDate(value);
  if (!date) return '';
  const days = daysAgo(date);
  if (days === 0) return clockTime(date);
  if (days === 1) return 'dünən';
  const text = formatDate(date);
  return date.getFullYear() === new Date().getFullYear() ? text.replace(/ \d{4}$/, '') : text;
};

const profilePath = (person) => `/profile/${person?.username || person?.id}`;

// Read receipt: one tick when sent, two when the other reader has opened it.
const ReceiptIcon = ({ read }) => (
  <svg aria-hidden="true" className="icon" height="14" viewBox="0 0 24 24" width={read ? 17 : 14}>
    {read ? (
      <>
        <path d="m2 12.5 4.5 4.5L16 7.5" />
        <path d="m11.5 16.5.5.5 9.5-9.5" />
      </>
    ) : (
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    )}
  </svg>
);

const LockIcon = () => (
  <svg aria-hidden="true" className="icon" height="30" viewBox="0 0 24 24" width="30">
    <rect height="10" rx="2" width="14" x="5" y="11" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const PageHeading = ({ children }) => (
  <header className="page-heading-row">
    <div>
      <Eyebrow>ŞƏXSİ SÖHBƏTLƏR</Eyebrow>
      <h1>Mesajlar</h1>
      <p>Oxuduqlarınız haqqında sakit və şəxsi söhbətlər.</p>
    </div>
    {children}
  </header>
);

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, emailConfirmed, resendConfirmationEmail } = useAuth();
  const [sendingVerification, setSendingVerification] = useState(false);
  const {
    newMessage,
    clearNewMessage,
    onlineUserIds,
    resetUnreadCount,
    setTotalUnreadCount,
    joinConversation: signalRJoin,
    leaveConversation: signalRLeave,
    isConnected: signalRConnected,
    setCurrentConversationUser,
  } = useSignalR();
  const messagesBoxRef = useRef(null);
  const inputRef = useRef(null);
  // The other reader of the conversation on screen. Lets a late history response for a conversation the
  // reader already left be ignored, and lets the unmount cleanup leave the right SignalR group.
  const activeUserRef = useRef(null);

  // State
  const [conversations, setConversations] = useState([]);
  const [conversationsError, setConversationsError] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesError, setMessagesError] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      if (activeUserRef.current) {
        signalRService.leaveConversation(activeUserRef.current);
      }
      // Clear current conversation user so new messages will increment unread count
      setCurrentConversationUser(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      activeUserRef.current = userProfile.id;
      setSelectedConversation(virtualConversation);
      setMessages([]);
      setMessagesError(false);
      setLoadingMessages(false);

      // Tell SignalR context which user we're chatting with
      setCurrentConversationUser(userProfile.id);

      // Join conversation
      if (userProfile.id) {
        await signalRJoin(userProfile.id);
      }
    } catch (error) {
      console.error('Error creating virtual conversation:', error);
      toast.error('Söhbətə başlamaq mümkün olmadı');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close message menu when clicking outside (or pressing Escape)
  useEffect(() => {
    if (!messageMenuOpen) return undefined;
    const closeMenu = () => setMessageMenuOpen(null);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [messageMenuOpen]);

  // Reset unread count when entering chat page
  useEffect(() => {
    resetUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the "Mesajlar" badge in the header equal to the unread messages of the conversations that are not
  // open (the open one is marked as read). Runs after the list loads and after every change to it.
  const selectedConversationId = selectedConversation?.id;
  useEffect(() => {
    if (loadingConversations || conversationsError) return;
    setTotalUnreadCount(
      conversations.reduce((sum, c) => (c.id === selectedConversationId ? sum : sum + (c.unreadCount || 0)), 0)
    );
  }, [conversations, conversationsError, loadingConversations, selectedConversationId, setTotalUnreadCount]);

  // Handle new messages from global SignalR context
  useEffect(() => {
    if (newMessage) {
      handleNewMessage(newMessage);
      clearNewMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  // Handle message read events from SignalR
  useEffect(() => {
    const unsubMessageRead = signalRService.onMessageRead((data) => {
      // Update message status when receiver reads it
      // Backend sends MessageId (PascalCase), but JavaScript converts it to messageId (camelCase)
      const messageId = data?.messageId || data?.MessageId;
      if (messageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isRead: true, readAt: data.readAt || data.ReadAt }
              : msg
          )
        );
      }
    });

    return () => {
      unsubMessageRead();
    };
  }, []);

  const initializeChat = async () => {
    // SignalR connection is managed by global SignalRContext
    // Just fetch conversations here
    await fetchConversations();
  };

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      setConversationsError(false);
      const data = await getConversations(1, 50);
      setConversations(data?.items || []);
    } catch {
      setConversationsError(true);
      toast.error('Söhbətləri yükləmək mümkün olmadı');
    } finally {
      setLoadingConversations(false);
    }
  };

  // Reload the list without the loading state (a message arrived from a reader who is not in it yet).
  const refreshConversationsQuietly = async () => {
    try {
      const data = await getConversations(1, 50);
      const list = data?.items || [];
      setConversations(list);
      // A conversation started from a profile becomes the real one once the server has it.
      setSelectedConversation((current) => {
        if (!current?.isVirtual) return current;
        const real = list.find((c) => c.otherUser?.id === current.otherUser?.id);
        return real ? { ...real, unreadCount: 0 } : current;
      });
    } catch (error) {
      console.error('Error refreshing conversations:', error);
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
    activeUserRef.current = conversation.otherUser?.id || null;
    setMessages([]);
    setMessageMenuOpen(null);
    setEditingMessageId(null);
    setEditedMessageText('');

    // Tell SignalR context which user we're chatting with (to prevent unread increment)
    setCurrentConversationUser(conversation.otherUser?.id);

    // Join the new conversation and fetch its messages. Joining waits for the hub connection (up to 3 s
    // when it is down), so both run together and the history never waits for SignalR.
    await Promise.all([
      conversation.otherUser?.id ? signalRJoin(conversation.otherUser.id) : null,
      fetchMessages(conversation),
    ]);
  };

  const fetchMessages = async (conversation) => {
    const otherUserId = conversation?.otherUser?.id;
    const conversationId = conversation?.id;
    if (!otherUserId) return;
    const isActive = () => activeUserRef.current === otherUserId;
    let loaded = false;

    try {
      setLoadingMessages(true);
      setMessagesError(false);
      const data = await getMessages(otherUserId, 1, 100);
      const items = data?.items || [];
      // Reverse to show oldest first (API returns newest first)
      const sortedMessages = [...items].reverse();
      if (isActive()) {
        setMessages(sortedMessages);
        setLoadingMessages(false);
      }
      loaded = true;

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
    } catch {
      if (!loaded && isActive()) setMessagesError(true);
      toast.error('Mesajları yükləmək mümkün olmadı');
    } finally {
      if (isActive()) setLoadingMessages(false);
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

    // A reader who is not in the list yet (first message to us): reload the list from the server.
    if (!conversations.some((c) => c.otherUser?.id === otherUserId)) {
      refreshConversationsQuietly();
      return;
    }

    // Update conversation list with last message (only for incoming messages). The header badge
    // (SignalRContext) is kept in step with these counts by the effect above.
    setConversations((prev) =>
      prev.map((c) => {
        if (c.otherUser?.id === otherUserId) {
          return {
            ...c,
            lastMessageText: message.text,
            lastMessageAt: message.createdAt,
            // Current conversation stays read; any other one shows the new unread message in the list
            unreadCount: isCurrentConversation ? 0 : (c.unreadCount || 0) + 1,
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
    } catch {
      toast.error('Mesajı göndərmək mümkün olmadı');
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

      toast.success('Mesaj silindi');
      setMessageMenuOpen(null);
    } catch {
      toast.error('Mesajı silmək mümkün olmadı');
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
      toast.error('Mesaj boş ola bilməz');
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
            ? { ...m, ...updated, text: updatedText, isEdited: true }
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

      toast.success('Mesaj yeniləndi');
      setEditingMessageId(null);
      setEditedMessageText('');
    } catch {
      toast.error('Mesajı yeniləmək mümkün olmadı');
    } finally {
      setSavingEditMessageId(null);
    }
  };

  const openDeleteConversation = (conversation, e) => {
    if (e) e.stopPropagation();
    setConversationToDelete(conversation);
    setShowDeleteConversationModal(true);
  };

  const closeDeleteConversation = () => {
    setShowDeleteConversationModal(false);
    setConversationToDelete(null);
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
        activeUserRef.current = null;
        setSelectedConversation(null);
        setMessages([]);
        setCurrentConversationUser(null);
      }

      toast.success('Söhbət silindi');
      setShowDeleteConversationModal(false);
      setConversationToDelete(null);
    } catch {
      toast.error('Söhbəti silmək mümkün olmadı');
    } finally {
      setDeletingConversationId(null);
    }
  };

  // Scroll the message pane (not the page) to the newest message.
  const scrollToBottom = () => {
    const box = messagesBoxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  };

  const searchText = searchTerm.trim().toLocaleLowerCase('az');
  const filteredConversations = conversations.filter((c) => {
    if (!searchText) return true;
    const person = c.otherUser;
    return [person?.username, person?.firstName, person?.lastName, displayName(person)]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase('az').includes(searchText));
  });

  // Handle resend verification from lock screen
  const handleResendVerification = async () => {
    setSendingVerification(true);
    await resendConfirmationEmail();
    setSendingVerification(false);
  };

  // Email verification lock screen
  if (!emailConfirmed) {
    return (
      <div className="page messages-page">
        <PageHeading />
        <section aria-labelledby="messages-locked-title" className="messages-locked">
          <span className="locked-mark">
            <LockIcon />
          </span>
          <Eyebrow>E-POÇT TƏSDİQİ</Eyebrow>
          <h2 id="messages-locked-title">Mesajlaşmaq üçün e-poçtunu təsdiqlə</h2>
          <p>
            Digər oxucularla yazışmağa başlamaq üçün e-poçt ünvanını təsdiqləməlisən. Təsdiq linki gələnlər
            qutuna göndərilib.
          </p>
          {user?.email && (
            <p className="locked-email">
              <span>Təsdiq linki göndərilən ünvan</span>
              <strong>{user.email}</strong>
            </p>
          )}
          <Button aria-busy={sendingVerification} disabled={sendingVerification} onClick={handleResendVerification}>
            {sendingVerification ? 'Göndərilir…' : 'Təsdiq məktubunu yenidən göndər'}
          </Button>
        </section>
      </div>
    );
  }

  const requestedUserId = searchParams.get('user') || location.state?.selectedUserId;
  const listUnavailable = !loadingConversations && !selectedConversation && !requestedUserId;
  const selectedPerson = selectedConversation?.otherUser;
  const selectedName = displayName(selectedPerson);
  const selectedOnline = isUserOnline(selectedPerson?.id);

  const renderConversationButton = (conv) => {
    const person = conv.otherUser;
    const name = displayName(person);
    const active = selectedConversation?.id === conv.id;
    const online = isUserOnline(person?.id);
    // Show last message from messages array if this is selected conversation
    const preview = active && messages.length > 0 ? messages[messages.length - 1]?.text : conv.lastMessageText;
    // Hide badge if this is the currently selected conversation
    const unread = !active && conv.unreadCount > 0 ? conv.unreadCount : 0;

    return (
      <button
        aria-current={active ? 'true' : undefined}
        className={active ? 'active' : ''}
        key={conv.id}
        onClick={() => handleSelectConversation(conv)}
        type="button"
      >
        <span className="avatar-wrap">
          <Avatar name={name} size="small" src={person?.profilePictureUrl} />
          {online && <span className="presence" />}
        </span>
        <span>
          <strong>{name}</strong>
          <small>{conv.isVirtual ? 'Yeni söhbət' : preview || 'Hələ mesaj yoxdur'}</small>
          {online && <span className="sr-only">Onlayn</span>}
        </span>
        <span className="conversation-side">
          {!conv.isVirtual && conv.lastMessageAt && (
            <time dateTime={conv.lastMessageAt}>{listTime(conv.lastMessageAt)}</time>
          )}
          {unread > 0 && (
            <i>
              {unread > 9 ? '9+' : unread}
              <span className="sr-only"> oxunmamış mesaj</span>
            </i>
          )}
        </span>
      </button>
    );
  };

  const renderMessage = (message, idx) => {
    const isOwn = message.senderId === user?.id;
    const showDate = idx === 0 || dayKey(message.createdAt) !== dayKey(messages[idx - 1]?.createdAt);
    const isMenuOpen = messageMenuOpen === message.id;
    const isDeleting = deletingMessageId === message.id;
    const isEditing = editingMessageId === message.id;
    const isSaving = savingEditMessageId === message.id;
    const side = isOwn ? 'outgoing' : 'incoming';

    return (
      <Fragment key={message.id}>
        {showDate && <span className="day-label">{dayLabel(message.createdAt)}</span>}
        <div aria-busy={isDeleting || undefined} className={`message-row ${side} ${isDeleting ? 'is-busy' : ''}`}>
          <div className={`bubble ${side} ${isEditing ? 'editing' : ''}`}>
            {isEditing ? (
              <div className="bubble-edit">
                <label className="sr-only" htmlFor={`edit-message-${message.id}`}>
                  Mesajı redaktə et
                </label>
                <textarea
                  autoFocus
                  disabled={isSaving}
                  id={`edit-message-${message.id}`}
                  onChange={(e) => setEditedMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEditMessage();
                    } else if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      handleSaveEditedMessage(message.id);
                    }
                  }}
                  rows={2}
                  value={editedMessageText}
                />
                <div>
                  <button disabled={isSaving} onClick={cancelEditMessage} type="button">
                    Ləğv et
                  </button>
                  <button
                    className="bubble-save"
                    disabled={isSaving}
                    onClick={() => handleSaveEditedMessage(message.id)}
                    type="button"
                  >
                    {isSaving ? 'Saxlanılır…' : 'Yadda saxla'}
                  </button>
                </div>
              </div>
            ) : (
              <p>{message.text}</p>
            )}
            <span className="bubble-meta">
              <time dateTime={message.createdAt}>{clockTime(message.createdAt)}</time>
              {(message.isEdited || message.updatedAt) && <span>· redaktə edilib</span>}
              {isOwn && (
                <span className={`receipt ${message.isRead ? 'read' : ''}`} title={message.isRead ? 'Oxunub' : 'Göndərildi'}>
                  <ReceiptIcon read={message.isRead} />
                  <span className="sr-only">{message.isRead ? 'Oxunub' : 'Göndərildi'}</span>
                </span>
              )}
            </span>
          </div>

          {/* Actions for own messages */}
          {isOwn && !isEditing && (
            <div className={`message-actions ${isMenuOpen ? 'open' : ''}`}>
              <button
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                aria-label="Mesaj əməliyyatları"
                className="message-more"
                disabled={isDeleting}
                onClick={(e) => {
                  e.stopPropagation();
                  setMessageMenuOpen(isMenuOpen ? null : message.id);
                }}
                type="button"
              >
                {isDeleting ? <span aria-hidden="true" className="chat-spinner" /> : <Icon name="more" />}
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div aria-label="Mesaj əməliyyatları" className={`message-menu ${idx < 2 ? 'below' : ''}`} role="menu">
                  <button onClick={() => startEditMessage(message)} role="menuitem" type="button">
                    <Icon name="edit" size={16} />
                    Redaktə et
                  </button>
                  <button className="danger" onClick={() => handleDeleteMessage(message.id)} role="menuitem" type="button">
                    <Icon name="trash" size={16} />
                    Sil
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Fragment>
    );
  };

  const deletingDialogConversation = deletingConversationId && deletingConversationId === conversationToDelete?.id;

  return (
    <div className="page messages-page">
      <PageHeading>
        <p className={`live-status ${signalRConnected ? 'is-live' : ''}`} role="status">
          <i aria-hidden="true" />
          {signalRConnected ? 'Canlı bağlantı' : 'Canlı bağlantı yoxdur'}
        </p>
      </PageHeading>

      {listUnavailable && conversationsError ? (
        <div className="messenger-state">
          <EmptyState
            action={<Button onClick={fetchConversations}>Yenidən cəhd et</Button>}
            text="Bağlantını yoxlayıb yenidən cəhd et."
            title="Söhbətlər yüklənmədi"
          />
        </div>
      ) : listUnavailable && conversations.length === 0 ? (
        <div className="messenger-state">
          <EmptyState
            action={<ButtonLink to="/community">Oxucuları kəşf et</ButtonLink>}
            text="İcmada oxucuları tap və onların profilindən ilk mesajını yaz. Söhbətlərin burada görünəcək."
            title="Hələ söhbətin yoxdur"
          />
        </div>
      ) : (
        <div className="messenger">
          <aside aria-label="Söhbətlər">
            <SearchField
              label="Söhbətlərdə axtar"
              onChange={setSearchTerm}
              placeholder="Söhbət axtar..."
              value={searchTerm}
            />
            {selectedConversation?.isVirtual && renderConversationButton(selectedConversation)}
            {loadingConversations ? (
              <div aria-label="Söhbətlər yüklənir" className="conversation-skeletons" role="status">
                {[0, 1, 2, 3].map((item) => (
                  <span className="conversation-skeleton" key={item}>
                    <i />
                    <span />
                  </span>
                ))}
              </div>
            ) : conversationsError ? (
              <div className="aside-note" role="alert">
                <p>Söhbətlər yüklənmədi.</p>
                <Button onClick={fetchConversations} variant="secondary">
                  Yenidən cəhd et
                </Button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <p className="aside-note">
                {searchText ? `“${searchTerm.trim()}” üzrə söhbət tapılmadı.` : 'Digər söhbətlərin burada görünəcək.'}
              </p>
            ) : (
              filteredConversations.map(renderConversationButton)
            )}
          </aside>

          {selectedConversation ? (
            <section aria-label={`${selectedName} ilə söhbət`} className="conversation">
              <header>
                <span className="avatar-wrap">
                  <Avatar name={selectedName} size="small" src={selectedPerson?.profilePictureUrl} />
                  {selectedOnline && <span className="presence" />}
                </span>
                <div>
                  <strong>
                    <Link to={profilePath(selectedPerson)}>{selectedName}</Link>
                  </strong>
                  {signalRConnected && (
                    <span className={selectedOnline ? 'is-online' : ''}>{selectedOnline ? 'Onlayn' : 'Oflayn'}</span>
                  )}
                </div>
                {!selectedConversation.isVirtual && (
                  <button
                    aria-label={`${selectedName} ilə söhbəti sil`}
                    className="icon-button conversation-delete"
                    disabled={deletingConversationId === selectedConversation.id}
                    onClick={(e) => openDeleteConversation(selectedConversation, e)}
                    title="Söhbəti sil"
                    type="button"
                  >
                    <Icon name="trash" />
                  </button>
                )}
              </header>

              <div aria-label="Mesajlar" aria-live="polite" className="messages" ref={messagesBoxRef} role="log">
                {loadingMessages ? (
                  <div aria-label="Mesajlar yüklənir" className="messages-loading" role="status">
                    <i />
                    <i />
                    <i />
                  </div>
                ) : messagesError ? (
                  <div className="messages-note" role="alert">
                    <strong>Mesajlar yüklənmədi</strong>
                    <p>Bağlantını yoxlayıb yenidən cəhd et.</p>
                    <Button onClick={() => fetchMessages(selectedConversation)} variant="secondary">
                      Yenidən cəhd et
                    </Button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="messages-note">
                    <strong>Hələ mesaj yoxdur</strong>
                    <p>Söhbətə başlamaq üçün ilk mesajını yaz.</p>
                  </div>
                ) : (
                  messages.map(renderMessage)
                )}
              </div>

              <form onSubmit={handleSendMessage}>
                <textarea
                  aria-label={`${selectedName} üçün mesaj`}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Mesajını yaz..."
                  ref={inputRef}
                  rows={1}
                  value={messageText}
                />
                <button aria-busy={sending} aria-label="Göndər" disabled={!messageText.trim() || sending} type="submit">
                  {sending ? <span aria-hidden="true" className="chat-spinner" /> : <Icon name="send" />}
                </button>
              </form>
            </section>
          ) : (
            /* No conversation selected */
            <section aria-label="Söhbət" className="conversation conversation-idle">
              {loadingConversations ? (
                <div aria-hidden="true" className="messages-loading">
                  <i />
                  <i />
                  <i />
                </div>
              ) : (
                <div className="messages-note">
                  <strong>Söhbət seç</strong>
                  <p>Mesajları görmək üçün siyahıdan bir söhbət seç.</p>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Delete Conversation Dialog */}
      {showDeleteConversationModal && conversationToDelete && (
        <Dialog labelledBy="delete-conversation-title" onClose={closeDeleteConversation}>
          <Eyebrow>SÖHBƏTİ SİL</Eyebrow>
          <h2 id="delete-conversation-title">{displayName(conversationToDelete.otherUser)} ilə söhbət silinsin?</h2>
          <p>Bütün mesajlar silinəcək. Bu əməliyyatı geri qaytarmaq mümkün deyil.</p>
          <div className="modal-actions">
            <Button onClick={closeDeleteConversation} variant="secondary">
              Ləğv et
            </Button>
            <Button
              aria-busy={Boolean(deletingDialogConversation)}
              disabled={Boolean(deletingDialogConversation)}
              onClick={handleDeleteConversation}
              variant="danger"
            >
              {deletingDialogConversation ? 'Silinir…' : 'Söhbəti sil'}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default ChatPage;
