import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, Loader2, Heart, MessageCircle, UserPlus, Star, BookMarked } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../api/notifications';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7050';

// Helper to get profile picture URL
const getProfilePictureUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

// Helper to format relative time
const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return past.toLocaleDateString();
};

// Get icon for notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case 5: // ReviewLike
    case 1: // QuoteLike
      return <Heart className="w-4 h-4 text-red-500" />;
    case 2: // QuoteComment
    case 6: // ReviewComment
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 3: // UserFollow
      return <UserPlus className="w-4 h-4 text-green-500" />;
    case 8: // ReviewCreated
      return <Star className="w-4 h-4 text-amber-500" />;
    case 7: // BookAddedToShelf
      return <BookMarked className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-stone-500" />;
  }
};

const NotificationDropdown = ({ unreadCount: initialUnreadCount = 0, onNewNotification }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [isOpen]);

  // Sync unread count with parent component
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  // Fetch notifications
  const fetchNotifications = async (pageNum) => {
    try {
      setLoading(true);
      const response = await getNotifications(pageNum, 20);
      const items = response?.items || response?.data || [];
      
      // Filter out MessageReceived notifications (type 4) - they go to messages page instead
      const filteredItems = items.filter(item => item.type !== 4);
      
      if (pageNum === 1) {
        setNotifications(filteredItems);
      } else {
        setNotifications(prev => [...prev, ...filteredItems]);
      }

      setHasMore(response?.hasNextPage || false);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load more notifications
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  // Mark notification as read and navigate
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate based on notification type
      setIsOpen(false);
      navigateToEntity(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Navigate to related entity
  const navigateToEntity = (notification) => {
    const { relatedEntityType, relatedEntityId, type, actorId } = notification;
    const currentUserId = user?.id;

    // Don't navigate if it's a MessageReceived notification and the actor is the current user
    // (user sent a message themselves, don't navigate to their own message)
    if (type === 4 && actorId === currentUserId) {
      return; // MessageReceived (type 4) from current user - don't navigate
    }

    if (!relatedEntityType || !relatedEntityId) return;

    switch (relatedEntityType.toLowerCase()) {
      case 'book':
        navigate(`/books/${relatedEntityId}`);
        break;
      case 'review':
        // Navigate to book details (reviews are shown there)
        navigate(`/books/${relatedEntityId}`);
        break;
      case 'quote':
        // Navigate to home (quotes carousel)
        navigate('/');
        break;
      case 'user':
        navigate(`/profile/${relatedEntityId}`);
        break;
      default:
        break;
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      const deleted = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Trigger shake animation
  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  // Add new notification (called from parent) - memoized to prevent re-creation
  const addNewNotification = useCallback((notification) => {
    // Don't add MessageReceived notifications (type 4) to dropdown - they go to messages page
    if (notification.type === 4) {
      return; // MessageReceived - don't add to dropdown
    }
    
    setNotifications(prev => [notification, ...prev]);
    // Don't increment count here - backend already sends updated count via SignalR
    // The count will be updated from SignalRContext
    triggerShake();
  }, [triggerShake]);

  // Expose addNewNotification to parent
  useEffect(() => {
    if (onNewNotification) {
      onNewNotification(addNewNotification);
    }
  }, [addNewNotification, onNewNotification]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg hover:bg-stone-100 transition-colors ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        <Bell className="w-5 h-5 text-stone-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-stone-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-linear-to-r from-stone-50 to-white">
            <h3 className="text-lg font-bold text-stone-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[500px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-12 h-12 text-stone-300 mb-3" />
                <p className="text-stone-500 text-sm font-medium">No notifications yet</p>
                <p className="text-stone-400 text-xs mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group relative flex items-start gap-3 p-4 border-b border-stone-50 hover:bg-stone-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></div>
                    )}

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
                        {notification.actor?.profilePictureUrl ? (
                          <img
                            src={getProfilePictureUrl(notification.actor.profilePictureUrl)}
                            alt={notification.actor?.firstName || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-600 font-medium text-sm">
                            {notification.actor?.firstName?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      {/* Icon Badge */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-900 leading-relaxed">
                        <span className="font-semibold">
                          {notification.actor?.firstName} {notification.actor?.lastName}
                        </span>{' '}
                        <span dangerouslySetInnerHTML={{ __html: notification.message || notification.title }} />
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-stone-200 transition-all"
                    >
                      <X className="w-4 h-4 text-stone-500" />
                    </button>
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      'Load more'
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
