import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBooks, getBooksByGenre } from "../api/books";
import { getImageUrl } from "../api/config";
import { useTranslation } from "../hooks/useTranslation";


const CATEGORY_ICONS = {
  Fiction: "📖",
  Mystery: "🔍",
  "Self-Help": "💪",
  Romance: "💕",
  Science: "🔬",
  History: "📜",
  Fantasy: "✨",
  Biography: "👤",
  Horror: "👻",
  Adventure: "🗺️",
  Drama: "🎭",
  Comedy: "😄",
  Thriller: "⚡",
  Philosophy: "🤔",
  Technology: "💻",
  Business: "💼",
  Health: "💚",
  Education: "🎓",
  Art: "🎨",
  Music: "🎵",
  Default: "📚"
};

export default function CategoriesPage({ onBookClick }) {
  const navigate = useNavigate();
  const t = useTranslation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState(null);
  const scrollRefs = useRef({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    setError(null);
    try {

      const allItems = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 10) {
        const response = await getAllBooks({ page, pageSize: 50 });
        const items = Array.isArray(response)
          ? response
          : response?.items || response?.Items || response?.data || [];
        
        if (Array.isArray(items) && items.length > 0) {
          allItems.push(...items);
          if (items.length < 50) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
        page++;
      }


      const genreMap = new Map();
      
      allItems.forEach(book => {
        let genres = [];
        

        if (book.genres && Array.isArray(book.genres)) {
          genres = book.genres;
        } else if (book.genre) {
          genres = Array.isArray(book.genre) ? book.genre : [book.genre];
        }
        
        genres.forEach(genre => {
          const genreName = typeof genre === 'string' 
            ? genre 
            : (genre?.name || genre?.Name || genre);
          
          if (genreName) {
            if (!genreMap.has(genreName)) {
              genreMap.set(genreName, {
                name: genreName,
                count: 0,
                id: genreName.toLowerCase().replace(/\s+/g, '-')
              });
            }
            genreMap.get(genreName).count++;
          }
        });
      });


      const categoriesList = Array.from(genreMap.values())
        .sort((a, b) => b.count - a.count);
      
      setCategories(categoriesList);
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
      const categoryName = category.name || category.Name;
      

      const response = await getBooksByGenre(categoryName, { page: 1, pageSize: 50 });
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
    return book.authorName || t("profile.unknownAuthor");
  };

  const getRating = (book) => {
    return book.rating || book.averageRating || book.avgRating || 0;
  };

  const getCategoryIcon = (categoryName) => {
    return CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.Default;
  };

  const translateCategoryName = (categoryName) => {

    const categoryMap = {
      "Fiction": t("category.fiction"),
      "Mystery": t("category.mystery"),
      "Self-Help": t("category.selfHelp"),
      "Romance": t("category.romance"),
      "Science": t("category.science"),
      "History": t("category.history"),
      "Fantasy": t("category.fantasy"),
      "Biography": t("category.biography"),
      "Horror": t("category.horror"),
      "Adventure": t("category.adventure"),
      "Drama": t("category.drama"),
      "Comedy": t("category.comedy"),
      "Thriller": t("category.thriller"),
      "Philosophy": t("category.philosophy"),
      "Technology": t("category.technology"),
      "Business": t("category.business"),
      "Health": t("category.health"),
      "Education": t("category.education"),
      "Art": t("category.art"),
      "Music": t("category.music"),
      "Classic": t("category.classic"),
      "Literary Fiction": t("category.literaryFiction"),
      "Historical Fiction": t("category.historicalFiction"),
    };
    return categoryMap[categoryName] || categoryName;
  };

  const getCategoryColor = (index) => {
    const colors = [
      "from-amber-500 via-orange-500 to-red-600",
      "from-purple-500 via-pink-500 to-rose-600",
      "from-blue-500 via-cyan-500 to-teal-600",
      "from-green-500 via-emerald-500 to-lime-600",
      "from-indigo-500 via-violet-500 to-purple-600",
      "from-red-500 via-orange-500 to-amber-600",
      "from-teal-500 via-cyan-500 to-blue-600",
      "from-pink-500 via-rose-500 to-red-600",
      "from-yellow-500 via-amber-500 to-orange-600",
      "from-emerald-500 via-green-500 to-teal-600",
    ];
    return colors[index % colors.length];
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
                    {t("categories.title")}
                  </h1>
                  <p className="text-gray-700 dark:text-gray-700 text-xl sm:text-2xl mt-3 font-semibold">
                    {categories.length > 0 
                      ? `${t("categories.subtitle")} - ${categories.length} ${t("categories.title").toLowerCase()}`
                      : t("categories.subtitle")
                    }
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
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-700 mt-6">{t("categories.loading")}</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {categories.map((category, index) => {
                const categoryName = category.name || "Unknown";
                const categoryId = category.id || categoryName.toLowerCase().replace(/\s+/g, '-');
                const bookCount = category.count || 0;
                const icon = getCategoryIcon(categoryName);
                const gradientColor = getCategoryColor(index);
                
                return (
                  <button
                    key={categoryId}
                    onClick={() => handleCategoryClick(category)}
                    className="group relative p-6 bg-white dark:bg-white rounded-3xl border-2 border-gray-200 dark:border-gray-200 hover:border-transparent transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 shadow-xl hover:shadow-2xl overflow-hidden"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <div className="text-5xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 transform">
                        {icon}
                      </div>
                      <h3 className="font-black text-gray-900 dark:text-gray-900 text-base mb-2 group-hover:text-white transition-colors duration-300 line-clamp-2">
                        {translateCategoryName(categoryName)}
                      </h3>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                          {bookCount}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-white/80 transition-colors duration-300">
                          {bookCount === 1 ? t("categories.book") : t("categories.books")}
                        </span>
                      </div>
                    </div>
                    
                    {/* Decorative Corner */}
                    <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-150"></div>
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
                {t("categories.noCategories")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-600">
                {t("categories.subtitle")}
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
                {t("categories.backToCategories")}
              </button>
              <div className="flex items-center gap-5 mb-5">
                <div className="relative">
                  <div className="w-2 h-20 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-xl"></div>
                  <div className="absolute top-0 left-0 w-2 h-20 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-sm opacity-60 animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-none mb-3 drop-shadow-sm">
                    {translateCategoryName(selectedCategory.name || selectedCategory.Name)}
                  </h1>
                  <p className="text-gray-700 dark:text-gray-700 text-xl sm:text-2xl mt-3 font-semibold">
                    {t("categories.booksInCategory")}
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
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-700 mt-6">{t("common.loading")}</p>
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
                  {t("categories.found")} <span className="text-amber-600 dark:text-amber-600">{categoryBooks.length}</span>{" "}
                  {categoryBooks.length === 1 ? t("categories.book") : t("categories.books")}
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
                {t("categories.noBooks")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-600">
                {t("categories.booksInCategory")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
