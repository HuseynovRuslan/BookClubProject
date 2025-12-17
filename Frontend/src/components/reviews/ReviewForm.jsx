import { useEffect, useMemo, useState } from "react";
import { getAllBooks } from "../../api/books";
import { useTranslation } from "../../hooks/useTranslation";

const RATING_OPTIONS = [5, 4, 3, 2, 1, 0];

const DEFAULT_FORM = {
  bookId: "",
  rating: 0,
  text: "",
};

export default function ReviewForm({
  initialValues = {},
  onSubmit,
  submitting = false,
  onCancel,
  bookOptions: providedBooks = null,
}) {
  const t = useTranslation();
  const [books, setBooks] = useState(providedBooks || []);
  const [formValues, setFormValues] = useState({ ...DEFAULT_FORM, ...initialValues });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (providedBooks) {
      setBooks(providedBooks);
      return () => {};
    }

    const loadBooks = async () => {
      try {
        const response = await getAllBooks({ page: 1, pageSize: 20 });
        const items = Array.isArray(response)
          ? response
          : response?.items || response?.data || [];
        if (isMounted) {
          setBooks(items);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Kitab siyahısı yüklənmədi");
        }
      }
    };
    loadBooks();
    return () => {
      isMounted = false;
    };
  }, [providedBooks]);

  useEffect(() => {
    setFormValues((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.bookId) {
      setError(t("error.selectBook"));
      return;
    }
    if (!formValues.text.trim()) {
      setError(t("post.reviewText") + " " + (t("error.default") || "cannot be empty"));
      return;
    }
    try {
      await onSubmit(formValues);
      setSuccess(t("common.success") || "Success!");
      setFormValues(DEFAULT_FORM);
    } catch (err) {
      setError(err.message || t("error.reviewCreate") || "Failed to create review");
    }
  };

  const bookSelectOptions = useMemo(
    () =>
      books.map((book) => ({
        id: book.id || book._id,
        title: book.title,
      })),
    [books]
  );

  const showBookSelect = !providedBooks || providedBooks.length === 0 || providedBooks.length > 1;

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-white rounded-xl p-6 space-y-4 border-2 border-gray-200 dark:border-gray-200 shadow-lg">
      {showBookSelect && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-900 mb-2">{t("post.selectBook")?.replace(" *", "") || "Book"}</label>
          <select
            value={formValues.bookId}
            onChange={(e) => handleChange("bookId", e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-50 text-gray-900 dark:text-gray-900 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all"
          >
            <option value="">{t("post.chooseBook") || "Choose a book..."}</option>
            {bookSelectOptions.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-900 mb-2">{t("post.rating")?.replace(" *", "") || "Rating"}</label>
        <div className="flex gap-2">
          {RATING_OPTIONS.map((rating) => (
            <button
              type="button"
              key={rating}
              onClick={() => handleChange("rating", rating)}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                formValues.rating === rating 
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md" 
                  : "bg-gray-100 dark:bg-gray-100 text-gray-700 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-200"
              }`}
            >
              {rating} ⭐
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-900 mb-2">{t("post.reviewText")?.replace(" *", "") || "Review Text"}</label>
        <textarea
          rows={4}
          value={formValues.text}
          onChange={(e) => handleChange("text", e.target.value)}
          className="w-full bg-white text-gray-900 p-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all resize-none"
          placeholder={t("post.shareThoughts") || "Share thoughts and impressions..."}
          style={{ backgroundColor: 'white', color: '#111827' }}
        />
      </div>

      {error && (
        <div className="text-sm text-red-700 dark:text-red-700 bg-red-50 dark:bg-red-50 border-2 border-red-200 dark:border-red-200 p-3 rounded-lg font-semibold">{error}</div>
      )}
      {success && (
        <div className="text-sm text-green-700 dark:text-green-700 bg-green-50 dark:bg-green-50 border-2 border-green-200 dark:border-green-200 p-3 rounded-lg font-semibold">
          {success}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-200 text-gray-900 dark:text-gray-900 font-semibold transition-all"
          >
            {t("common.cancel") || "Cancel"}
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (t("common.saving") || "Saving...") : (t("post.writeReview") || "Write Review")}
        </button>
      </div>
    </form>
  );
}




