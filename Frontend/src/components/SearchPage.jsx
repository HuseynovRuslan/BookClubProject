import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";
import { getAllBooks } from "../api/books";
import { getImageUrl } from "../api/config";

export default function SearchPage({ onBookClick }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(
    async (query) => {
      if (!query || !query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response = await getAllBooks({ page: 1, pageSize: 50, query: query.trim() });
        const items = response?.items || response?.Items || response || [];
        setResults(items);
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message || "Failed to search books");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search effect
  useEffect(() => {
    const query = searchQuery.trim();
    if (query) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300); 

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch, setSearchParams]);

  useEffect(() => {
    const queryFromUrl = searchParams.get("q");
    if (queryFromUrl && queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
      performSearch(queryFromUrl);
    }
  }, []);

  const handleBookClick = (book) => {
    if (onBookClick) {
      onBookClick(book);
    } else {
      navigate(`/books/${book.id || book.Id}`);
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
    <div className="min-h-screen bg-white dark:bg-white">
      <div className="max-w-7xl mx-auto px-6 xl:px-8 py-8">
        {/* Modern Header Section */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 rounded-3xl p-8 md:p-12 border-2 border-amber-100 dark:border-amber-100 shadow-xl">
            <div className="flex items-center gap-5 mb-8">
              <div className="relative">
                <div className="w-2 h-12 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-lg"></div>
                <div className="absolute top-0 left-0 w-2 h-12 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-md opacity-50"></div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-gray-900 tracking-tight leading-none">
                Search Books
              </h1>
            </div>

            {/* Modern Search Input */}
            <div className="relative max-w-3xl">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                <Search className="h-6 w-6 text-amber-500 dark:text-amber-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or genre..."
                className="w-full pl-14 pr-5 py-4 text-lg border-3 border-amber-200 dark:border-amber-200 rounded-2xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-lg backdrop-blur-sm"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-amber-600 dark:border-amber-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-50 dark:to-orange-50 border-2 border-red-200 dark:border-red-200 rounded-2xl shadow-lg">
            <p className="text-red-600 dark:text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && hasSearched && (
          <>
            {results.length > 0 ? (
              <>
                <div className="mb-8 flex items-center gap-4">
                  <div className="relative">
                    <div className="w-1 h-8 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full"></div>
                  </div>
                  <p className="text-xl font-black text-gray-900 dark:text-gray-900">
                    Found <span className="text-amber-600 dark:text-amber-600">{results.length}</span>{" "}
                    {results.length === 1 ? "book" : "books"}
                  </p>
                </div>
                
                {/* Modern Grid Layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {results.map((book, index) => {
                    const coverImage = getImageUrlForBook(book);
                    const authorName = getAuthorName(book);
                    const rating = getRating(book);
                    const genre = book.genre?.name || book.genre || (Array.isArray(book.genres) && book.genres[0]?.name) || null;
                    
                    return (
                      <div
                        key={book.id || book.Id || index}
                        onClick={() => handleBookClick(book)}
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
              </>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 rounded-full mb-6">
                  <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-400" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900 mb-3">
                  No books found
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-600">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty State - No search yet */}
        {!loading && !error && !hasSearched && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-full mb-6">
              <Search className="h-12 w-12 text-amber-500 dark:text-amber-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900 mb-3">
              Start searching
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-600">
              Search for books by title, author, or genre
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
