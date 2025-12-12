import { useState, useEffect, useRef } from "react";
import { getAllBooks } from "../api/books";
import { getImageUrl } from "../api/config";
import { useTranslation } from "../hooks/useTranslation";

export default function RecommendationsPage({ onBookClick }) {
  const t = useTranslation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const scrollRefs = useRef({});

  // Helper function to translate category names
  const translateCategoryName = (categoryName) => {
    if (!categoryName) return categoryName;
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
    };
    return categoryMap[categoryName] || categoryName;
  };

  // Function to get cached trending books or generate new ones
  const getCachedTrendingBooks = (allBooks) => {
    if (!allBooks || allBooks.length === 0) return [];
    
    const cacheKey = 'trendingBooks';
    const timestampKey = 'trendingBooksTimestamp';
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    
    try {
      const cached = localStorage.getItem(cacheKey);
      const timestamp = localStorage.getItem(timestampKey);
      
      if (cached && timestamp) {
        const cachedTime = parseInt(timestamp, 10);
        const now = Date.now();
        const timeDiff = now - cachedTime;
        
        // If less than 1 week has passed, use cached books
        if (timeDiff < oneWeekInMs) {
          const cachedBooks = JSON.parse(cached);
          // Verify that cached book IDs still exist in current books
          const validCachedBooks = cachedBooks.filter(cachedBook => 
            allBooks.some(book => (book.id || book._id) === (cachedBook.id || cachedBook._id))
          );
          
          // If we have valid cached books, return them
          if (validCachedBooks.length > 0) {
            return validCachedBooks;
          }
        }
      }
      
      // Generate new random trending books (10 books)
      const shuffled = [...allBooks].sort(() => 0.5 - Math.random());
      const newTrendingBooks = shuffled.slice(0, 10);
      
      // Cache the new trending books
      localStorage.setItem(cacheKey, JSON.stringify(newTrendingBooks));
      localStorage.setItem(timestampKey, Date.now().toString());
      
      return newTrendingBooks;
    } catch (error) {
      console.error('Error managing trending books cache:', error);
      // Fallback: generate new random books
      const shuffled = [...allBooks].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 10);
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const fetchAllBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch books in batches (max 50 per request)
      const allItems = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 10) { // Limit to 10 pages (500 books max)
        const response = await getAllBooks({ page, pageSize: 50 });
        const items = Array.isArray(response)
          ? response
          : response?.items || response?.data || [];
        
        if (Array.isArray(items) && items.length > 0) {
          allItems.push(...items);
          // If we got less than 50 items, we've reached the end
          if (items.length < 50) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
        page++;
      }
      
      setBooks(allItems);
      
      // Get or generate trending books (cached for 1 week)
      const cachedTrending = getCachedTrendingBooks(allItems);
      setTrendingBooks(cachedTrending);
      
      
      // Extract unique genres
      const uniqueGenres = new Set();
      allItems.forEach(book => {
        if (book.genres && Array.isArray(book.genres)) {
          book.genres.forEach(genre => {
            const genreName = typeof genre === 'string' ? genre : (genre.name || genre.Name || genre);
            if (genreName) uniqueGenres.add(genreName);
          });
        } else if (book.genre) {
          const genreName = typeof book.genre === 'string' ? book.genre : (book.genre.name || book.genre.Name || book.genre);
          if (genreName) uniqueGenres.add(genreName);
        }
      });
      
      setGenres(Array.from(uniqueGenres).sort());
    } catch (err) {
      // Error mesajı artıq config.js-də kullanıcı dostu formata çevrilir
      const errorMsg = err.translationKey 
        ? (err.status ? t(err.translationKey).replace("{status}", err.status) : t(err.translationKey))
        : (err.message || t("error.booksLoad"));
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getBooksByGenre = (genreName) => {
    return books.filter(book => {
      if (book.genres && Array.isArray(book.genres)) {
        return book.genres.some(genre => {
          const g = typeof genre === 'string' ? genre : (genre.name || genre.Name || genre);
          return g === genreName;
        });
      } else if (book.genre) {
        const g = typeof book.genre === 'string' ? book.genre : (book.genre.name || book.genre.Name || book.genre);
        return g === genreName;
      }
      return false;
    });
  };

  const scrollLeft = (genreName) => {
    const container = scrollRefs.current[genreName];
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = (genreName) => {
    const container = scrollRefs.current[genreName];
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <div className="w-6 h-6 border-3 border-gray-300 dark:border-gray-600 border-t-amber-600 dark:border-t-amber-400 rounded-full animate-spin"></div>
          <span className="text-lg">{t("recommendations.loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="inline-block p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 bg-white dark:bg-white min-h-screen">
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
                {t("recommendations.title")}
              </h1>
              <p className="text-gray-700 dark:text-gray-700 text-xl sm:text-2xl mt-3 font-semibold">
                {t("recommendations.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        {/* Trending Books Section - Random 5 Books */}
        {books.length > 0 && (
          <div className="space-y-5">
            {/* Trending Books Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-2 h-12 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-lg"></div>
                  <div className="absolute top-0 left-0 w-2 h-12 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-md opacity-50"></div>
                </div>
                <div className="flex items-baseline gap-4">
                  <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-gray-900 tracking-tight leading-none">
                    {t("recommendations.trending")}
                  </h2>
                  <span className="text-xs text-gray-600 dark:text-gray-600 font-bold bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-200 shadow-sm">
                    10 {t("recommendations.booksCount")}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => scrollLeft('trending')}
                  className="group p-4 rounded-2xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 hover:bg-gradient-to-br hover:from-amber-50 hover:via-orange-50 hover:to-red-50 hover:border-amber-400 dark:hover:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 hover:-translate-x-1 active:scale-95"
                  aria-label="Scroll left"
                >
                  <svg className="w-7 h-7 text-gray-700 dark:text-gray-700 group-hover:text-amber-600 dark:group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollRight('trending')}
                  className="group p-4 rounded-2xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 hover:bg-gradient-to-br hover:from-amber-50 hover:via-orange-50 hover:to-red-50 hover:border-amber-400 dark:hover:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 hover:translate-x-1 active:scale-95"
                  aria-label="Scroll right"
                >
                  <svg className="w-7 h-7 text-gray-700 dark:text-gray-700 group-hover:text-amber-600 dark:group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Trending Books Carousel */}
            <div className="relative">
              {/* Gradient fade effects on sides - Minimal */}
              <div className="absolute left-0 top-0 bottom-6 w-4 bg-gradient-to-r from-white via-white/30 to-transparent dark:from-white dark:via-white/30 dark:to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-6 w-4 bg-gradient-to-l from-white via-white/30 to-transparent dark:from-white dark:via-white/30 dark:to-transparent z-10 pointer-events-none"></div>
              
              <div
                ref={(el) => (scrollRefs.current['trending'] = el)}
                className="flex gap-5 overflow-x-auto scrollbar-hide pb-6 scroll-smooth"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {trendingBooks.map((book, index) => {
                    const coverImage = getImageUrl(
                      book.coverImageUrl ||
                      book.cover ||
                      book.coverImage ||
                      book.coverUrl ||
                      book.image
                    );
                    
                    const rating = book.rating || book.averageRating || book.avgRating || 0;
                    
                    return (
                      <div
                        key={book.id || book._id}
                        onClick={() => onBookClick && onBookClick(book)}
                        className="flex-shrink-0 w-48 cursor-pointer group"
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <div className="bg-white dark:bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 dark:border-gray-200 hover:border-amber-400 dark:hover:border-amber-400 transform hover:-translate-y-2 hover:scale-[1.02] relative">
                          <div className="absolute top-3 left-3 z-20">
                            <div className="relative group/badge">
                              {/* Warm orange glow - Perfect for books */}
                              <div className="absolute -inset-1 bg-gradient-to-br from-orange-400 via-red-400 to-amber-400 rounded-xl blur-lg opacity-60 group-hover/badge:opacity-80 transition-opacity duration-500"></div>
                              <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-red-300 to-amber-300 rounded-xl blur-md opacity-50 group-hover/badge:opacity-70 transition-opacity duration-500"></div>
                              
                              {/* Main badge - Orange/Red/Amber gradient */}
                              <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 text-white font-black text-xl w-12 h-12 rounded-xl flex items-center justify-center shadow-[0_8px_32px_rgba(249,115,22,0.5),0_0_16px_rgba(239,68,68,0.4)] border-2 border-white/40 backdrop-blur-md group-hover/badge:scale-110 group-hover/badge:shadow-[0_12px_48px_rgba(249,115,22,0.7),0_0_24px_rgba(239,68,68,0.6)] group-hover/badge:-rotate-1 transition-all duration-500 ease-out">
                                <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_4px_rgba(255,255,255,0.4)] leading-none">
                                  {index + 1}
                                </span>
                              </div>
                              
                              {/* Premium inner shine */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/25 to-transparent rounded-xl pointer-events-none"></div>
                              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-xl pointer-events-none"></div>
                              
                              {/* Animated ring on hover */}
                              <div className="absolute -inset-1 rounded-xl border-2 border-white/0 group-hover/badge:border-white/50 transition-all duration-500 pointer-events-none"></div>
                            </div>
                          </div>
                          
                          {/* Book Cover with Modern Effects */}
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
                                {/* Ultra modern shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out pointer-events-none"></div>
                                {/* Gradient overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 via-transparent to-transparent group-hover:from-amber-500/10 transition-all duration-700 pointer-events-none"></div>
                                {/* Corner accent */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
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

                          {/* Book Info - Ultra Modern Typography */}
                          <div className="p-4 bg-white dark:bg-white relative">
                            {/* Decorative top border */}
                            <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Title */}
                            <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-900 line-clamp-2 leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 transition-all duration-500">
                              {book.title}
                            </h3>
                            
                            {/* Rating Star - Ultra Enhanced Design */}
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
            </div>
          </div>
        )}

        {/* Genre Sections */}
        {genres.map((genreName) => {
          const genreBooks = getBooksByGenre(genreName);
          if (genreBooks.length === 0) return null;

          return (
            <div key={genreName} className="space-y-5">
              {/* Genre Header with Ultra Modern Glassmorphism Design */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-2 h-12 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-lg"></div>
                    <div className="absolute top-0 left-0 w-2 h-12 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-md opacity-50"></div>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-gray-900 tracking-tight leading-none">
                      {translateCategoryName(genreName)}
                    </h2>
                    <span className="text-xs text-gray-600 dark:text-gray-600 font-bold bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-200 shadow-sm">
                      {genreBooks.length} {genreBooks.length === 1 ? t("categories.book") : t("categories.books")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => scrollLeft(genreName)}
                    className="group p-4 rounded-2xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 hover:bg-gradient-to-br hover:from-amber-50 hover:via-orange-50 hover:to-red-50 hover:border-amber-400 dark:hover:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 hover:-translate-x-1 active:scale-95"
                    aria-label="Scroll left"
                  >
                    <svg className="w-7 h-7 text-gray-700 dark:text-gray-700 group-hover:text-amber-600 dark:group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollRight(genreName)}
                    className="group p-4 rounded-2xl bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 hover:bg-gradient-to-br hover:from-amber-50 hover:via-orange-50 hover:to-red-50 hover:border-amber-400 dark:hover:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 hover:translate-x-1 active:scale-95"
                    aria-label="Scroll right"
                  >
                    <svg className="w-7 h-7 text-gray-700 dark:text-gray-700 group-hover:text-amber-600 dark:group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Carousel - Ultra Modern Glassmorphism */}
              <div className="relative">
                {/* Gradient fade effects on sides - Minimal */}
                <div className="absolute left-0 top-0 bottom-6 w-4 bg-gradient-to-r from-white via-white/30 to-transparent dark:from-white dark:via-white/30 dark:to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-6 w-4 bg-gradient-to-l from-white via-white/30 to-transparent dark:from-white dark:via-white/30 dark:to-transparent z-10 pointer-events-none"></div>
                
                <div
                  ref={(el) => (scrollRefs.current[genreName] = el)}
                  className="flex gap-5 overflow-x-auto scrollbar-hide pb-6 scroll-smooth"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {genreBooks.map((book, index) => {
                    const coverImage = getImageUrl(
                      book.coverImageUrl ||
                      book.cover ||
                      book.coverImage ||
                      book.coverUrl ||
                      book.image
                    );
                    
                    const rating = book.rating || book.averageRating || book.avgRating || 0;
                    
                    return (
                      <div
                        key={book.id || book._id}
                        onClick={() => onBookClick && onBookClick(book)}
                        className="flex-shrink-0 w-48 cursor-pointer group"
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <div className="bg-white dark:bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 dark:border-gray-200 hover:border-amber-400 dark:hover:border-amber-400 transform hover:-translate-y-2 hover:scale-[1.02]">
                          {/* Book Cover with Ultra Modern Effects */}
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
                                {/* Ultra modern shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out pointer-events-none"></div>
                                {/* Gradient overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 via-transparent to-transparent group-hover:from-amber-500/10 transition-all duration-700 pointer-events-none"></div>
                                {/* Corner accent */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
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

                          {/* Book Info - Ultra Modern Typography */}
                          <div className="p-4 bg-white dark:bg-white relative">
                            {/* Decorative top border */}
                            <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Title */}
                            <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-900 line-clamp-2 leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 transition-all duration-500">
                              {book.title}
                            </h3>
                            
                            {/* Rating Star - Ultra Enhanced Design */}
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
              </div>
            </div>
          );
        })}
      </div>

      {genres.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-600 dark:text-gray-400 text-lg">{t("recommendations.noBooks")}</p>
        </div>
      )}

    </div>
  );
}

