import { useState, useEffect, useRef } from "react";
import { X, BookOpen, Quote, BookCheck, FileText, Star, Target, Edit2, Trash2 } from "lucide-react";
import { getAllBooks, getBookById } from "../api/books";
import { createReview, updateReview, deleteReview } from "../api/reviews";
import { getMyReviews } from "../api/users";
import { createQuote } from "../api/quotes";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../api/config";
import { useTranslation } from "../hooks/useTranslation";

export default function CreatePostModal({ onClose, onCreate }) {
  const { user } = useAuth();
  const t = useTranslation();
  
  const POST_TYPES = [
    { id: "review", label: t("post.writeReview"), icon: BookOpen, color: "purple" },
    { id: "quote", label: t("post.shareQuote"), icon: Quote, color: "blue" },
    { id: "status", label: t("post.readingStatus"), icon: BookCheck, color: "green" },
    { id: "goal", label: t("post.readingGoal"), icon: Target, color: "orange" },
  ];

  const READING_STATUSES = [
    { id: "started", label: t("post.startedReading") },
    { id: "reading", label: t("post.currentlyReading") },
    { id: "finished", label: t("post.finishedReading") },
  ];
  const [selectedType, setSelectedType] = useState(null);
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Form states
  const [selectedBook, setSelectedBook] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [quoteTag, setQuoteTag] = useState("");
  const [readingStatus, setReadingStatus] = useState("");
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (selectedType && (selectedType === "review" || selectedType === "quote" || selectedType === "status")) {
      loadBooks();
    }
    if (selectedType === "review") {
      loadUserReviews();
    }
  }, [selectedType]);

  const loadUserReviews = async () => {
    setLoadingReviews(true);
    try {
      const reviews = await getMyReviews();
      setUserReviews(reviews || []);
    } catch (err) {
      console.error("Error loading user reviews:", err);
      setUserReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadBooks = async () => {
    setLoadingBooks(true);
    try {
      const response = await getAllBooks({ page: 1, pageSize: 50 });
      const items = response?.items || response?.Items || response || [];
      setBooks(items);
    } catch (err) {
      console.error("Error loading books:", err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let newPost = {
        id: `post-${Date.now()}`,
        type: selectedType,
        username: user?.name || user?.firstName || "You",
        userAvatar: user?.avatarUrl || user?.AvatarUrl || user?.profilePictureUrl || user?.ProfilePictureUrl || null,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: [],
        isLocal: true,
      };

      switch (selectedType) {
        case "review":
          if (!selectedBook) {
            setError(t("post.selectBookFirst"));
            setSubmitting(false);
            return;
          }
          if (rating === 0) {
            setError(t("post.fillRequired"));
            setSubmitting(false);
            return;
          }
          if (!reviewText.trim()) {
            setError(t("post.fillRequired"));
            setSubmitting(false);
            return;
          }

          try {
            // Check if editing existing review
            if (editingReview) {
              const updated = await updateReview(editingReview.id, {
                rating: rating,
                text: reviewText.trim(),
              });

              newPost = {
                ...newPost,
                type: "review",
                bookTitle: selectedBook.title || selectedBook.Title,
                bookCover: selectedBook.coverImageUrl || selectedBook.coverImage || selectedBook.cover,
                review: reviewText.trim(),
                rating: rating,
                reviewId: editingReview.id,
              };
            } else {
              const review = await createReview({
                bookId: selectedBook.id || selectedBook.Id,
                rating: rating,
                text: reviewText.trim(),
              });

              newPost = {
                ...newPost,
                type: "review",
                bookTitle: selectedBook.title || selectedBook.Title,
                bookCover: selectedBook.coverImageUrl || selectedBook.coverImage || selectedBook.cover,
                review: reviewText.trim(),
                rating: rating,
                reviewId: review.id || review.Id || review,
              };
            }
          } catch (err) {
            if (err.isConflict || err.status === 409) {
              setError(t("error.reviewExists"));
            } else {
              // Error mesajı artıq config.js-də kullanıcı dostu formata çevrilir
              const errorMsg = err.translationKey 
                ? (err.status ? t(err.translationKey).replace("{status}", err.status) : t(err.translationKey))
                : (err.message || t("error.reviewCreate"));
              setError(errorMsg);
            }
            setSubmitting(false);
            return;
          }
          break;

        case "quote":
          if (!selectedBook) {
            setError("Please select a book");
            setSubmitting(false);
            return;
          }
          if (!quoteText.trim()) {
            setError("Please enter a quote");
            setSubmitting(false);
            return;
          }

          try {
            // Get full book details to get AuthorId
            const bookId = selectedBook.id || selectedBook.Id;
            let authorId = selectedBook.authorId || selectedBook.AuthorId || selectedBook.author?.id || selectedBook.Author?.Id;
            
            // If authorId is not in the book object, fetch full book details
            if (!authorId) {
              try {
                const fullBook = await getBookById(bookId);
                const bookData = fullBook?.Data || fullBook;
                authorId = bookData?.authorId || bookData?.AuthorId || bookData?.author?.id || bookData?.Author?.Id;
              } catch (fetchErr) {
                console.warn("Could not fetch book details for authorId:", fetchErr);
              }
            }

            if (!authorId) {
              setError(t("error.authorNotFound"));
              setSubmitting(false);
              return;
            }

            const tags = quoteTag.trim() ? [quoteTag.trim()] : null;
            const quote = await createQuote({
              BookId: bookId,
              AuthorId: authorId,
              Text: quoteText.trim(),
              Tags: tags,
            });

            // Extract quoteId properly - ensure it's a string
            let quoteIdValue = null;
            if (quote) {
              if (typeof quote === 'string') {
                quoteIdValue = quote;
              } else if (quote.id) {
                quoteIdValue = String(quote.id);
              } else if (quote.Id) {
                quoteIdValue = String(quote.Id);
              } else if (quote.data?.id) {
                quoteIdValue = String(quote.data.id);
              } else if (quote.data?.Id) {
                quoteIdValue = String(quote.data.Id);
              } else if (quote.Data?.id) {
                quoteIdValue = String(quote.Data.id);
              } else if (quote.Data?.Id) {
                quoteIdValue = String(quote.Data.Id);
              }
            }

            // Use quoteId as the post id so it matches backend and persists
            newPost = {
              ...newPost,
              id: quoteIdValue || `local-${Date.now()}`, // Use backend quoteId as post id
              type: "quote",
              bookTitle: selectedBook.title || selectedBook.Title,
              bookCover: selectedBook.coverImageUrl || selectedBook.coverImage || selectedBook.cover,
              review: quoteText.trim(),
              quoteId: quoteIdValue,
            };
          } catch (err) {
            // Error mesajı artıq config.js-də kullanıcı dostu formata çevrilir
            const errorMsg = err.translationKey 
              ? (err.status ? t(err.translationKey).replace("{status}", err.status) : t(err.translationKey))
              : (err.message || t("error.quoteCreate"));
            setError(errorMsg);
            setSubmitting(false);
            return;
          }
          break;

        case "status":
          if (!readingStatus) {
            setError("Please select a reading status");
            setSubmitting(false);
            return;
          }

          const statusLabel = READING_STATUSES.find((s) => s.id === readingStatus)?.label || readingStatus;
          newPost = {
            ...newPost,
            type: "post",
            review: selectedBook
              ? `${statusLabel}: ${selectedBook.title || selectedBook.Title}`
              : statusLabel,
            bookTitle: selectedBook?.title || selectedBook?.Title || "",
            bookCover: selectedBook?.coverImageUrl || selectedBook?.coverImage || selectedBook?.cover || "",
            readingStatus: readingStatus,
          };
          break;


        case "goal":
          if (!goalTarget.trim()) {
            setError(t("post.enterGoal"));
            setSubmitting(false);
            return;
          }

          newPost = {
            ...newPost,
            type: "post",
            review: `📚 Reading Goal: ${goalTarget.trim()}${goalDeadline ? ` (Deadline: ${new Date(goalDeadline).toLocaleDateString()})` : ""}`,
            goalTarget: goalTarget.trim(),
            goalDeadline: goalDeadline || null,
          };
          break;
      }

    onCreate(newPost);
    // Reload user reviews after creating/updating
    if (selectedType === "review") {
      await loadUserReviews();
    }
    onClose();
    } catch (err) {
      if (err.status === 401) {
        setError(t("error.authRequired"));
      } else {
        // Error mesajı artıq config.js-də kullanıcı dostu formata çevrilir
        const errorMsg = err.translationKey 
          ? (err.status ? t(err.translationKey).replace("{status}", err.status) : t(err.translationKey))
          : (err.message || t("error.postCreate"));
        setError(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setSelectedBook(null);
    setRating(0);
    setReviewText("");
    setQuoteText("");
    setQuoteTag("");
    setReadingStatus("");
    setPostText("");
    setPostImage(null);
    setGoalTarget("");
    setGoalDeadline("");
    setError("");
    setEditingReview(null);
  };

  const handleEditReview = (review) => {
    const book = books.find((b) => (b.id || b.Id) === (review.bookId || review.book?.id));
    if (book) {
      setSelectedBook(book);
      setRating(review.rating || 0);
      setReviewText(review.text || "");
      setEditingReview(review);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm(t("post.deleteConfirm"))) {
      return;
    }
    try {
      await deleteReview(reviewId);
      await loadUserReviews();
      setError("");
    } catch (err) {
      // Error mesajı artıq config.js-də kullanıcı dostu formata çevrilir
      const errorMsg = err.translationKey 
        ? (err.status ? t(err.translationKey).replace("{status}", err.status) : t(err.translationKey))
        : (err.message || t("error.reviewDelete"));
      setError(errorMsg);
    }
  };

  const handleBack = () => {
    resetForm();
  };

  if (!selectedType) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
        <div
          ref={modalRef}
          className="bg-white dark:bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 animate-slideUp border-2 border-gray-100 dark:border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modern Header */}
          <div className="relative p-8 border-b-2 border-gray-100 dark:border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 rounded-t-3xl"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-2 h-12 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-lg"></div>
                  <div className="absolute top-0 left-0 w-2 h-12 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-md opacity-50"></div>
                </div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-gray-900 tracking-tight">{t("post.createPost")}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-2xl transition-all hover:scale-110"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-8">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-700 mb-8">{t("post.chooseType")}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {POST_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-200 hover:border-amber-400 dark:hover:border-amber-400 bg-white dark:bg-white hover:bg-gradient-to-br hover:from-amber-50 hover:via-orange-50 hover:to-red-50 dark:hover:from-amber-50 dark:hover:via-orange-50 dark:hover:to-red-50 transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className={`p-4 rounded-2xl bg-gradient-to-br from-${type.color}-100 to-${type.color}-200 dark:from-${type.color}-100 dark:to-${type.color}-200 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon className={`w-8 h-8 text-${type.color}-600 dark:text-${type.color}-600`} />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-900 text-center">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedTypeInfo = POST_TYPES.find((t) => t.id === selectedType);
  const Icon = selectedTypeInfo?.icon || FileText;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn overflow-y-auto py-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 my-4 animate-slideUp max-h-[90vh] flex flex-col border-2 border-gray-100 dark:border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Header */}
        <div className="relative p-6 border-b-2 border-gray-100 dark:border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 rounded-t-3xl"></div>
          <div className="relative flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-2xl transition-all hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-600 rotate-45" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100">
                <Icon className="w-6 h-6 text-amber-600 dark:text-amber-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-900">{selectedTypeInfo?.label}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-2xl transition-all hover:scale-110"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Write Review */}
          {selectedType === "review" && (
            <>
              {/* User's Existing Reviews Section */}
              {userReviews.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                    {t("post.yourReviews")} ({userReviews.length})
                  </h3>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {userReviews.map((review) => {
                      const reviewBook = books.find((b) => (b.id || b.Id) === (review.bookId || review.book?.id));
                      return (
                        <div
                          key={review.id}
                          className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          {reviewBook && (
                            <img
                              src={getImageUrl(reviewBook.coverImageUrl || reviewBook.coverImage || reviewBook.cover)}
                              alt={reviewBook.title || reviewBook.Title}
                              className="w-10 h-14 object-cover rounded flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {reviewBook?.title || reviewBook?.Title || "Unknown Book"}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-yellow-400 text-xs">{"★".repeat(review.rating || 0)}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {review.text?.substring(0, 25)}...
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditReview(review)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                              title={t("post.editReview")}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title={t("post.deleteReview")}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  {t("post.selectBook")}
                </label>
                {loadingBooks ? (
                  <div className="p-2 text-center text-gray-500 text-sm">{t("post.loadingBooks")}</div>
                ) : (
                  <select
                    value={selectedBook ? String(selectedBook.id || selectedBook.Id || "") : ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (!selectedValue) {
                        setSelectedBook(null);
                        setEditingReview(null);
                        setRating(0);
                        setReviewText("");
                        return;
                      }
                      const book = books.find((b) => String(b.id || b.Id) === selectedValue);
                      if (book) {
                        setSelectedBook(book);
                        // Check if user already reviewed this book
                        const existingReview = userReviews.find(
                          (r) => String(r.bookId || r.book?.id) === String(book.id || book.Id)
                        );
                        if (existingReview) {
                          setEditingReview(existingReview);
                          setRating(existingReview.rating || 0);
                          setReviewText(existingReview.text || "");
                        } else {
                          setEditingReview(null);
                          setRating(0);
                          setReviewText("");
                        }
                      }
                    }}
                    className="w-full p-4 text-base rounded-xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-sm"
                    required
                  >
                    <option value="">{t("post.chooseBook")}</option>
                    {books.map((book) => {
                      const bookId = String(book.id || book.Id || "");
                      const hasReview = userReviews.some(
                        (r) => String(r.bookId || r.book?.id) === bookId
                      );
                      return (
                        <option key={bookId} value={bookId}>
                          {book.title || book.Title} {hasReview ? "✓" : ""}
                        </option>
                      );
                    })}
                  </select>
                )}
                {selectedBook && editingReview && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Editing existing review
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  Rating *
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleStarClick(value)}
                      className={`text-3xl transition-all hover:scale-125 ${
                        value <= rating ? "text-yellow-500 drop-shadow-lg" : "text-gray-300 dark:text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && <p className="text-xs text-gray-500 mt-0.5">{rating} out of 5 stars</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  {t("post.reviewText")} {editingReview && <span className="text-xs text-blue-600 dark:text-blue-400">({t("common.edit")})</span>}
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
                  placeholder={t("post.reviewText")}
                  required
                />
              </div>
            </>
          )}

          {/* Share Quote */}
          {selectedType === "quote" && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  {t("post.selectBook")}
                </label>
                {loadingBooks ? (
                  <div className="p-4 text-center text-gray-500">{t("post.loadingBooks")}</div>
                ) : (
                  <select
                    value={selectedBook ? String(selectedBook.id || selectedBook.Id || "") : ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (!selectedValue) {
                        setSelectedBook(null);
                        return;
                      }
                      const book = books.find((b) => String(b.id || b.Id) === selectedValue);
                      setSelectedBook(book || null);
                    }}
                    className="w-full p-4 rounded-xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-sm"
                    required
                  >
                    <option value="">{t("post.chooseBook")}</option>
                    {books.map((book) => {
                      const bookId = String(book.id || book.Id || "");
                      return (
                        <option key={bookId} value={bookId}>
                          {book.title || book.Title}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

          <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  {t("post.quoteText")}
                </label>
                <textarea
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  rows={4}
                  className="w-full p-4 rounded-xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-900 dark:text-gray-900 resize-none focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-sm"
                  placeholder="Enter the quote..."
                  required
            />
          </div>

          <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  {t("post.quoteTag")}
                </label>
            <input
              type="text"
                  value={quoteTag}
                  onChange={(e) => setQuoteTag(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-sm"
                  placeholder="e.g., inspiration, motivation"
                />
                <p className="text-xs text-gray-500 mt-1">Add a tag to categorize this quote</p>
              </div>
            </>
          )}

          {/* Reading Status */}
          {selectedType === "status" && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  {t("post.status")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {READING_STATUSES.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setReadingStatus(status.id)}
                      className={`p-5 rounded-xl border-2 transition-all font-semibold ${
                        readingStatus === status.id
                          ? "border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 text-amber-700 dark:text-amber-700 shadow-lg scale-105"
                          : "border-gray-200 dark:border-gray-200 bg-white dark:bg-white text-gray-700 dark:text-gray-700 hover:border-amber-300 dark:hover:border-amber-300 hover:bg-gray-50 dark:hover:bg-gray-50 shadow-sm hover:shadow-md"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  Book (Optional)
                </label>
                {loadingBooks ? (
                  <div className="p-4 text-center text-gray-500">Loading books...</div>
                ) : (
                  <select
                    value={selectedBook ? String(selectedBook.id || selectedBook.Id || "") : ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (!selectedValue) {
                        setSelectedBook(null);
                        return;
                      }
                      const book = books.find((b) => String(b.id || b.Id) === selectedValue);
                      setSelectedBook(book || null);
                    }}
                    className="w-full p-4 rounded-xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-sm"
                  >
                    <option value="">No book selected</option>
                    {books.map((book) => {
                      const bookId = String(book.id || book.Id || "");
                      return (
                        <option key={bookId} value={bookId}>
                          {book.title || book.Title}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </>
          )}

          {/* Quick Review */}
          {selectedType === "quick-review" && (
            <>
              {/* User's Existing Reviews Section */}
              {userReviews.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {t("post.yourReviews")} ({userReviews.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userReviews.map((review) => {
                      const reviewBook = books.find((b) => (b.id || b.Id) === (review.bookId || review.book?.id));
                      return (
                        <div
                          key={review.id}
                          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          {reviewBook && (
                            <img
                              src={getImageUrl(reviewBook.coverImageUrl || reviewBook.coverImage || reviewBook.cover)}
                              alt={reviewBook.title || reviewBook.Title}
                              className="w-12 h-16 object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {reviewBook?.title || reviewBook?.Title || "Unknown Book"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-yellow-400 text-xs">{"★".repeat(review.rating || 0)}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {review.text?.substring(0, 30)}...
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditReview(review)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                              title={t("post.editReview")}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title={t("post.deleteReview")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  {t("post.selectBook")}
                </label>
                {loadingBooks ? (
                  <div className="p-4 text-center text-gray-500">{t("post.loadingBooks")}</div>
                ) : (
                  <select
                    value={selectedBook ? String(selectedBook.id || selectedBook.Id || "") : ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (!selectedValue) {
                        setSelectedBook(null);
                        setRating(0);
                        setQuickComment("");
                        return;
                      }
                      const book = books.find((b) => String(b.id || b.Id) === selectedValue);
                      if (book) {
                        setSelectedBook(book);
                        // Check if user already reviewed this book
                        const existingReview = userReviews.find(
                          (r) => String(r.bookId || r.book?.id) === String(book.id || book.Id)
                        );
                        if (existingReview) {
                          setRating(existingReview.rating || 0);
                          setQuickComment(existingReview.text || "");
                        } else {
                          setRating(0);
                          setQuickComment("");
                        }
                      }
                    }}
                    className="w-full p-4 rounded-xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-sm"
                    required
                  >
                    <option value="">{t("post.chooseBook")}</option>
                    {books.map((book) => {
                      const bookId = String(book.id || book.Id || "");
                      const hasReview = userReviews.some(
                        (r) => String(r.bookId || r.book?.id) === bookId
                      );
                      return (
                        <option key={bookId} value={bookId}>
                          {book.title || book.Title} {hasReview ? "✓ (Reviewed)" : ""}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleStarClick(value)}
                      className={`text-3xl transition-all hover:scale-125 ${
                        value <= rating ? "text-yellow-500 drop-shadow-lg" : "text-gray-300 dark:text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  Quick Comment
                </label>
                <input
                  type="text"
                  value={quickComment}
                  onChange={(e) => setQuickComment(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-sm"
                  placeholder="Short comment (optional)"
                  maxLength={100}
                />
              </div>
            </>
          )}

          {/* Reading Goal */}
          {selectedType === "goal" && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  {t("post.goalTarget")}
                </label>
                <input
                  type="text"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-sm"
                  placeholder="e.g., Read 10 books this month"
                  required
            />
          </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  {t("post.goalDeadline")}
                </label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-sm"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-50 dark:to-orange-50 border-2 border-red-200 dark:border-red-200 rounded-xl shadow-lg">
              <p className="text-sm font-semibold text-red-600 dark:text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-100 dark:border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-base rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow-md"
              disabled={submitting}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-base rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={submitting}
            >
              {submitting ? t("common.loading") : t("post.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
