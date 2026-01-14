import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';

// Base URL for the backend API - environment variable ilə konfiqurasiya olunur
const BASE_URL = (import.meta.env.VITE_API_URL || 'https://localhost:7050') + '/';

/**
 * BookCard Component - Displays a book in a card format
 * @param {Object} book - Book object with id, title, coverImageUrl, authorName, averageRating, etc.
 */
const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const [currentImageSrc, setCurrentImageSrc] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    navigate(`/books/${book.id}`);
  };

  // Helper function to get OpenLibrary cover image
  const getOpenLibraryCover = (isbn) => {
    if (!isbn) return null;
    
    // Clean ISBN (remove dashes and spaces)
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    // OpenLibrary Covers API - Large size
    return `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`;
  };

  // Helper function to format backend image URL
  const getBackendImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '') {
      return null;
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    const normalizedPath = imagePath.replace(/\\/g, '/');
    const cleanPath = normalizedPath.startsWith('/') 
      ? normalizedPath.substring(1) 
      : normalizedPath;

    return `${BASE_URL}${cleanPath}`;
  };

  // Priority: OpenLibrary > Backend > Placeholder
  const openLibraryCover = getOpenLibraryCover(book.isbn || book.ISBN);
  const backendCover = getBackendImageUrl(book.coverImageUrl);
  
  // Initialize current image source on mount or when book changes
  useEffect(() => {
    const openLib = getOpenLibraryCover(book.isbn || book.ISBN);
    const backend = getBackendImageUrl(book.coverImageUrl);
    
    if (openLib || backend) {
      setCurrentImageSrc(openLib || backend);
      setImageError(false); // Reset error when book changes
      setImageLoaded(false); // Reset loaded state when book changes
    } else {
      setCurrentImageSrc(null);
      setImageLoaded(false);
    }
  }, [book.id, book.isbn, book.ISBN, book.coverImageUrl]); // Re-run when book changes

  // Show placeholder only if no image source OR error occurred
  // Don't wait for imageLoaded - show image immediately when it starts loading
  const showPlaceholder = !currentImageSrc || imageError;

  return (
    <div
      onClick={handleClick}
      className="
        group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden
        hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
        border border-gray-200
      "
    >
      {/* Book Cover Image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-200">
        {showPlaceholder ? (
          /* Placeholder for books without cover or failed images */
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <BookOpen className="w-16 h-16 text-gray-400" />
          </div>
        ) : (
          <>
            <img
              key={currentImageSrc} // Force re-render when src changes
              src={currentImageSrc}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={() => {
                // Recalculate URLs
                const openLib = getOpenLibraryCover(book.isbn || book.ISBN);
                const backend = getBackendImageUrl(book.coverImageUrl);
                
                // If OpenLibrary failed and we have backend URL, try it
                if (currentImageSrc === openLib && backend) {
                  setCurrentImageSrc(backend);
                  setImageError(false); // Reset error to try backend
                } else {
                  // Both failed, show placeholder
                  setImageError(true);
                  setCurrentImageSrc(null);
                }
              }}
              onLoad={() => {
                setImageError(false); // Reset error on successful load
                setImageLoaded(true); // Mark as loaded (for future use)
              }}
            />
            
            {/* Hover Overlay - Only shows on hover, doesn't block image */}
            <div className="
              absolute inset-0 pointer-events-none z-10
              bg-black opacity-0 group-hover:opacity-20
              transition-opacity duration-300 flex items-center justify-center
            ">
              <BookOpen className="
                text-white opacity-0 group-hover:opacity-100 
                transition-opacity duration-300 w-12 h-12
              " />
            </div>
          </>
        )}
      </div>

      {/* Book Info - Fixed height structure */}
      <div className="p-4 flex flex-col h-[140px]">
        {/* Title - Fixed 2 lines height */}
        <h3 className="
          font-semibold text-gray-900 text-base mb-2 
          line-clamp-2 min-h-[2.75rem]
          group-hover:text-indigo-600 transition-colors
        ">
          {book.title}
        </h3>

        {/* Author - Fixed 1 line height */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-1 min-h-[1.25rem]">
          {book.authorName || 'Unknown Author'}
        </p>

        {/* Rating - Push to bottom with mt-auto */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-900">
              {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}
            </span>
          </div>
          
          {book.ratingCount > 0 && (
            <span className="text-xs text-gray-500">
              ({book.ratingCount} {book.ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
