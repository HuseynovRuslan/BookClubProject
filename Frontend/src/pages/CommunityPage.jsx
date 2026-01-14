import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Users,
  UserPlus,
  UserCheck,
  Loader,
  X,
  Sparkles,
  Globe,
  Filter,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllUsers } from '../api/users';
import { followUser, unfollowUser, getMyFollowing } from '../api/userFollows';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

// Skeleton Components
const UserCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-stone-200 rounded-full" />
      <div className="flex-1">
        <div className="h-5 bg-stone-200 rounded w-32 mb-2" />
        <div className="h-4 bg-stone-200 rounded w-24" />
      </div>
      <div className="w-24 h-9 bg-stone-200 rounded-lg" />
    </div>
  </div>
);

// User Card Component
const UserCard = ({ user, isFollowing, onFollowToggle, isCurrentUser }) => {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);
  
  // Sync local state with prop when it changes
  useEffect(() => {
    setFollowing(isFollowing);
  }, [isFollowing]);
  
  const profilePicUrl = getImageUrl(user?.profilePictureUrl);
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.username?.[0]?.toUpperCase() || '?';

  const handleFollowToggle = async () => {
    if (loading || isCurrentUser) return;
    
    // Optimistic UI update
    setLoading(true);
    const wasFollowing = following;
    setFollowing(!following);
    
    try {
      if (wasFollowing) {
        await unfollowUser(user.id);
        toast.success(`Unfollowed ${user.username}`);
      } else {
        await followUser(user.id);
        toast.success(`Following ${user.username}`);
      }
      onFollowToggle(user.id, !wasFollowing);
    } catch (error) {
      // Handle 409 Conflict - already following/not following
      if (error.response?.status === 409) {
        // If we tried to follow but got 409, user is already followed
        if (!wasFollowing) {
          setFollowing(true);
          onFollowToggle(user.id, true);
          toast.info(`Already following ${user.username}`);
        } else {
          // If we tried to unfollow but got 409, user is already not followed
          setFollowing(false);
          onFollowToggle(user.id, false);
          toast.info(`Not following ${user.username}`);
        }
      } else {
        // Revert on other errors
        setFollowing(wasFollowing);
        toast.error(wasFollowing ? 'Failed to unfollow' : 'Failed to follow');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md hover:border-stone-300 transition-all group">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Link
          to={`/user/${user.username}`}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white text-lg font-semibold overflow-hidden shrink-0 ring-2 ring-stone-100 group-hover:ring-amber-200 transition-all"
        >
          {profilePicUrl ? (
            <img src={profilePicUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </Link>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/user/${user.username}`}
            className="font-semibold text-stone-800 hover:text-amber-600 transition-colors block truncate"
          >
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username}
          </Link>
          <p className="text-sm text-stone-400 truncate">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-stone-500 mt-1 line-clamp-1">{user.bio}</p>
          )}
        </div>

        {/* Follow Button */}
        {!isCurrentUser && (
          <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shrink-0 ${
              following
                ? 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : following ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Follow</span>
              </>
            )}
          </button>
        )}

        {isCurrentUser && (
          <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
            You
          </span>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ searchTerm, onClear }) => (
  <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-stone-100 to-stone-200 rounded-full flex items-center justify-center mb-4">
      <Users className="w-10 h-10 text-stone-400" />
    </div>
    <h3 className="text-lg font-semibold text-stone-800 mb-2">
      {searchTerm ? 'No users found' : 'No users yet'}
    </h3>
    <p className="text-stone-500 mb-6 max-w-sm mx-auto">
      {searchTerm
        ? `We couldn't find any users matching "${searchTerm}". Try a different search term.`
        : 'Be the first to invite friends to BookClub!'}
    </p>
    {searchTerm && (
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium"
      >
        <X className="w-4 h-4" />
        Clear Search
      </button>
    )}
  </div>
);

// Main Page Component
const CommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [users, setUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch following list
  const fetchFollowingList = useCallback(async () => {
    try {
      const response = await getMyFollowing(1, 1000);
      
      // Handle different response formats
      let following = [];
      if (response) {
        if (Array.isArray(response)) {
          following = response;
        } else if (Array.isArray(response.data)) {
          following = response.data;
        } else if (response.items && Array.isArray(response.items)) {
          following = response.items;
        }
      }
      
      const ids = new Set(following.map((u) => u.id));
      setFollowingIds(ids);
    } catch (error) {
      console.error('Error fetching following list:', error);
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1 && !append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getAllUsers(pageNum, 12, debouncedSearch);
      
      // Handle response format
      let items = [];
      let total = 0;
      let totalPages = 1;
      
      if (response) {
        if (Array.isArray(response)) {
          items = response;
          total = response.length;
        } else if (Array.isArray(response.data)) {
          items = response.data;
          total = response.totalCount || items.length;
          totalPages = response.totalPages || 1;
        } else if (response.items && Array.isArray(response.items)) {
          items = response.items;
          total = response.totalCount || items.length;
          totalPages = response.totalPages || 1;
        }
      }

      if (append) {
        setUsers((prev) => [...prev, ...items]);
      } else {
        setUsers(items);
      }
      
      setTotalCount(total);
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch]);

  // Initial load
  useEffect(() => {
    fetchFollowingList();
  }, [fetchFollowingList]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Handle follow toggle
  const handleFollowToggle = (userId, isNowFollowing) => {
    setFollowingIds((prev) => {
      const newSet = new Set(prev);
      if (isNowFollowing) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchUsers(page + 1, true);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-amber-500" />
                <h1 className="text-xl font-bold text-stone-800">Community</h1>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-stone-500">
              <Users className="w-4 h-4" />
              <span>{totalCount} members</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or username..."
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-stone-500">
              {debouncedSearch
                ? `Found ${totalCount} user${totalCount !== 1 ? 's' : ''} matching "${debouncedSearch}"`
                : `Showing ${users.length} of ${totalCount} members`}
            </p>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(8)].map((_, idx) => (
              <UserCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <EmptyState searchTerm={debouncedSearch} onClear={handleClearSearch} />
        )}

        {/* User Grid */}
        {!loading && users.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {users.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                isFollowing={followingIds.has(u.id)}
                onFollowToggle={handleFollowToggle}
                isCurrentUser={u.id === user?.id}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && users.length > 0 && hasMore && (
          <div className="text-center mt-8">
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
                  Load More Users
                </>
              )}
            </button>
          </div>
        )}

        {/* End of List */}
        {!loading && users.length > 0 && !hasMore && (
          <div className="text-center mt-8 py-4">
            <p className="text-stone-400 text-sm">You've seen all members! 🎉</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityPage;
