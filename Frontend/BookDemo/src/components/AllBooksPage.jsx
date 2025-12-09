import { useCallback, useEffect, useState } from "react";
import BookCard from "./BookCard";
import { getAllBooks } from "../api/books";

export function AllBooksPage({ onBookClick }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [hasMore, setHasMore] = useState(false);

  const fetchBooks = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllBooks({
          page: pageToLoad,
          pageSize,
        });
        
        let items = [];
        let totalCount = 0;
        
        if (Array.isArray(response)) {
          items = response;
          totalCount = response.length;
        } else if (response?.Data) {
          const data = response.Data;
          items = data?.items || data?.Items || [];
          totalCount = data?.totalCount || data?.TotalCount || 0;
        } else {
          items = response?.items || response?.Items || [];
          totalCount = response?.totalCount || response?.TotalCount || response?.total || 0;
        }

        const booksToShow = items.slice(0, pageSize);
        setBooks(booksToShow);


        const currentPageEnd = pageToLoad * pageSize;
        setHasMore(totalCount > currentPageEnd);
      } catch (err) {
        setError(err.message || "Failed to load books.");
        setBooks([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchBooks(page);
  }, [fetchBooks, page]);

  const handlePrevious = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-gray-900 dark:text-white text-3xl xl:text-4xl">All Books</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Browse all books available in the BookVerse library
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
            onClick={() => fetchBooks(page)}
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {books.map((book, index) => (
              <BookCard
                key={book.id || book._id || `book-${index}`}
                book={book}
                onClick={() => onBookClick(book)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={page === 1 || loading}
              className="px-6 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Page {page}</span>
              {books.length === pageSize && (
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  ({books.length} books)
                </span>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={!hasMore || loading}
              className="px-6 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
export default AllBooksPage;
