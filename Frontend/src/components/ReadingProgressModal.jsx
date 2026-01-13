import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateReadingProgress, getReadingProgresses } from "../api/readingProgress";
import { X, BookOpen, TrendingUp, CheckCircle2, Target } from "lucide-react";

export default function ReadingProgressModal({ book, isOpen, onClose, onProgressUpdate }) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("");
  const [totalPages, setTotalPages] = useState(book?.pageCount || 0);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isOpen && book) {
      setTotalPages(book.pageCount || book.PageCount || 0);
      loadProgress();
    }
  }, [isOpen, book]);

  const loadProgress = async () => {
    if (!user?.id || !book?.id) return;
    
    setLoading(true);
    try {
      const data = await getReadingProgresses(1, 50);
      const bookId = book.id || book.Id;
      const bookProgress = data?.items?.find(
        (p) => (p.bookId || p.BookId) === bookId
      );
      if (bookProgress) {
        setProgress(bookProgress);
        const page = bookProgress.currentPage || bookProgress.CurrentPage || 0;
        setCurrentPage(page.toString());
      } else {
        setCurrentPage("");
        setProgress(null);
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
      setCurrentPage("");
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const page = parseInt(currentPage);
    if (isNaN(page) || page < 0 || (totalPages > 0 && page > totalPages)) {
      setError(`Please enter a valid page number${totalPages > 0 ? ` (0-${totalPages})` : ""}`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const bookId = book.id || book.Id;
      if (!bookId) {
        setError("Book ID is missing");
        setSaving(false);
        return;
      }
      
      const response = await updateReadingProgress(bookId, page);
      console.log("Reading progress updated successfully:", response);
      
      // Reload progress to show updated value
      await loadProgress();
      
      // Show success message
      setSuccessMessage(`Progress saved! You're on page ${page}${totalPages > 0 ? ` of ${totalPages}` : ""}.`);
      setError(null);
      
      if (onProgressUpdate) {
        onProgressUpdate(page, totalPages);
      }
      
      // Auto-close if book is completed
      if (totalPages > 0 && page >= totalPages) {
        setSuccessMessage("Congratulations! You've finished this book!");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err) {
      console.error("Error updating reading progress:", err);
      const errorMsg = err.message || err.detail || err.data?.title || "Failed to update progress. Please try again.";
      setError(errorMsg);
      setSuccessMessage(null);
    } finally {
      setSaving(false);
    }
  };

  const progressPercentage = totalPages > 0 && currentPage
    ? Math.min((parseInt(currentPage) / totalPages) * 100, 100)
    : 0;

  const isCompleted = totalPages > 0 && currentPage && parseInt(currentPage) >= totalPages;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-white rounded-3xl max-w-md w-full border-2 border-gray-200 dark:border-gray-200 shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b-2 border-gray-200 dark:border-gray-200 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50">
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent rounded-t-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-white/80 shadow-md border-2 border-amber-200 dark:border-amber-200">
                <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-gray-900">
                  Reading Progress
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-600 font-semibold">
                  {book?.title || book?.Title || "Book"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/80 dark:hover:bg-white/80 transition-all"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-amber-200 dark:border-amber-200 rounded-full"></div>
                <div className="w-6 h-6 border-3 border-amber-600 dark:border-amber-600 border-t-transparent rounded-full animate-spin absolute"></div>
                <span className="text-gray-700 dark:text-gray-700 font-semibold">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              {totalPages > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-gray-900 dark:text-gray-900">
                      {currentPage || 0}
                    </span>
                    <span className="text-lg font-bold text-gray-600 dark:text-gray-600">
                      / {totalPages} pages
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-100 dark:bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-full transition-all duration-500 ease-out shadow-lg"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-600">
                      {progressPercentage.toFixed(1)}% Complete
                    </span>
                    {isCompleted && (
                      <span className="text-sm font-bold text-green-600 dark:text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Input */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-2">
                  Current Page
                </label>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    setCurrentPage(e.target.value);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  min="0"
                  max={totalPages || undefined}
                  className="w-full p-4 rounded-xl bg-white dark:bg-white border-2 border-amber-200 dark:border-amber-200 text-gray-900 dark:text-gray-900 font-bold text-center text-2xl focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 transition-all"
                  placeholder="0"
                />
                {totalPages > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
                    Enter a number between 0 and {totalPages}
                  </p>
                )}
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="p-4 bg-green-50 dark:bg-green-50 border-2 border-green-200 dark:border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-600" />
                    <p className="text-sm text-green-600 dark:text-green-600 font-semibold">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-50 border-2 border-red-200 dark:border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-600 font-semibold">{error}</p>
                </div>
              )}

              {/* Completion Message */}
              {isCompleted && !successMessage && (
                <div className="p-4 bg-green-50 dark:bg-green-50 border-2 border-green-200 dark:border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-600" />
                    <p className="text-sm text-green-600 dark:text-green-600 font-semibold">
                      Congratulations! You've finished this book!
                    </p>
                  </div>
                </div>
              )}

              {/* Stats */}
              {progress && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 border-2 border-amber-200 dark:border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-600" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-700">
                        Last Updated
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-900">
                      {progress.updatedAt
                        ? new Date(progress.updatedAt).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-50 dark:to-cyan-50 border-2 border-blue-200 dark:border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-600" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-700">
                        Progress
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-900">
                      {progressPercentage.toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !currentPage}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Save Progress
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-white dark:bg-white border-2 border-gray-300 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-400 text-gray-700 dark:text-gray-700 font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
