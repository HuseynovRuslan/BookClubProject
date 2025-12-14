import { useCallback, useEffect, useState } from "react";
import { getAllBooks } from "../api/books";
import { getImageUrl } from "../api/config";
import { useTranslation } from "../hooks/useTranslation";

export function AllBooksPage({ onBookClick }) {
  const t = useTranslation();
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

        const errorMsg = err.translationKey 
          ? (err.status ? t(err.translationKey).replace("{status}", err.status) : t(err.translationKey))
          : (err.message || t("error.booksLoad"));
        setError(errorMsg);
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

  const getImageUrlForBook = (book) => {
    return getImageUrl(
      book.coverImageUrl ||
      book.cover ||
      book.coverImage ||
      book.coverUrl ||
      book.image
    );
  };

  const getAuthorName = (book) => {
    if (book.author) {
      if (typeof book.author === 'string') {
        return book.author;
      } else if (book.author?.name || book.author?.Name) {
        return book.author.name || book.author.Name;
      }
    }
    return book.authorName || "Unknown author";
  };

  const getRating = (book) => {
    return book.rating || book.averageRating || book.avgRating || 0;
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 bg-white dark:bg-white min-h-screen">
      {/* Header Section - Ultra Modern Glassmorphism Design */}
      <div className="mb-14 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-red-50/80 dark:from-amber-50/80 dark:via-orange-50/80 dark:to-red-50/80 rounded-3xl -z-10 backdrop-blur-md"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-amber-50/40 rounded-3xl -z-10"></div>
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 md:py-12 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-5">
            <div className="relative">
              <div className="w-1.5 sm:w-2 h-16 sm:h-18 md:h-20 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-xl"></div>
              <div className="absolute top-0 left-0 w-1.5 sm:w-2 h-16 sm:h-18 md:h-20 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-sm opacity-60 animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-none mb-2 sm:mb-3 drop-shadow-sm">
                All Books
              </h1>
              <p className="text-gray-700 dark:text-gray-700 text-base sm:text-lg md:text-xl lg:text-2xl mt-2 sm:mt-3 font-semibold">
                Browse all books available in the BookVerse library
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-amber-600 dark:border-amber-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-700 mt-6">Loading books...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-50 dark:to-orange-50 border-2 border-red-200 dark:border-red-200 rounded-2xl shadow-lg">
          <p className="text-red-600 dark:text-red-600 font-semibold mb-4">{error}</p>
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => fetchBooks(page)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && books.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-full mb-6">
            <svg className="h-12 w-12 text-amber-500 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900 mb-3">
            No books available yet
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-600">
            Check back later for new additions
          </p>
        </div>
      )}

      {/* Books Grid */}
      {!loading && !error && books.length > 0 && (
        <>
          <div className="mb-8 flex items-center gap-4">
            <div className="relative">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full"></div>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-gray-900">
              Showing <span className="text-amber-600 dark:text-amber-600">{books.length}</span> books
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {books.map((book, index) => {
              const coverImage = getImageUrlForBook(book);
              const authorName = getAuthorName(book);
              const rating = getRating(book);
              
              return (
                <div
                  key={book.id || book._id || `book-${index}`}
                  onClick={() => onBookClick(book)}
                  className="flex-shrink-0 cursor-pointer group"
                  style={{ 
                    animationDelay: `${index * 30}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="bg-white dark:bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 dark:border-gray-200 hover:border-amber-400 dark:hover:border-amber-400 transform hover:-translate-y-2 hover:scale-[1.02]">
                    {/* Book Cover */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 overflow-hidden relative group-hover:shadow-inner">
                      {coverImage ? (
                        <>
                          <img
                            src={coverImage}
                            alt={book.title || "Book cover"}
                            className="w-full h-full object-cover group-hover:scale-[1.15] transition-transform duration-1000 ease-out"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {/* Shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out pointer-events-none"></div>
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 via-transparent to-transparent group-hover:from-amber-500/10 transition-all duration-700 pointer-events-none"></div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-400">
                          <svg
                            className="w-24 h-24 opacity-30"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="p-4 bg-white dark:bg-white relative">
                      {/* Decorative top border */}
                      <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Title */}
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-900 line-clamp-2 leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 transition-all duration-500">
                        {book.title}
                      </h3>
                      
                      {/* Author */}
                      <p className="text-xs text-gray-600 dark:text-gray-600 mb-3 line-clamp-1">
                        {authorName}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-50 dark:via-amber-50 dark:to-yellow-100 px-3 py-1.5 rounded-xl border-2 border-yellow-300 dark:border-yellow-300 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                          <span className="text-sm text-yellow-500 drop-shadow-sm">★</span>
                          <span className="text-xs font-black text-gray-900 dark:text-gray-900 ml-1.5">
                            {rating > 0 ? rating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t-2 border-gray-100 dark:border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={page === 1 || loading}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-900">Page {page}</span>
              {books.length === pageSize && (
                <span className="text-sm text-gray-600 dark:text-gray-600">
                  ({books.length} books)
                </span>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={!hasMore || loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
