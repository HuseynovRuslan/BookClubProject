import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Pencil,
  Trash2,
  Loader,
  User,
  X,
  Send,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
import {
  getReviewsByBookId,
  createReview,
  updateReview,
  deleteReview,
} from '../api/reviews';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7050';

/**
 * Review Section Component
 * Displays reviews for a book and allows users to add/edit/delete their own reviews
 * 
 * @param {Object} props
 * @param {string} props.bookId - The book ID to display reviews for
 */
const ReviewSection = ({ bookId }) => {
  const { user, isAuthenticated, emailConfirmed } = useAuth();

  // State
  const [reviews, setReviews] = useState([]);
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

  useEffect(() => {
    if (bookId) {
      fetchReviews();
    }
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getReviewsByBookId(bookId, 1, 50);
      const reviewsList = data?.items || data || [];
      // Debug: Check if review data includes firstName, lastName, userProfilePictureUrl
      if (reviewsList.length > 0) {
        console.log('Review data sample:', reviewsList[0]);
      }
      setReviews(reviewsList);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (rating, comment) => {
    if (!rating || rating < 1 || rating > 5) {
      return 'Please select a rating (1-5 stars)';
    }
    if (!comment || comment.trim().length === 0) {
      return 'Please write a review comment';
    }
    if (comment.trim().length < 10) {
      return 'Review must be at least 10 characters';
    }
    return '';
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please log in to write a review');
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

      toast.success('Review submitted successfully!');
      setNewRating(0);
      setNewComment('');
      fetchReviews();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
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

      toast.success('Review updated!');
      setEditingReviewId(null);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      setDeletingReviewId(reviewId);
      await deleteReview(reviewId);
      toast.success('Review deleted');
      setShowDeleteConfirm(null);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error) {
      toast.error('Failed to delete review');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProfilePicture = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === stars).length / reviews.length) * 100
        : 0,
  }));

  return (
    <div className="mt-12 pt-8 border-t border-stone-200">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-stone-700" />
        <h2 className="text-2xl font-bold text-stone-900">Reviews & Ratings</h2>
        <span className="px-2.5 py-0.5 bg-stone-100 text-stone-600 text-sm font-medium rounded-full">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-stone-400 animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Rating Summary */}
          <div className="lg:col-span-1">
            <div className="bg-stone-50 rounded-xl p-6">
              {/* Average Rating */}
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-stone-900 mb-2">
                  {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </div>
                <StarRating rating={Math.round(averageRating)} size="lg" />
                <p className="text-stone-500 text-sm mt-2">
                  Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {ratingCounts.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-stone-600 w-6">{stars}★</span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-stone-500 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write Review Form - Only if user hasn't reviewed */}
            {isAuthenticated && !userReview && (
              <div className="mt-6 bg-white border border-stone-200 rounded-xl p-6">
                <h3 className="font-semibold text-stone-900 mb-4">Write a Review</h3>
                
                {/* Email Verification Warning */}
                {!emailConfirmed && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-800 font-medium text-sm">Email verification required</p>
                      <p className="text-amber-700 text-sm mt-1">
                        Please verify your email to submit reviews. Check your inbox for the verification link.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmitReview}>
                  {/* Star Rating Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Your Rating
                    </label>
                    <StarRating
                      rating={newRating}
                      onRatingChange={emailConfirmed ? setNewRating : undefined}
                      size="lg"
                      disabled={!emailConfirmed}
                    />
                  </div>

                  {/* Comment Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={emailConfirmed ? "Share your thoughts about this book..." : "Verify your email to write reviews"}
                      rows={4}
                      disabled={!emailConfirmed}
                      className={`w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent resize-none ${!emailConfirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  {/* Error Message */}
                  {formError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
                      <AlertCircle className="w-4 h-4" />
                      {formError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !emailConfirmed}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : !emailConfirmed ? (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        Verify Email to Submit
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Review
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Already Reviewed Notice */}
            {isAuthenticated && userReview && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-amber-800 text-sm">
                  You've already reviewed this book. You can edit or delete your review below.
                </p>
              </div>
            )}

            {/* Login Prompt */}
            {!isAuthenticated && (
              <div className="mt-6 bg-stone-50 border border-stone-200 rounded-xl p-6 text-center">
                <p className="text-stone-600 mb-3">
                  Log in to write a review
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Log In
                </a>
              </div>
            )}
          </div>

          {/* Right Column - Reviews List */}
          <div className="lg:col-span-2">
            {reviews.length === 0 ? (
              /* Empty State */
              <div className="bg-stone-50 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-stone-500">
                  Be the first to share your thoughts about this book!
                </p>
              </div>
            ) : (
              /* Reviews List */
              <div className="space-y-6">
                {reviews.map((review) => {
                  const isOwn = review.userId === user?.id;
                  const isEditing = editingReviewId === review.id;

                  return (
                    <div
                      key={review.id}
                      className={`bg-white border rounded-xl p-6 transition-all ${
                        isOwn ? 'border-amber-200 bg-amber-50/30' : 'border-stone-200'
                      }`}
                    >
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden flex-shrink-0">
                            {review.userProfilePictureUrl ? (
                              <img
                                src={getProfilePicture(review.userProfilePictureUrl)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-stone-700 text-white font-medium">
                                {review.firstName && review.lastName
                                  ? `${review.firstName[0]}${review.lastName[0]}`.toUpperCase()
                                  : review.firstName
                                  ? review.firstName[0].toUpperCase()
                                  : review.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>

                          {/* User Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                {(review.firstName || review.lastName) ? (
                                  <span className="font-medium text-stone-900">
                                    {[review.firstName, review.lastName].filter(Boolean).join(' ') || review.username || 'Anonymous'}
                                  </span>
                                ) : (
                                  <span className="font-medium text-stone-900">
                                    {review.username || 'Anonymous'}
                                  </span>
                                )}
                                {review.username && (review.firstName || review.lastName) && (
                                  <span className="text-xs text-stone-500">@{review.username}</span>
                                )}
                              </div>
                              {isOwn && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-stone-400 text-xs">•</span>
                              <span className="text-stone-500 text-xs">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions (only for own reviews) */}
                        {isOwn && !isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(review)}
                              className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                              aria-label="Edit review"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(review.id)}
                              className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label="Delete review"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Review Content or Edit Form */}
                      {isEditing ? (
                        <div className="space-y-4">
                          {/* Edit Rating */}
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              Rating
                            </label>
                            <StarRating
                              rating={editRating}
                              onRatingChange={setEditRating}
                              size="md"
                            />
                          </div>

                          {/* Edit Comment */}
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              Review
                            </label>
                            <textarea
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                            />
                          </div>

                          {/* Edit Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateReview(review.id)}
                              disabled={submitting}
                              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {submitting ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Review Text */
                        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                          {review.reviewText || 'No comment provided.'}
                        </p>
                      )}

                      {/* Delete Confirmation */}
                      {showDeleteConfirm === review.id && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-sm mb-3">
                            Are you sure you want to delete this review?
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg text-sm transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={deletingReviewId === review.id}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {deletingReviewId === review.id ? (
                                <>
                                  <Loader className="w-3 h-3 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
