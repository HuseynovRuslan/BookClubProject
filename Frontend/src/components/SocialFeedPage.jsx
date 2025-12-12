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
    // Remove blob URLs before saving - they're invalid after page reload
    const cleanedPosts = posts.map(post => {
      const cleanedPost = { ...post };
      if (cleanedPost.postImage && cleanedPost.postImage.startsWith('blob:')) {
        cleanedPost.postImage = null;
      }
      if (cleanedPost.bookCover && cleanedPost.bookCover.startsWith('blob:')) {
        cleanedPost.bookCover = null;
      }
      return cleanedPost;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedPosts));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
};

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const posts = JSON.parse(stored);
    // Filter out blob URLs from postImage and bookCover as they're invalid after page reload
    // Also ensure quoteId and reviewId are strings, not objects
    // Remove posts with invalid quoteId (object format that can't be fixed)
    const cleanedPosts = posts
      .map(post => {
        const cleanedPost = { ...post };
        // Remove blob URLs - they're invalid after page reload
        if (cleanedPost.postImage && cleanedPost.postImage.startsWith('blob:')) {
          cleanedPost.postImage = null;
        }
        if (cleanedPost.bookCover && cleanedPost.bookCover.startsWith('blob:')) {
          cleanedPost.bookCover = null;
        }
        // Ensure quoteId is a string
        if (cleanedPost.quoteId && typeof cleanedPost.quoteId !== 'string') {
          const quoteIdObj = cleanedPost.quoteId;
          cleanedPost.quoteId = quoteIdObj.Id || 
                                quoteIdObj.id || 
                                quoteIdObj.quoteId || 
                                quoteIdObj.QuoteId ||
                                quoteIdObj.data?.Id ||
                                quoteIdObj.data?.id ||
                                quoteIdObj.Data?.Id ||
                                quoteIdObj.Data?.id ||
                                (quoteIdObj.toString && quoteIdObj.toString() !== '[object Object]' ? quoteIdObj.toString() : null) ||
                                String(quoteIdObj);
          
          // If still contains [object Object], set to null (will be filtered out)
          if (cleanedPost.quoteId && cleanedPost.quoteId.includes('[object')) {
            console.warn("quoteId contains [object Object], removing post. Original:", quoteIdObj);
            cleanedPost.quoteId = null;
          }
        }
        // Ensure reviewId is a string
        if (cleanedPost.reviewId && typeof cleanedPost.reviewId !== 'string') {
          cleanedPost.reviewId = cleanedPost.reviewId.id || cleanedPost.reviewId.Id || String(cleanedPost.reviewId);
        }
        return cleanedPost;
      })
      .filter(post => {
        // Remove posts that are quotes but have invalid quoteId
        if (post.type === 'quote' && (!post.quoteId || post.quoteId.includes('[object'))) {
          console.log("Removing quote post with invalid quoteId:", post.id);
          return false;
        }
        return true;
      });
    
    // Save cleaned posts back to localStorage to prevent future errors
    if (cleanedPosts.length !== posts.length || cleanedPosts.some((post, idx) => 
      (post.postImage !== posts[idx]?.postImage) || 
      (post.bookCover !== posts[idx]?.bookCover) ||
      (post.quoteId !== posts[idx]?.quoteId) ||
      (post.reviewId !== posts[idx]?.reviewId)
    )) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedPosts));
      console.log(`Cleaned ${posts.length - cleanedPosts.length} invalid posts from localStorage`);
    }
    
    return cleanedPosts;
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
  onDeletePost,
}) {
  const { user: authUser } = useAuth();
  const t = useTranslation();
  const [remotePosts, setRemotePosts] = useState(() => {
    // Load saved posts from localStorage on initial state
    const saved = loadFromStorage();
    return saved;
  });
  const [loading, setLoading] = useState(false); // Set to false since we're loading from localStorage initially
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
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/45687df3-eadd-450e-98a3-bb43b3daaefc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SocialFeedPage.jsx:135',message:'mergedPosts before setState',data:{mergedPostsCount:mergedPosts.length,firstPostUserAvatar:mergedPosts[0]?.userAvatar,additionalPostsCount:additionalPosts.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      setRemotePosts([...mergedPosts, ...additionalPosts]);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError(err.message || "Failed to load feed.");
      // On error, load from localStorage
      const saved = loadFromStorage();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/45687df3-eadd-450e-98a3-bb43b3daaefc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SocialFeedPage.jsx:141',message:'loaded from localStorage on error',data:{savedCount:saved.length,firstPostUserAvatar:saved[0]?.userAvatar},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      setRemotePosts(saved);
    } finally {
      setLoading(false);
    }
  }, [followingUsers, authUser]);

  // Disabled automatic feed refresh - user requested to disable this
  // useEffect(() => {
  //   if (!followingLoading && followingUsers.length >= 0) {
  //     fetchFeed();
  //   }
  // }, [fetchFeed, followingLoading, followingUsers.length]);

  const posts = useMemo(() => {
    // Create a map to merge posts and their comments
    const postMap = new Map();
    
    // First, add all remote posts
    remotePosts.forEach(post => {
      postMap.set(post.id, { ...post });
    });
    
    // Then, merge local posts (prioritize local posts)
    localPosts.forEach(post => {
      const existingPost = postMap.get(post.id);
      if (existingPost) {
        // Merge comments from both sources
        const existingCommentIds = new Set((existingPost.comments || []).map(c => c.id));
        const newComments = (post.comments || []).filter(c => !existingCommentIds.has(c.id));
        postMap.set(post.id, {
          ...existingPost,
          ...post, // Local post takes priority
          comments: [...(existingPost.comments || []), ...newComments]
        });
      } else {
        postMap.set(post.id, { ...post });
      }
    });
    
    const uniquePosts = Array.from(postMap.values());
    
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

  // Sync localPosts to remotePosts so they persist after page reload
  useEffect(() => {
    if (localPosts.length > 0) {
      setRemotePosts((prev) => {
        // Create a map to merge local and remote posts
        const postMap = new Map();
        
        // First, add all remote posts
        prev.forEach(post => {
          postMap.set(post.id, post);
        });
        
        // Then, add/update local posts (prioritize local posts)
        localPosts.forEach(localPost => {
          postMap.set(localPost.id, localPost);
        });
        
        const merged = Array.from(postMap.values());
        
        // Save to localStorage
        saveToStorage(merged);
        
        return merged;
      });
    }
  }, [localPosts]);

  const handleRemoteCommentAdd = useCallback(
    (postId, text) => {
      const newComment = {
        id: Date.now().toString(),
        username: currentUsername || authUser?.name || "You",
        userAvatar: authUser?.avatarUrl || authUser?.AvatarUrl || authUser?.profilePictureUrl || authUser?.ProfilePictureUrl || null,
        text,
        timestamp: new Date().toISOString(),
      };
      setRemotePosts((prev) => {
        const updated = prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), newComment],
              }
            : post
        );
        // Save to localStorage immediately
        saveToStorage(updated);
        return updated;
      });
    },
    [currentUsername, authUser]
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

  const handleRemotePostUpdate = useCallback(async (postId, updatedPost) => {
    // Update post in remote posts state
    setRemotePosts((prev) => {
      const updated = prev.map((p) => (p.id === postId ? updatedPost : p));
      // Save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        const merged = existing.map((p) => {
          const updatedPost = updated.find((up) => up.id === p.id);
          return updatedPost || p;
        });
        // Add new posts that aren't in existing
        updated.forEach((up) => {
          if (!merged.find((p) => p.id === up.id)) {
            merged.push(up);
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {
        console.error("Error saving post update to localStorage:", err);
      }
      return updated;
    });
  }, []);

  const handleRemotePostDelete = useCallback(async (postId, post) => {
    try {
      // Delete from backend if it's a review or quote
      if (post.type === "review" && post.reviewId) {
        const { deleteReview } = await import("../api/reviews");
        const reviewId = String(post.reviewId || post.reviewId?.id || post.reviewId?.Id || post.reviewId);
        await deleteReview(reviewId);
      } else if (post.type === "quote" && post.quoteId) {
        const { deleteQuote } = await import("../api/quotes");
        // Ensure quoteId is a string, not an object
        let quoteId = null;
        
        // Log the structure for debugging
        console.log("post.quoteId structure:", post.quoteId, "Type:", typeof post.quoteId);
        
        if (typeof post.quoteId === 'string') {
          quoteId = post.quoteId.trim();
        } else if (typeof post.quoteId === 'object' && post.quoteId !== null) {
          // Try all possible ways to extract the ID from the object
          quoteId = post.quoteId.id || 
                   post.quoteId.Id || 
                   post.quoteId.quoteId ||
                   post.quoteId.QuoteId ||
                   post.quoteId.data?.id ||
                   post.quoteId.data?.Id ||
                   post.quoteId.Data?.id ||
                   post.quoteId.Data?.Id ||
                   (post.quoteId.toString && post.quoteId.toString() !== '[object Object]' ? post.quoteId.toString() : null);
          
          if (quoteId) {
            quoteId = String(quoteId).trim();
          } else {
            // If we can't extract, try JSON.stringify to see the structure
            console.error("Cannot extract quoteId from object:", JSON.stringify(post.quoteId, null, 2));
            console.error("Full post object:", JSON.stringify(post, null, 2));
            throw new Error("quoteId is an object but cannot extract ID. Object keys: " + Object.keys(post.quoteId).join(', '));
          }
        } else {
          throw new Error("quoteId is not a string or object: " + typeof post.quoteId);
        }
        
        if (!quoteId || quoteId === 'null' || quoteId === 'undefined' || quoteId.includes('[object')) {
          console.error("Invalid quoteId detected:", { quoteId, postQuoteId: post.quoteId, postType: typeof post.quoteId, post });
          throw new Error("Invalid quoteId: " + quoteId);
        }
        
        console.log("Deleting quote with ID:", quoteId);
        await deleteQuote(quoteId);
      }
      
      // Remove from remote posts state
      setRemotePosts((prev) => {
        const updated = prev.filter((p) => p.id !== postId);
        // Save to localStorage
        try {
          const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
          const filtered = existing.filter((p) => p.id !== postId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (err) {
          console.error("Error saving post deletion to localStorage:", err);
        }
        return updated;
      });
    } catch (err) {
      console.error("Error deleting remote post:", err);
      throw err; // Re-throw to let component handle error display
    }
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 bg-white dark:bg-white min-h-screen">
      {/* Header Section - Ultra Modern Glassmorphism Design */}
      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-red-50/80 dark:from-amber-50/80 dark:via-orange-50/80 dark:to-red-50/80 rounded-3xl -z-10 backdrop-blur-md"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-amber-50/40 rounded-3xl -z-10"></div>
        <div className="px-6 py-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-1.5 h-16 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-xl"></div>
              <div className="absolute top-0 left-0 w-1.5 h-16 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-sm opacity-60 animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-tight mb-2 drop-shadow-sm">
                {t("feed.title")}
              </h1>
              <p className="text-gray-700 dark:text-gray-700 text-base sm:text-lg mt-2 font-semibold">
                {t("feed.subtitle")}
              </p>
            </div>
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
        <div className="space-y-4">
          {posts.map((post) => (
            <SocialFeedPost
              key={post.id}
              post={post}
              currentUsername={currentUsername}
              enableInteractions
              onAddComment={(postId, text) =>
                post.isLocal
                  ? onAddComment?.(postId, text)
                  : handleRemoteCommentAdd(postId, text)
              }
              onDeleteComment={(commentId) =>
                post.isLocal
                  ? onDeleteComment?.(post.id, commentId)
                  : handleRemoteCommentDelete(post.id, commentId)
              }
              onDeletePost={post.isLocal ? onDeletePost : handleRemotePostDelete}
              onViewReview={handleViewReview}
              onPostUpdate={post.isLocal ? undefined : handleRemotePostUpdate}
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
