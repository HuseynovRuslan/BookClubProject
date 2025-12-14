/**
 * Clean React Example: Comment Management with State & Backend Sync
 * 
 * This example demonstrates:
 * 1. Fetching comments from backend on mount/refresh
 * 2. Optimistic updates when adding comments
 * 3. Proper state management
 * 4. Immediate UI updates
 */

import { useState, useEffect, useCallback } from 'react';
import { getComments, createComment } from '../api/comments';

function SocialFeedExample() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch comments for a single post
  const fetchPostComments = useCallback(async (postId, postType) => {
    try {
      const comments = await getComments(postId, postType);
      
      // Normalize comment format
      const normalizedComments = (comments || []).map(comment => ({
        id: comment.id || comment.Id,
        username: comment.username || comment.Username || 'Anonymous',
        text: comment.text || comment.Text || '',
        timestamp: comment.timestamp || comment.createdAt || comment.CreatedAt,
      }));
      
      return normalizedComments;
    } catch (err) {
      console.error(`Error fetching comments for post ${postId}:`, err);
      return [];
    }
  }, []);

  // Fetch comments for all posts
  const fetchAllComments = useCallback(async (postsList) => {
    const postsWithComments = await Promise.all(
      postsList.map(async (post) => {
        const postType = post.type === 'quote' ? 'quote' : 
                         post.type === 'review' ? 'review' : 'post';
        const postId = post.reviewId || post.quoteId || post.id;
        
        const comments = await fetchPostComments(postId, postType);
        
        return {
          ...post,
          comments: comments,
        };
      })
    );
    
    return postsWithComments;
  }, [fetchPostComments]);

  // Load posts and comments on mount
  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        // 1. Fetch posts from backend
        const response = await fetch('/api/feed/get-feed');
        const data = await response.json();
        const postsList = data.items || [];
        
        // 2. Fetch comments for all posts
        const postsWithComments = await fetchAllComments(postsList);
        
        // 3. Update state
        setPosts(postsWithComments);
      } catch (err) {
        console.error('Error loading feed:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadFeed();
  }, [fetchAllComments]);

  // Add comment handler - Clean and simple
  const handleAddComment = useCallback(async (postId, text) => {
    // Find the post
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const postType = post.type === 'quote' ? 'quote' : 
                     post.type === 'review' ? 'review' : 'post';
    const actualPostId = post.reviewId || post.quoteId || postId;
    
    // 1. Create optimistic comment (temporary ID)
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      username: 'You', // Current user
      text: text,
      timestamp: new Date().toISOString(),
    };
    
    // 2. Update state immediately (optimistic update)
    setPosts((prevPosts) => {
      return prevPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), optimisticComment],
          };
        }
        return p;
      });
    });
    
    // 3. Save to backend
    try {
      const savedComment = await createComment(actualPostId, text, postType);
      
      // 4. Replace optimistic comment with backend comment
      if (savedComment) {
        const backendComment = {
          id: savedComment.id || savedComment.Id || optimisticComment.id,
          username: savedComment.username || savedComment.Username || optimisticComment.username,
          text: savedComment.text || savedComment.Text || text,
          timestamp: savedComment.timestamp || savedComment.createdAt || optimisticComment.timestamp,
        };
        
        setPosts((prevPosts) => {
          return prevPosts.map((p) => {
            if (p.id === postId) {
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
      }
      // If savedComment is null, API not available, keep optimistic comment
    } catch (err) {
      // 5. On error, remove optimistic comment
      console.error('Error creating comment:', err);
      setPosts((prevPosts) => {
        return prevPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: (p.comments || []).filter(c => c.id !== optimisticComment.id),
            };
          }
          return p;
        });
      });
      throw err; // Re-throw to show error to user
    }
  }, [posts]);

  // Refresh comments for a specific post
  const refreshPostComments = useCallback(async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const postType = post.type === 'quote' ? 'quote' : 
                     post.type === 'review' ? 'review' : 'post';
    const actualPostId = post.reviewId || post.quoteId || postId;
    
    const comments = await fetchPostComments(actualPostId, postType);
    
    setPosts((prevPosts) => {
      return prevPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: comments,
          };
        }
        return p;
      });
    });
  }, [posts, fetchPostComments]);

  if (loading) {
    return <div>Loading feed...</div>;
  }

  return (
    <div>
      <h1>Social Feed</h1>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onAddComment={handleAddComment}
          onRefreshComments={refreshPostComments}
        />
      ))}
    </div>
  );
}

// Post Card Component
function PostCard({ post, onAddComment, onRefreshComments }) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onAddComment(post.id, commentText.trim());
      setCommentText(''); // Clear input on success
    } catch (err) {
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-card">
      <h2>{post.title || post.bookTitle}</h2>
      <p>{post.text || post.review}</p>
      
      {/* Comments Section */}
      <div className="comments">
        <h3>Comments ({post.comments?.length || 0})</h3>
        
        {/* Display Comments */}
        {post.comments?.map((comment) => (
          <div key={comment.id} className="comment">
            <strong>{comment.username}</strong>
            <p>{comment.text}</p>
            <small>{new Date(comment.timestamp).toLocaleString()}</small>
          </div>
        ))}
        
        {/* Add Comment Form */}
        <form onSubmit={handleSubmit}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            disabled={isSubmitting}
          />
          <button type="submit" disabled={!commentText.trim() || isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Add Comment'}
          </button>
        </form>
        
        {/* Refresh Comments Button */}
        <button onClick={() => onRefreshComments(post.id)}>
          Refresh Comments
        </button>
      </div>
    </div>
  );
}

export default SocialFeedExample;

/**
 * KEY PATTERNS DEMONSTRATED:
 * 
 * 1. **Fetch Comments on Mount**
 *    - useEffect fetches posts, then fetches comments for each post
 *    - Comments are merged with posts before setting state
 * 
 * 2. **Optimistic Updates**
 *    - Comment added to state immediately with temp ID
 *    - Backend save happens asynchronously
 *    - Temp comment replaced with backend comment (real ID)
 *    - On error, temp comment is removed
 * 
 * 3. **State Management**
 *    - Functional updates (prev => ...) to avoid stale closures
 *    - Immutable updates (map, filter, spread)
 *    - Single source of truth (posts state)
 * 
 * 4. **Error Handling**
 *    - Try-catch blocks around async operations
 *    - Revert optimistic updates on error
 *    - User-friendly error messages
 * 
 * 5. **Refresh Capability**
 *    - refreshPostComments function refetches comments
 *    - Can be called after page refresh or manually
 * 
 * 6. **Clean Code**
 *    - Separated concerns (fetch, add, refresh)
 *    - Reusable helper functions
 *    - Clear variable names
 *    - Proper error handling
 */

