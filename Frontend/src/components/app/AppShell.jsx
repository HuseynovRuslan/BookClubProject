import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import '@fontsource-variable/inter';
import '@fontsource-variable/lora';
import '@fontsource-variable/lora/wght-italic.css';
import '../../styles/bookla-fonts.css';
import '../../styles/bookla-app.css';
import NotificationDropdown from '../NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { useSignalR } from '../../context/SignalRContext';
import { getNotifications, getUnreadCount as getNotificationUnreadCount } from '../../api/notifications';
import { getConversations } from '../../api/dashboard';
import { getCurrentUserProfile } from '../../api/users';
import { Avatar, Icon } from './ui';
import { displayName } from './format';
import bookOpen from '../../assets/landing/icons/book-open-27.svg';

// Header, navigation and footer of the signed-in application (Make "Shell").

const navItems = [
  { to: '/dashboard', label: 'Ana səhifə' },
  { to: '/books', label: 'Kitablar' },
  { to: '/my-shelves', label: 'Kitab rəflərim', also: ['/shelves'] },
  { to: '/community', label: 'İcma' },
  { to: '/feed', label: 'Fəaliyyət lenti' },
  { to: '/messages', label: 'Mesajlar' },
  { to: '/profile', label: 'Profil', end: true },
];

const Logo = ({ className = '' }) => (
  <>
    <img alt="" className={className} src={bookOpen} />
    <span>Bookla</span>
    <i />
  </>
);

const AppShell = () => {
  const { user, logout } = useAuth();
  const {
    unreadCount: unreadMessages,
    setTotalUnreadCount,
    newNotification,
    notificationUnreadCount,
    clearNewNotification,
    setNotificationCount,
  } = useSignalR();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const addNotificationCallbackRef = useRef(null);
  const accountRef = useRef(null);
  const accountButtonRef = useRef(null);

  // The application is in Azerbaijani; the auth and admin screens are still English.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.lang;
    root.lang = 'az';
    return () => {
      root.lang = previous;
    };
  }, []);

  // Close the menus when the page changes.
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  // A newly opened page starts at the top (the router keeps the previous page's scroll position);
  // Back/Forward keep the position the browser restores.
  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  useEffect(() => {
    if (!accountOpen && !menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (accountOpen) accountButtonRef.current?.focus();
      setAccountOpen(false);
      setMenuOpen(false);
    };
    const onPointer = (event) => {
      if (accountOpen && !accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [accountOpen, menuOpen]);

  // Unread notifications, excluding MessageReceived (type 4), which belongs to the messages page.
  const fetchNotificationUnreadCount = useCallback(async () => {
    try {
      const response = await getNotifications(1, 100);
      const items = response?.items || response?.data || [];
      setNotificationCount(items.filter((n) => n.type !== 4 && !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notification unread count:', error);
      try {
        setNotificationCount(await getNotificationUnreadCount());
      } catch (fallbackError) {
        console.error('Error fetching fallback unread count:', fallbackError);
      }
    }
  }, [setNotificationCount]);

  useEffect(() => {
    fetchNotificationUnreadCount();
    // Unread messages for the "Mesajlar" badge until SignalR updates it.
    getConversations(1, 50)
      .then((data) => {
        const items = data?.items || data || [];
        setTotalUnreadCount(items.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
      })
      .catch((error) => console.error('Error loading conversations:', error));
    getCurrentUserProfile()
      .then(setProfile)
      .catch((error) => console.error('Error loading profile:', error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The profile page announces name/photo changes so the header avatar stays current.
  useEffect(() => {
    const reload = () =>
      getCurrentUserProfile()
        .then(setProfile)
        .catch((error) => console.error('Error loading profile:', error));
    window.addEventListener('bookla:profile-updated', reload);
    return () => window.removeEventListener('bookla:profile-updated', reload);
  }, []);

  // New notification from SignalR: add it to the open panel and refresh the count.
  useEffect(() => {
    if (!newNotification) return;
    if (newNotification.type !== 4 && addNotificationCallbackRef.current) {
      addNotificationCallbackRef.current(newNotification);
    }
    clearNewNotification();
    if (newNotification.type !== 4) fetchNotificationUnreadCount();
  }, [newNotification, clearNewNotification, fetchNotificationUnreadCount]);

  const handleNewNotification = useCallback((callback) => {
    addNotificationCallbackRef.current = callback;
  }, []);

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    navigate('/login');
  };

  const person = { ...user, ...profile, username: user?.username };
  const name = displayName(person);
  const isAdmin = user?.role === 'Admin' || user?.roles?.includes?.('Admin');
  const isActive = (item) => item.also?.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className="bk-app" lang="az">
      <div className="app-shell">
        <header className="topbar">
          <Link aria-label="Bookla — ana səhifə" className="logo" to="/dashboard">
            <Logo />
          </Link>
          <nav aria-label="Əsas naviqasiya" className={menuOpen ? 'nav nav-open' : 'nav'} id="app-navigation">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive: active }) => (active || isActive(item) ? 'active' : '')}
                end={item.end}
                key={item.to}
                to={item.to}
              >
                {item.label}
                {item.to === '/messages' && unreadMessages > 0 && (
                  <span className="nav-badge">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                    <span className="sr-only"> oxunmamış mesaj</span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="top-actions">
            <NotificationDropdown
              onNewNotification={handleNewNotification}
              onUnreadCountChange={setNotificationCount}
              unreadCount={notificationUnreadCount}
            />
            <div className="contents" ref={accountRef}>
              <button
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="Hesab menyusu"
                className="avatar-button"
                onClick={() => setAccountOpen((open) => !open)}
                ref={accountButtonRef}
                type="button"
              >
                <Avatar name={name} size="small" src={profile?.profilePictureUrl} />
              </button>
              {accountOpen && (
                <div className="account-panel" role="menu" aria-label="Hesab">
                  <p>
                    {name}
                    {user?.username && <span>@{user.username}</span>}
                  </p>
                  <Link role="menuitem" to="/profile">
                    Profilim
                  </Link>
                  <Link role="menuitem" to="/ai-recommendations">
                    Süni intellekt tövsiyələri
                  </Link>
                  <Link role="menuitem" to="/news">
                    Xəbərlər
                  </Link>
                  <Link role="menuitem" to="/feedback">
                    Rəy bildir
                  </Link>
                  {isAdmin && (
                    <Link role="menuitem" to="/admin">
                      Admin paneli
                    </Link>
                  )}
                  <hr />
                  <button onClick={handleLogout} role="menuitem" type="button">
                    <Icon name="logout" /> Çıxış
                  </button>
                </div>
              )}
            </div>
            <button
              aria-controls="app-navigation"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Menyunu bağla' : 'Menyunu aç'}
              className="icon-button menu-button"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
        <footer className="app-footer">
          <Link aria-label="Bookla — ana səhifə" className="logo footer-logo" to="/dashboard">
            <Logo />
          </Link>
          <p>Kitabın açıq, söhbətin davam edir.</p>
          <span>
            © 2026 Bookla.org · <Link to="/privacy">Məxfilik</Link> · <Link to="/terms">Şərtlər</Link>
          </span>
        </footer>
      </div>
    </div>
  );
};

export default AppShell;
