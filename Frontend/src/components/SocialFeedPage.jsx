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


const getReportedPosts = () => {
  try {
    const reported = localStorage.getItem(REPORTED_POSTS_KEY);
    if (!reported) return [];
    return JSON.parse(reported);
  } catch (err) {
    return [];
  }
};


const saveReportedPost = (postId) => {
  try {
    const reportedPosts = getReportedPosts();
    if (!reportedPosts.includes(postId)) {
      reportedPosts.push(postId);
      localStorage.setItem(REPORTED_POSTS_KEY, JSON.stringify(reportedPosts));
    }
  } catch (err) {

  }
};


const saveToStorage = (posts) => {
  try {

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

  }
};

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const posts = JSON.parse(stored);



    const cleanedPosts = posts
      .map(post => {
        const cleanedPost = { ...post };

        if (cleanedPost.postImage && cleanedPost.postImage.startsWith('blob:')) {
          cleanedPost.postImage = null;
        }
        if (cleanedPost.bookCover && cleanedPost.bookCover.startsWith('blob:')) {
          cleanedPost.bookCover = null;
        }

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
          

          if (cleanedPost.quoteId && cleanedPost.quoteId.includes('[object')) {

            cleanedPost.quoteId = String(quoteIdObj);
          }
        }

        if (cleanedPost.reviewId && typeof cleanedPost.reviewId !== 'string') {
          cleanedPost.reviewId = cleanedPost.reviewId.id || cleanedPost.reviewId.Id || String(cleanedPost.reviewId);
        }
        return cleanedPost;
      });
    

    if (cleanedPosts.length !== posts.length || cleanedPosts.some((post, idx) => 
      (post.postImage !== posts[idx]?.postImage) || 
      (post.bookCover !== posts[idx]?.bookCover) ||
      (post.quoteId !== posts[idx]?.quoteId) ||
      (post.reviewId !== posts[idx]?.reviewId)
    )) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedPosts));
    }
    
    return cleanedPosts;
  } catch (err) {
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
  const { user: authUser, isGuest } = useAuth();
  const t = useTranslation();
  const [remotePosts, setRemotePosts] = useState(() => {

    const saved = loadFromStorage();
    return saved;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [reviewModalError, setReviewModalError] = useState(null);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(true);


  const loadFollowing = useCallback(async () => {

    if (isGuest || !authUser?.id) {
      setFollowingLoading(false);
      setFollowingUsers([]);
      return;
    }
    try {
      const following = await getFollowing();

      const userIds = following.map(user => user.id || user.Id || user.userId || user.UserId).filter(Boolean);

      const currentUserId = authUser.id || authUser.Id;
      if (currentUserId) {
        userIds.push(currentUserId);
      }
      setFollowingUsers(userIds);
    } catch (err) {

      setFollowingUsers([]);
    } finally {
      setFollowingLoading(false);
    }
  }, [authUser, isGuest]);

  useEffect(() => {
    loadFollowing();
  }, [loadFollowing]);


  useEffect(() => {
    const handleFollowStatusChange = () => {
      loadFollowing();
    };
    
    window.addEventListener('followStatusChanged', handleFollowStatusChange);
    
    return () => {
      window.removeEventListener('followStatusChanged', handleFollowStatusChange);
    };
  }, [loadFollowing]);


  const fetchCommentsForPosts = useCallback(async (posts) => {

    if (isGuest) {
      return posts;
    }
    
    const { getComments } = await import("../api/comments");
    
    const commentPromises = posts.map(async (post) => {
      if (!post.id) return post;
      

      const postType = post.type === 'quote' ? 'quote' : 
                       post.type === 'review' ? 'review' : 'post';
      const postId = post.reviewId || post.quoteId || post.id;
      
      try {
        const comments = await getComments(postId, postType);
        

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

        return post;
      }
    });
    
    return Promise.all(commentPromises);
  }, [isGuest]);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {

      const savedPosts = loadFromStorage();
      

      if (isGuest) {
        setRemotePosts(savedPosts);
        setLoading(false);
        return;
      }
      

      const response = await getFeed({ page: 1, pageSize: 100 });

      let items = response.items || [];
      

      if (followingUsers.length > 0) {
        const currentUserId = authUser?.id || authUser?.Id;
        items = items.filter(post => {

          const postUserId = post.userId || post.UserId || 
                           post.user?.id || post.User?.Id ||
                           post.user?.userId || post.User?.UserId;
          

          return followingUsers.includes(postUserId) || postUserId === currentUserId;
        });
      }
      

      const newPostIds = new Set(items.map(p => p.id));
      

      const mergedPosts = items.map(newPost => {


        let savedPost = savedPosts.find(sp => sp.id === newPost.id);
        if (!savedPost && newPost.type === 'review' && newPost.reviewId) {

          savedPost = savedPosts.find(sp => 
            (sp.type === 'review' && sp.reviewId === newPost.reviewId) ||
            (sp.type === 'review' && sp.id === newPost.reviewId)
          );
        }
        
        if (savedPost) {


          return { 
            ...newPost, 
            comments: savedPost.comments || [],
            likes: savedPost.likes !== undefined ? savedPost.likes : (newPost.likes || 0),
            isLiked: savedPost.isLiked !== undefined ? savedPost.isLiked : (newPost.isLiked || false),
          };
        }
        

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
      

      const postsWithBackendComments = await fetchCommentsForPosts(mergedPosts);
      

      const finalPosts = postsWithBackendComments.map(post => {
        const savedPost = savedPosts.find(sp => {
          if (sp.id === post.id) return true;
          if (post.type === 'review' && post.reviewId && sp.type === 'review' && sp.reviewId === post.reviewId) return true;
          return false;
        });
        
        if (savedPost && savedPost.comments && savedPost.comments.length > 0) {

          const backendCommentIds = new Set((post.comments || []).map(c => c.id).filter(Boolean));
          const localComments = (savedPost.comments || []).filter(c => c.id && !backendCommentIds.has(c.id));
          

          return {
            ...post,
            comments: [...(post.comments || []), ...localComments],

            likes: savedPost.likes !== undefined ? savedPost.likes : post.likes,
            isLiked: savedPost.isLiked !== undefined ? savedPost.isLiked : post.isLiked,
          };
        }
        
        return post;
      });
      


      const additionalPosts = savedPosts.filter(ep => 
        !newPostIds.has(ep.id) && (
          ep.isLocal ||
          ep.type === 'quote' ||
          ep.type === 'post' ||
          ep.type === 'review'
        )
      );
      

      const uniqueAdditionalPosts = Array.from(
        new Map(additionalPosts.map(post => [post.id, post])).values()
      );
      
      setRemotePosts([...finalPosts, ...uniqueAdditionalPosts]);
    } catch (err) {
      setError(err.message || "Failed to load feed.");

      const saved = loadFromStorage();
      setRemotePosts(saved);
    } finally {
      setLoading(false);
    }
  }, [followingUsers, authUser, fetchCommentsForPosts, isGuest]);


  useEffect(() => {
    if (!followingLoading && followingUsers.length >= 0) {
      fetchFeed();
    }
  }, [fetchFeed, followingLoading, followingUsers.length]);

  const posts = useMemo(() => {

    const postMap = new Map();
    

    remotePosts.forEach(post => {
      postMap.set(post.id, { ...post });
    });
    


    localPosts.forEach(post => {
      const existingPost = postMap.get(post.id);
      if (existingPost) {

        const existingCommentIds = new Set((existingPost.comments || []).map(c => c.id));
        const newComments = (post.comments || []).filter(c => !existingCommentIds.has(c.id));
        postMap.set(post.id, {
          ...existingPost,
          ...post,
          comments: [...(existingPost.comments || []), ...newComments],
          isLocal: true
        });
      } else {
        postMap.set(post.id, { ...post, isLocal: true });
      }
    });
    
    const uniquePosts = Array.from(postMap.values());
    

    const sortedPosts = uniquePosts.sort((a, b) => {

      if (a.isLocal && !b.isLocal) return -1;
      if (!a.isLocal && b.isLocal) return 1;
      

      const timeA = new Date(a.timestamp || a.createdAt || a.CreatedAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || b.CreatedAt || 0).getTime();
      return timeB - timeA;
    });
    

    if (followingUsers.length > 0) {
      const currentUserId = authUser?.id || authUser?.Id;
      return sortedPosts.filter(post => {

        if (post.isLocal) return true;
        

        const postUserId = post.userId || post.UserId || 
                          post.user?.id || post.User?.Id ||
                          post.user?.userId || post.User?.UserId;
        

        return followingUsers.includes(postUserId) || postUserId === currentUserId;
      });
    }
    

    return sortedPosts;
  }, [localPosts, remotePosts, followingUsers, authUser]);


  useEffect(() => {
    if (posts.length > 0) {
      saveToStorage(posts);
    }
  }, [posts]);





  useEffect(() => {
    if (localPosts.length > 0) {
      setRemotePosts((prev) => {

        const postMap = new Map();
        

        prev.forEach(post => {
          postMap.set(post.id, post);
        });
        

        localPosts.forEach(localPost => {
          postMap.set(localPost.id, localPost);
        });
        
        const merged = Array.from(postMap.values());
        

        saveToStorage(merged);
        
        return merged;
      });
    }
  }, [localPosts]);

  const handleRemoteCommentAdd = useCallback(
    async (postId, text) => {

      const optimisticComment = {
        id: `temp-${Date.now()}`,
        username: currentUsername || authUser?.name || "You",
        userAvatar: authUser?.avatarUrl || authUser?.AvatarUrl || authUser?.profilePictureUrl || authUser?.ProfilePictureUrl || null,
        text,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      

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
        return prev;
      });
      

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
        throw new Error("Post not found");
      }
      


      setRemotePosts((prev) => {

        const existingPost = prev.find(p => p.id === postId || (p.type === 'review' && p.reviewId === postId));
        
        if (!existingPost) {

          const savedPosts = loadFromStorage();
          const savedPost = savedPosts.find(p => p.id === postId || (p.type === 'review' && p.reviewId === postId));
          
          if (savedPost) {

            return [...prev, {
              ...savedPost,
              comments: [...(savedPost.comments || []), optimisticComment],
            }];
          }

          return prev;
        }
        

        return prev.map((p) => {
          const isTargetPost = p.id === postId || (p.type === 'review' && p.reviewId === postId);
          if (isTargetPost) {

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

            return p;
          }
          return p;
        });
      });
      

      try {
        const savedPosts = loadFromStorage();
        const updatedPosts = savedPosts.map((p) => {
          const isTargetPost = p.id === postId || (p.type === 'review' && p.reviewId === postId);
          if (isTargetPost) {

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

      }
      

      let savedComment = null;
      try {
        const { createComment } = await import("../api/comments");
        savedComment = await createComment(actualPostId, text, postType);
      } catch (err) {

        if (err.status !== 404) {
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

      }
      

      if (savedComment) {
        const backendComment = {
          id: savedComment.id || savedComment.Id || optimisticComment.id,
          username: savedComment.username || savedComment.Username || savedComment.user?.name || savedComment.User?.Name || optimisticComment.username,
          userAvatar: savedComment.userAvatar || savedComment.UserAvatar || savedComment.user?.avatarUrl || savedComment.User?.AvatarUrl || optimisticComment.userAvatar,
          text: savedComment.text || savedComment.Text || savedComment.commentText || savedComment.CommentText || text,
          timestamp: savedComment.timestamp || savedComment.createdAt || savedComment.CreatedAt || optimisticComment.timestamp,
          createdAt: savedComment.createdAt || savedComment.CreatedAt || savedComment.timestamp || optimisticComment.timestamp,
        };
        

        setRemotePosts((prev) => {
          return prev.map((p) => {
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
        });
        

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

        }
      }
      

      if (onAddComment) {
        try {
          await onAddComment(postId, text);
        } catch (err) {

        }
      }
      
      return Promise.resolve();
    },
    [currentUsername, authUser, onAddComment]
  );

  const handleRemoteCommentDelete = useCallback(async (postId, commentId) => {

    let post = null;
    let comment = null;
    

    setRemotePosts((prev) => {
      post = prev.find(p => p.id === postId);
      comment = post?.comments?.find(c => c.id === commentId);
      return prev;
    });
    

    if (!comment) {
      const savedPosts = loadFromStorage();
      post = savedPosts.find(p => p.id === postId);
      comment = post?.comments?.find(c => c.id === commentId);
    }
    
    if (!comment || !post) {
      alert("Comment tapılmadı");
      return;
    }


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

      saveToStorage(updated);
      return updated;
    });

    try {

      const { deleteComment } = await import("../api/comments");
      const result = await deleteComment(commentId);
      

    } catch (err) {

      if (err.status !== 404) {

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

    }
    

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
    

    if (onDeleteComment) {
      try {

        const result = onDeleteComment(postId, commentId);
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (err) {

      }
    }
  }, [authUser, onDeleteComment]);

  const handleRemotePostUpdate = useCallback(async (postId, updatedPost) => {

    setRemotePosts((prev) => {
      const updated = prev.map((p) => (p.id === postId ? updatedPost : p));

      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        const merged = existing.map((p) => {
          const updatedPost = updated.find((up) => up.id === p.id);
          return updatedPost || p;
        });

        updated.forEach((up) => {
          if (!merged.find((p) => p.id === up.id)) {
            merged.push(up);
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {

      }
      return updated;
    });
  }, []);

  const handleRemotePostDelete = useCallback(async (postId, post) => {
    try {


      if (onDeletePost) {
        await onDeletePost(postId, post);
      }
      

      setRemotePosts((prev) => {
        const updated = prev.filter((p) => p.id !== postId);

        try {
          const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
          const filtered = existing.filter((p) => p.id !== postId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (err) {

        }
        return updated;
      });
    } catch (err) {
      throw err;
    }
  }, [onDeletePost]);

  const handleReportPost = useCallback(async (postId, post) => {
    try {

      saveReportedPost(postId);
      

      setRemotePosts((prev) => prev.filter((p) => p.id !== postId));
      


    } catch (err) {
      throw err;
    }
  }, []);

  const handleLocalPostUpdate = useCallback(async (postId, updatedPost) => {



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

                if (post.isLocal) {

                  return onAddComment?.(postId, text);
                } else {

                  return handleRemoteCommentAdd(postId, text);
              }
              }}

              onDeleteComment={undefined}

              onDeletePost={undefined}
              onReportPost={undefined}

              onViewReview={undefined}
              onPostUpdate={post.isLocal ? (onPostUpdate ? async (postId, updatedPost) => {

                await onPostUpdate(postId, updatedPost);

                setRemotePosts((prev) => {
                  return prev.map((p) => (p.id === postId ? { ...p, ...updatedPost } : p));
                });
              } : undefined) : handleRemotePostUpdate}
              onLikeChange={(postId, likes, isLiked) => {

                setRemotePosts((prev) => {
                  const updated = prev.map((p) =>
                    p.id === postId ? { ...p, likes, isLiked } : p
                  );

                  saveToStorage(updated);
                  return updated;
                });
                

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
