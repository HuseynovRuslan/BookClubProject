import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Loader,
    Sparkles,
    User as UserIcon,
    Calendar,
    BookOpen,
} from 'lucide-react';
import { toast } from 'react-toastify';
import FeedItemCard from '../components/FeedItemCard';
import { getUserFeed } from '../api/feed';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

// Helper to get full image URL
const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
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

// Profile Header Skeleton
const ProfileHeaderSkeleton = () => (
    <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-stone-200 rounded-full animate-pulse" />
            <div className="flex-1">
                <div className="h-6 bg-stone-200 rounded w-40 mb-2 animate-pulse" />
                <div className="h-4 bg-stone-200 rounded w-32 animate-pulse" />
            </div>
        </div>
    </div>
);

// Empty State Component
const EmptyState = () => (
    <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-stone-100 to-stone-200 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-stone-400" />
        </div>
        <h3 className="text-lg font-semibold text-stone-800 mb-2">No activity yet</h3>
        <p className="text-stone-500 mb-6 max-w-sm mx-auto">
            This user hasn't shared any quotes, reviews, or added books to shelves yet.
        </p>
    </div>
);

// Main Component
const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    // State
    const [profileUser, setProfileUser] = useState(null);
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user feed
    const fetchUserFeed = useCallback(
        async (pageNum = 1, append = false) => {
            try {
                if (pageNum === 1 && !append) {
                    setLoading(true);
                    setError(null);
                } else {
                    setLoadingMore(true);
                }

                const response = await getUserFeed(userId, pageNum, 10);

                // Handle PagedResult format
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

                // Extract user info from first item (all items should have same user)
                if (items.length > 0 && items[0].user) {
                    setProfileUser(items[0].user);
                }

                if (append) {
                    setFeedItems((prev) => [...prev, ...items]);
                } else {
                    setFeedItems(items);
                }

                setHasMore(pageNum < totalPages);
                setPage(pageNum);
            } catch (error) {
                console.error('Error fetching user feed:', error);

                if (error.response?.status === 404) {
                    setError('User not found');
                    toast.error('User not found');
                } else {
                    setError('Failed to load user profile');
                    toast.error('Failed to load user profile');
                }
                setFeedItems([]);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [userId]
    );

    // Initial load
    useEffect(() => {
        fetchUserFeed(1);
    }, [fetchUserFeed]);

    // Load more
    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchUserFeed(page + 1, true);
        }
    };

    // If there's an error, show error state
    if (error && !loading) {
        return (
            <div className="min-h-screen bg-stone-50">
                <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <h1 className="text-xl font-bold text-stone-800">User Profile</h1>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                    <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
                        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <UserIcon className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-stone-800 mb-2">{error}</h3>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const profilePicUrl = getImageUrl(profileUser?.profilePictureUrl);
    const initials =
        profileUser?.firstName && profileUser?.lastName
            ? `${profileUser.firstName[0]}${profileUser.lastName[0]}`
            : profileUser?.username?.[0]?.toUpperCase() || '?';

    const displayName =
        profileUser?.firstName && profileUser?.lastName
            ? `${profileUser.firstName} ${profileUser.lastName}`
            : profileUser?.username || 'User';

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-stone-800">{displayName}</h1>
                                {profileUser?.username && (
                                    <p className="text-xs text-stone-500">@{profileUser.username}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                {/* Profile Header */}
                {loading && !profileUser ? (
                    <ProfileHeaderSkeleton />
                ) : (
                    profileUser && (
                        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden shrink-0">
                                    {profilePicUrl ? (
                                        <img src={profilePicUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-stone-800 mb-1">{displayName}</h2>
                                    {profileUser.username && (
                                        <p className="text-sm text-stone-500 mb-2">@{profileUser.username}</p>
                                    )}
                                    {profileUser.email && (
                                        <p className="text-sm text-stone-600 mb-2">{profileUser.email}</p>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-stone-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Member since {new Date(profileUser.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}

                {/* Feed Section */}
                <div className="space-y-4">
                    {/* Loading Skeletons */}
                    {loading && (
                        <>
                            <FeedItemSkeleton />
                            <FeedItemSkeleton />
                            <FeedItemSkeleton />
                        </>
                    )}

                    {/* Empty State */}
                    {!loading && (!feedItems || feedItems.length === 0) && <EmptyState />}

                    {/* Feed Items */}
                    {!loading &&
                        Array.isArray(feedItems) &&
                        feedItems.map((item) => (
                            <FeedItemCard
                                key={item.id}
                                item={item}
                                onItemDeleted={(itemId) =>
                                    setFeedItems((prev) => prev.filter((i) => i.id !== itemId))
                                }
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
            </main>
        </div>
    );
};

export default UserProfile;
