import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Search,
  Star,
  Library,
  TrendingUp,
  Clock,
  Trophy,
  MessageCircle,
  Users,
  Bell,
  Target,
  ChevronRight,
  BookMarked,
  Heart,
  Plus,
  X,
  CheckCircle,
  LogOut,
  User,
  ChevronDown,
  Quote,
  Loader2,
  Shield,
  Sparkles,
} from 'lucide-react';
import BookCard from '../components/BookCard';
import ReadingChallengeCard from '../components/ReadingChallengeCard';
import QuoteCard from '../components/QuoteCard';
import AddEditQuoteModal from '../components/AddEditQuoteModal';
import NotificationDropdown from '../components/NotificationDropdown';
import { getAllBooks } from '../api/books';
import { getUserShelves, getShelfById } from '../api/shelves';
import { getUserYearChallenge, getSocialFeed, getConversations } from '../api/dashboard';
import { getCurrentUserProfile } from '../api/users';
import { getAllQuotes } from '../api/quotes';
import { getUnreadCount as getNotificationUnreadCount, getNotifications } from '../api/notifications';
import { useAuth } from '../context/AuthContext';
import { useSignalR } from '../context/SignalRContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7050';

// Helper to get profile picture URL
const getProfilePictureUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

// Skeleton Loader Components
const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-stone-200 rounded-xl"></div>
      <div className="flex-1">
        <div className="h-4 bg-stone-200 rounded w-20 mb-2"></div>
        <div className="h-6 bg-stone-200 rounded w-12"></div>
      </div>
    </div>
  </div>
);

const BookCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-stone-200 animate-pulse">
    <div className="aspect-[2/3] bg-stone-200 rounded-t-xl"></div>
    <div className="p-3">
      <div className="h-4 bg-stone-200 rounded w-4/5 mb-2"></div>
      <div className="h-3 bg-stone-200 rounded w-3/5"></div>
    </div>
  </div>
);

