import { useState, useEffect, useRef } from "react";
import { useShelves } from "../context/ShelvesContext.jsx";
import { getImageUrl } from "../api/config";

function BookCard({ book, onClick, enableShelfControls = true, priority = false }) {
  const { shelves, addBookToShelf } = useShelves();
  const [status, setStatus] = useState(null);
  const [showShelfSelect, setShowShelfSelect] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  const cardRef = useRef(null);

  const coverImage = getImageUrl(
    book.coverImageUrl ||
    book.cover ||
    book.coverImage ||
    book.coverUrl ||
    book.image
  );

  // Intersection Observer for lazy loading (skip for priority images)
  useEffect(() => {
    // Priority images load immediately
    if (priority) {
      setIsInView(true);
      return;
    }

    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) {
        observer.disconnect();
      }
    };
  }, [priority]);

  // Preload image when in view
  useEffect(() => {
    if (!isInView || !coverImage) {
      if (!coverImage) {
        setImageError(true);
        setImageLoading(false);
      }
      return;
    }

    setImageLoading(true);
    setImageError(false);

    // Preload image
    const img = new Image();
    img.src = coverImage;
    
    let isMounted = true;
    
    img.onload = () => {
      if (isMounted) {
        setImageLoading(false);
        setImageError(false);
      }
    };
    
    img.onerror = () => {
      if (isMounted) {
        setImageError(true);
        setImageLoading(false);
      }
    };

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (isMounted) {
        setImageLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, coverImage]);
  // Handle Author object from backend (BookDetailDto has Author as AuthorDto object)
  let authorName = "Unknown author";
  if (book.author) {
    if (typeof book.author === 'string') {
      authorName = book.author;
    } else if (book.author?.name || book.author?.Name) {
      authorName = book.author.name || book.author.Name;
    }
  } else if (book.authorName) {
    authorName = book.authorName;
  } else if (book.Author) {
    if (typeof book.Author === 'string') {
      authorName = book.Author;
    } else if (book.Author?.name || book.Author?.Name) {
      authorName = book.Author.name || book.Author.Name;
    }
  }
  
  const genres = book.genre 
    ? (Array.isArray(book.genre) ? book.genre : [book.genre])
    : (book.genres && Array.isArray(book.genres) ? book.genres.map(g => typeof g === 'string' ? g : (g.name || g.Name || g)) : []);
  
  const rating = book.rating || book.averageRating || book.avgRating || null;

  const handleShelfChange = async (event) => {
    event.stopPropagation();
    const shelfId = event.target.value;
    if (!shelfId) return;
    try {
      await addBookToShelf(shelfId, book);
      setStatus({
        type: "success",
        message: `"${book.title}" ${shelves.find((s) => s.id === shelfId)?.name} siyahısına əlavə olundu`,
      });
      setShowShelfSelect(false);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Shelf-ə əlavə etmək alınmadı",
      });
    } finally {
      event.target.value = "";
      setTimeout(() => setStatus(null), 2500);
    }
  };

  const handleAddToReadingList = (e) => {
    e.stopPropagation();
    setShowShelfSelect(true);
  };

  return (
    <div
      ref={cardRef}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600/50 transform hover:-translate-y-2 hover-gentle-scale"
      onClick={onClick}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Elegant overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-orange-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:via-orange-500/5 group-hover:to-amber-500/5 transition-all duration-500 pointer-events-none z-10"></div>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-200/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
      
      {/* Book Cover with elegant shadow */}
      <div className="aspect-[3/4] bg-gradient-to-br from-amber-100 via-orange-100 to-amber-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 overflow-hidden relative shadow-inner">
        {/* Skeleton Loader with book-themed colors */}
        {imageLoading && isInView && (
          <div className="absolute inset-0 z-20 animate-pulse">
            <div className="w-full h-full bg-gradient-to-br from-amber-200 via-orange-200 to-amber-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-amber-300 dark:border-amber-600 border-t-amber-600 dark:border-t-amber-400 rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Image with elegant effects */}
        {isInView && coverImage && !imageError ? (
          <>
            <img
              ref={imgRef}
              src={coverImage}
              alt={book.title || "Book cover"}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchpriority={priority ? "high" : "low"}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
            {/* Elegant shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-30"></div>
            {/* Subtle vignette effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none z-20"></div>
          </>
        ) : !isInView ? (
          // Placeholder while waiting to load
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-100 to-amber-100 dark:from-gray-700 dark:via-gray-800">
            <div className="w-12 h-12 border-2 border-amber-300 dark:border-amber-600 border-t-amber-600 dark:border-t-amber-400 rounded-full animate-spin opacity-50"></div>
          </div>
        ) : (
          // No image placeholder with book icon
          <div className="flex flex-col items-center justify-center h-full text-amber-600 dark:text-amber-400 p-4">
            <svg
              className="w-20 h-20 mb-3 opacity-60"
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
            <span className="text-xs text-center font-semibold">No Cover</span>
          </div>
        )}
      </div>

      {/* Book Info with elegant typography */}
      <div className="p-4 relative z-10 bg-white dark:bg-gray-800">
        {/* Title */}
        <h3 className="font-bold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors duration-300 leading-snug min-h-[2.5rem]">
          {book.title}
        </h3>
        
        {/* Author with elegant styling */}
        <div className="mb-3">
          <p className="text-xs text-amber-700 dark:text-amber-300 line-clamp-1 font-medium italic">
            by {authorName}
          </p>
        </div>

        {/* Genre and Rating */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {genres.length > 0 && (
            <span className="text-[10px] px-3 py-1 bg-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-900 dark:text-amber-200 rounded-full font-bold border border-amber-300 dark:border-amber-700 shadow-sm">
              {typeof genres[0] === 'string' ? genres[0] : (genres[0].name || genres[0].Name || genres[0])}
            </span>
          )}
          {rating && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 px-2.5 py-1 rounded-full border border-yellow-300 dark:border-yellow-700 shadow-sm">
              <span className="text-xs text-yellow-600 dark:text-yellow-400">★</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Decorative bottom line */}
        <div className="mt-3 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
}

export default BookCard;
