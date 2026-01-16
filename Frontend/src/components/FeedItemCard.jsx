import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  MoreHorizontal,
  Star,
  BookOpen,
  Quote,
  BookMarked,
  UserPlus,
  Clock,
  Trash2,
  Send,
  Loader2,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { toggleLike, getComments, addComment, updateComment, deleteComment } from '../api/interactions';
import { deleteQuote, updateQuote, deleteReview, updateReview, deleteBookShelf } from '../api/feed';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Base URL for the backend API
const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:7050';
const BASE_URL = API_BASE.endsWith('/') ? API_BASE : API_BASE + '/';

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  
  // Normalize path separators (convert Windows backslashes to forward slashes)
  let normalizedPath = url.replace(/\\/g, '/');
  
  // Remove leading slash if present (BASE_URL already ends with /)
  const cleanPath = normalizedPath.startsWith('/') 
    ? normalizedPath.substring(1) 
    : normalizedPath;
  
  return `${BASE_URL}${cleanPath}`;
};

// Relative time formatter
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Star Rating Display
const StarRating = ({ rating, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating
            ? 'fill-amber-400 text-amber-400'
            : 'fill-stone-200 text-stone-200'
            }`}
        />
      ))}
    </div>
  );
};

// Interactive Star Rating for Editing
const InteractiveStarRating = ({ rating, onRatingChange, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`${sizeClass} transition-colors ${star <= (hoverRating || rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-stone-200 text-stone-200 hover:fill-amber-200 hover:text-amber-200'
              }`}
          />
        </button>
      ))}
    </div>
  );
};

// Activity Type Icon
const ActivityIcon = ({ type }) => {
  const iconMap = {
    Quote: { icon: Quote, color: 'text-purple-500', bg: 'bg-purple-50' },
    Review: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    BookAdded: { icon: BookMarked, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    Follow: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' },
  };
  const config = iconMap[type] || iconMap.Quote;
  const Icon = config.icon;

  return (
    <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
    </div>
  );
};

// User Avatar
const UserAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const profilePicUrl = getImageUrl(user?.profilePictureUrl);
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.username?.[0]?.toUpperCase() || '?';

  return (
    <Link
      to={`/profile/${user?.id}`}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white font-semibold overflow-hidden hover:ring-2 hover:ring-stone-300 transition-all shrink-0`}
    >
      {profilePicUrl ? (
        <img src={profilePicUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </Link>
  );
};

// Book Cover Mini
const BookCoverMini = ({ book, size = 'sm', disableLink = false }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-16',
    md: 'w-16 h-22',
    lg: 'w-20 h-28',
  };

  useEffect(() => {
    if (!book) {
      setImageSrc(null);
      setImageError(false);
      return;
    }

    const isbn = book.isbn || book.ISBN;
    const backendUrl = book.coverImageUrl
      ? (book.coverImageUrl.startsWith('http')
        ? book.coverImageUrl
        : `${BASE_URL}${book.coverImageUrl.startsWith('/') ? book.coverImageUrl.substring(1) : book.coverImageUrl}`)
      : null;
    const openLibraryUrl = isbn
      ? `https://covers.openlibrary.org/b/isbn/${isbn.replace(/[-\s]/g, '')}-S.jpg`
      : null;

    // Prioritize backend URL (our uploaded images) over OpenLibrary
    setImageSrc(backendUrl || openLibraryUrl);
    setImageError(false);
  }, [book?.id, book?.isbn, book?.ISBN, book?.coverImageUrl]);

  const handleImageError = () => {
    const backendUrl = book?.coverImageUrl
      ? (book.coverImageUrl.startsWith('http')
        ? book.coverImageUrl
        : `${BASE_URL}${book.coverImageUrl.startsWith('/') ? book.coverImageUrl.substring(1) : book.coverImageUrl}`)
      : null;
    const isbn = book?.isbn || book?.ISBN;
    const openLibraryUrl = isbn
      ? `https://covers.openlibrary.org/b/isbn/${isbn.replace(/[-\s]/g, '')}-S.jpg`
      : null;
    
    // If backend failed, try OpenLibrary as fallback
    if (imageSrc === backendUrl && openLibraryUrl) {
      setImageSrc(openLibraryUrl);
      setImageError(false);
      return;
    }
    // If OpenLibrary failed and we have backend URL, try it
    if (imageSrc?.includes('openlibrary.org') && backendUrl) {
      setImageSrc(backendUrl);
      setImageError(false);
      return;
    }
    setImageError(true);
  };

  const content = imageSrc && !imageError ? (
    <img
      src={imageSrc}
      alt={book?.title}
      className="w-full h-full object-cover"
      onError={handleImageError}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300">
      <BookOpen className="w-5 h-5 text-stone-400" />
    </div>
  );

  const className = `${sizeClasses[size]} rounded-md overflow-hidden bg-stone-100 shrink-0 shadow-sm hover:shadow-md transition-shadow`;

  if (disableLink) {
    return <div className={className}>{content}</div>;
  }

  const bookId = book?.id || book?.Id;
  if (!bookId) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link to={`/books/${bookId}`} className={className}>
      {content}
    </Link>
  );
};

