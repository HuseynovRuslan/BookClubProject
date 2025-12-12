import { useState } from "react";
import { X } from "lucide-react";
import { useShelves } from "../context/ShelvesContext.jsx";
import { useTranslation } from "../hooks/useTranslation";

export default function ShelfSelectionModal({
  isOpen,
  onClose,
  book,
  mode = "add", // "add" or "move"
  currentShelfId = null, // For "move" mode, exclude current shelf
  onSelect,
}) {
  const t = useTranslation();
  const { shelves, loading } = useShelves();
  const [selectedShelfId, setSelectedShelfId] = useState(null);

  // Helper function to translate shelf names
  const translateShelfName = (shelfName) => {
    if (!shelfName) return shelfName;
    const shelfMap = {
      "Want to Read": t("readingList.wantToRead"),
      "Currently Reading": t("readingList.currentlyReading"),
      "Read": t("readingList.read"),
      "Custom Shelves": t("readingList.customShelves"),
    };
    return shelfMap[shelfName] || shelfName;
  };

  if (!isOpen) return null;

  // Filter shelves based on mode
  const availableShelves = shelves.filter((shelf) => {
    if (mode === "move" && currentShelfId) {
      // For move mode, exclude current shelf
      return shelf.id !== currentShelfId;
    }
    return true;
  });

  const handleConfirm = () => {
    if (selectedShelfId && onSelect) {
      onSelect(selectedShelfId);
      setSelectedShelfId(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedShelfId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-900">
            {mode === "move" ? t("shelfSelection.moveTitle") : t("shelfSelection.title")}
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-600" />
          </button>
        </div>

        {/* Book Info */}
        {book && (
          <div className="p-6 border-b-2 border-gray-200 dark:border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-900 mb-1">
              {book.title}
            </h3>
            {book.author && (
              <p className="text-sm text-gray-600 dark:text-gray-600">
                {t("shelfSelection.by")} {typeof book.author === 'string' ? book.author : (book.author?.name || book.author?.Name || t("profile.unknownAuthor"))}
              </p>
            )}
          </div>
        )}

        {/* Shelf List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : availableShelves.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-600 font-semibold">
                {t("shelfSelection.noShelves")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableShelves.map((shelf) => (
                <button
                  key={shelf.id}
                  onClick={() => setSelectedShelfId(shelf.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedShelfId === shelf.id
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-50 shadow-md"
                      : "border-gray-200 dark:border-gray-200 hover:border-amber-300 dark:hover:border-amber-300 hover:bg-gray-50 dark:hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-900">
                        {translateShelfName(shelf.name)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-600 mt-1">
                        {shelf.books?.length || 0} {shelf.books?.length === 1 ? t("shelfSelection.book") : t("shelfSelection.books")}
                      </p>
                    </div>
                    {selectedShelfId === shelf.id && (
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-200">
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow-md"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedShelfId}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {mode === "move" ? t("shelfSelection.move") : t("shelfSelection.add")}
          </button>
        </div>
      </div>
    </div>
  );
}

