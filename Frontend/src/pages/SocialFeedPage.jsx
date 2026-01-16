import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  RefreshCw,
  Compass,
  BookOpen,
  Star,
  UserPlus,
  UserCheck,
  Search,
  Sparkles,
  Loader,
  Rss,
  Globe,
  Heart,
} from 'lucide-react';
import { toast } from 'react-toastify';
import FeedItemCard from '../components/FeedItemCard';
import { getPersonalFeed, getSocialFeed } from '../api/feed';
import { getAllUsers } from '../api/users';
import { followUser, getMyFollowing } from '../api/userFollows';
import { getAllBooks } from '../api/books';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

// Helper to check if user is admin
const isAdmin = (user) => {
  if (!user) return false;
  // Check multiple possible field names for role
  const isAdminByRole = user?.role === 'Admin' || 
         user?.roles?.includes('Admin') ||
         user?.userRole === 'Admin' ||
         (Array.isArray(user?.roles) && user.roles.some(r => r === 'Admin' || r?.name === 'Admin'));
  
  // Also check by username (common admin username patterns)
  const isAdminByUsername = user?.username?.toLowerCase() === 'admin' ||
                            user?.username?.toLowerCase().startsWith('admin_');
  
  return isAdminByRole || isAdminByUsername;
};

// Skeleton Components
const FeedItemSkeleton = () => (
  <div className="bg-white rounded-xl border border-stone-200 p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-stone-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-stone-200 rounded w-32 mb-2" />
        <div className="h-3 bg-stone-200 rounded w-20" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-stone-200 rounded w-full" />
      <div className="h-4 bg-stone-200 rounded w-3/4" />
      <div className="h-4 bg-stone-200 rounded w-1/2" />
    </div>
    <div className="mt-4 flex gap-4">
      <div className="h-8 bg-stone-200 rounded w-16" />
      <div className="h-8 bg-stone-200 rounded w-20" />
    </div>
  </div>
);

const UserCardSkeleton = () => (
  <div className="flex items-center gap-3 p-3 animate-pulse">
    <div className="w-10 h-10 bg-stone-200 rounded-full" />
    <div className="flex-1">
      <div className="h-4 bg-stone-200 rounded w-24 mb-1" />
      <div className="h-3 bg-stone-200 rounded w-16" />
    </div>
    <div className="w-16 h-8 bg-stone-200 rounded-lg" />
  </div>
);

const BookCardSkeleton = () => (
  <div className="flex items-center gap-3 p-3 animate-pulse">
    <div className="w-10 h-14 bg-stone-200 rounded" />
    <div className="flex-1">
      <div className="h-4 bg-stone-200 rounded w-32 mb-1" />
      <div className="h-3 bg-stone-200 rounded w-24" />
    </div>
  </div>
);

