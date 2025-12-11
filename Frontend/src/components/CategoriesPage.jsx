import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGenres } from "../api/genres";
import { getBooksByGenre } from "../api/books";
import { getImageUrl } from "../api/config";

export default function CategoriesPage({ onBookClick }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const response = await getGenres({ page: 1, pageSize: 100 });
      const items = response?.items || response?.Items || response || [];
      setCategories(items);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError(err.message || "Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoadingBooks(true);
    setError(null);

    try {
      const categoryId = category.id || category.Id;
      const categoryName = category.name || category.Name;
      
      // Try by genre name first (as per backend API)
      const response = await getBooksByGenre(categoryName, { page: 1, pageSize: 100 });
      const items = response?.items || response?.Items || response || [];
      setCategoryBooks(items);
    } catch (err) {
      console.error("Error loading category books:", err);
      setError(err.message || "Failed to load books for this category");
      setCategoryBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleBookClick = (book) => {
    if (onBookClick) {
      onBookClick(book);
    } else {
      navigate(`/books/${book.id || book.Id}`);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryBooks([]);
    setError(null);
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
      {!selectedCategory ? (
        <>
          {/* Header Section - Ultra Modern Glassmorphism Design */}
          <div className="mb-14 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-red-50/80 dark:from-amber-50/80 dark:via-orange-50/80 dark:to-red-50/80 rounded-3xl -z-10 backdrop-blur-md"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-amber-50/40 rounded-3xl -z-10"></div>
            <div className="px-10 py-12 relative z-10">
              <div className="flex items-center gap-5 mb-5">
                <div className="relative">
                  <div className="w-2 h-20 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-xl"></div>
                  <div className="absolute top-0 left-0 w-2 h-20 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-sm opacity-60 animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-none mb-3 drop-shadow-sm">
                    Categories
                  </h1>
                  <p className="text-gray-700 dark:text-gray-700 text-xl sm:text-2xl mt-3 font-semibold">
                    Browse books by category
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingCategories && (
            <div className="text-center py-20">
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-amber-600 dark:border-amber-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-700 mt-6">Loading categories...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loadingCategories && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-50 dark:to-orange-50 border-2 border-red-200 dark:border-red-200 rounded-2xl shadow-lg">
              <p className="text-red-600 dark:text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* Categories Grid */}
          {!loadingCategories && !error && categories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {categories.map((category, index) => {
                const categoryName = category.name || category.Name || "Unknown";
                const categoryId = category.id || category.Id;
                return (
                  <button
                    key={categoryId}
                    onClick={() => handleCategoryClick(category)}
                    className="p-6 bg-white dark:bg-white rounded-2xl border-2 border-gray-200 dark:border-gray-200 hover:border-amber-400 dark:hover:border-amber-400 hover:bg-gradient-to-br hover:from-amber-50 hover:via-orange-50 hover:to-red-50 dark:hover:from-amber-50 dark:hover:via-orange-50 dark:hover:to-red-50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-lg hover:shadow-xl group"
                    style={{ 
                      animationDelay: `${index * 30}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📚</div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-900 text-sm break-words group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 transition-all duration-300">
                        {categoryName}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loadingCategories && !error && categories.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-full mb-6">
                <svg className="h-12 w-12 text-amber-500 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900 mb-3">
                No categories found
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-600">
                Categories will appear here once they are added
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Header Section - Category Books View */}
          <div className="mb-14 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-red-50/80 dark:from-amber-50/80 dark:via-orange-50/80 dark:to-red-50/80 rounded-3xl -z-10 backdrop-blur-md"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-amber-50/40 rounded-3xl -z-10"></div>
            <div className="px-10 py-12 relative z-10">
              <button
                onClick={handleBackToCategories}
                className="mb-6 text-amber-600 dark:text-amber-600 hover:text-amber-700 dark:hover:text-amber-700 flex items-center gap-2 transition-all font-semibold group"
              >
                <svg
                  className="w-6 h-6 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Categories
              </button>
              <div className="flex items-center gap-5 mb-5">
                <div className="relative">
                  <div className="w-2 h-20 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-xl"></div>
                  <div className="absolute top-0 left-0 w-2 h-20 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-sm opacity-60 animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-none mb-3 drop-shadow-sm">
                    {selectedCategory.name || selectedCategory.Name}
                  </h1>
                  <p className="text-gray-700 dark:text-gray-700 text-xl sm:text-2xl mt-3 font-semibold">
                    Books in this category
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingBooks && (
            <div className="text-center py-20">
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-amber-600 dark:border-amber-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-700 mt-6">Loading books...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loadingBooks && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-50 dark:to-orange-50 border-2 border-red-200 dark:border-red-200 rounded-2xl shadow-lg">
              <p className="text-red-600 dark:text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* Books Grid */}
          {!loadingBooks && !error && categoryBooks.length > 0 && (
            <>
              <div className="mb-8 flex items-center gap-4">
                <div className="relative">
                  <div className="w-1 h-8 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full"></div>
                </div>
                <p className="text-xl font-black text-gray-900 dark:text-gray-900">
                  Found <span className="text-amber-600 dark:text-amber-600">{categoryBooks.length}</span>{" "}
                  {categoryBooks.length === 1 ? "book" : "books"}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {categoryBooks.map((book, index) => {
                  const coverImage = getImageUrlForBook(book);
                  const authorName = getAuthorName(book);
                  const rating = getRating(book);
                  
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
          )}

          {/* Empty State */}
          {!loadingBooks && !error && categoryBooks.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-full mb-6">
                <svg className="h-12 w-12 text-amber-500 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900 mb-3">
                No books found
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-600">
                This category doesn't have any books yet
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