const FeedItemSkeleton = () => (
  <div className="flex items-start gap-3 p-3 animate-pulse">
    <div className="w-10 h-10 bg-stone-200 rounded-full"></div>
    <div className="flex-1">
      <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-stone-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Section Component
const Section = ({ title, icon: Icon, books, loading, onSeeAll, count = 5 }) => {
  // Safety check: ensure books is an array
  const safeBooks = Array.isArray(books) ? books : [];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-stone-600" />
          <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
        </div>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-1 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: count }).map((_, idx) => (
            <BookCardSkeleton key={idx} />
          ))}
        </div>
      ) : safeBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <BookOpen className="w-8 h-8 text-stone-300 mb-2" />
          <p className="text-stone-500 text-sm">No books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {safeBooks.slice(0, count).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    unreadCount: signalRUnread, 
    newMessage, 
    setTotalUnreadCount,
    newNotification,
    notificationUnreadCount,
    clearNewNotification,
    setNotificationCount
  } = useSignalR();
  const navigate = useNavigate();
  
  // Data states
  const [allBooks, setAllBooks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [feed, setFeed] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Use ref instead of state to avoid re-render loops
  const addNotificationCallbackRef = useRef(null);
  
  // Loading states
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Challenge modal state
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeBooks, setChallengeBooks] = useState([]);

  // Quotes state
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteModalMode, setQuoteModalMode] = useState('add');
  const [editingQuote, setEditingQuote] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [isAuthenticated]);

  // Fetch notification unread count on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationUnreadCount();
    }
  }, [isAuthenticated]);

  // Handle new notification from SignalR
  useEffect(() => {
    if (newNotification) {
      // Ignore MessageReceived notifications (type 4) - they don't go to notification dropdown
      // Messages are handled separately via the messages system
      if (newNotification.type === 4) {
        clearNewNotification();
        return;
      }
      
      // For other notifications, add to dropdown
      if (addNotificationCallbackRef.current) {
        addNotificationCallbackRef.current(newNotification);
      }
      clearNewNotification();
      
      // Refresh unread count from backend to ensure accuracy
      // This ensures we get the correct count from the server
      fetchNotificationUnreadCount();
      
      // Optional: Play subtle sound (you can add a notification sound file)
      // new Audio('/notification-sound.mp3').play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newNotification, clearNewNotification]);

  const fetchAllData = async () => {
    // Always fetch books and quotes
    fetchAllBooks();
    fetchQuotes();
    
    // Fetch dashboard data only if authenticated
    if (isAuthenticated && user) {
      fetchDashboardData();
    } else {
      setLoadingDashboard(false);
    }
  };

  const fetchNotificationUnreadCount = async () => {
    try {
      // Get all notifications to filter out MessageReceived (type 4)
      const response = await getNotifications(1, 100);
      const items = response?.items || response?.data || [];
      
      // Count only non-message notifications (exclude type 4 - MessageReceived)
      const nonMessageNotifications = items.filter(n => n.type !== 4);
      const unreadCount = nonMessageNotifications.filter(n => !n.isRead).length;
      
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notification unread count:', error);
      // Fallback to API count if filtering fails
      try {
        const count = await getNotificationUnreadCount();
        setNotificationCount(count);
      } catch (fallbackError) {
        console.error('Error fetching fallback unread count:', fallbackError);
      }
    }
  };

  // Memoized callback to prevent re-render loops
  const handleNewNotification = useCallback((callback) => {
    addNotificationCallbackRef.current = callback;
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoadingQuotes(true);
      const res = await getAllQuotes(1, 30);
      const items = res?.items || res?.data || res || [];
      setQuotes(items);
    } catch (err) {
      console.error('Error loading quotes:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const fetchAllBooks = async () => {
    try {
      setLoadingBooks(true);
      // Fetch all books in a single call with large page size
      const response = await getAllBooks(1, 1000);
      
      // Safe data extraction: handle both PagedResult and array responses
      const allBooksData = response?.items || (Array.isArray(response) ? response : []);
      setAllBooks(allBooksData);
    } catch (err) {
      console.error('Error loading books:', err);
      setAllBooks([]); // Set empty array on error
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const currentYear = new Date().getFullYear();
      
      // Fetch all dashboard data in parallel
      const results = await Promise.allSettled([
        getUserShelves(),
        getUserYearChallenge(currentYear, user?.id),
        getSocialFeed(1, 5),
        getConversations(1, 10),
        getCurrentUserProfile(),
      ]);
      
      // Process shelves
      if (results[0].status === 'fulfilled') {
        const shelvesData = results[0].value;
        if (Array.isArray(shelvesData)) {
          setShelves(shelvesData);
        } else if (shelvesData?.items) {
          setShelves(shelvesData.items);
        }
      }
      
      // Process challenge
      if (results[1].status === 'fulfilled') {
        setChallenge(results[1].value);
      }
      
      // Process feed
      if (results[2].status === 'fulfilled') {
        const feedData = results[2].value;
        setFeed(feedData?.items || feedData || []);
      }
      
      // Process conversations
      if (results[3].status === 'fulfilled') {
        const convData = results[3].value;
        const convItems = convData?.items || convData || [];
        setConversations(convItems);
        
        // Initial unread count-u SignalR context-ə set et
        const totalUnread = convItems.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnreadCount(totalUnread);
      }
      
      // Process user profile
      if (results[4].status === 'fulfilled') {
        setUserProfile(results[4].value);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Computed data
  const totalBooksInShelves = useMemo(() => {
    return shelves.reduce((sum, shelf) => sum + (shelf.bookCount || shelf.books?.length || 0), 0);
  }, [shelves]);

  // SignalR context-dən gələn unread count-u istifadə et (real-time)
  const unreadMessages = signalRUnread;

  // Client-side filtering and sorting for book sections
  const trendingBooks = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    // Trending: Most rated/popular (by rating count)
    return [...allBooks]
      .sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))
      .slice(0, 10);
  }, [allBooks]);

  const topRatedBooks = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    // Top Rated: Highest average rating (filter out 0 ratings)
    return [...allBooks]
      .filter(book => (book.averageRating || 0) > 0)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 10);
  }, [allBooks]);

  const newArrivals = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    // New Arrivals: Most recently created
    return [...allBooks]
      .filter(book => book.createdAt) // Only include books with createdAt
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending: newest first
      })
      .slice(0, 10);
  }, [allBooks]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/books?search=${encodeURIComponent(searchTerm)}` : '/books');
  };

  // Handle opening challenge modal
  const handleOpenChallengeModal = async () => {
    if (!challenge) return;
    
    // Find "Read" shelf
    const readShelf = shelves.find(s => s.name === 'Read');
    if (readShelf?.id) {
      try {
        const shelfData = await getShelfById(readShelf.id);
        setChallengeBooks(shelfData?.books || []);
      } catch (error) {
        console.error('Error fetching Read shelf:', error);
        setChallengeBooks([]);
      }
    }
    setShowChallengeModal(true);
  };

  // Handle logout
  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  // Quote modal handlers
  const handleOpenAddQuote = () => {
    setQuoteModalMode('add');
    setEditingQuote(null);
    setShowQuoteModal(true);
  };

  const handleOpenEditQuote = (quote) => {
    setQuoteModalMode('edit');
    setEditingQuote(quote);
    setShowQuoteModal(true);
  };

  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false);
    setEditingQuote(null);
  };

  const handleQuoteSuccess = () => {
    fetchQuotes(); // Refresh quotes list
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Calculate challenge progress
  const challengeProgress = challenge ? Math.min((challenge.completedBooksCount || 0) / (challenge.targetBooksCount || 1) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-stone-900">BookClub</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/news" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
                News
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/feed" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
                    Feed
                  </Link>
                  <Link to="/community" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
                    Community
                  </Link>
                  <Link to="/books" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
                    Browse
                  </Link>
                  <Link to="/my-shelves" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
                    My Shelves
                  </Link>
                  <Link to="/ai-recommendations" className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium transition-colors">
                    <Sparkles className="w-4 h-4" />
                    AI Picks
                  </Link>
                </>
              )}
              <Link to="/feedback" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
                Feedback
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Notification Dropdown */}
                  <NotificationDropdown 
                    unreadCount={notificationUnreadCount}
                    onNewNotification={handleNewNotification}
                  />
                  
                  <div className="relative user-menu-container">
                    {/* User Menu Button */}
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                    >
                    <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                      {userProfile?.profilePictureUrl ? (
                        <img
                          src={getProfilePictureUrl(userProfile.profilePictureUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        userProfile?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-stone-700 max-w-[120px] truncate">
                      {userProfile?.firstName || user?.username || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-white font-medium overflow-hidden flex-shrink-0">
                          {userProfile?.profilePictureUrl ? (
                            <img
                              src={getProfilePictureUrl(userProfile.profilePictureUrl)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            userProfile?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900 truncate">
                            {userProfile?.firstName 
                              ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
                              : user?.username || 'User'}
                          </p>
                          <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-stone-500" />
                          <span className="text-sm">My Profile</span>
                        </Link>
                        <Link
                          to="/my-shelves"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <Library className="w-4 h-4 text-stone-500" />
                          <span className="text-sm">My Library</span>
                        </Link>
                        <Link
                          to="/feed"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <TrendingUp className="w-4 h-4 text-stone-500" />
                          <span className="text-sm">Activity Feed</span>
                        </Link>
                        <Link
                          to="/community"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <Users className="w-4 h-4 text-stone-500" />
                          <span className="text-sm">Community</span>
                        </Link>
                        <Link
                          to="/messages"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-stone-500" />
                          <span className="text-sm">Messages</span>
                          {unreadMessages > 0 && (
                            <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                              {unreadMessages}
                            </span>
                          )}
                        </Link>
                        {user?.role === 'Admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-amber-700 hover:bg-amber-50 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-medium">Admin Panel</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-stone-100 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-stone-600 hover:text-stone-900 text-sm font-medium">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Authenticated User Dashboard */}
        {isAuthenticated ? (
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
                  Welcome back, {userProfile?.firstName || user?.username || 'Reader'}! 👋
                </h1>
                <p className="text-stone-500 mt-1">
                  Here's what's happening in your reading world
                </p>
              </div>
              
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg">
                  <Search className="w-4 h-4 text-stone-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40 sm:w-48 bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none text-sm"
                    placeholder="Search books..."
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Dashboard Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loadingDashboard ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  {/* My Library Card */}
                  <Link
                    to="/my-shelves"
                    className="group bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                        <Library className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-stone-500">My Library</p>
                        <p className="text-2xl font-bold text-stone-900">{totalBooksInShelves}</p>
                        <p className="text-xs text-stone-500">{shelves.length} shelves</p>
                      </div>
                    </div>
                  </Link>

                  {/* Reading Challenge Card */}
                  <button
                    onClick={handleOpenChallengeModal}
                    disabled={!challenge}
                    className="group bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-md transition-all text-left w-full cursor-pointer disabled:cursor-default disabled:hover:border-stone-200 disabled:hover:shadow-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                        <Trophy className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-stone-500">{new Date().getFullYear()} Challenge</p>
                        {challenge ? (
                          <>
                            <p className="text-lg font-bold text-stone-900">
                              {challenge.completedBooksCount || 0}/{challenge.targetBooksCount || 0}
                            </p>
                            <div className="w-full h-1.5 bg-stone-100 rounded-full mt-1">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${challengeProgress}%` }}
                              ></div>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-emerald-600 font-medium">
                            Set goal in sidebar →
                          </p>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Messages Card */}
                  <Link
                    to="/messages"
                    className="group bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors relative">
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                        {unreadMessages > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadMessages}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-stone-500">Messages</p>
                        <p className="text-lg font-bold text-stone-900">
                          {unreadMessages > 0 ? `${unreadMessages} unread` : 'All read'}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Social Feed Card */}
                  <Link
                    to="/feed"
                    className="group bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-stone-500">Social Feed</p>
                        <p className="text-sm font-medium text-stone-700">
                          See what friends are reading
                        </p>
                      </div>
                    </div>
                  </Link>
                </>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Books Sections - 3/4 width */}
              <div className="lg:col-span-3 space-y-8">
                <Section
                  title="Trending Now"
                  icon={TrendingUp}
                  books={trendingBooks}
                  loading={loadingBooks}
                  onSeeAll={() => navigate('/books')}
                />

                <Section
                  title="Top Rated"
                  icon={Star}
                  books={topRatedBooks}
                  loading={loadingBooks}
                  onSeeAll={() => navigate('/books')}
                />

                <Section
                  title="New Arrivals"
                  icon={Clock}
                  books={newArrivals}
                  loading={loadingBooks}
                  onSeeAll={() => navigate('/books')}
                />
              </div>

              {/* Sidebar - 1/4 width */}
              <div className="space-y-6">
                {/* Reading Challenge */}
                <ReadingChallengeCard 
                  year={new Date().getFullYear()} 
                  onUpdate={fetchDashboardData}
                />

                {/* Community Quotes Section */}
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col" style={{ maxHeight: '600px' }}>
                  <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Quote className="w-4 h-4 text-amber-500" />
                      <h3 className="font-semibold text-stone-800 text-sm">Community Quotes</h3>
                    </div>
                    <button
                      onClick={handleOpenAddQuote}
                      className="flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  
                  <div className="p-3 overflow-y-auto flex-1">
                    {loadingQuotes ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                      </div>
                    ) : quotes.length === 0 ? (
                      <div className="text-center py-8">
                        <Quote className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                        <p className="text-sm text-stone-500">No quotes yet</p>
                        <p className="text-xs text-stone-400 mt-1">Be the first to share!</p>
                        <button
                          onClick={handleOpenAddQuote}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Share a Quote
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {quotes.map((quote) => (
                          <QuoteCard
                            key={quote.id}
                            quote={quote}
                            onEdit={handleOpenEditQuote}
                            onDelete={fetchQuotes}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <h3 className="font-semibold text-stone-800 text-sm mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link
                      to="/books"
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-stone-600" />
                      </div>
                      <span className="text-sm text-stone-700">Browse Books</span>
                    </Link>
                    <Link
                      to="/my-shelves"
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-stone-600" />
                      </div>
                      <span className="text-sm text-stone-700">Create Shelf</span>
                    </Link>
                    <Link
                      to="/ai-recommendations"
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm text-purple-700 font-medium">AI Picks</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Guest View */
          <div className="space-y-12">
            {/* Hero for guests */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-12 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    Discover great reads
                  </div>
                  
                  <h1 className="text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
                    Your personal library,{' '}
                    <span className="text-stone-500">anywhere you go</span>
                  </h1>
                  
                  <p className="text-stone-600 text-lg leading-relaxed">
                    Track your reading, discover new books, and connect with fellow readers.
                  </p>

                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-stone-100 rounded-xl">
                      <Search className="w-5 h-5 text-stone-400" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none"
                        placeholder="Search books..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-colors"
                    >
                      Search
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-colors"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/books"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-300 hover:border-stone-400 text-stone-700 font-medium rounded-xl transition-colors"
                    >
                      Browse Books
                    </Link>
                  </div>
                </div>

                <div className="bg-stone-100 p-8 lg:p-12 flex items-center">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white rounded-xl p-5 text-center">
                      <div className="text-3xl font-bold text-stone-900">10k+</div>
                      <div className="text-sm text-stone-500 mt-1">Books</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 text-center">
                      <div className="text-3xl font-bold text-stone-900">4.8</div>
                      <div className="text-sm text-stone-500 mt-1">Avg Rating</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 text-center">
                      <div className="text-3xl font-bold text-stone-900">2k+</div>
                      <div className="text-sm text-stone-500 mt-1">Readers</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 text-center">
                      <div className="text-3xl font-bold text-stone-900">50+</div>
                      <div className="text-sm text-stone-500 mt-1">Categories</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Sections */}
            <Section
              title="Trending Now"
              icon={TrendingUp}
              books={trendingBooks}
              loading={loadingBooks}
              onSeeAll={() => navigate('/books')}
            />

            <Section
              title="Top Rated"
              icon={Star}
              books={topRatedBooks}
              loading={loadingBooks}
              onSeeAll={() => navigate('/books')}
            />

            <Section
              title="New Arrivals"
              icon={Clock}
              books={newArrivals}
              loading={loadingBooks}
              onSeeAll={() => navigate('/books')}
            />

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
                  <Library className="w-6 h-6 text-stone-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">Organize Your Books</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Create custom shelves and organize your reading list the way you want.
                </p>
              </div>
              
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-stone-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">Set Reading Goals</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Challenge yourself with yearly reading goals and track your progress.
                </p>
              </div>
              
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-stone-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">Connect & Share</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Follow friends, share reviews, and discover what others are reading.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-stone-900 rounded-2xl p-8 lg:p-12 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                Ready to start reading?
              </h2>
              <p className="text-stone-400 mb-6 max-w-xl mx-auto">
                Join thousands of readers who track their books, share reviews, and discover new favorites.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white hover:bg-stone-100 text-stone-900 font-semibold rounded-xl transition-colors"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 border border-stone-700 hover:border-stone-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-stone-900">BookClub</span>
            </div>
            <p className="text-sm text-stone-500">
              © 2026 BookClub. Your personal reading companion.
            </p>
          </div>
        </div>
      </footer>

      {/* Challenge Books Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowChallengeModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">
                    {new Date().getFullYear()} Reading Challenge
                  </h2>
                  <p className="text-sm text-stone-500">
                    {challenge?.completedBooksCount || 0} / {challenge?.targetBooksCount || 0} books completed
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChallengeModal(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-stone-700">Progress</span>
                <span className="text-sm font-bold text-emerald-600">{Math.round(challengeProgress)}%</span>
              </div>
              <div className="h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all"
                  style={{ width: `${challengeProgress}%` }}
                />
              </div>
            </div>

            {/* Books List */}
            <div className="p-5 overflow-y-auto max-h-[50vh]">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Books Read This Year</h3>
              
              {challengeBooks.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">No books read yet</p>
                  <p className="text-sm text-stone-400 mt-1">
                    Add books to your "Read" shelf to track progress
                  </p>
                  <Link
                    to="/books"
                    onClick={() => setShowChallengeModal(false)}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    Browse Books
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {challengeBooks.map((book) => (
                    <Link
                      key={book.id}
                      to={`/books/${book.id}`}
                      onClick={() => setShowChallengeModal(false)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors group"
                    >
                      {/* Book Cover */}
                      <div className="w-12 h-16 bg-stone-200 rounded-lg overflow-hidden shrink-0">
                        {book.coverImage || book.coverImageUrl ? (
                          <img
                            src={book.coverImage || book.coverImageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-stone-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-stone-900 truncate group-hover:text-emerald-600 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-sm text-stone-500 truncate">
                          {book.author?.name || book.authorName || 'Unknown Author'}
                        </p>
                      </div>
                      
                      {/* Check Icon */}
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {challengeBooks.length > 0 && (
              <div className="p-4 border-t border-stone-200 bg-stone-50">
                <Link
                  to="/my-shelves"
                  onClick={() => setShowChallengeModal(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <Library className="w-4 h-4" />
                  View All Shelves
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Quote Modal */}
      <AddEditQuoteModal
        isOpen={showQuoteModal}
        onClose={handleCloseQuoteModal}
        mode={quoteModalMode}
        initialData={editingQuote}
        onSuccess={handleQuoteSuccess}
      />
    </div>
  );
};

export default HomePage;
