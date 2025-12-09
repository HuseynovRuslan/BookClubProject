import { useState, useEffect } from "react";
import { useShelves } from "../context/ShelvesContext.jsx";
import { getImageUrl } from "../api/config";

function BookCard({ book, onClick, enableShelfControls = true }) {
  const { shelves, addBookToShelf } = useShelves();
  const [status, setStatus] = useState(null);
  const [showShelfSelect, setShowShelfSelect] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const coverImage = getImageUrl(
    book.coverImageUrl ||
    book.cover ||
    book.coverImage ||
    book.coverUrl ||
    book.image
  );

  useEffect(() => {
    if (coverImage) {
      setImageError(false);
      setImageLoading(true);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [coverImage]);
  const authorName = book.author || book.authorName || "Unknown author";
  
  const genres = book.genre 
    ? (Array.isArray(book.genre) ? book.genre : [book.genre])
    : [];
  
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
      className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden rounded-t-lg relative">
        {coverImage && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={coverImage}
              alt={book.title || "Book cover"}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              loading="lazy"
              decoding="async"
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={(e) => {
                setImageError(true);
                setImageLoading(false);
                e.target.style.display = "none";
              }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-4">
            <svg
              className="w-12 h-12 mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-xs text-center">No Image</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-gray-900 dark:text-white">
          {book.title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">{authorName}</p>

        <div className="mb-2 flex items-center justify-between gap-2">
          {genres.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
              {genres[0]}
            </span>
          )}
          {rating && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-yellow-500">★</span>
              <span className="text-xs text-gray-600 dark:text-gray-300">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default BookCard;
