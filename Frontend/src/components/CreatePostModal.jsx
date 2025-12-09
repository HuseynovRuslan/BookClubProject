import { useState, useEffect, useRef } from "react";
import { X, BookOpen, Quote, BookCheck, FileText, Star, Target, Edit2, Trash2 } from "lucide-react";
import { getAllBooks, getBookById } from "../api/books";
import { createReview, updateReview, deleteReview } from "../api/reviews";
import { getMyReviews } from "../api/users";
import { createQuote } from "../api/quotes";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../api/config";

const POST_TYPES = [
  { id: "review", label: "Write Review", icon: BookOpen, color: "purple" },
  { id: "quote", label: "Share Quote", icon: Quote, color: "blue" },
  { id: "status", label: "Reading Status", icon: BookCheck, color: "green" },
  { id: "post", label: "Normal Post", icon: FileText, color: "gray" },
  { id: "goal", label: "Reading Goal", icon: Target, color: "orange" },
];

const READING_STATUSES = [
  { id: "started", label: "Started Reading" },
  { id: "reading", label: "Currently Reading" },
  { id: "finished", label: "Finished Reading" },
];

export default function CreatePostModal({ onClose, onCreate }) {
  const { user } = useAuth();
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
        timestamp: "Just now",
        likes: 0,
        comments: [],
        isLocal: true,
      };

      switch (selectedType) {
        case "review":
          if (!selectedBook) {
            setError("Please select a book");
            return;
          }
          if (rating === 0) {
            setError("Please provide a rating");
            return;
          }
          if (!reviewText.trim()) {
            setError("Please write a review");
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
              setError("You have already reviewed this book. Please update your existing review instead.");
            } else {
              setError(err.message || "Failed to create review");
            }
            return;
          }
          break;

        case "quote":
          if (!selectedBook) {
            setError("Please select a book");
            return;
          }
          if (!quoteText.trim()) {
            setError("Please enter a quote");
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
              setError("Could not determine book author. Please try again.");
              return;
            }

            const tags = quoteTag.trim() ? [quoteTag.trim()] : null;
            const quote = await createQuote({
              BookId: bookId,
              AuthorId: authorId,
              Text: quoteText.trim(),
              Tags: tags,
            });

            newPost = {
              ...newPost,
              type: "quote",
              bookTitle: selectedBook.title || selectedBook.Title,
              bookCover: selectedBook.coverImageUrl || selectedBook.coverImage || selectedBook.cover,
              review: quoteText.trim(),
              quoteId: quote.id || quote.Id || quote,
            };
          } catch (err) {
            setError(err.message || "Failed to create quote");
            return;
          }
          break;

        case "status":
          if (!readingStatus) {
            setError("Please select a reading status");
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

        case "post":
          if (!postText.trim() && !postImage) {
            setError("Please add text or an image");
            return;
          }

          newPost = {
            ...newPost,
            type: "post",
            review: postText.trim(),
            postImage: postImage ? URL.createObjectURL(postImage) : null,
          };
          break;


        case "goal":
          if (!goalTarget.trim()) {
            setError("Please enter a reading goal");
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
        setError("Authentication required. Please login again.");
      } else {
        setError(err.message || "Failed to create post");
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
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }
    try {
      await deleteReview(reviewId);
      await loadUserReviews();
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete review");
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Post</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">Choose a post type:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {POST_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group"
                  >
                    <div className={`p-3 rounded-full bg-${type.color}-100 dark:bg-${type.color}-900/30 group-hover:bg-${type.color}-200 dark:group-hover:bg-${type.color}-800/50 transition-colors`}>
                      <Icon className={`w-6 h-6 text-${type.color}-600 dark:text-${type.color}-400`} />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-4 animate-slideUp max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-45" />
            </button>
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTypeInfo?.label}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Write Review */}
          {selectedType === "review" && (
            <>
              {/* User's Existing Reviews Section */}
              {userReviews.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                    Your Reviews ({userReviews.length})
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
                              title="Edit review"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Delete review"
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
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Select Book *
                </label>
                {loadingBooks ? (
                  <div className="p-2 text-center text-gray-500 text-sm">Loading books...</div>
                ) : (
                  <select
                    value={selectedBook?.id || ""}
                    onChange={(e) => {
                      const book = books.find((b) => (b.id || b.Id) === e.target.value);
                      setSelectedBook(book);
                      // Check if user already reviewed this book
                      const existingReview = userReviews.find(
                        (r) => (r.bookId || r.book?.id) === (book?.id || book?.Id)
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
                    }}
                    className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Choose a book...</option>
                    {books.map((book) => {
                      const hasReview = userReviews.some(
                        (r) => (r.bookId || r.book?.id) === (book.id || book.Id)
                      );
                      return (
                        <option key={book.id || book.Id} value={book.id || book.Id}>
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
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Rating *
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleStarClick(value)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        value <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && <p className="text-xs text-gray-500 mt-0.5">{rating} out of 5 stars</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Review * {editingReview && <span className="text-xs text-blue-600 dark:text-blue-400">(Editing)</span>}
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
                  placeholder="Share your thoughts about this book..."
                  required
                />
              </div>
            </>
          )}

          {/* Share Quote */}
          {selectedType === "quote" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Book *
                </label>
                {loadingBooks ? (
                  <div className="p-4 text-center text-gray-500">Loading books...</div>
                ) : (
                  <select
                    value={selectedBook?.id || ""}
                    onChange={(e) => {
                      const book = books.find((b) => (b.id || b.Id) === e.target.value);
                      setSelectedBook(book);
                    }}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Choose a book...</option>
                    {books.map((book) => (
                      <option key={book.id || book.Id} value={book.id || book.Id}>
                        {book.title || book.Title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quote Text *
                </label>
                <textarea
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
                  placeholder="Enter the quote..."
                  required
            />
          </div>

          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag (Optional)
                </label>
            <input
              type="text"
                  value={quoteTag}
                  onChange={(e) => setQuoteTag(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reading Status *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {READING_STATUSES.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setReadingStatus(status.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        readingStatus === status.id
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Book (Optional)
                </label>
                {loadingBooks ? (
                  <div className="p-4 text-center text-gray-500">Loading books...</div>
                ) : (
                  <select
                    value={selectedBook?.id || ""}
                    onChange={(e) => {
                      const book = books.find((b) => (b.id || b.Id) === e.target.value);
                      setSelectedBook(book || null);
                    }}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <option value="">No book selected</option>
                    {books.map((book) => (
                      <option key={book.id || book.Id} value={book.id || book.Id}>
                        {book.title || book.Title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </>
          )}

          {/* Normal Post */}
          {selectedType === "post" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post Text
                </label>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  rows={5}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
                  placeholder="What's on your mind?"
            />
          </div>

          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPostImage(e.target.files?.[0] || null)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                {postImage && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(postImage)}
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded-lg"
                    />
                  </div>
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
                    Your Reviews ({userReviews.length})
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
                              title="Edit review"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Delete review"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Book *
                </label>
                {loadingBooks ? (
                  <div className="p-4 text-center text-gray-500">Loading books...</div>
                ) : (
                  <select
                    value={selectedBook?.id || ""}
                    onChange={(e) => {
                      const book = books.find((b) => (b.id || b.Id) === e.target.value);
                      setSelectedBook(book);
                      // Check if user already reviewed this book
                      const existingReview = userReviews.find(
                        (r) => (r.bookId || r.book?.id) === (book?.id || book?.Id)
                      );
                      if (existingReview) {
                        setRating(existingReview.rating || 0);
                        setQuickComment(existingReview.text || "");
                      } else {
                        setRating(0);
                        setQuickComment("");
                      }
                    }}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Choose a book...</option>
                    {books.map((book) => {
                      const hasReview = userReviews.some(
                        (r) => (r.bookId || r.book?.id) === (book.id || book.Id)
                      );
                      return (
                        <option key={book.id || book.Id} value={book.id || book.Id}>
                          {book.title || book.Title} {hasReview ? "✓ (Reviewed)" : ""}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleStarClick(value)}
                      className={`text-3xl transition-transform hover:scale-110 ${
                        value <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Comment
                </label>
                <input
                  type="text"
                  value={quickComment}
                  onChange={(e) => setQuickComment(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Target *
                </label>
                <input
                  type="text"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="e.g., Read 10 books this month"
                  required
            />
          </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
