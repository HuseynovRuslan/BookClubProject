import { useCallback, useEffect, useState } from "react";
import BookCard from "./BookCard";
import { getAllBooks } from "../api/books";

function HomePage({ onBookClick }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrendingBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllBooks({ page: 1, pageSize: 10 });
      const items = Array.isArray(response)
        ? response
        : response?.items || response?.data || [];
      setBooks(items);
    } catch (err) {
      setError(err.message || "Failed to load books.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingBooks();
  }, [fetchTrendingBooks]);

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      {/* Header Section with Gradient Background */}
      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-2xl -z-10"></div>
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-12 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full"></div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Trending Books
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg ml-4">
            Discover the most popular books in the BookVerse community
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20">
          <div className="inline-flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-6 h-6 border-3 border-gray-300 dark:border-gray-600 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
            <span className="text-lg">Loading books...</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16">
          <div className="inline-block p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
              onClick={fetchTrendingBooks}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-block p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No books available yet.</p>
          </div>
        </div>
      )}

      {!loading && !error && books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
          {books.map((book, index) => (
            <BookCard
              key={book.id || book._id}
              book={book}
              onClick={() => onBookClick(book)}
              priority={index < 6} // Prioritize first 6 images
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
