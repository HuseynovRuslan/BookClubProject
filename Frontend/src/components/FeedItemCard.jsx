import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toggleLike, getComments, addComment, updateComment, deleteComment } from '../api/interactions';
import { deleteQuote, updateQuote, deleteReview, updateReview, deleteBookShelf } from '../api/feed';
import { useAuth } from '../context/AuthContext';
import { Activity, Avatar, BookCover, Button, Dialog, Eyebrow, Icon } from './app/ui';
import { bookAuthor, formatRating, shelfName, timeAgo } from './app/format';
import '../styles/app/social.css';

// One activity in the reading feed (Make "feed-card"): who did what, the review / quote / shelved book,
// likes and comments. Used by the feed page and by the profile page; props: { item, onItemDeleted }.

// "34 dəqiqə əvvəl", with the exact moment for assistive technology.
const When = ({ date }) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return <time dateTime={parsed.toISOString()}>{timeAgo(parsed)}</time>;
};

// Read-only stars (Make ".stars": ★★★★★).
const Stars = ({ rating }) => {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <div aria-label={`Qiymət: 5 üzərindən ${value}`} className="stars" role="img">
      <span aria-hidden="true">{'★'.repeat(value)}</span>
      <span aria-hidden="true" className="stars-off">
        {'★'.repeat(5 - value)}
      </span>
    </div>
  );
};

