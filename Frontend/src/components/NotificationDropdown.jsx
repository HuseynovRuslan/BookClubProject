import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../api/notifications';
import { Avatar, Button, Icon } from './app/ui';
import { displayName, timeAgo } from './app/format';

// What the actor did, by notification type (backend NotificationType). Titles from the API are
// English and contain user-chosen names, so they are only a fallback and always rendered as text.
const actionText = {
  1: 'sitatınızı bəyəndi.',
  2: 'sitatınıza şərh yazdı.',
  3: 'sizi izləməyə başladı.',
  5: 'rəyinizi bəyəndi.',
  6: 'rəyinizə şərh yazdı.',
  7: 'rəfinə kitab əlavə etdi.',
  8: 'yeni rəy yazdı.',
};

// Bell button and notification panel of the application header (Make "notification-panel").
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
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  // Fetch notifications when the panel opens
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Sync unread count with the header
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  const fetchNotifications = async (pageNum) => {
    try {
      setLoading(true);
      const response = await getNotifications(pageNum, 20);
      const items = response?.items || response?.data || [];

      // MessageReceived notifications (type 4) belong to the messages page
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

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  // Mark as read and open the related page
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      setIsOpen(false);
      navigateToEntity(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const navigateToEntity = (notification) => {
    const { relatedEntityType, relatedEntityId, type, actorId } = notification;
    const currentUserId = user?.id;

    // A message the user sent themselves has nothing to open
    if (type === 4 && actorId === currentUserId) {
      return;
    }

    if (!relatedEntityType || !relatedEntityId) return;

    switch (relatedEntityType.toLowerCase()) {
      case 'book':
      case 'review':
        // Reviews are shown on the book page
        navigate(`/books/${relatedEntityId}`);
        break;
      case 'quote':
        // Quotes are listed on the dashboard
        navigate('/dashboard');
        break;
      case 'user':
        navigate(`/profile/${relatedEntityId}`);
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
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

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  // Called by the header when SignalR delivers a notification
  const addNewNotification = useCallback((notification) => {
    // MessageReceived (type 4) goes to the messages page, not here
    if (notification.type === 4) {
      return;
    }

    setNotifications(prev => [notification, ...prev]);
    // The unread count itself comes from the backend via SignalR
    triggerShake();
  }, [triggerShake]);

  useEffect(() => {
    if (onNewNotification) {
      onNewNotification(addNewNotification);
    }
  }, [addNewNotification, onNewNotification]);

  return (
    <div className="contents" ref={dropdownRef}>
      <button
        ref={buttonRef}
        aria-expanded={isOpen}
        aria-label={unreadCount > 0 ? `Bildirişlər, ${unreadCount} oxunmamış` : 'Bildirişlər'}
        className={`icon-button notification-button ${isShaking ? 'animate-shake' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Icon name="bell" />
        {/* Make shows a dot; the exact count is in the button's label. */}
        {unreadCount > 0 && <span aria-hidden="true" />}
      </button>

      {isOpen && (
        <aside aria-label="Bildirişlər" className="notification-panel">
          <div className="panel-head">
            <strong>Bildirişlər</strong>
            <button aria-label="Bildirişləri bağla" onClick={() => setIsOpen(false)} type="button">
              <Icon name="close" />
            </button>
          </div>

          {loading && notifications.length === 0 ? (
            <p className="panel-empty" role="status">Bildirişlər yüklənir…</p>
          ) : notifications.length === 0 ? (
            <p className="panel-empty">Hələ bildiriş yoxdur. Kimsə rəyinizi bəyənəndə və ya sizi izləyəndə burada görəcəksiniz.</p>
          ) : (
            <>
              {notifications.map((notification) => {
                const actor = notification.actor;
                const name = actor ? displayName(actor) : '';
                const text = actionText[notification.type];
                return (
                  <div className={`notice ${!notification.isRead ? 'unread' : ''}`} key={notification.id}>
                    <button className="notice-main" onClick={() => handleNotificationClick(notification)} type="button">
                      <Avatar name={name || 'Bookla'} size="small" src={actor?.profilePictureUrl} />
                      <p>
                        {text && name ? (
                          <>
                            <strong>{name}</strong> {text}
                          </>
                        ) : (
                          notification.title || notification.message
                        )}
                        <span>
                          {!notification.isRead && <span className="sr-only">Oxunmamış. </span>}
                          {timeAgo(notification.createdAt)}
                        </span>
                      </p>
                    </button>
                    <button
                      aria-label="Bildirişi sil"
                      className="notice-remove"
                      onClick={() => handleDelete(notification.id)}
                      type="button"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                );
              })}

              {hasMore && (
                <Button className="panel-more" disabled={loading} onClick={handleLoadMore} variant="quiet">
                  {loading ? 'Yüklənir…' : 'Daha çox göstər'}
                </Button>
              )}
            </>
          )}

          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="secondary">
              Hamısını oxunmuş et
            </Button>
          )}
        </aside>
      )}
    </div>
  );
};

export default NotificationDropdown;
