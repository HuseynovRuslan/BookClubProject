import { useState, useEffect, useCallback } from "react";
import { useShelves } from "../context/ShelvesContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getBookById, updateBookStatus } from "../api/books";
import { getReviews, createReview, updateReview as updateReviewApi, deleteReview } from "../api/reviews";
import { getImageUrl } from "../api/config";
import ReviewForm from "./reviews/ReviewForm";
import ShelfSelectionModal from "./ShelfSelectionModal";
import GuestRestrictionModal from "./GuestRestrictionModal";
import { useTranslation } from "../hooks/useTranslation";

function BookDetailModal({ book, onClose, onShowLogin, onShowRegister }) {
  const t = useTranslation();
  const { shelves, addBookToShelf, refreshShelves } = useShelves();
  const { user, isGuest } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [bookDetails, setBookDetails] = useState(book);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showShelfModal, setShowShelfModal] = useState(false);

  const loadBookDetails = useCallback(async () => {
    if (!book?.id && !book?._id) {
      console.warn("Book ID not found:", book);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const bookId = book.id || book._id;
      console.log("Loading book details for ID:", bookId);
      
      const [bookData, reviewsData] = await Promise.all([
        getBookById(bookId),
        getReviews({ page: 1, pageSize: 50, bookId: bookId }).catch((err) => {
          console.error("Error fetching reviews:", err);
          return null; // Return null on error
        })
      ]);
      
      console.log("Book data received:", bookData);
      console.log("Reviews data received:", reviewsData);
      console.log("Reviews data type:", typeof reviewsData);
      console.log("Reviews data is array:", Array.isArray(reviewsData));
      
      // Backend-dən gələn bookData ApiResponse formatında ola bilər
      const finalBookData = bookData?.data || bookData || book;
      setBookDetails(finalBookData);
      
      // Filter reviews for this book (reviewsData is already filtered by bookId from API)
      let filteredReviews = [];
      if (reviewsData) {
        console.log("Raw reviewsData:", reviewsData);
        const reviewsResponse = reviewsData?.items || reviewsData?.Items || reviewsData || [];
        console.log("Reviews response array:", reviewsResponse);
        filteredReviews = Array.isArray(reviewsResponse) ? reviewsResponse : [];
        console.log("Filtered reviews before normalize:", filteredReviews);
        
        // Normalize review fields from backend format (BookReviewDto)
        // Backend returns: { id, bookId, bookTitle, userId, username, rating, reviewText, createdAt }
        filteredReviews = filteredReviews.map(review => {
          const normalized = {
            id: review.id || review.Id,
            userId: review.userId || review.UserId,
            username: review.username || review.Username || review.userName || review.UserName || "Anonymous",
            rating: review.rating || review.Rating || 0,
            text: review.reviewText || review.ReviewText || review.text || review.Text || review.comment || review.Comment || "",
            createdAt: review.createdAt || review.CreatedAt || review.date || review.Date || new Date().toISOString(),
          };
          console.log("Normalized review:", normalized);
          return normalized;
        });
        console.log("Final filtered reviews:", filteredReviews);
      }
      
      // If no reviews found in API, use reviews from book object
      if (filteredReviews.length === 0 && finalBookData.reviews) {
        setReviews(finalBookData.reviews.map((r, idx) => ({
          id: r.id || idx,
          username: r.username || "Anonymous",
          rating: r.rating || 5,
          text: r.comment || r.text || "",
          createdAt: r.date || new Date().toISOString(),
        })));
      } else {
        console.log("Setting reviews:", filteredReviews);
        setReviews(filteredReviews);
      }
    } catch (err) {
      console.error("Error loading book details:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.status,
        data: err.data
      });
      // Fallback to book prop if API fails
      setBookDetails(book);
      if (book.reviews) {
        setReviews(book.reviews.map((r, idx) => ({
          id: r.id || idx,
          username: r.username || "Anonymous",
          rating: r.rating || 5,
          text: r.comment || r.text || "",
          createdAt: r.date || new Date().toISOString(),
        })));
      }
    } finally {
      setLoading(false);
    }
  }, [book, user]);

  useEffect(() => {
    loadBookDetails();
  }, [loadBookDetails]);
  
  // Expose refresh function for parent components
  useEffect(() => {
    // Listen for review creation events (if needed)
    const handleReviewCreated = () => {
      loadBookDetails();
    };
    // You can use a custom event or context to trigger this
    window.addEventListener('reviewCreated', handleReviewCreated);
    return () => {
      window.removeEventListener('reviewCreated', handleReviewCreated);
    };
  }, [loadBookDetails]);

  const handleAddToReadingList = () => {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }
    // Ensure we have bookDetails with an ID
    if (!bookDetails || (!bookDetails.id && !bookDetails._id)) {
      setStatus({
        type: "error",
        message: "Kitab məlumatları yüklənməyib",
      });
      setTimeout(() => setStatus(null), 2500);
      return;
    }
    
    // Open shelf selection modal
    setShowShelfModal(true);
  };

  const handleShelfSelect = async (shelfId) => {
    if (!bookDetails) return;
    
    const targetShelf = shelves.find(s => s.id === shelfId);
    
    if (!targetShelf) {
      setStatus({
        type: "error",
        message: "Shelf tapılmadı",
      });
      setTimeout(() => setStatus(null), 2500);
      return;
    }
    
    try {
      await addBookToShelf(shelfId, bookDetails);
      if (typeof refreshShelves === "function") {
        await refreshShelves();
      }
      setStatus({
        type: "success",
        message: `"${bookDetails.title || 'Kitab'}" ${targetShelf.name} siyahısına əlavə olundu`,
      });
      // Refresh shelves to update Reading List page
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('shelfUpdated'));
      }
    } catch (err) {
      console.error("Error adding book to shelf:", err);
      setStatus({
        type: "error",
        message: err.message || "Shelf-ə əlavə etmək alınmadı",
      });
    } finally {
      setTimeout(() => setStatus(null), 2500);
    }
  };

  const handleReviewSubmit = async (values) => {
    setSubmittingReview(true);
    try {
      if (editingReview) {
        await updateReviewApi(editingReview.id, values);
        setEditingReview(null);
      } else {
        await createReview({
          ...values,
          bookId: bookDetails.id || bookDetails._id,
        });
      }
      // Reload reviews after submission
      await loadBookDetails();
      setStatus({
        type: "success",
        message: editingReview ? "Review yeniləndi" : "Review əlavə olundu",
      });
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Review göndərmək alınmadı",
      });
      setTimeout(() => setStatus(null), 2500);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      await loadBookDetails();
      setStatus({
        type: "success",
        message: "Review silindi",
      });
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Review silmək alınmadı",
      });
      setTimeout(() => setStatus(null), 2500);
    }
  };

  const coverImage = getImageUrl(
    bookDetails?.coverImageUrl ||
    bookDetails?.cover ||
    bookDetails?.coverImage ||
    bookDetails?.coverUrl ||
    bookDetails?.image
  );
  
  // Handle Author object from backend (BookDetailDto has Author as AuthorDto object)
  let authorName = t("bookDetail.unknownAuthor");
  if (bookDetails?.author) {
    if (typeof bookDetails.author === 'string') {
      authorName = bookDetails.author;
    } else if (bookDetails.author?.name || bookDetails.author?.Name) {
      authorName = bookDetails.author.name || bookDetails.author.Name;
    }
  } else if (bookDetails?.authorName) {
    authorName = bookDetails.authorName;
  } else if (bookDetails?.Author) {
    if (typeof bookDetails.Author === 'string') {
      authorName = bookDetails.Author;
    } else if (bookDetails.Author?.name || bookDetails.Author?.Name) {
      authorName = bookDetails.Author.name || bookDetails.Author.Name;
    }
  }
  let genre = null;
  if (bookDetails?.genre) {
    genre = typeof bookDetails.genre === 'string' ? bookDetails.genre : (bookDetails.genre.name || bookDetails.genre);
  } else if (Array.isArray(bookDetails?.genres) && bookDetails.genres.length > 0) {
    const firstGenre = bookDetails.genres[0];
    genre = typeof firstGenre === 'string' ? firstGenre : (firstGenre.name || firstGenre);
  }
  const rating = bookDetails?.rating || bookDetails?.averageRating || bookDetails?.avgRating || null;
  const description = bookDetails?.description || "";

  const renderStars = (rating) => {
    const roundedRating = Math.round(rating * 2) / 2; 
    const fullStars = Math.floor(roundedRating);
    const hasHalfStar = roundedRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-500 text-sm">★</span>
        ))}
        {hasHalfStar && (
          <span key="half" className="text-yellow-500 text-sm">★</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-sm">★</span>
        ))}
      </div>
    );
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : "?";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "short", 
        day: "numeric" 
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
        <div className="max-w-7xl xl:max-w-[1600px] mx-auto px-6 xl:px-8 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-gray-600">{t("bookDetail.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 transition-colors group text-gray-600 hover:text-gray-900"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-medium">{t("bookDetail.backToHome")}</span>
          </button>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            <div className="flex-shrink-0">
              <div className="w-full lg:w-64 h-96 lg:h-[28rem] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={bookDetails?.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    {t("bookDetail.noImage")}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-gray-900">
                {bookDetails?.title}
              </h1>
              <p className="text-xl mb-6 text-gray-600">{t("bookDetail.by")} {authorName}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                {genre && (
                  <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold shadow-sm">
                    {genre}
                  </span>
                )}
                {rating && (
                  <div className="flex items-center gap-2">
                    {renderStars(rating)}
                    <span className="font-medium text-gray-700">{rating.toFixed(1)} / 5.0</span>
                  </div>
                )}
              </div>

              {description && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{t("bookDetail.about")}</h3>
                  <p className="leading-7 text-lg text-gray-700">{description}</p>
                </div>
              )}

              <button
                onClick={handleAddToReadingList}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium bg-gray-900 hover:bg-gray-800"
              >
                <span className="text-xl">+</span>
                <span>{t("bookDetail.addToReadingList")}</span>
              </button>

              {status && (
                <div className="mt-4">
                  <p
                    className={`text-sm font-medium ${
                      status.type === "success" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {status.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-8 border-gray-200">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">{t("bookDetail.reviews")}</h2>
            
            <div className="mb-8">
              {!isGuest && bookDetails && (bookDetails.id || bookDetails._id) && (
                <ReviewForm
                  initialValues={
                    editingReview
                      ? {
                          bookId: bookDetails.id || bookDetails._id,
                          rating: editingReview.rating,
                          text: editingReview.text,
                        }
                      : {
                          bookId: bookDetails.id || bookDetails._id,
                          rating: 5,
                          text: "",
                        }
                  }
                  onSubmit={handleReviewSubmit}
                  onCancel={() => setEditingReview(null)}
                  bookOptions={[bookDetails].filter(Boolean)}
                />
              )}
              {isGuest && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 border-2 border-amber-200 dark:border-amber-200 rounded-xl">
                  <p className="text-gray-700 dark:text-gray-700 mb-3">{t("guest.reviewRestriction")}</p>
                  <button
                    onClick={() => setShowGuestModal(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    {t("guest.login")}
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-900">{t("bookDetail.userReviews")}</h3>
            {reviews.length === 0 ? (
              <div className="text-center py-12 rounded-xl bg-gray-50">
                <p className="text-lg text-gray-500">{t("bookDetail.noReviews")}</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl p-5 border hover:shadow-md transition-shadow bg-gray-50 border-gray-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {getInitials(review.username)}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900">{review.username}</span>
                          {review.rating !== undefined && (
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          )}
                        </div>
                        <p className="mb-3 leading-relaxed text-gray-700">{review.text || review.comment}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            {formatDate(review.createdAt || review.date)}
                          </p>
                          {user && review.userId && String(review.userId) === String(user.id || user._id) && (
                            <button
                              onClick={() => setEditingReview(review)}
                              className="px-3 py-1 rounded text-sm bg-gray-900 hover:bg-gray-800 text-white"
                            >
                              {t("bookDetail.edit")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shelf Selection Modal */}
      <ShelfSelectionModal
        isOpen={showShelfModal}
        onClose={() => setShowShelfModal(false)}
        book={bookDetails}
        mode="add"
        onSelect={handleShelfSelect}
      />

      {/* Guest Restriction Modal */}
      <GuestRestrictionModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onLogin={onShowLogin}
        onRegister={onShowRegister}
      />
    </div>
  );
}

export default BookDetailModal;