// Rating picker for editing a review: five radio buttons drawn as stars.
const StarInput = ({ value, onChange }) => {
  const name = useId();
  return (
    <fieldset className="star-input">
      <legend>Qiymətin</legend>
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <label className={star <= value ? 'on' : ''} key={star}>
            <input
              checked={value === star}
              className="sr-only"
              name={name}
              onChange={() => onChange(star)}
              type="radio"
              value={star}
            />
            <span aria-hidden="true">★</span>
            <span className="sr-only">{star} ulduz</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

// The "…" button in the card header with the owner's actions (edit, delete).
const ActionsMenu = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    rootRef.current?.querySelector('[role="menuitem"]')?.focus();
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const moveFocus = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const options = Array.from(rootRef.current?.querySelectorAll('[role="menuitem"]') ?? []);
    const index = options.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
    options[(next + options.length) % options.length]?.focus();
  };

  return (
    <div
      className="feed-menu"
      onBlur={(event) => {
        if (open && !rootRef.current?.contains(event.relatedTarget)) setOpen(false);
      }}
      ref={rootRef}
    >
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className="feed-menu-button"
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type="button"
      >
        <Icon name="more" />
      </button>
      {open && (
        <div className="feed-menu-list" id={menuId} onKeyDown={moveFocus} role="menu">
          {items.map((item) => (
            <button
              className={item.danger ? 'danger' : ''}
              key={item.label}
              onClick={() => {
                // Focus goes back to "…" first, so a dialog opened by the action returns focus there.
                buttonRef.current?.focus();
                setOpen(false);
                item.onSelect();
              }}
              role="menuitem"
              type="button"
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Confirmation before deleting something (replaces window.confirm).
const ConfirmDialog = ({ eyebrow, title, text, confirmLabel, onConfirm, onClose }) => {
  const titleId = useId();
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    const done = await onConfirm();
    setBusy(false);
    if (done !== false) onClose();
  };
  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={titleId}>{title}</h2>
      {text && <p>{text}</p>}
      <div className="modal-actions">
        <Button onClick={onClose} variant="secondary">
          Ləğv et
        </Button>
        <Button aria-busy={busy} disabled={busy} onClick={confirm} variant="danger">
          {busy ? 'Silinir…' : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
};

// Like toggle and comment counter (Make ".feed-actions").
const FeedActions = ({
  entityId,
  entityType,
  initialLiked = false,
  initialLikesCount = 0,
  commentsCount = 0,
  commentsOpen,
  commentsId,
  onToggleComments,
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [likeLoading, setLikeLoading] = useState(false);

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
    const optimisticCount = wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1;
    setLiked(!wasLiked);
    setLikesCount(optimisticCount);

    setLikeLoading(true);
    try {
      const response = await toggleLike(entityId, entityType);
      // Update with actual server values
      setLiked(response?.isLiked ?? !wasLiked);
      setLikesCount(response?.newCount ?? optimisticCount);
    } catch {
      // Rollback on error
      setLiked(wasLiked);
      setLikesCount(prevCount);
      toast.error('Bəyənmə yenilənmədi');
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="feed-actions">
      <button
        aria-busy={likeLoading}
        aria-pressed={liked}
        className={liked ? 'liked' : ''}
        onClick={handleLike}
        type="button"
      >
        <Icon name="heart" size={14} /> {likesCount} bəyənmə
      </button>
      <button
        aria-controls={commentsOpen ? commentsId : undefined}
        aria-expanded={commentsOpen}
        className={commentsOpen ? 'active' : ''}
        onClick={onToggleComments}
        type="button"
      >
        {commentsCount} şərh
      </button>
    </div>
  );
};

// One comment, with edit/delete for its author.
const CommentItem = ({ comment, currentUserId, onDelete, onUpdate, isEditing, editText, onEditStart, onEditCancel, onEditTextChange }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editId = useId();
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

  const handleSave = async (event) => {
    event.preventDefault();
    if (isSaving || !editText.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(comment.id, editText.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <li className="feed-comment">
      <Avatar name={comment.userName || 'Oxucu'} size="small" src={comment.userProfilePicture} />
      <div className="feed-comment-body">
        <p className="feed-comment-meta">
          {comment.userId ? (
            <Link className="activity-name" to={`/profile/${comment.userId}`}>
              {comment.userName}
            </Link>
          ) : (
            <strong>{comment.userName}</strong>
          )}{' '}
          <When date={comment.createdAt} />
        </p>
        {isEditing ? (
          <form className="feed-comment-edit" onSubmit={handleSave}>
            <label className="sr-only" htmlFor={editId}>
              Şərhi redaktə et
            </label>
            <textarea
              autoFocus
              id={editId}
              onChange={(event) => onEditTextChange(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && !isSaving && onEditCancel()}
              rows={2}
              value={editText}
            />
            <div>
              <Button disabled={isSaving} onClick={onEditCancel} variant="secondary">
                Ləğv et
              </Button>
              <Button disabled={isSaving || !editText.trim()} type="submit">
                {isSaving ? 'Saxlanılır…' : 'Yadda saxla'}
              </Button>
            </div>
          </form>
        ) : (
          <p className="feed-comment-text">{comment.text}</p>
        )}
      </div>
      {isOwner && !isEditing && (
        <div className="feed-comment-tools">
          <button aria-label="Şərhi redaktə et" onClick={() => onEditStart(comment.id, comment.text)} title="Redaktə et" type="button">
            <Icon name="edit" size={16} />
          </button>
          <button aria-busy={isDeleting} aria-label="Şərhi sil" disabled={isDeleting} onClick={handleDelete} title="Sil" type="button">
            <Icon name="trash" size={16} />
          </button>
        </div>
      )}
    </li>
  );
};

// Comment list and form; mounted while the comments are open.
const CommentsSection = ({ id, entityId, entityType, currentUserId, onCountChange }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const inputId = useId();

  const fetchComments = useCallback(async () => {
    const response = await getComments(entityId);
    // PagedResult returns items array, not data
    setComments(response?.items || response?.data || []);
  }, [entityId]);

  useEffect(() => {
    let active = true;
    fetchComments()
      .then(() => active && setLoadError(false))
      .catch((error) => {
        console.error('Failed to load comments:', error);
        if (active) setLoadError(true);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [fetchComments]);

  const retry = async () => {
    setLoading(true);
    try {
      await fetchComments();
      setLoadError(false);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!newComment.trim() || posting) return;

    setPosting(true);
    try {
      await addComment(entityId, entityType, newComment.trim());
    } catch {
      toast.error('Şərh əlavə olunmadı');
      setPosting(false);
      return;
    }
    setNewComment('');
    onCountChange(1);
    // Refresh comments to get the new one with all metadata
    try {
      await fetchComments();
      setLoadError(false);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
    toast.success('Şərh əlavə olundu');
    setPosting(false);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCountChange(-1);
      toast.success('Şərh silindi');
    } catch {
      toast.error('Şərh silinmədi');
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
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, text: newText } : c)));
      setEditingCommentId(null);
      setEditText('');
      toast.success('Şərh yeniləndi');
    } catch {
      toast.error('Şərh yenilənmədi');
    }
  };

  return (
    <section aria-label="Şərhlər" className="feed-comments" id={id}>
      {loading ? (
        <p aria-live="polite" className="feed-comments-status" role="status">
          Şərhlər yüklənir…
        </p>
      ) : loadError ? (
        <p className="feed-comments-status">
          Şərhlər yüklənmədi.{' '}
          <button className="feed-link-button" onClick={retry} type="button">
            Yenidən cəhd et
          </button>
        </p>
      ) : comments.length > 0 ? (
        <ul className="feed-comment-list">
          {comments.map((comment) => (
            <CommentItem
              comment={comment}
              currentUserId={currentUserId}
              editText={editText}
              isEditing={editingCommentId === comment.id}
              key={comment.id}
              onDelete={handleDeleteComment}
              onEditCancel={handleEditCancel}
              onEditStart={handleEditStart}
              onEditTextChange={setEditText}
              onUpdate={handleUpdateComment}
            />
          ))}
        </ul>
      ) : (
        <p className="feed-comments-status">Hələ şərh yoxdur. İlk fikri sən yaz.</p>
      )}

      <form className="feed-comment-form" onSubmit={handleAddComment}>
        <label className="sr-only" htmlFor={inputId}>
          Şərh yaz
        </label>
        <input
          id={inputId}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder="Şərh yaz..."
          type="text"
          value={newComment}
        />
        <button aria-busy={posting} aria-label="Şərhi göndər" disabled={!newComment.trim() || posting} type="submit">
          <Icon name="send" size={17} />
        </button>
      </form>
    </section>
  );
};

// Card frame shared by every activity type: header, content, likes and comments.
const FeedCardShell = ({ item, className = '', actionText, menu, interaction, currentUserId, children }) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDelta, setCommentDelta] = useState(0);
  const commentsId = useId();
  const userId = item.user?.id;

  return (
    <article className={`feed-card ${className}`}>
      <Activity
        action={menu}
        person={item.user}
        text={actionText}
        time={<When date={item.createdAt} />}
        to={userId ? `/profile/${userId}` : undefined}
      />
      {children}
      {interaction && (
        <>
          <FeedActions
            commentsCount={Math.max(0, (interaction.commentsCount ?? 0) + commentDelta)}
            commentsId={commentsId}
            commentsOpen={commentsOpen}
            entityId={interaction.entityId}
            entityType={interaction.entityType}
            initialLiked={interaction.isLiked}
            initialLikesCount={interaction.likesCount}
            // Start again from the server values whenever they change (e.g. after a refresh).
            key={`${interaction.entityId}:${interaction.isLiked}:${interaction.likesCount}`}
            onToggleComments={() => setCommentsOpen((open) => !open)}
          />
          {commentsOpen && (
            <CommentsSection
              currentUserId={currentUserId}
              entityId={interaction.entityId}
              entityType={interaction.entityType}
              id={commentsId}
              onCountChange={(delta) => setCommentDelta((value) => value + delta)}
            />
          )}
        </>
      )}
    </article>
  );
};

// Cover that links to the book; the title next to it is the accessible link.
const CoverLink = ({ book, bookId }) =>
  bookId ? (
    <Link aria-hidden="true" className="feed-cover-link" tabIndex={-1} to={`/books/${bookId}`}>
      <BookCover book={book} />
    </Link>
  ) : (
    <BookCover book={book} />
  );

// Quote activity (Make ".quote-feed").
const QuoteCard = ({ item, currentUserId, onDelete }) => {
  const [savedText, setSavedText] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const editId = useId();
  const titleId = useId();

  // Ensure we have valid quote data
  if (!item.quote || !item.quote.id) {
    return <FeedCardShell actionText="bir sitat paylaşdı." item={item} />;
  }

  const entityId = item.quote.id;
  const isOwner = currentUserId && item.user?.id === currentUserId;
  const text = savedText ?? item.quote.text;
  const book = item.book || item.quote.book;
  const bookId = book?.id || book?.Id;
  const author = bookAuthor(book);

  const handleEdit = () => {
    setEditText(text || '');
    setDialog('edit');
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editText.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await updateQuote(entityId, editText.trim(), item.quote.tags || []);
      setSavedText(editText.trim());
      setDialog(null);
      toast.success('Sitat yeniləndi');
    } catch (error) {
      toast.error('Sitat yenilənmədi');
      console.error('Error updating quote:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteQuote(entityId);
      toast.success('Sitat silindi');
      if (onDelete) onDelete(item.id);
      return true;
    } catch (error) {
      toast.error('Sitat silinmədi');
      console.error('Error deleting quote:', error);
      return false;
    }
  };

  return (
    <FeedCardShell
      actionText="bir sitat paylaşdı."
      className="quote-feed"
      currentUserId={currentUserId}
      interaction={{
        entityId,
        entityType: 'Quote',
        isLiked: item.quote.isLiked ?? false,
        likesCount: item.quote.likesCount ?? 0,
        commentsCount: item.quote.commentsCount ?? 0,
      }}
      item={item}
      menu={
        isOwner && (
          <ActionsMenu
            items={[
              { label: 'Redaktə et', icon: 'edit', onSelect: handleEdit },
              { label: 'Sil', icon: 'trash', danger: true, onSelect: () => setDialog('delete') },
            ]}
            label="Sitat əməliyyatları"
          />
        )
      }
    >
      <blockquote>“{text}”</blockquote>
      {book && (book.title || author) && (
        <p>
          {author && `${author} · `}
          {bookId ? (
            <Link className="feed-book-link" to={`/books/${bookId}`}>
              <strong>{book.title}</strong>
            </Link>
          ) : (
            <strong>{book.title}</strong>
          )}
        </p>
      )}
      {item.quote.tags?.length > 0 && (
        <ul aria-label="Etiketlər" className="feed-tags">
          {item.quote.tags.slice(0, 5).map((tag, index) => (
            <li key={`${tag}-${index}`}>#{tag}</li>
          ))}
        </ul>
      )}

      {dialog === 'edit' && (
        <Dialog labelledBy={titleId} onClose={() => !isSaving && setDialog(null)}>
          <form onSubmit={handleSaveEdit}>
            <Eyebrow>SİTATI REDAKTƏ ET</Eyebrow>
            <h2 id={titleId}>Sitatın mətnini yenilə</h2>
            <label className="text-field" htmlFor={editId}>
              <span>Sitat</span>
              <textarea id={editId} onChange={(event) => setEditText(event.target.value)} rows={5} value={editText} />
            </label>
            <div className="modal-actions">
              <Button disabled={isSaving} onClick={() => setDialog(null)} variant="secondary">
                Ləğv et
              </Button>
              <Button disabled={isSaving || !editText.trim()} type="submit">
                {isSaving ? 'Saxlanılır…' : 'Yadda saxla'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
      {dialog === 'delete' && (
        <ConfirmDialog
          confirmLabel="Sitatı sil"
          eyebrow="SİTATI SİL"
          onClose={() => setDialog(null)}
          onConfirm={handleDelete}
          text="Bu sitat lentdən və profilindən birdəfəlik silinəcək."
          title="Bu sitat silinsin?"
        />
      )}
    </FeedCardShell>
  );
};

// Review activity (Make ".feed-book").
const ReviewCard = ({ item, currentUserId, onDelete }) => {
  const [saved, setSaved] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const editId = useId();
  const titleId = useId();

  // Ensure we have valid review data
  if (!item.review || !item.review.id) {
    return <FeedCardShell actionText="yeni rəy paylaşdı." item={item} />;
  }

  const review = item.review;
  const entityId = review.id;
  const isOwner = currentUserId && item.user?.id === currentUserId;
  const rating = saved?.rating ?? review.rating ?? 0;
  const reviewText = saved ? saved.reviewText : review.reviewText;
  const bookId = review.bookId || item.book?.id;
  const book = {
    ...(item.book || {}),
    id: bookId,
    title: review.bookTitle || item.book?.title,
    coverImageUrl: review.bookCoverImageUrl || item.book?.coverImageUrl,
  };

  const handleEdit = () => {
    setEditText(reviewText || '');
    setEditRating(rating || 0);
    setDialog('edit');
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (editRating === 0 || isSaving) return;
    setIsSaving(true);
    try {
      await updateReview(entityId, editRating, editText.trim());
      setSaved({ rating: editRating, reviewText: editText.trim() });
      setDialog(null);
      toast.success('Rəy yeniləndi');
    } catch (error) {
      toast.error('Rəy yenilənmədi');
      console.error('Error updating review:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview(entityId);
      toast.success('Rəy silindi');
      if (onDelete) onDelete(item.id);
      return true;
    } catch (error) {
      toast.error('Rəy silinmədi');
      console.error('Error deleting review:', error);
      return false;
    }
  };

  return (
    <FeedCardShell
      actionText="yeni rəy paylaşdı."
      currentUserId={currentUserId}
      interaction={{
        entityId,
        entityType: 'Review',
        isLiked: review.isLiked ?? false,
        likesCount: review.likesCount ?? 0,
        commentsCount: review.commentsCount ?? 0,
      }}
      item={item}
      menu={
        isOwner && (
          <ActionsMenu
            items={[
              { label: 'Redaktə et', icon: 'edit', onSelect: handleEdit },
              { label: 'Sil', icon: 'trash', danger: true, onSelect: () => setDialog('delete') },
            ]}
            label="Rəy əməliyyatları"
          />
        )
      }
    >
      <div className="feed-book">
        <CoverLink book={book} bookId={bookId} />
        <div>
          <Eyebrow>KİTAB RƏYİ</Eyebrow>
          <h3>{bookId ? <Link to={`/books/${bookId}`}>{book.title}</Link> : book.title}</h3>
          <Stars rating={rating} />
          {reviewText && <p>“{reviewText}”</p>}
        </div>
      </div>

      {dialog === 'edit' && (
        <Dialog labelledBy={titleId} onClose={() => !isSaving && setDialog(null)}>
          <form onSubmit={handleSaveEdit}>
            <Eyebrow>RƏYİ REDAKTƏ ET</Eyebrow>
            <h2 id={titleId}>{book.title || 'Rəyini yenilə'}</h2>
            <StarInput onChange={setEditRating} value={editRating} />
            <label className="text-field" htmlFor={editId}>
              <span>Rəyin</span>
              <textarea
                id={editId}
                onChange={(event) => setEditText(event.target.value)}
                placeholder="Kitab haqqında fikrini yaz..."
                rows={5}
                value={editText}
              />
            </label>
            <div className="modal-actions">
              <Button disabled={isSaving} onClick={() => setDialog(null)} variant="secondary">
                Ləğv et
              </Button>
              <Button disabled={isSaving || editRating === 0} type="submit">
                {isSaving ? 'Saxlanılır…' : 'Yadda saxla'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
      {dialog === 'delete' && (
        <ConfirmDialog
          confirmLabel="Rəyi sil"
          eyebrow="RƏYİ SİL"
          onClose={() => setDialog(null)}
          onConfirm={handleDelete}
          text="Rəyin və ona yazılan şərhlər birdəfəlik silinəcək."
          title="Bu rəy silinsin?"
        />
      )}
    </FeedCardShell>
  );
};

// What adding a book to a shelf means, by the shelf's real (API) name.
const shelfEyebrow = (name) => {
  if (name === 'Read') return 'TAMAMLANDI';
  if (name === 'Currently Reading') return 'HAZIRDA OXUYUR';
  if (name === 'Want to Read') return 'OXUMAQ İSTƏYİR';
  return 'RƏFƏ ƏLAVƏ EDİLDİ';
};

// Book added to a shelf (Make ".finished-book").
const BookAddedCard = ({ item, currentUserId, onDelete }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const bookId = item.book?.id || item.book?.Id;
  const hasValidBook = item.book && bookId;

  // For BookShelf, we use the bookShelf item's ID if available, otherwise book ID
  const entityId = item.bookShelfId || bookId;
  const isOwner = currentUserId && item.user?.id === currentUserId;
  const actionText = item.shelfName ? `“${shelfName(item.shelfName)}” rəfinə kitab əlavə etdi.` : 'rəfinə kitab əlavə etdi.';

  // Guard: ensure we have an entityId for interactions
  if (!entityId) {
    return <FeedCardShell actionText={actionText} item={item} />;
  }

  // bookShelfId is "<bookId>-<shelfId>"; ids can contain hyphens, so cut the known book id off the front.
  const shelfId =
    bookId && item.bookShelfId?.startsWith(`${bookId}-`)
      ? item.bookShelfId.slice(String(bookId).length + 1)
      : item.bookShelfId?.split('-')[1];

  const handleDelete = async () => {
    if (!bookId || !shelfId) {
      toast.error('Silmək mümkün olmadı: kitab və ya rəf tapılmadı');
      return false;
    }
    try {
      await deleteBookShelf(bookId, shelfId);
      toast.success('Kitab rəfdən çıxarıldı');
      if (onDelete) onDelete(item.id);
      return true;
    } catch (error) {
      toast.error('Kitab rəfdən çıxarılmadı');
      console.error('Error deleting bookshelf entry:', error);
      return false;
    }
  };

  const averageRating = Number(item.book?.averageRating) || 0;

  return (
    <FeedCardShell
      actionText={actionText}
      currentUserId={currentUserId}
      interaction={{
        entityId,
        entityType: 'BookShelf',
        isLiked: item.isLiked ?? false,
        likesCount: item.likesCount ?? 0,
        commentsCount: item.commentsCount ?? 0,
      }}
      item={item}
      menu={
        // Delete only (no edit for a shelf entry)
        isOwner && (
          <ActionsMenu
            items={[{ label: 'Rəfdən çıxar', icon: 'trash', danger: true, onSelect: () => setConfirmOpen(true) }]}
            label="Rəf əməliyyatları"
          />
        )
      }
    >
      {hasValidBook ? (
        <div className="finished-book">
          <CoverLink book={item.book} bookId={bookId} />
          <div>
            <Eyebrow>{shelfEyebrow(item.shelfName)}</Eyebrow>
            <h3>
              <Link to={`/books/${bookId}`}>{item.book.title || 'Kitab'}</Link>
              {item.book.isDeleted && <span className="feed-badge">Silinib</span>}
            </h3>
            <p>{bookAuthor(item.book) || 'Müəllif məlum deyil'}</p>
            {averageRating > 0 && (
              <div className="feed-rating">
                <Stars rating={averageRating} />
                <span>{formatRating(averageRating)}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="finished-book">
          <div aria-hidden="true" className="book-cover cover-sand" />
          <div>
            <Eyebrow>{shelfEyebrow(item.shelfName)}</Eyebrow>
            <p>Kitab məlumatı əlçatan deyil.</p>
          </div>
        </div>
      )}

      {confirmOpen && (
        <ConfirmDialog
          confirmLabel="Rəfdən çıxar"
          eyebrow="RƏFDƏN ÇIXAR"
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          text={`Kitab “${shelfName(item.shelfName) || 'rəf'}” rəfindən çıxarılacaq.`}
          title="Kitab rəfdən çıxarılsın?"
        />
      )}
    </FeedCardShell>
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

  switch (item?.activityType) {
    case 'Quote':
      return <QuoteCard currentUserId={currentUserId} item={item} onDelete={handleItemDelete} />;
    case 'Review':
      return <ReviewCard currentUserId={currentUserId} item={item} onDelete={handleItemDelete} />;
    case 'BookAdded':
      return <BookAddedCard currentUserId={currentUserId} item={item} onDelete={handleItemDelete} />;
    default:
      return item ? <FeedCardShell actionText="yenilik paylaşdı." item={item} /> : null;
  }
};

export default FeedItemCard;
