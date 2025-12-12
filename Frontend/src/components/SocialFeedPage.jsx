import { useCallback, useMemo, useState, useEffect } from "react";
import { getFeed } from "../api/feed";
import { getReviewById } from "../api/reviews";
import SocialFeedPost from "./SocialFeedPost";
import ReviewDetailModal from "./reviews/ReviewDetailModal";
import { useAuth } from "../context/AuthContext.jsx";
import { getFollowing } from "../api/userFollows";
import { useTranslation } from "../hooks/useTranslation";

const STORAGE_KEY = "bookverse_social_feed";

// localStorage helper functions
const saveToStorage = (posts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
};

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Error loading from localStorage:", err);
    return [];
  }
};

export default function SocialFeedPage({
  currentUsername,
  localPosts = [],
  onAddComment,
  onDeleteComment,
}) {
  const { user: authUser } = useAuth();
  const t = useTranslation();
  const [remotePosts, setRemotePosts] = useState(() => {
    // Load saved posts from localStorage on initial state
    const saved = loadFromStorage();
    return saved;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [reviewModalError, setReviewModalError] = useState(null);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(true);

  // Load following users list
  const loadFollowing = useCallback(async () => {
    if (!authUser?.id) {
      setFollowingLoading(false);
      return;
    }
    try {
      const following = await getFollowing();
      // Extract user IDs from following list
      const userIds = following.map(user => user.id || user.Id || user.userId || user.UserId).filter(Boolean);
      // Also include current user's ID to show own posts
      const currentUserId = authUser.id || authUser.Id;
      if (currentUserId) {
        userIds.push(currentUserId);
      }
      setFollowingUsers(userIds);
    } catch (err) {
      console.error("Error loading following users:", err);
      // On error, still show all posts (fallback behavior)
      setFollowingUsers([]);
    } finally {
      setFollowingLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    loadFollowing();
  }, [loadFollowing]);

  // Listen for follow status changes separately
  useEffect(() => {
    const handleFollowStatusChange = () => {
      loadFollowing();
    };
    
    window.addEventListener('followStatusChanged', handleFollowStatusChange);
    
    return () => {
      window.removeEventListener('followStatusChanged', handleFollowStatusChange);
    };
  }, [loadFollowing]);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch a large number of posts since pagination is removed
      const response = await getFeed({ page: 1, pageSize: 100 });
      // getFeed already returns normalized format: { items, total, page, pageSize }
      let items = response.items || [];
      
      // Filter posts to only show posts from followed users (including own posts)
      if (followingUsers.length > 0) {
        const currentUserId = authUser?.id || authUser?.Id;
        items = items.filter(post => {
          // Get post author ID - try different possible field names
          const postUserId = post.userId || post.UserId || 
                           post.user?.id || post.User?.Id ||
                           post.user?.userId || post.User?.UserId;
          
          // Include if post is from a followed user or from current user
          return followingUsers.includes(postUserId) || postUserId === currentUserId;
        });
      }
      
      // Merge with current remotePosts (which may contain saved posts)
      const newPostIds = new Set(items.map(p => p.id));
      
      // Combine new API posts with existing posts, prioritizing existing versions (which have comments, likes, etc.)
      const mergedPosts = items.map(newPost => {
        const existingPost = remotePosts.find(ep => ep.id === newPost.id);
        if (existingPost) {
          // Use existing version (has comments, likes, etc.) but update with new data
          return { ...newPost, ...existingPost };
        }
        return newPost;
      });
      
      // Add existing posts that aren't in new API feed (local posts or old saved posts)
      const additionalPosts = remotePosts.filter(ep => 
        !newPostIds.has(ep.id)
      );
      
      setRemotePosts([...mergedPosts, ...additionalPosts]);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError(err.message || "Failed to load feed.");
      // On error, load from localStorage
      const saved = loadFromStorage();
      setRemotePosts(saved);
    } finally {
      setLoading(false);
    }
  }, [followingUsers, authUser]);

  useEffect(() => {
    if (!followingLoading && followingUsers.length >= 0) {
      fetchFeed();
    }
  }, [fetchFeed, followingLoading, followingUsers.length]);

  const posts = useMemo(() => {
    // Combine local and remote posts
    const allPosts = [...localPosts, ...remotePosts];
    
    // Remove duplicates (prioritize localPosts > remotePosts)
    const uniquePosts = [];
    const seenIds = new Set();
    
    for (const post of allPosts) {
      if (!seenIds.has(post.id)) {
        seenIds.add(post.id);
        uniquePosts.push(post);
      }
    }
    
    // Filter to only show posts from followed users (including own posts)
    if (followingUsers.length > 0) {
      const currentUserId = authUser?.id || authUser?.Id;
      return uniquePosts.filter(post => {
        // Local posts are always from current user, so include them
        if (post.isLocal) return true;
        
        // Get post author ID
        const postUserId = post.userId || post.UserId || 
                          post.user?.id || post.User?.Id ||
                          post.user?.userId || post.User?.UserId;
        
        // Include if post is from a followed user or from current user
        return followingUsers.includes(postUserId) || postUserId === currentUserId;
      });
    }
    
    // If no following list loaded yet, show all posts
    return uniquePosts;
  }, [localPosts, remotePosts, followingUsers, authUser]);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      saveToStorage(posts);
    }
  }, [posts]);

  const handleRemoteCommentAdd = useCallback(
    (postId, text) => {
      const newComment = {
        id: Date.now().toString(),
        username: currentUsername || "You",
        text,
        timestamp: "Just now",
      };
      setRemotePosts((prev) => {
        return prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), newComment],
              }
            : post
        );
      });
    },
    [currentUsername]
  );

  const handleRemoteCommentDelete = useCallback((postId, commentId) => {
    setRemotePosts((prev) => {
      return prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: (post.comments || []).filter(
                (comment) => comment.id !== commentId
              ),
            }
          : post
      );
    });
  }, []);

  const handleViewReview = useCallback(
    async (item) => {
      setReviewModalOpen(true);
      setReviewModalError(null);
      setReviewDetail({
        id: item.reviewId || item.id,
        rating: item.rating,
        text: item.review,
        book: {
          title: item.bookTitle,
          coverImage: item.bookCover,
        },
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      });
      if (!item.reviewId) {
        return;
      }
      try {
        const fullReview = await getReviewById(item.reviewId);
        setReviewDetail(fullReview);
      } catch (err) {
        setReviewModalError(err.message || "Review detalları tapılmadı");
      }
    },
    []
  );

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 bg-white dark:bg-white min-h-screen">
      {/* Header Section - Ultra Modern Glassmorphism Design */}
      <div className="mb-14 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-red-50/80 dark:from-amber-50/80 dark:via-orange-50/80 dark:to-red-50/80 rounded-3xl -z-10 backdrop-blur-md"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-amber-50/40 rounded-3xl -z-10"></div>
        <div className="px-10 py-12 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5 flex-1">
              <div className="relative">
                <div className="w-2 h-20 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-xl"></div>
                <div className="absolute top-0 left-0 w-2 h-20 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-sm opacity-60 animate-pulse"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-none mb-3 drop-shadow-sm">
                  {t("feed.title")}
                </h1>
                <p className="text-gray-700 dark:text-gray-700 text-xl sm:text-2xl mt-3 font-semibold">
                  {t("feed.subtitle")}
                </p>
              </div>
            </div>
            <button
              onClick={fetchFeed}
              className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t("feed.refresh")}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-purple-600 dark:border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-700 mt-6">{t("feed.loading")}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-50 dark:to-orange-50 border-2 border-red-200 dark:border-red-200 rounded-2xl shadow-lg">
          <p className="text-red-600 dark:text-red-600 font-semibold mb-4">{error}</p>
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={fetchFeed}
          >
            {t("common.error")} - {t("feed.refresh")}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-full mb-6">
            <svg className="h-12 w-12 text-amber-500 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900 mb-3">
            {t("feed.noPosts")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-600">
            {t("feed.createPost")}
          </p>
        </div>
      )}

      {/* Posts */}
      {!loading && !error && posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <SocialFeedPost
              key={post.id}
              post={post}
              currentUsername={currentUsername}
              enableInteractions
              onAddComment={(text) =>
                post.isLocal
                  ? onAddComment?.(post.id, text)
                  : handleRemoteCommentAdd(post.id, text)
              }
              onDeleteComment={(commentId) =>
                post.isLocal
                  ? onDeleteComment?.(post.id, commentId)
                  : handleRemoteCommentDelete(post.id, commentId)
              }
              onViewReview={handleViewReview}
              onLikeChange={(postId, likes, isLiked) => {
                // Update post likes in state
                setRemotePosts((prev) => {
                  return prev.map((p) =>
                    p.id === postId ? { ...p, likes, isLiked } : p
                  );
                });
              }}
            />
          ))}
        </div>
      )}

      {reviewModalOpen && reviewDetail && (
        <ReviewDetailModal
          review={reviewDetail}
          errorMessage={reviewModalError}
          onClose={() => {
            setReviewModalOpen(false);
            setReviewDetail(null);
            setReviewModalError(null);
          }}
        />
      )}

      {reviewModalOpen && reviewModalError && !reviewDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-white p-8 rounded-3xl max-w-md text-center space-y-6 border-2 border-gray-200 dark:border-gray-200 shadow-2xl">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-900">{reviewModalError}</p>
            <button
              onClick={() => {
                setReviewModalOpen(false);
                setReviewModalError(null);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
