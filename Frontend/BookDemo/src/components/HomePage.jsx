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
      <div className="mb-8">
        <h1 className="xl:text-4xl">Trending Books</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Discover the most popular books in the BookVerse community
        </p>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-600 dark:text-gray-400">Loading books...</div>
      )}

      {error && !loading && (
        <div className="text-center py-16 text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 rounded-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700"
            onClick={fetchTrendingBooks}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div className="text-center py-16 text-gray-600 dark:text-gray-400">
          No books available yet.
        </div>
      )}

      {!loading && !error && books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 xl:gap-8">
          {books.map((book) => (
            <BookCard
              key={book.id || book._id}
              book={book}
              onClick={() => onBookClick(book)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
