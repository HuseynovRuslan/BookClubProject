import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import signalRService from '../services/signalrService';
import { useAuth } from './AuthContext';

const SignalRContext = createContext(null);

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
};

export const SignalRProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessage, setNewMessage] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const currentConversationUserIdRef = useRef(null);
  const lastProcessedMessageIdRef = useRef(null);

  // Connect to SignalR when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connectSignalR();
    } else {
      disconnectSignalR();
    }

    return () => {
      disconnectSignalR();
    };
  }, [isAuthenticated, user]);

  const connectSignalR = async () => {
    try {
      // IMPORTANT: Subscribe to events BEFORE starting connection
      // Otherwise we miss the initial OnlineUsersList event
      
      // Subscribe to messages
      const unsubMessage = signalRService.onMessage((message) => {
        // Prevent duplicate processing - same message can come from ReceiveMessage and NewMessage
        if (lastProcessedMessageIdRef.current === message.id) {
          return; // Already processed this message
        }
        
        // Mark this message as processed
        lastProcessedMessageIdRef.current = message.id;
        
        setNewMessage(message);
        
        // Increment unread count ONLY if:
        // 1. Message is from someone else
        // 2. We're NOT currently viewing that conversation
        if (message.senderId !== user?.id) {
          // Check if we're currently in this conversation using ref
          if (currentConversationUserIdRef.current !== message.senderId) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      });

      // Subscribe to user status
      const unsubStatus = signalRService.onUserStatus((userId, isOnline) => {
        // Don't track current user's status
        if (userId === user?.id) return;
        
        setOnlineUserIds((prev) => {
          if (isOnline) {
            // Add if not already in list
            if (!prev.includes(userId)) {
              return [...prev, userId];
            }
            return prev;
          } else {
            // Remove from list
            return prev.filter(id => id !== userId);
          }
        });
      });

      // Subscribe to initial online users list (sent when connecting)
      const unsubOnlineList = signalRService.onOnlineUsersList((userIds) => {
        // Set initial online users list (exclude current user if present)
        const filteredUserIds = (userIds || []).filter(id => id !== user?.id);
        // Merge with existing list to preserve any users who came online via UserOnline events
        // This handles the case where UserOnline events arrive before OnlineUsersList
        setOnlineUserIds((prev) => {
          const merged = [...new Set([...prev, ...filteredUserIds])];
          return merged;
        });
      });

      // Store unsubscribe functions for cleanup
      window._signalRCleanup = () => {
        unsubMessage();
        unsubStatus();
        unsubOnlineList();
      };

      // NOW start the connection (after subscribing)
      await signalRService.startConnection();
      setIsConnected(signalRService.getConnectionState());
    } catch (error) {
      console.error('Failed to connect to SignalR:', error);
    }
  };

  const disconnectSignalR = async () => {
    if (window._signalRCleanup) {
      window._signalRCleanup();
      window._signalRCleanup = null;
    }
    await signalRService.stopConnection();
    setIsConnected(false);
    // Reset refs on disconnect
    lastProcessedMessageIdRef.current = null;
  };

  // Reset unread count (call this when opening chat page)
  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Clear new message after it's been handled
  const clearNewMessage = useCallback(() => {
    setNewMessage(null);
  }, []);

  // Update unread count from external source (e.g., API)
  const setTotalUnreadCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  // Join a specific conversation (for ChatPage)
  const joinConversation = useCallback(async (otherUserId) => {
    await signalRService.joinConversation(otherUserId);
  }, []);

  // Leave a conversation (for ChatPage)
  const leaveConversation = useCallback(async (otherUserId) => {
    await signalRService.leaveConversation(otherUserId);
  }, []);

  // Set current conversation user ID (to prevent counting messages as unread when viewing)
  const setCurrentConversationUser = useCallback((userId) => {
    currentConversationUserIdRef.current = userId;
  }, []);

  const value = {
    isConnected,
    unreadCount,
    newMessage,
    onlineUserIds,
    resetUnreadCount,
    clearNewMessage,
    setTotalUnreadCount,
    joinConversation,
    leaveConversation,
    setCurrentConversationUser,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};
