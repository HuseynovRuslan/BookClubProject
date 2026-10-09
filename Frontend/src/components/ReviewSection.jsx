import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
import {
  getReviewsByBookId,
  createReview,
  updateReview,
  deleteReview,
} from '../api/reviews';
import { toggleLike, getComments, addComment, updateComment, deleteComment } from '../api/interactions';
import { useAuth } from '../context/AuthContext';
import { Avatar, Button, ButtonLink, Dialog, EmptyState, Eyebrow, Icon } from './app/ui';
import { displayName, timeAgo } from './app/format';

// Reader reviews of one book (Make "Oxucu rəyləri"): summary, the write form, and review rows with
// edit/delete for the author, likes and comments for everyone.

const profilePath = (person) => `/profile/${person?.username || person?.userName || person?.userId || ''}`;

/**
 * @param {Object} props
 * @param {string} props.bookId - The book ID to display reviews for
 * @param {Function} [props.onStatsChange] - Called with { count, average } whenever the list changes
 */
const ReviewSection = ({ bookId, onStatsChange }) => {
  const { user, isAuthenticated, emailConfirmed } = useAuth();

  // State
  const [reviews, setReviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // New review form state
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [formError, setFormError] = useState('');

  // Edit form state
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  // Check if current user has already reviewed
  const userReview = reviews.find((r) => r.userId === user?.id);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReviewsByBookId(bookId, 1, 50);
      const received = data?.items || data || [];
      // The API filters by bookId; keep only this book's reviews in case a list ever comes back mixed.
      const reviewsList = received.filter((r) => !r.bookId || String(r.bookId) === String(bookId));
      setReviews(reviewsList);
      setTotalCount(
        reviewsList.length === received.length ? Math.max(data?.totalCount || 0, reviewsList.length) : reviewsList.length,
      );
    } catch {
      toast.error('Rəylər yüklənmədi');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (bookId) {
      fetchReviews();
    }
  }, [bookId, fetchReviews]);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  useEffect(() => {
    if (!loading) onStatsChange?.({ count: totalCount, average: averageRating });
  }, [loading, totalCount, averageRating, onStatsChange]);

  const validateForm = (rating, comment) => {
    if (!rating || rating < 1 || rating > 5) {
      return 'Qiymət seç (1–5 ulduz)';
    }
    if (!comment || comment.trim().length === 0) {
      return 'Rəyinin mətnini yaz';
    }
    if (comment.trim().length < 10) {
      return 'Rəy ən azı 10 simvoldan ibarət olmalıdır';
    }
    return '';
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Rəy yazmaq üçün daxil ol');
      return;
    }

    const error = validateForm(newRating, newComment);
    if (error) {
      setFormError(error);
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      await createReview({
        bookId,
        rating: newRating,
        reviewText: newComment.trim(),
      });

      toast.success('Rəyin paylaşıldı!');
      setNewRating(0);
      setNewComment('');
      fetchReviews();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Rəyi göndərmək alınmadı';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.reviewText || '');
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleUpdateReview = async (reviewId) => {
    const error = validateForm(editRating, editComment);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setSubmitting(true);
      await updateReview(reviewId, {
        rating: editRating,
        reviewText: editComment.trim(),
      });

      toast.success('Rəy yeniləndi');
      setEditingReviewId(null);
      fetchReviews();
    } catch {
      toast.error('Rəyi yeniləmək alınmadı');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      setDeletingReviewId(reviewId);
      await deleteReview(reviewId);
      toast.success('Rəy silindi');
      setShowDeleteConfirm(null);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setTotalCount((count) => Math.max(0, count - 1));
    } catch {
      toast.error('Rəyi silmək alınmadı');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const patchReview = (reviewId, changes) =>
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...changes(r) } : r)));

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === stars).length / reviews.length) * 100
        : 0,
  }));

  if (loading) {
    return (
      <div aria-label="Rəylər yüklənir" aria-live="polite" className="reviews reviews-loading" role="status">
        <div className="review-summary-skeleton" />
        {[0, 1].map((key) => (
          <div className="review-skeleton" key={key}>
            <i />
            <div>
              <span />
              <span />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const reviewToDelete = reviews.find((r) => r.id === showDeleteConfirm);

  return (
    <div className="reviews">
      {/* Rating Summary */}
      <div className="review-summary">
        <strong>{averageRating > 0 ? averageRating.toFixed(1) : '—'}</strong>
        <div>
          <StarRating rating={Math.round(averageRating)} />
          <span>
            {reviews.length > 0 ? `${reviews.length} rəy əsasında` : 'Hələ qiymət verilməyib'}
          </span>
        </div>
        {reviews.length > 0 && (
          <ul aria-label="Qiymətlərin bölgüsü" className="rating-bars">
            {ratingCounts.map(({ stars, count, percentage }) => (
              <li key={stars}>
                <span>{stars} ★</span>
                <i aria-hidden="true">
                  <b style={{ width: `${percentage}%` }} />
                </i>
                <span>
                  {count}
                  <span className="sr-only"> rəy</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Write Review Form - Only if user hasn't reviewed */}
      {isAuthenticated && !userReview && (
        <form aria-labelledby={`review-form-${bookId}`} className="review-form" onSubmit={handleSubmitReview} noValidate>
          <h3 id={`review-form-${bookId}`}>Rəyini yaz</h3>

          {/* Email Verification Warning */}
          {!emailConfirmed && (
            <p className="review-note review-note-warning" role="note">
              <strong>E-poçt təsdiqi tələb olunur.</strong> Rəy yazmaq üçün e-poçtunu təsdiqlə — təsdiq
              linki gələnlər qutusundadır.
            </p>
          )}

          {/* Star Rating Input */}
          <div className="review-form-rating">
            <span aria-hidden="true" className="review-form-label">
              Qiymətin
            </span>
            <StarRating
              disabled={!emailConfirmed}
              label="Qiymətin"
              onRatingChange={emailConfirmed ? setNewRating : undefined}
              rating={newRating}
              size="lg"
            />
          </div>

          {/* Comment Input */}
          <label className="text-field">
            Rəyin
            <textarea
              aria-label="Rəyin"
              disabled={!emailConfirmed}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={emailConfirmed ? 'Bu kitab haqqında fikirlərini bölüş...' : 'Rəy yazmaq üçün e-poçtunu təsdiqlə'}
              rows={4}
              value={newComment}
              aria-describedby={formError ? `review-error-${bookId}` : undefined}
              aria-invalid={formError ? true : undefined}
            />
          </label>

          {/* Error Message */}
          {formError && (
            <p className="form-error" id={`review-error-${bookId}`} role="alert">
              {formError}
            </p>
          )}

          <div className="review-form-actions">
            <Button disabled={submitting || !emailConfirmed} type="submit">
              <Icon name="send" />
              {submitting ? 'Göndərilir...' : !emailConfirmed ? 'Göndərmək üçün e-poçtu təsdiqlə' : 'Rəyi paylaş'}
            </Button>
          </div>
        </form>
      )}

      {/* Already Reviewed Notice */}
      {isAuthenticated && userReview && (
        <p className="review-note">Bu kitab haqqında artıq rəy yazmısan. Rəyini aşağıda redaktə edə və ya silə bilərsən.</p>
      )}

      {/* Login Prompt */}
      {!isAuthenticated && (
        <div className="review-note review-login">
          <p>Rəy yazmaq üçün hesabına daxil ol.</p>
          <ButtonLink to="/login" variant="secondary">
            Daxil ol
          </ButtonLink>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <EmptyState title="Hələ rəy yoxdur" text="Bu kitab haqqında fikrini ilk sən bölüş." />
      ) : (
        <div className="review-list">
          {reviews.map((review) => {
            const isOwn = review.userId === user?.id;
            const isEditing = editingReviewId === review.id;
            const name = displayName(review);

            return (
              <article className={`review ${isOwn ? 'review-own' : ''}`} key={review.id}>
                <Avatar name={name} size="small" src={review.userProfilePictureUrl} />
                <div>
                  <div className="review-head">
                    <p className="review-author">
                      <Link className="activity-name" to={profilePath(review)}>
                        {name}
                      </Link>
                      {review.username && (review.firstName || review.lastName) && (
                        <span className="review-handle">@{review.username}</span>
                      )}
                      {isOwn && <span className="review-tag">Sənin rəyin</span>}
                    </p>
                    {!isEditing && <StarRating rating={review.rating} />}
                  </div>

                  {/* Review Content or Edit Form */}
                  {isEditing ? (
                    <div className="review-edit">
                      <div className="review-form-rating">
                        <span aria-hidden="true" className="review-form-label">Qiymət</span>
                        <StarRating label="Qiymət" onRatingChange={setEditRating} rating={editRating} size="md" />
                      </div>
                      <label className="text-field">
                        Rəy
                        <textarea aria-label="Rəy" onChange={(e) => setEditComment(e.target.value)} rows={3} value={editComment} />
                      </label>
                      <div className="review-form-actions">
                        <Button onClick={handleCancelEdit} variant="secondary">
                          Ləğv et
                        </Button>
                        <Button disabled={submitting} onClick={() => handleUpdateReview(review.id)}>
                          {submitting ? 'Yadda saxlanılır...' : 'Yadda saxla'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="review-text">{review.reviewText || 'Şərh yazılmayıb.'}</p>
                  )}

                  <ReviewFooter
                    isEditing={isEditing}
                    isOwn={isOwn}
                    onDelete={() => setShowDeleteConfirm(review.id)}
                    onEdit={() => handleStartEdit(review)}
                    onPatch={(changes) => patchReview(review.id, changes)}
                    review={review}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {reviewToDelete && (
        <Dialog labelledBy="delete-review-title" onClose={() => setShowDeleteConfirm(null)}>
          <Eyebrow>RƏYİ SİL</Eyebrow>
          <h2 id="delete-review-title">Rəyini silmək istəyirsən?</h2>
          <p>Rəy, ona verilən bəyənmələr və şərhlər silinəcək. Bu əməliyyatı geri qaytarmaq olmur.</p>
          <div className="modal-actions">
            <Button onClick={() => setShowDeleteConfirm(null)} variant="secondary">
              Ləğv et
            </Button>
            <Button
              disabled={deletingReviewId === reviewToDelete.id}
              onClick={() => handleDeleteReview(reviewToDelete.id)}
              variant="danger"
            >
              <Icon name="trash" />
              {deletingReviewId === reviewToDelete.id ? 'Silinir...' : 'Sil'}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

// Time, likes, comments and (for the author) edit/delete under one review.
const ReviewFooter = ({ review, isOwn, isEditing, onEdit, onDelete, onPatch }) => {
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const liked = !!review.isLiked;
  const likesCount = review.likesCount ?? 0;
  const commentsCount = review.commentsCount ?? 0;

  const handleLike = async () => {
    if (!review.id || likeLoading) return;
    // Optimistic update, rolled back on error
    onPatch(() => ({ isLiked: !liked, likesCount: liked ? Math.max(0, likesCount - 1) : likesCount + 1 }));
    setLikeLoading(true);
    try {
      const response = await toggleLike(review.id, 'Review');
      if (response && typeof response.isLiked === 'boolean') {
        const count = response.newCount ?? response.likesCount;
        onPatch((r) => ({ isLiked: response.isLiked, likesCount: typeof count === 'number' ? count : r.likesCount }));
      }
    } catch {
      onPatch(() => ({ isLiked: liked, likesCount }));
      toast.error('Bəyənməni yeniləmək alınmadı');
    } finally {
      setLikeLoading(false);
    }
  };

  const commentsId = `review-comments-${review.id}`;

  return (
    <>
      <div className="review-footer">
        <small>
          <time dateTime={review.createdAt}>{timeAgo(review.createdAt)}</time>
        </small>
        <div className="review-actions">
          <button
            aria-label={liked ? 'Bəyənməni geri al' : 'Rəyi bəyən'}
            aria-pressed={liked}
            className={`review-action ${liked ? 'is-liked' : ''}`}
            disabled={likeLoading}
            onClick={handleLike}
            type="button"
          >
            <Icon name="heart" size={16} />
            <span>{likesCount}</span>
          </button>
          <button
            aria-controls={commentsId}
            aria-expanded={commentsOpen}
            aria-label={`Şərhlər (${commentsCount})`}
            className={`review-action ${commentsOpen ? 'is-open' : ''}`}
            onClick={() => setCommentsOpen((open) => !open)}
            type="button"
          >
            <Icon name="comment" size={16} />
            <span>{commentsCount}</span>
          </button>
          {isOwn && !isEditing && (
            <>
              <button aria-label="Rəyi redaktə et" className="review-action" onClick={onEdit} type="button">
                <Icon name="edit" size={16} />
              </button>
              <button aria-label="Rəyi sil" className="review-action review-action-danger" onClick={onDelete} type="button">
                <Icon name="trash" size={16} />
              </button>
            </>
          )}
        </div>
      </div>
      {commentsOpen && (
        <ReviewComments
          id={commentsId}
          onCountChange={(delta) => onPatch((r) => ({ commentsCount: Math.max(0, (r.commentsCount ?? 0) + delta) }))}
          reviewId={review.id}
        />
      )}
    </>
  );
};

// Comments under a review: list, add, and edit/delete for the comment's author.
const ReviewComments = ({ id, reviewId, onCountChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getComments(reviewId);
      setComments(response?.items || response?.data || []);
    } catch {
      toast.error('Şərhlər yüklənmədi');
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      await addComment(reviewId, 'Review', newComment.trim());
      setNewComment('');
      onCountChange(1);
      await fetchComments();
      toast.success('Şərh əlavə edildi');
    } catch {
      toast.error('Şərh əlavə etmək alınmadı');
    } finally {
      setPosting(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    const text = editText.trim();
    if (!text || savingId) return;
    setSavingId(commentId);
    try {
      await updateComment(commentId, text);
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, text } : c)));
      setEditingCommentId(null);
      setEditText('');
      toast.success('Şərh yeniləndi');
    } catch {
      toast.error('Şərhi yeniləmək alınmadı');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (deletingId) return;
    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setConfirmDeleteId(null);
      onCountChange(-1);
      toast.success('Şərh silindi');
    } catch {
      toast.error('Şərhi silmək alınmadı');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section aria-label="Rəyə yazılan şərhlər" className="review-comments" id={id}>
      {loading ? (
        <p className="review-comments-status" role="status">
          Şərhlər yüklənir...
        </p>
      ) : comments.length === 0 ? (
        <p className="review-comments-status">Hələ şərh yoxdur. İlk şərhi sən yaz.</p>
      ) : (
        <ul className="review-comment-list">
          {comments.map((comment) => {
            const isOwner = user?.id && comment.userId === user.id;
            const isEditing = editingCommentId === comment.id;
            const name = comment.userName || 'Oxucu';
            return (
              <li className="review-comment" key={comment.id}>
                <Avatar name={name} size="small" src={comment.userProfilePicture} />
                <div>
                  <p className="review-comment-meta">
                    <Link className="activity-name" to={`/profile/${comment.userName || comment.userId}`}>
                      {name}
                    </Link>
                    <time dateTime={comment.createdAt}>{timeAgo(comment.createdAt)}</time>
                  </p>
                  {isEditing ? (
                    <div className="review-comment-edit">
                      <label className="text-field">
                        <span className="sr-only">Şərhi redaktə et</span>
                        <textarea aria-label="Şərhi redaktə et" onChange={(e) => setEditText(e.target.value)} rows={2} value={editText} />
                      </label>
                      <div className="review-form-actions">
                        <Button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditText('');
                          }}
                          variant="secondary"
                        >
                          Ləğv et
                        </Button>
                        <Button disabled={!editText.trim() || savingId === comment.id} onClick={() => handleUpdateComment(comment.id)}>
                          {savingId === comment.id ? 'Yadda saxlanılır...' : 'Yadda saxla'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="review-comment-text">{comment.text}</p>
                  )}
                  {isOwner && !isEditing && (
                    <div className="review-comment-actions">
                      {confirmDeleteId === comment.id ? (
                        <>
                          <span>Şərh silinsin?</span>
                          <button onClick={() => setConfirmDeleteId(null)} type="button">
                            Xeyr
                          </button>
                          <button
                            className="is-danger"
                            disabled={deletingId === comment.id}
                            onClick={() => handleDeleteComment(comment.id)}
                            type="button"
                          >
                            {deletingId === comment.id ? 'Silinir...' : 'Bəli, sil'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditText(comment.text || '');
                            }}
                            type="button"
                          >
                            Redaktə et
                          </button>
                          <button className="is-danger" onClick={() => setConfirmDeleteId(comment.id)} type="button">
                            Sil
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form className="review-comment-form" onSubmit={handleAddComment}>
        <label className="field">
          <span className="sr-only">Şərh yaz</span>
          <input
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Şərh yaz..."
            value={newComment}
          />
        </label>
        <Button disabled={!newComment.trim() || posting} type="submit">
          <Icon name="send" size={16} />
          {posting ? 'Göndərilir...' : 'Göndər'}
        </Button>
      </form>
    </section>
  );
};

export default ReviewSection;
