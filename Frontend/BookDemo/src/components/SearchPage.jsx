import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";
import { getAllBooks } from "../api/books";
import { getImageUrl } from "../api/config";
import BookCard from "./BookCard";

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

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold ">
            Search Books
          </h1>

          {/* Search Input */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or genre..."
              className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && hasSearched && (
          <>
            {results.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Found <span className="font-semibold text-gray-900 dark:text-white">{results.length}</span>{" "}
                    {results.length === 1 ? "book" : "books"}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {results.map((book) => (
                    <div
                      key={book.id || book.Id}
                      onClick={() => handleBookClick(book)}
                      className="cursor-pointer transform transition-transform hover:scale-105"
                    >
                      <BookCard book={book} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-16 w-16" />
                <p className="text-xl font-semibold">
                  No books found
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty State - No search yet */}
        {!loading && !error && !hasSearched && (
          <div className="text-center py-12">
            <Search className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 ">
              Start searching
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Search for books by title, author, or genre
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