// Comment Item Component
const CommentItem = ({ comment, currentUserId, onDelete, onUpdate, isEditing, editText, onEditStart, onEditCancel, onEditTextChange }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isOwner = currentUserId && comment.userId === currentUserId;

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (isSaving || !editText.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(comment.id, editText.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b border-stone-100 last:border-0">
      <UserAvatar user={{ username: comment.userName, profilePictureUrl: comment.userProfilePicture }} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-800 text-sm">{comment.userName}</span>
          <span className="text-xs text-stone-400">{getRelativeTime(comment.createdAt)}</span>
        </div>
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            className="w-full mt-1 px-2 py-1.5 text-sm text-stone-600 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none"
            rows={2}
            autoFocus
          />
        ) : (
          <p className="text-sm text-stone-600 mt-1">{comment.text}</p>
        )}
      </div>
      {isOwner && (
        <div className="flex gap-1 self-start">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving || !editText.trim()}
                className="p-1.5 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Save"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={onEditCancel}
                disabled={isSaving}
                className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEditStart(comment.id, comment.text)}
                className="p-1.5 text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Comments Section Component
const CommentsSection = ({ entityId, entityType, isOpen }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (isOpen && entityId) {
      fetchComments();
    }
  }, [isOpen, entityId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await getComments(entityId);
      // PagedResult returns items array, not data
      setComments(response.items || response.data || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || posting) return;

    setPosting(true);
    try {
      await addComment(entityId, entityType, newComment.trim());
      setNewComment('');
      // Refresh comments to get the new one with all metadata
      await fetchComments();
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleEditStart = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleUpdateComment = async (commentId, newText) => {
    try {
      await updateComment(commentId, newText);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, text: newText } : c))
      );
      setEditingCommentId(null);
      setEditText('');
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 pt-4 border-t border-stone-200">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
        </div>
      )}

      {/* Comments List */}
      {!loading && comments.length > 0 && (
        <div className="mb-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={handleDeleteComment}
              onUpdate={handleUpdateComment}
              isEditing={editingCommentId === comment.id}
              editText={editText}
              onEditStart={handleEditStart}
              onEditCancel={handleEditCancel}
              onEditTextChange={setEditText}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && comments.length === 0 && (
        <p className="text-sm text-stone-400 text-center py-2 mb-4">No comments yet. Be the first!</p>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || posting}
          className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Post
        </button>
      </form>
    </div>
  );
};

