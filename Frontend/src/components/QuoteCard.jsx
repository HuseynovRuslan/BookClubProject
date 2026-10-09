import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteQuote, toggleQuoteLike } from '../api/quotes';
import { toast } from 'react-toastify';
import { Avatar, Button, Dialog, Eyebrow, Icon } from './app/ui';
import { displayName, timeAgo } from './app/format';

const LONG_QUOTE = 160;

/**
 * QuoteCard - One quote in the Make "quote-card" style: the quote, its book, who shared it, like and
 * (for the owner) edit/delete actions. Rendered inside the rose `.quote-card` panel of the dashboard.
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
      toast.info('Sitatı bəyənmək üçün daxil ol.');
      return;
    }

    setLikeLoading(true);
    try {
      const newLikedState = await toggleQuoteLike(quote.id);
      setIsLiked(newLikedState);
      setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    } catch {
      toast.error('Bəyənməni yeniləmək alınmadı.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteQuote(quote.id);
      toast.success('Sitat silindi.');
      setShowDeleteConfirm(false);
      if (onDelete) onDelete();
    } catch {
      toast.error('Sitatı silmək alınmadı.');
    } finally {
      setDeleting(false);
    }
  };

  const userName = quote.user ? displayName(quote.user) : 'Anonim oxucu';
  const profilePath = quote.user ? `/profile/${quote.user.username || quote.user.userName || quote.createdByUserId}` : null;
  const bookTitle = quote.book?.title || 'Naməlum kitab';
  const authorName = quote.book?.authorName || quote.book?.author?.name || '';
  const text = quote.text || '';

  return (
    <>
      <blockquote className={text.length > LONG_QUOTE ? 'is-long' : ''}>“{text}”</blockquote>
      <p className="quote-source">
        {authorName && <>{authorName} · </>}
        <Link to={`/books/${quote.bookId}`}>{bookTitle}</Link>
      </p>

      {quote.tags && quote.tags.length > 0 && (
        <ul aria-label="Teqlər" className="quote-tags">
          {quote.tags.slice(0, 3).map((tag, idx) => (
            <li key={idx}>#{tag}</li>
          ))}
          {quote.tags.length > 3 && <li>+{quote.tags.length - 3}</li>}
        </ul>
      )}

      <div className="quote-meta">
        <div className="quote-by">
          <Avatar name={userName} size="small" src={quote.user?.profilePictureUrl} />
          <span>
            {profilePath ? <Link to={profilePath}>{userName}</Link> : <strong>{userName}</strong>}
            {quote.createdAt && <small>{timeAgo(quote.createdAt)} paylaşdı</small>}
          </span>
        </div>
        <div className="quote-actions">
          <button
            aria-label={isLiked ? `Bəyənməni geri al (${likesCount})` : `Bəyən (${likesCount})`}
            aria-pressed={isLiked}
            className="quote-action"
            disabled={likeLoading}
            onClick={handleToggleLike}
            type="button"
          >
            <Icon name="heart" size={16} />
            <span aria-hidden="true">{likesCount}</span>
          </button>
          {isOwner && (
            <>
              <button
                aria-label="Sitatı redaktə et"
                className="quote-action icon-only"
                onClick={() => onEdit && onEdit(quote)}
                title="Redaktə et"
                type="button"
              >
                <Icon name="edit" size={16} />
              </button>
              <button
                aria-label="Sitatı sil"
                className="quote-action icon-only"
                onClick={() => setShowDeleteConfirm(true)}
                title="Sil"
                type="button"
              >
                <Icon name="trash" size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <Dialog labelledBy={`delete-quote-${quote.id}`} onClose={() => !deleting && setShowDeleteConfirm(false)}>
          <Eyebrow>Sitatı sil</Eyebrow>
          <h2 id={`delete-quote-${quote.id}`}>Bu sitat silinsin?</h2>
          <p>Sitat birdəfəlik silinəcək. Bu əməliyyatı geri qaytarmaq olmur.</p>
          <div className="modal-actions">
            <Button disabled={deleting} onClick={() => setShowDeleteConfirm(false)} variant="secondary">
              Ləğv et
            </Button>
            <Button disabled={deleting} onClick={handleDelete} variant="danger">
              <Icon name="trash" size={16} />
              {deleting ? 'Silinir…' : 'Sil'}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default QuoteCard;
