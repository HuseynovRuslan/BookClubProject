import { useEffect, useMemo, useState } from "react";
import { getAllBooks } from "../../api/books";

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
      setError("Zəhmət olmasa kitab seçin");
      return;
    }
    if (!formValues.text.trim()) {
      setError("Review mətni boş ola bilməz");
      return;
    }
    try {
      await onSubmit(formValues);
      setSuccess("Review qeyd olundu!");
      setFormValues(DEFAULT_FORM);
    } catch (err) {
      setError(err.message || "Review göndərmək alınmadı");
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

  // Hide book selection if bookOptions is provided (we're on a specific book page)
  const showBookSelect = !providedBooks || providedBooks.length === 0 || providedBooks.length > 1;

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 dark:bg-gray-800 rounded-lg p-4 space-y-4">
      {showBookSelect && (
        <div>
          <label className="block text-sm text-gray-300 mb-1">Kitab</label>
          <select
            value={formValues.bookId}
            onChange={(e) => handleChange("bookId", e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded"
          >
            <option value="">Kitab seç</option>
            {bookSelectOptions.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-300 mb-1">Reytinq</label>
        <div className="flex gap-2">
          {RATING_OPTIONS.map((rating) => (
            <button
              type="button"
              key={rating}
              onClick={() => handleChange("rating", rating)}
              className={`flex-1 py-2 rounded ${
                formValues.rating === rating ? "bg-purple-600" : "bg-gray-700"
              }`}
            >
              {rating} ⭐
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Review mətni</label>
        <textarea
          rows={4}
          value={formValues.text}
          onChange={(e) => handleChange("text", e.target.value)}
          className="w-full bg-gray-700 text-white p-2 rounded resize-none"
          placeholder="Fikir və təəssüratlarını paylaş..."
        />
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-900/30 p-2 rounded">{error}</div>
      )}
      {success && (
        <div className="text-sm text-green-400 bg-green-900/20 p-2 rounded">
          {success}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            Ləğv et
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          {submitting ? "Göndərilir..." : "Review yaz"}
        </button>
      </div>
    </form>
  );
}