// Reusable Interaction Bar with Like + Comment buttons
const InteractionBar = ({ entityId, entityType, initialLiked = false, initialLikesCount = 0, onCommentClick, showComments, commentsCount = 0 }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [likeLoading, setLikeLoading] = useState(false);

  // Sync state when props change (e.g., when data refreshes from server)
  useEffect(() => {
    setLiked(initialLiked);
    setLikesCount(initialLikesCount);
  }, [initialLiked, initialLikesCount]);

  const handleLike = async () => {
    // Guard: ensure entityId exists
    if (!entityId || likeLoading) {
      if (!entityId) {
        console.warn('Cannot like: entityId is missing', { entityType, entityId });
      }
      return;
    }

    // Optimistic update
    const wasLiked = liked;
    const prevCount = likesCount;
    setLiked(!wasLiked);
    setLikesCount(wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    setLikeLoading(true);
    try {
      const response = await toggleLike(entityId, entityType);
      // Update with actual server values
      setLiked(response.isLiked);
      setLikesCount(response.newCount);
    } catch (error) {
      // Rollback on error
      setLiked(wasLiked);
      setLikesCount(prevCount);
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="mt-4 flex items-center gap-4">
      <button
        onClick={handleLike}
        disabled={likeLoading}
        className={`flex items-center gap-1.5 text-sm transition-all active:scale-95 ${liked
          ? 'text-red-500 hover:text-red-600'
          : 'text-stone-400 hover:text-red-500'
          }`}
      >
        <Heart
          className={`w-5 h-5 transition-all ${liked
            ? 'fill-red-500 text-red-500 scale-110'
            : 'fill-none stroke-current'
            }`}
        />
        <span>{likesCount}</span>
      </button>
      <button
        onClick={onCommentClick}
        className={`flex items-center gap-1.5 text-sm transition-colors ${showComments
          ? 'text-stone-700'
          : 'text-stone-400 hover:text-stone-600'
          }`}
      >
        <MessageSquare className={`w-5 h-5 ${showComments ? 'fill-stone-100' : ''}`} />
        <span>Comment{commentsCount > 0 ? ` (${commentsCount})` : ''}</span>
      </button>
    </div>
  );
};

// Quote Activity Card
const QuoteContent = ({ item, currentUserId, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.quote?.text || '');
  const [isSaving, setIsSaving] = useState(false);

  // Ensure we have valid quote data
  if (!item.quote || !item.quote.id) {
    return null;
  }

  const entityId = item.quote.id;
  const entityType = 'Quote';
  const isLiked = item.quote.isLiked ?? false;
  const likesCount = item.quote.likesCount ?? 0;
  const isOwner = currentUserId && item.user?.id === currentUserId;

  const handleEdit = () => {
    setEditText(item.quote.text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditText(item.quote.text);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await updateQuote(entityId, editText.trim(), item.quote.tags || []);
      item.quote.text = editText.trim(); // Update local state
      setIsEditing(false);
      toast.success('Quote updated successfully!');
    } catch (error) {
      toast.error('Failed to update quote');
      console.error('Error updating quote:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    try {
      await deleteQuote(entityId);
      toast.success('Quote deleted');
      if (onDelete) onDelete(item.id);
    } catch (error) {
      toast.error('Failed to delete quote');
      console.error('Error deleting quote:', error);
    }
  };

  return (
    <div className="mt-3">
      {/* Edit/Delete Actions for Owner */}
      {isOwner && !isEditing && (
        <div className="flex gap-1 justify-end mb-2">
          <button
            onClick={handleEdit}
            className="p-1.5 text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit quote"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete quote"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quote Text */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full px-3 py-2 text-stone-700 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
            rows={4}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving || !editText.trim()}
              className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="relative pl-4 border-l-4 border-purple-300 bg-gradient-to-r from-purple-50/50 to-transparent py-3 pr-4 rounded-r-lg">
          <Quote className="absolute -left-3 -top-1 w-6 h-6 text-purple-300 fill-purple-100" />
          <p className="text-stone-700 italic leading-relaxed">"{item.quote.text}"</p>
        </div>
      )}

      {/* Book Reference */}
      {item.book && (item.book.id || item.book.Id) && (
        <Link
          to={`/books/${item.book.id || item.book.Id}`}
          className="mt-3 flex items-center gap-3 p-2 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <BookCoverMini book={item.book} size="sm" disableLink />
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-800 truncate">{item.book.title}</p>
            <p className="text-xs text-stone-500">{item.book.authorName}</p>
          </div>
        </Link>
      )}

      {/* Tags */}
      {item.quote.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.quote.tags.slice(0, 5).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Interaction Bar - Fully interactive for Quotes */}
      <InteractionBar
        entityId={entityId}
        entityType={entityType}
        initialLiked={isLiked}
        initialLikesCount={likesCount}
        onCommentClick={() => setShowComments(!showComments)}
        showComments={showComments}
        commentsCount={item.quote.commentsCount ?? 0}
      />

      {/* Comments Section */}
      <CommentsSection entityId={entityId} entityType={entityType} isOpen={showComments} />
    </div>
  );
};

// Review Activity Card
const ReviewContent = ({ item, currentUserId, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.review?.reviewText || '');
  const [editRating, setEditRating] = useState(item.review?.rating || 0);
  const [isSaving, setIsSaving] = useState(false);

  // Ensure we have valid review data
  if (!item.review || !item.review.id) {
    return null;
  }

  const entityId = item.review.id;
  const entityType = 'Review';
  const isLiked = item.review.isLiked ?? false;
  const likesCount = item.review.likesCount ?? 0;
  const isOwner = currentUserId && item.user?.id === currentUserId;

  const handleEdit = () => {
    setEditText(item.review.reviewText || '');
    setEditRating(item.review.rating || 0);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditText(item.review.reviewText || '');
    setEditRating(item.review.rating || 0);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (editRating === 0 || isSaving) return;
    setIsSaving(true);
    try {
      await updateReview(entityId, editRating, editText.trim());
      item.review.rating = editRating;
      item.review.reviewText = editText.trim();
      setIsEditing(false);
      toast.success('Review updated successfully!');
    } catch (error) {
      toast.error('Failed to update review');
      console.error('Error updating review:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(entityId);
      toast.success('Review deleted');
      if (onDelete) onDelete(item.id);
    } catch (error) {
      toast.error('Failed to delete review');
      console.error('Error deleting review:', error);
    }
  };

  return (
    <div className="mt-3">
      {/* Edit/Delete Actions for Owner */}
      {isOwner && !isEditing && (
        <div className="flex gap-1 justify-end mb-2">
          <button
            onClick={handleEdit}
            className="p-1.5 text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit review"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete review"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Book Info with Review */}
      <div className="flex gap-4">
        <BookCoverMini
          book={{
            id: item.review.bookId,
            coverImageUrl: item.review.bookCoverImageUrl,
            title: item.review.bookTitle,
          }}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <Link
            to={`/books/${item.review.bookId}`}
            className="font-semibold text-stone-800 hover:text-amber-600 transition-colors"
          >
            {item.review.bookTitle}
          </Link>

          {/* Rating */}
          <div className="mt-1">
            {isEditing ? (
              <div>
                <p className="text-xs text-stone-500 mb-1">Click to change rating:</p>
                <InteractiveStarRating rating={editRating} onRatingChange={setEditRating} />
              </div>
            ) : (
              <StarRating rating={item.review.rating || 0} />
            )}
          </div>

          {/* Review Text */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Write your review..."
                className="w-full px-3 py-2 text-sm text-stone-600 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || editRating === 0}
                  className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            item.review.reviewText && (
              <p className="mt-2 text-stone-600 text-sm leading-relaxed line-clamp-3">
                {item.review.reviewText}
              </p>
            )
          )}
        </div>
      </div>

      {/* Interaction Bar - Fully interactive for Reviews */}
      <InteractionBar
        entityId={entityId}
        entityType={entityType}
        initialLiked={isLiked}
        initialLikesCount={likesCount}
        onCommentClick={() => setShowComments(!showComments)}
        showComments={showComments}
        commentsCount={item.review.commentsCount ?? 0}
      />

      {/* Comments Section */}
      <CommentsSection entityId={entityId} entityType={entityType} isOpen={showComments} />
    </div>
  );
};

// Book Added Activity Card  
const BookAddedContent = ({ item, currentUserId, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const bookId = item.book?.id || item.book?.Id;
  const hasValidBook = item.book && bookId;

  // For BookShelf, we use the bookShelf item's ID if available, otherwise book ID
  // Ensure we have a valid entityId for interactions
  const entityId = item.bookShelfId || bookId;
  const entityType = 'BookShelf';
  const isLiked = item.isLiked ?? false;
  const likesCount = item.likesCount ?? 0;
  const isOwner = currentUserId && item.user?.id === currentUserId;

  // Debug log - remove later
  console.log('BookAddedContent entityId:', entityId, 'bookShelfId:', item.bookShelfId, 'bookId:', bookId);

  // Guard: ensure we have an entityId for interactions
  if (!entityId) {
    return null;
  }

  // Extract shelfId from bookShelfId (format: "bookId-shelfId")
  const shelfId = item.bookShelfId?.split('-')[1];

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove this book from your shelf?')) return;
    if (!bookId || !shelfId) {
      toast.error('Unable to delete: missing book or shelf ID');
      return;
    }
    try {
      await deleteBookShelf(bookId, shelfId);
      toast.success('Book removed from shelf');
      if (onDelete) onDelete(item.id);
    } catch (error) {
      toast.error('Failed to remove book from shelf');
      console.error('Error deleting bookshelf entry:', error);
    }
  };

  return (
    <div className="mt-3">
      {/* Delete Action for Owner (No Edit for BookShelf) */}
      {isOwner && (
        <div className="flex gap-1 justify-end mb-2">
          <button
            onClick={handleDelete}
            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove from shelf"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Description */}
      <p className="text-stone-600 mb-3">
        added{' '}
        {hasValidBook ? (
          <Link
            to={`/books/${bookId}`}
            className="font-semibold text-stone-800 hover:text-emerald-600 transition-colors"
          >
            {item.book.title || 'a book'}
          </Link>
        ) : (
          <span className="font-semibold text-stone-800">a book</span>
        )}
        {' '}to{' '}
        <span className="font-medium text-emerald-600">{item.shelfName}</span>
      </p>

      {/* Book Card */}
      {hasValidBook ? (
        <Link
          to={`/books/${bookId}`}
          className="flex gap-4 p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
        >
          <BookCoverMini book={item.book} size="md" disableLink />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-stone-800">{item.book.title}</h4>
              {item.book.isDeleted && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-600 rounded">
                  Deleted
                </span>
              )}
            </div>
            <p className="text-sm text-stone-500 mt-0.5">{item.book.authorName || 'Unknown Author'}</p>
            {item.book.averageRating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={Math.round(item.book.averageRating)} />
                <span className="text-xs text-stone-400">
                  {item.book.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="flex gap-4 p-3 bg-stone-50 rounded-xl">
          <div className="w-16 h-22 rounded-md overflow-hidden bg-stone-200 shrink-0 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-stone-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-stone-500">Book information unavailable</p>
          </div>
        </div>
      )}

      {/* Interaction Bar - Fully interactive for BookShelves */}
      <InteractionBar
        entityId={entityId}
        entityType={entityType}
        initialLiked={isLiked}
        initialLikesCount={likesCount}
        onCommentClick={() => setShowComments(!showComments)}
        showComments={showComments}
        commentsCount={item.commentsCount ?? 0}
      />

      {/* Comments Section */}
      <CommentsSection entityId={entityId} entityType={entityType} isOpen={showComments} />
    </div>
  );
};

// Main FeedItemCard Component
const FeedItemCard = ({ item, onItemDeleted }) => {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const handleItemDelete = (itemId) => {
    // Call parent's onItemDeleted handler to remove from list
    if (onItemDeleted) {
      onItemDeleted(itemId);
    }
  };

  const getActivityDescription = () => {
    switch (item.activityType) {
      case 'Quote':
        return 'shared a quote';
      case 'Review':
        return 'reviewed a book';
      case 'BookAdded':
        return null; // Description is in the content
      default:
        return 'shared an update';
    }
  };

  const renderContent = () => {
    switch (item.activityType) {
      case 'Quote':
        return <QuoteContent item={item} currentUserId={currentUserId} onDelete={handleItemDelete} />;
      case 'Review':
        return <ReviewContent item={item} currentUserId={currentUserId} onDelete={handleItemDelete} />;
      case 'BookAdded':
        return <BookAddedContent item={item} currentUserId={currentUserId} onDelete={handleItemDelete} />;
      default:
        return null;
    }
  };

  return (
    <article className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <UserAvatar user={item.user} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/profile/${item.user?.id}`}
                className="font-semibold text-stone-800 hover:text-stone-600 transition-colors"
              >
                {item.user?.firstName && item.user?.lastName
                  ? `${item.user.firstName} ${item.user.lastName}`
                  : item.user?.username}
              </Link>
              {getActivityDescription() && (
                <span className="text-stone-500 text-sm">{getActivityDescription()}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-xs text-stone-400">{getRelativeTime(item.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActivityIcon type={item.activityType} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2">{renderContent()}</div>
    </article>
  );
};

export default FeedItemCard;
