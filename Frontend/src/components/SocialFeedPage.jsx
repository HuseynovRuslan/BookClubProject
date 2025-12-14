import { useCallback, useMemo, useState, useEffect } from "react";
import { getFeed } from "../api/feed";
import { getReviewById } from "../api/reviews";
import SocialFeedPost from "./SocialFeedPost";
import ReviewDetailModal from "./reviews/ReviewDetailModal";
import { useAuth } from "../context/AuthContext.jsx";
import { getFollowing } from "../api/userFollows";
import { useTranslation } from "../hooks/useTranslation";

const STORAGE_KEY = "bookverse_social_feed";
const REPORTED_POSTS_KEY = "bookverse_reported_posts";

// Helper function to get reported posts from localStorage
const getReportedPosts = () => {
  try {
    const reported = localStorage.getItem(REPORTED_POSTS_KEY);
    if (!reported) return [];
    return JSON.parse(reported);
  } catch (err) {
    console.error("Error loading reported posts:", err);
    return [];
  }
};

// Helper function to save reported post
const saveReportedPost = (postId) => {
  try {
    const reportedPosts = getReportedPosts();
    if (!reportedPosts.includes(postId)) {
      reportedPosts.push(postId);
      localStorage.setItem(REPORTED_POSTS_KEY, JSON.stringify(reportedPosts));
    }
  } catch (err) {
    console.error("Error saving reported post:", err);
  }
};

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
          
          // If still contains [object Object], try to keep the original value as string
          if (cleanedPost.quoteId && cleanedPost.quoteId.includes('[object')) {
            console.warn("quoteId contains [object Object], keeping original value. Original:", quoteIdObj);
            // Keep the original object as string representation instead of null
            cleanedPost.quoteId = String(quoteIdObj);
          }
        }
        // Ensure reviewId is a string
        if (cleanedPost.reviewId && typeof cleanedPost.reviewId !== 'string') {
          cleanedPost.reviewId = cleanedPost.reviewId.id || cleanedPost.reviewId.Id || String(cleanedPost.reviewId);
        }
        return cleanedPost;
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
  onReportPost,
  onPostUpdate,
  onLikeChange,
  onShowLogin,
  onShowRegister,
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

  // Helper function to fetch comments from backend for posts
  const fetchCommentsForPosts = useCallback(async (posts) => {
    const { getComments } = await import("../api/comments");
    
    const commentPromises = posts.map(async (post) => {
      if (!post.id) return post;
      
      // Determine post type and ID for comment fetching
      const postType = post.type === 'quote' ? 'quote' : 
                       post.type === 'review' ? 'review' : 'post';
      const postId = post.reviewId || post.quoteId || post.id;
      
      try {
        const comments = await getComments(postId, postType);
        
        // Normalize comment format from backend
        const normalizedComments = (comments || []).map(comment => ({
          id: comment.id || comment.Id,
          username: comment.username || comment.Username || comment.user?.name || comment.User?.Name || 'Anonymous',
          userAvatar: comment.userAvatar || comment.UserAvatar || comment.user?.avatarUrl || comment.User?.AvatarUrl || null,
          text: comment.text || comment.Text || comment.commentText || comment.CommentText || '',
          timestamp: comment.timestamp || comment.createdAt || comment.CreatedAt || new Date().toISOString(),
          createdAt: comment.createdAt || comment.CreatedAt || comment.timestamp || new Date().toISOString(),
        }));
        
        return {
          ...post,
          comments: normalizedComments,
        };
      } catch (err) {
        // If API not available (404) or other error, return post without comments
        if (err.status !== 404) {
          console.error(`Error fetching comments for post ${postId}:`, err);
        }
        return post; // Return post without comments on error
      }
    });
    
    return Promise.all(commentPromises);
  }, []);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load saved posts from localStorage first to ensure quotes persist
      const savedPosts = loadFromStorage();
      
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
      
      // Merge with saved posts from localStorage (which may contain quotes and local posts)
      const newPostIds = new Set(items.map(p => p.id));
      
      // Combine new API posts with existing posts, prioritizing saved versions (which have comments, likes, etc.)
      const mergedPosts = items.map(newPost => {
        // First check savedPosts (localStorage) - it has the most up-to-date comments and deletions
        // For reviews, check both id and reviewId to match posts
        let savedPost = savedPosts.find(sp => sp.id === newPost.id);
        if (!savedPost && newPost.type === 'review' && newPost.reviewId) {
          // Try to find by reviewId
          savedPost = savedPosts.find(sp => 
            (sp.type === 'review' && sp.reviewId === newPost.reviewId) ||
            (sp.type === 'review' && sp.id === newPost.reviewId)
          );
        }
        
        if (savedPost) {
          // Merge: use new post data but keep comments, likes, and other local data from saved post
          // CRITICAL: Always use savedPost.comments to preserve comments and deletions from ProfilePage
          return { 
            ...newPost, 
            comments: savedPost.comments || [], // Always use saved comments (from ProfilePage or SocialFeed)
            likes: savedPost.likes !== undefined ? savedPost.likes : (newPost.likes || 0),
            isLiked: savedPost.isLiked !== undefined ? savedPost.isLiked : (newPost.isLiked || false),
          };
        }
        
        // If not in savedPosts, check remotePosts (current state)
        const existingPost = remotePosts.find(ep => ep.id === newPost.id);
        if (existingPost) {
          return { 
            ...newPost, 
            comments: existingPost.comments || newPost.comments || [],
            likes: existingPost.likes !== undefined ? existingPost.likes : (newPost.likes || 0),
            isLiked: existingPost.isLiked !== undefined ? existingPost.isLiked : (newPost.isLiked || false),
          };
        }
        
        return newPost;
      });
      
      // Fetch comments from backend for all posts
      const postsWithBackendComments = await fetchCommentsForPosts(mergedPosts);
      
      // Merge backend comments with localStorage comments (avoid duplicates)
      const finalPosts = postsWithBackendComments.map(post => {
        const savedPost = savedPosts.find(sp => {
          if (sp.id === post.id) return true;
          if (post.type === 'review' && post.reviewId && sp.type === 'review' && sp.reviewId === post.reviewId) return true;
          return false;
        });
        
        if (savedPost && savedPost.comments && savedPost.comments.length > 0) {
          // Merge comments: combine backend and localStorage, remove duplicates by ID
          const backendCommentIds = new Set((post.comments || []).map(c => c.id).filter(Boolean));
          const localComments = (savedPost.comments || []).filter(c => c.id && !backendCommentIds.has(c.id));
          
          // Combine: backend comments first (more reliable), then local comments
          return {
            ...post,
            comments: [...(post.comments || []), ...localComments],
            // Also preserve likes and isLiked from localStorage
            likes: savedPost.likes !== undefined ? savedPost.likes : post.likes,
            isLiked: savedPost.isLiked !== undefined ? savedPost.isLiked : post.isLiked,
          };
        }
        
        return post;
      });
      
      // Add saved posts that aren't in new API feed (local posts, quotes, or old saved posts)
      // This ensures quotes and other local posts persist even if they're not in the API feed yet
      const additionalPosts = savedPosts.filter(ep => 
        !newPostIds.has(ep.id) && (
          ep.isLocal || // Local posts (including quotes)
          ep.type === 'quote' || // Quotes from localStorage
          ep.type === 'post' || // Normal posts from localStorage
          ep.type === 'review' // Reviews from localStorage
        )
      );
      
      // Remove duplicates from additionalPosts (in case remotePosts and savedPosts have same posts)
      const uniqueAdditionalPosts = Array.from(
        new Map(additionalPosts.map(post => [post.id, post])).values()
      );
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/45687df3-eadd-450e-98a3-bb43b3daaefc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SocialFeedPage.jsx:135',message:'mergedPosts before setState',data:{mergedPostsCount:finalPosts.length,firstPostUserAvatar:finalPosts[0]?.userAvatar,additionalPostsCount:uniqueAdditionalPosts.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      setRemotePosts([...finalPosts, ...uniqueAdditionalPosts]);
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
  }, [followingUsers, authUser, fetchCommentsForPosts]);

  // Fetch feed on mount and when following users change
  useEffect(() => {
    if (!followingLoading && followingUsers.length >= 0) {
      fetchFeed();
    }
  }, [fetchFeed, followingLoading, followingUsers.length]);

  const posts = useMemo(() => {
    // Create a map to merge posts and their comments
    const postMap = new Map();
    
    // First, add all remote posts
    remotePosts.forEach(post => {
      postMap.set(post.id, { ...post });
    });
    
    // Then, merge local posts (prioritize local posts)
    // Local posts should appear first (newest at top)
    localPosts.forEach(post => {
      const existingPost = postMap.get(post.id);
      if (existingPost) {
        // Merge comments from both sources
        const existingCommentIds = new Set((existingPost.comments || []).map(c => c.id));
        const newComments = (post.comments || []).filter(c => !existingCommentIds.has(c.id));
        postMap.set(post.id, {
          ...existingPost,
          ...post, // Local post takes priority
          comments: [...(existingPost.comments || []), ...newComments],
          isLocal: true // Ensure local flag is set
        });
      } else {
        postMap.set(post.id, { ...post, isLocal: true });
      }
    });
    
    const uniquePosts = Array.from(postMap.values());
    
    // Sort posts by timestamp (newest first) - local posts first, then by timestamp
    const sortedPosts = uniquePosts.sort((a, b) => {
      // Local posts (newly created) should be at the top
      if (a.isLocal && !b.isLocal) return -1;
      if (!a.isLocal && b.isLocal) return 1;
      
      // Then sort by timestamp (newest first)
      const timeA = new Date(a.timestamp || a.createdAt || a.CreatedAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || b.CreatedAt || 0).getTime();
      return timeB - timeA; // Descending order (newest first)
    });
    
    // Filter to only show posts from followed users (including own posts)
    if (followingUsers.length > 0) {
      const currentUserId = authUser?.id || authUser?.Id;
      return sortedPosts.filter(post => {
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
    return sortedPosts;
  }, [localPosts, remotePosts, followingUsers, authUser]);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      saveToStorage(posts);
    }
  }, [posts]);

  // Note: Comments are now fetched in fetchFeed() function, so we don't need a separate useEffect
  // This ensures comments are always fetched when feed is refreshed

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
    async (postId, text) => {
      // 1. Create optimistic comment (temporary ID)
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        username: currentUsername || authUser?.name || "You",
        userAvatar: authUser?.avatarUrl || authUser?.AvatarUrl || authUser?.profilePictureUrl || authUser?.ProfilePictureUrl || null,
        text,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      // 2. Find the post to determine its type - use functional update to get latest state
      let post = null;
      let postType = 'post';
      let actualPostId = postId;
      
      setRemotePosts((prev) => {
        post = prev.find(p => p.id === postId || (p.type === 'review' && p.reviewId === postId));
        if (post) {
          postType = post.type === 'quote' ? 'quote' : 
                      post.type === 'review' ? 'review' : 'post';
          actualPostId = post.reviewId || post.quoteId || postId;
        }
        return prev; // Don't change state, just read it
      });
      
      // If post not found in state, try localStorage
      if (!post) {
        const savedPosts = loadFromStorage();
        post = savedPosts.find(p => p.id === postId || (p.type === 'review' && p.reviewId === postId));
        if (post) {
          postType = post.type === 'quote' ? 'quote' : 
                      post.type === 'review' ? 'review' : 'post';
          actualPostId = post.reviewId || post.quoteId || postId;
        }
      }
      
      if (!post) {
        console.error("Post not found for comment:", postId);
        throw new Error("Post not found");
      }
      
      // 3. Update state immediately (optimistic update)
      // Use functional update to ensure we have the latest state
      setRemotePosts((prev) => {
        // Check if post exists in current state
        const existingPost = prev.find(p => p.id === postId || (p.type === 'review' && p.reviewId === postId));
        
        if (!existingPost) {
          // Post not found in state - try to load from localStorage
          const savedPosts = loadFromStorage();
          const savedPost = savedPosts.find(p => p.id === postId || (p.type === 'review' && p.reviewId === postId));
          
          if (savedPost) {
            // Add post from localStorage with new comment
            return [...prev, {
              ...savedPost,
              comments: [...(savedPost.comments || []), optimisticComment],
            }];
          }
          // Post not found anywhere - return prev unchanged
          console.warn("Post not found in state or localStorage for comment:", postId);
          return prev;
        }
        
        // Post exists - add comment (check for duplicate first)
        return prev.map((p) => {
          const isTargetPost = p.id === postId || (p.type === 'review' && p.reviewId === postId);
          if (isTargetPost) {
            // Check for duplicate before adding
            const hasComment = (p.comments || []).some(c => 
              c.id === optimisticComment.id || 
              (c.text === optimisticComment.text && c.username === optimisticComment.username &&
               Math.abs(new Date(c.timestamp || 0).getTime() - new Date(optimisticComment.timestamp).getTime()) < 5000)
            );
            if (!hasComment) {
              return {
                ...p,
                comments: [...(p.comments || []), optimisticComment],
              };
            }
            // Comment already exists, return unchanged
            return p;
          }
          return p;
        });
      });
      
      // 4. Save to localStorage immediately (with duplicate check)
      try {
        const savedPosts = loadFromStorage();
        const updatedPosts = savedPosts.map((p) => {
          const isTargetPost = p.id === postId || (p.type === 'review' && p.reviewId === postId);
          if (isTargetPost) {
            // Check for duplicate before adding
            const hasComment = (p.comments || []).some(c => 
              c.id === optimisticComment.id || 
              (c.text === optimisticComment.text && c.username === optimisticComment.username)
            );
            if (!hasComment) {
              return {
                ...p,
                comments: [...(p.comments || []), optimisticComment],
              };
            }
          }
          return p;
        });
        saveToStorage(updatedPosts);
      } catch (err) {
        console.error("Error saving comment to localStorage:", err);
      }
      
      // 5. Save to backend API
      let savedComment = null;
      try {
        const { createComment } = await import("../api/comments");
        savedComment = await createComment(actualPostId, text, postType);
      } catch (err) {
        // If API call fails (except 404), revert optimistic update
        if (err.status !== 404) {
          console.error("Error creating comment via API:", err);
          setRemotePosts((prev) => {
            return prev.map((p) => {
              const isTargetPost = p.id === postId || (p.type === 'review' && p.reviewId === postId);
              if (isTargetPost) {
                return {
                  ...p,
                  comments: (p.comments || []).filter(c => c.id !== optimisticComment.id),
                };
              }
              return p;
            });
          });
          throw err;
        }
        // 404 means API not available, keep optimistic comment
      }
      
      // 6. Replace optimistic comment with backend comment if available
      if (savedComment) {
        const backendComment = {
          id: savedComment.id || savedComment.Id || optimisticComment.id,
          username: savedComment.username || savedComment.Username || savedComment.user?.name || savedComment.User?.Name || optimisticComment.username,
          userAvatar: savedComment.userAvatar || savedComment.UserAvatar || savedComment.user?.avatarUrl || savedComment.User?.AvatarUrl || optimisticComment.userAvatar,
          text: savedComment.text || savedComment.Text || savedComment.commentText || savedComment.CommentText || text,
          timestamp: savedComment.timestamp || savedComment.createdAt || savedComment.CreatedAt || optimisticComment.timestamp,
          createdAt: savedComment.createdAt || savedComment.CreatedAt || savedComment.timestamp || optimisticComment.timestamp,
        };
        
        // Update state with backend comment
        setRemotePosts((prev) => {
          return prev.map((p) => {
            const isTargetPost = p.id === postId || (p.type === 'review' && p.reviewId === postId);
            if (isTargetPost) {
              // Replace temp comment with backend comment
              const updatedComments = (p.comments || []).map(c => 
                c.id === optimisticComment.id ? backendComment : c
              );
              return {
                ...p,
                comments: updatedComments,
              };
            }
            return p;
          });
        });
        
        // Update localStorage with backend comment
        try {
          const savedPosts = loadFromStorage();
          const updatedPosts = savedPosts.map((p) => {
            const isTargetPost = p.id === postId || (p.type === 'review' && p.reviewId === postId);
            if (isTargetPost) {
              const updatedComments = (p.comments || []).map(c => 
                c.id === optimisticComment.id ? backendComment : c
              );
              return {
                ...p,
                comments: updatedComments,
              };
            }
            return p;
          });
          saveToStorage(updatedPosts);
        } catch (err) {
          console.error("Error updating localStorage with backend comment:", err);
        }
      }
      
      // 7. Call parent's onAddComment if available (for App.jsx to sync with localPosts and userPosts)
      if (onAddComment) {
        try {
          await onAddComment(postId, text);
        } catch (err) {
          console.error("Error adding comment via parent handler:", err);
          // Don't revert - comment is already saved
        }
      }
      
      return Promise.resolve();
    },
    [currentUsername, authUser, onAddComment]
  );

  const handleRemoteCommentDelete = useCallback(async (postId, commentId) => {
    // Find the post and comment to check permissions
    let post = null;
    let comment = null;
    
    // Get current state
    setRemotePosts((prev) => {
      post = prev.find(p => p.id === postId);
      comment = post?.comments?.find(c => c.id === commentId);
      return prev;
    });
    
    // If not found in state, try localStorage
    if (!comment) {
      const savedPosts = loadFromStorage();
      post = savedPosts.find(p => p.id === postId);
      comment = post?.comments?.find(c => c.id === commentId);
    }
    
    if (!comment || !post) {
      console.warn("Comment not found for deletion:", commentId);
      alert("Comment tapılmadı");
      return;
    }

    // Check permissions: comment owner OR post owner can delete
    const commentOwnerUsername = comment.username;
    const postOwnerUsername = post?.username || post?.user?.name || post?.user?.username;
    const currentUsername = authUser?.name || authUser?.username || authUser?.firstName;
    const isCommentOwner = commentOwnerUsername === currentUsername;
    const isPostOwner = postOwnerUsername === currentUsername || 
                       (post?.userId && authUser?.id && String(post.userId) === String(authUser.id)) ||
                       (post?.isLocal && currentUsername);
    
    if (!isCommentOwner && !isPostOwner) {
      console.error("User does not have permission to delete this comment");
      alert("Bu comment-i silmək üçün icazəniz yoxdur");
      return;
    }

    // Optimistic update: Remove comment from UI immediately
    setRemotePosts((prev) => {
      const updated = prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: (post.comments || []).filter(
                (comment) => comment.id !== commentId
              ),
            }
          : post
      );
      // Save to localStorage immediately
      saveToStorage(updated);
      return updated;
    });

    try {
      // Try to delete from backend API
      const { deleteComment } = await import("../api/comments");
      const result = await deleteComment(commentId);
      
      // If API returns null, it means endpoint doesn't exist (404), continue with localStorage
      if (result === null) {
        console.log("Comments delete API not available, using localStorage only");
      }
    } catch (err) {
      // If API call fails (except 404), revert optimistic update
      if (err.status !== 404) {
        console.error("Error deleting comment from backend:", err);
        // Revert optimistic update by re-adding the comment
        setRemotePosts((prev) => {
          const updated = prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...(post.comments || []), comment],
                }
              : post
          );
          saveToStorage(updated);
          return updated;
        });
        alert("Comment silinərkən xəta baş verdi. Yenidən cəhd edin.");
        return;
      }
      // 404 means API not available, continue with localStorage fallback
    }
    
    // Also update localStorage directly to ensure persistence
    try {
      const savedPosts = loadFromStorage();
      const updated = savedPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: (post.comments || []).filter(
                (comment) => comment.id !== commentId
              ),
            }
          : post
      );
      saveToStorage(updated);
    } catch (err) {
      console.error("Error updating localStorage for comment deletion:", err);
    }
    
    // Call parent's handler if available (for App.jsx to sync with localPosts and userPosts)
    if (onDeleteComment) {
      try {
        // Check if parent handler is async
        const result = onDeleteComment(postId, commentId);
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (err) {
        console.error("Error deleting comment via parent handler:", err);
        // Don't throw - we've already updated local state
      }
    }
  }, [authUser, onDeleteComment]);

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
      // Call parent's onDeletePost if available (for App.jsx to handle deletion)
      // This will handle backend deletion, localStorage, localPosts, and userPosts
      if (onDeletePost) {
        await onDeletePost(postId, post);
      }
      
      // Also remove from remote posts state (for SocialFeedPage's own state)
      setRemotePosts((prev) => {
        const updated = prev.filter((p) => p.id !== postId);
        // Save to localStorage (onDeletePost already does this, but we do it here too for safety)
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
  }, [onDeletePost]);

  const handleReportPost = useCallback(async (postId, post) => {
    try {
      // Save reported post to localStorage (only hides from current user's feed)
      saveReportedPost(postId);
      
      // Remove from remote posts state so it disappears immediately
      setRemotePosts((prev) => prev.filter((p) => p.id !== postId));
      
      // Also remove from local posts if it exists there
      // Note: We don't call onDeletePost because we don't want to delete from backend
    } catch (err) {
      console.error("Error reporting post:", err);
      throw err;
    }
  }, []);

  const handleLocalPostUpdate = useCallback(async (postId, updatedPost) => {
    // This handles updates for local posts (passed from App.jsx via onPostUpdate prop)
    // The actual update is handled in App.jsx, but we need to ensure remotePosts is also updated
    // if the post exists there (for merged posts)
    setRemotePosts((prev) => {
      const updated = prev.map((p) => (p.id === postId ? { ...p, ...updatedPost } : p));
      return updated;
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
              allowEditDelete={false}
              onAddComment={(postId, text) => {
                // Always allow comments in Social Feed
                if (post.isLocal) {
                  // For local posts, use parent's handler
                  return onAddComment?.(postId, text);
                } else {
                  // For remote posts, use handleRemoteCommentAdd
                  return handleRemoteCommentAdd(postId, text);
              }
              }}
              // Social Feed'de yorum silme olmasın - sadece profile page'den silinsin
              onDeleteComment={undefined}
              // Social Feed: 3 dots menu should NOT appear at all
              onDeletePost={undefined}
              onReportPost={undefined}
              // Social Feed'de Review Details butonu olmasın
              onViewReview={undefined}
              onPostUpdate={post.isLocal ? (onPostUpdate ? async (postId, updatedPost) => {
                // Call parent's onPostUpdate for local posts
                await onPostUpdate(postId, updatedPost);
                // Also update remotePosts if post exists there (for merged posts)
                setRemotePosts((prev) => {
                  return prev.map((p) => (p.id === postId ? { ...p, ...updatedPost } : p));
                });
              } : undefined) : handleRemotePostUpdate}
              onLikeChange={(postId, likes, isLiked) => {
                // Update post likes in state
                setRemotePosts((prev) => {
                  const updated = prev.map((p) =>
                    p.id === postId ? { ...p, likes, isLiked } : p
                  );
                  // Save to localStorage for sync
                  saveToStorage(updated);
                  return updated;
                });
                
                // Also call parent's onLikeChange if available (for App.jsx to sync with localPosts and userPosts)
                if (onLikeChange) {
                  onLikeChange(postId, likes, isLiked);
                }
              }}
              onShowLogin={onShowLogin}
              onShowRegister={onShowRegister}
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
