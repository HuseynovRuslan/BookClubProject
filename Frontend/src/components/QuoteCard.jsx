import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Quote, 
  Heart, 
  Pencil, 
  Trash2, 
  BookOpen, 
  User,
  Loader2,
  AlertTriangle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deleteQuote, toggleQuoteLike } from '../api/quotes';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

// Helper to get profile picture URL
const getProfilePictureUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

// Helper to get book cover URL
const getBookCoverUrl = (book) => {
  if (!book) return null;
  
  const isbn = book.isbn || book.ISBN;
  if (isbn) {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    return `https://covers.openlibrary.org/b/isbn/${cleanISBN}-S.jpg`;
  }
  
  if (book.coverImageUrl) {
    if (book.coverImageUrl.startsWith('http')) return book.coverImageUrl;
    return `${BASE_URL}${book.coverImageUrl.startsWith('/') ? '' : '/'}${book.coverImageUrl}`;
  }
  
  return null;
};

/**
 * QuoteCard - Displays a single quote with optional edit/delete actions
 * @param {object} quote - Quote data from API
 * @param {function} onEdit - Callback when edit is clicked
 * @param {function} onDelete - Callback when quote is deleted (to refresh list)
 */
const QuoteCard = ({ quote, onEdit, onDelete }) => {
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(quote.isLiked || false);
  const [likesCount, setLikesCount] = useState(quote.likesCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check if current user is the owner of this quote
  const isOwner = isAuthenticated && user?.id === quote.createdByUserId;

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to like quotes');
      return;
    }

    setLikeLoading(true);
    try {
      const newLikedState = await toggleQuoteLike(quote.id);
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteQuote(quote.id);
      toast.success('Quote deleted successfully');
      setShowDeleteConfirm(false);
      if (onDelete) onDelete();
    } catch (error) {
      toast.error('Failed to delete quote');
    } finally {
      setDeleting(false);
    }
  };

  const userName = quote.user?.firstName 
    ? `${quote.user.firstName} ${quote.user.lastName || ''}`.trim()
    : quote.user?.userName || 'Anonymous';

  const bookTitle = quote.book?.title || 'Unknown Book';
  const authorName = quote.book?.authorName || quote.book?.author?.name || '';

  return (
    <>
      <div className="group relative bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md hover:border-stone-300 transition-all">
        {/* Owner Actions - Edit & Delete (visible on hover) */}
        {isOwner && (
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit && onEdit(quote)}
              className="p-1.5 bg-stone-100 hover:bg-amber-100 rounded-lg transition-colors"
              title="Edit quote"
            >
              <Pencil className="w-3.5 h-3.5 text-stone-600 hover:text-amber-600" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 bg-stone-100 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete quote"
            >
              <Trash2 className="w-3.5 h-3.5 text-stone-600 hover:text-red-600" />
            </button>
          </div>
        )}

        {/* Quote Icon */}
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
          <Quote className="w-4 h-4 text-amber-600" />
        </div>

        {/* Quote Text */}
        <blockquote className="mt-2 mb-4 text-stone-700 font-serif italic text-lg leading-relaxed line-clamp-4">
          "{quote.text}"
        </blockquote>

        {/* Book Info */}
        <div className="flex items-center gap-3 mb-4 p-2.5 bg-stone-50 rounded-lg">
          <div className="w-10 h-14 bg-stone-200 rounded-lg overflow-hidden shrink-0">
            {getBookCoverUrl(quote.book) ? (
              <img
                src={getBookCoverUrl(quote.book)}
                alt={bookTitle}
                className="w-full h-full object-cover"
                onError={(e) => e.target.style.display = 'none'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-stone-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link 
              to={`/books/${quote.bookId}`}
              className="font-medium text-stone-900 hover:text-amber-600 truncate block text-sm transition-colors"
            >
              {bookTitle}
            </Link>
            {authorName && (
              <p className="text-xs text-stone-500 truncate">{authorName}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        {quote.tags && quote.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {quote.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full"
              >
                #{tag}
              </span>
            ))}
            {quote.tags.length > 3 && (
              <span className="px-2 py-0.5 text-stone-400 text-xs">
                +{quote.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer: User Info & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          {/* User Info */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-stone-200 overflow-hidden flex items-center justify-center">
              {quote.user?.profilePictureUrl ? (
                <img
                  src={getProfilePictureUrl(quote.user.profilePictureUrl)}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-stone-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-stone-700">{userName}</p>
              <p className="text-[10px] text-stone-400">
                {quote.createdAt 
                  ? new Date(quote.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    }) 
                  : ''}
              </p>
            </div>
          </div>

          {/* Like Button */}
          <button
            onClick={handleToggleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              isLiked 
                ? 'bg-red-50 text-red-600' 
                : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
            }`}
          >
            {likeLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            )}
            <span className="text-xs font-medium">{likesCount}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Delete Quote</h3>
                <p className="text-sm text-stone-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-sm text-stone-600 mb-6">
              Are you sure you want to delete this quote? It will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuoteCard;