// User Suggestion Card
const UserSuggestionCard = ({ user, onFollow }) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const profilePicUrl = getImageUrl(user?.profilePictureUrl);
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.username?.[0]?.toUpperCase() || '?';

  const handleFollow = async () => {
    if (loading || following || isAdmin(user)) return;

    // Optimistic UI update
    setLoading(true);
    setFollowing(true);

    try {
      await followUser(user.id);
      toast.success(`Following ${user.username}`);
      if (onFollow) onFollow(user.id);
    } catch (error) {
      // Handle 409 Conflict - already following
      if (error.response?.status === 409) {
        setFollowing(true);
        toast.info(`Already following ${user.username}`);
        if (onFollow) onFollow(user.id);
      } else {
        // Revert on other errors
        setFollowing(false);
        toast.error('Failed to follow user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg transition-colors">
      <Link
        to={`/profile/${user.username}`}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0"
      >
        {profilePicUrl ? (
          <img src={profilePicUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${user.username}`}
          className="font-medium text-stone-800 hover:text-stone-600 truncate block text-sm"
        >
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username}
        </Link>
        <p className="text-xs text-stone-400 truncate">@{user.username}</p>
      </div>
      <button
        onClick={handleFollow}
        disabled={following || loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${following
            ? 'bg-stone-100 text-stone-500'
            : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
      >
        {loading ? (
          <Loader className="w-3 h-3 animate-spin" />
        ) : following ? (
          <>
            <UserCheck className="w-3 h-3" />
            <span>Following</span>
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3" />
            <span>Follow</span>
          </>
        )}
      </button>
    </div>
  );
};

// Trending Book Card
const TrendingBookCard = ({ book, rank }) => {
  const coverUrl = getImageUrl(book?.coverImageUrl);

  return (
    <Link
      to={`/books/${book.id}`}
      className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg transition-colors group"
    >
      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">
        {rank}
      </div>
      <div className="w-10 h-14 rounded overflow-hidden bg-stone-100 shrink-0">
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-stone-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-stone-800 text-sm truncate group-hover:text-amber-600 transition-colors">
          {book.title}
        </h4>
        <p className="text-xs text-stone-400 truncate">{book.authorName}</p>
        {book.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-stone-500">{book.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

// Empty State Component
const EmptyState = ({ feedType, onSwitchFeed }) => (
  <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-stone-100 to-stone-200 rounded-full flex items-center justify-center mb-4">
      {feedType === 'personal' ? (
        <Users className="w-10 h-10 text-stone-400" />
      ) : (
        <Compass className="w-10 h-10 text-stone-400" />
      )}
    </div>
    <h3 className="text-lg font-semibold text-stone-800 mb-2">
      {feedType === 'personal' ? 'Your feed is quiet' : 'Nothing to discover yet'}
    </h3>
    <p className="text-stone-500 mb-6 max-w-sm mx-auto">
      {feedType === 'personal'
        ? "Follow some readers to see their updates! Discover what books they're reading, quotes they love, and reviews they share."
        : "There's no activity in the community yet. Be the first to share something!"}
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {feedType === 'personal' && (
        <button
          onClick={onSwitchFeed}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium"
        >
          <Globe className="w-4 h-4" />
          Explore Community
        </button>
      )}
      <Link
        to="/browse"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
      >
        <Search className="w-4 h-4" />
        Find Friends
      </Link>
    </div>
  </div>
);

// Main Page Component
const SocialFeedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Feed State
  const [feedType, setFeedType] = useState('personal'); // 'personal' or 'discover'
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sidebar State
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Fetch feed
  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1 && !append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const fetchFn = feedType === 'personal' ? getPersonalFeed : getSocialFeed;
      const response = await fetchFn(pageNum, 10);

      // Handle different response formats
      // PagedResult format: { data: [], totalPages, pageNumber, pageSize, totalCount }
      // Or direct array
      let items = [];
      let totalPages = 1;

      if (response) {
        if (Array.isArray(response)) {
          items = response;
        } else if (Array.isArray(response.data)) {
          items = response.data;
          totalPages = response.totalPages || 1;
        } else if (response.items && Array.isArray(response.items)) {
          items = response.items;
          totalPages = response.totalPages || 1;
        }
      }

      // Filter out items from admin users
      const filteredItems = items.filter(item => !isAdmin(item?.user));
      
      if (append) {
        setFeedItems((prev) => [...prev, ...filteredItems]);
      } else {
        setFeedItems(filteredItems);
      }

      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching feed:', error);
      toast.error('Failed to load feed');
      setFeedItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [feedType]);

  // Fetch all books for trending calculation (same as HomePage)
  const fetchAllBooks = useCallback(async () => {
    try {
      setLoadingBooks(true);
      const response = await getAllBooks(1, 1000);
      const allBooksData = response?.items || (Array.isArray(response) ? response : []);
      setAllBooks(allBooksData);
    } catch (err) {
      console.error('Error loading books:', err);
      setAllBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  // Calculate trending books using the same algorithm as HomePage
  const trendingBooks = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    // Trending: Most rated/popular (by rating count) - same as HomePage
    return [...allBooks]
      .sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))
      .slice(0, 5); // Show top 5 in sidebar
  }, [allBooks]);

  // Fetch sidebar data (Who to Follow)
  const fetchSidebarData = useCallback(async () => {
    setSidebarLoading(true);
    try {
      // Fetch in parallel: all users, current user's following list
      const [allUsersRes, followingRes] = await Promise.all([
        getAllUsers(1, 30), // Get first 30 users
        getMyFollowing(1, 1000), // Get all users I'm following
      ]);

      // Parse users response
      let allUsers = [];
      if (allUsersRes) {
        if (Array.isArray(allUsersRes)) {
          allUsers = allUsersRes;
        } else if (Array.isArray(allUsersRes.data)) {
          allUsers = allUsersRes.data;
        } else if (allUsersRes.items && Array.isArray(allUsersRes.items)) {
          allUsers = allUsersRes.items;
        }
      }

      // Parse following response
      let following = [];
      if (followingRes) {
        if (Array.isArray(followingRes)) {
          following = followingRes;
        } else if (Array.isArray(followingRes.data)) {
          following = followingRes.data;
        } else if (followingRes.items && Array.isArray(followingRes.items)) {
          following = followingRes.items;
        }
      }

      // Get set of following IDs for quick lookup
      const followingIds = new Set(following.map((u) => u.id));
      const currentUserId = user?.id;

      // Filter out: users I already follow + myself + admins
      const eligibleUsers = allUsers.filter(
        (u) => u.id !== currentUserId && !followingIds.has(u.id) && !isAdmin(u)
      );

      // Shuffle and pick 3 random users
      const shuffled = eligibleUsers.sort(() => Math.random() - 0.5);
      const suggested = shuffled.slice(0, 3);

      setSuggestedUsers(suggested);
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
    } finally {
      setSidebarLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  useEffect(() => {
    fetchSidebarData();
  }, [fetchSidebarData]);

  useEffect(() => {
    fetchAllBooks();
  }, [fetchAllBooks]);

  // Refresh feed
  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeed(1);
  };

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(page + 1, true);
    }
  };

  // Switch feed type
  const handleSwitchFeed = (type) => {
    if (type !== feedType) {
      setFeedType(type);
      setPage(1);
      setFeedItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Rss className="w-6 h-6 text-amber-500" />
                <h1 className="text-xl font-bold text-stone-800">Activity Feed</h1>
              </div>
            </div>

            {/* Feed Type Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
              <button
                onClick={() => handleSwitchFeed('personal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${feedType === 'personal'
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                  }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Following</span>
              </button>
              <button
                onClick={() => handleSwitchFeed('discover')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${feedType === 'discover'
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                  }`}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Discover</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Feed Column */}
          <div className="flex-1 max-w-2xl space-y-4">
            {/* Loading Skeletons */}
            {loading && (
              <>
                <FeedItemSkeleton />
                <FeedItemSkeleton />
                <FeedItemSkeleton />
              </>
            )}

            {/* Empty State */}
            {!loading && (!feedItems || feedItems.length === 0) && (
              <EmptyState
                feedType={feedType}
                onSwitchFeed={() => handleSwitchFeed('discover')}
              />
            )}

            {/* Feed Items */}
            {!loading && Array.isArray(feedItems) &&
              feedItems.map((item) => (
                <FeedItemCard
                  key={item.id}
                  item={item}
                  onItemDeleted={(itemId) => setFeedItems(prev => prev.filter(i => i.id !== itemId))}
                />
              ))}

            {/* Load More Button */}
            {!loading && feedItems?.length > 0 && hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all font-medium"
                >
                  {loadingMore ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Load More
                    </>
                  )}
                </button>
              </div>
            )}

            {/* End of Feed */}
            {!loading && feedItems?.length > 0 && !hasMore && (
              <div className="text-center py-8">
                <p className="text-stone-400 text-sm">You've reached the end! 🎉</p>
              </div>
            )}
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-80 space-y-6">
            {/* Who to Follow */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-stone-600" />
                  <h3 className="font-semibold text-stone-800">Who to Follow</h3>
                </div>
              </div>
              <div className="divide-y divide-stone-100">
                {sidebarLoading ? (
                  <>
                    <UserCardSkeleton />
                    <UserCardSkeleton />
                    <UserCardSkeleton />
                  </>
                ) : suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user) => (
                    <UserSuggestionCard
                      key={user.id}
                      user={user}
                      onFollow={(id) =>
                        setSuggestedUsers((prev) => prev.filter((u) => u.id !== id))
                      }
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-stone-400 text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p>No suggestions yet</p>
                    <Link
                      to="/community"
                      className="text-amber-600 hover:text-amber-700 font-medium mt-1 inline-block"
                    >
                      Browse all users
                    </Link>
                  </div>
                )}
              </div>
              <Link
                to="/community"
                className="block px-4 py-3 text-center text-sm text-stone-600 hover:text-stone-800 hover:bg-stone-50 font-medium border-t border-stone-100"
              >
                View All Members →
              </Link>
            </div>

            {/* Trending Books */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-stone-800">Trending Books</h3>
                </div>
              </div>
              <div className="divide-y divide-stone-100">
                {sidebarLoading || loadingBooks ? (
                  <>
                    <BookCardSkeleton />
                    <BookCardSkeleton />
                    <BookCardSkeleton />
                  </>
                ) : trendingBooks.length > 0 ? (
                  trendingBooks.map((book, idx) => (
                    <TrendingBookCard key={book.id} book={book} rank={idx + 1} />
                  ))
                ) : (
                  <div className="p-4 text-center text-stone-400 text-sm">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p>No trending books</p>
                  </div>
                )}
              </div>
              <Link
                to="/books"
                className="block px-4 py-3 text-center text-sm text-amber-600 hover:text-amber-700 hover:bg-stone-50 font-medium border-t border-stone-100"
              >
                View All Books →
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl p-5 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Stay Connected</h4>
                  <p className="text-stone-400 text-sm">Follow readers you love</p>
                </div>
              </div>
              <p className="text-stone-300 text-sm leading-relaxed">
                See what books your friends are reading, quotes they love, and reviews they share.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SocialFeedPage;
