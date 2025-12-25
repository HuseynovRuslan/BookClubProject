import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { useShelves } from "../context/ShelvesContext.jsx";
import { useTranslation } from "../hooks/useTranslation";

export default function ShelfSelectionModal({
  isOpen,
  onClose,
  book,
  mode = "add",
  currentShelfId = null,
  onSelect,
}) {
  const t = useTranslation();
  const { shelves, loading, createShelf } = useShelves();
  const [selectedShelfId, setSelectedShelfId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [creatingLoading, setCreatingLoading] = useState(false);


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

  const handleCreateShelf = async (e) => {
    e.preventDefault();
    if (!newShelfName.trim()) return;

    setCreatingLoading(true);
    try {
      const newShelf = await createShelf({ name: newShelfName.trim() });
      setNewShelfName("");
      setIsCreating(false);
      // Auto-select the newly created shelf
      if (newShelf && (newShelf.id || newShelf._id)) {
        if (onSelect) {
          onSelect(newShelf.id || newShelf._id);
          setSelectedShelfId(null);
          onClose();
        }
      }
    } catch (err) {
      console.error("Failed to create shelf:", err);
      // Optional: show error in UI
    } finally {
      setCreatingLoading(false);
    }
  };

  if (!isOpen) return null;



  const availableShelves = shelves.filter((shelf) => {
    if (mode === "move" && currentShelfId) {

      return shelf.id !== currentShelfId;
    }
    if (mode === "add") {

      return true;
    }
    return true;
  }).sort((a, b) => {

    if (mode === "add") {
      const isADefault = a.isDefault === true || a.IsDefault === true;
      const isBDefault = b.isDefault === true || b.IsDefault === true;

      if (isADefault && !isBDefault) return -1;
      if (!isADefault && isBDefault) return 1;


      if (isADefault && isBDefault) {
        const defaultOrder = ["Want to Read", "Currently Reading", "Read"];
        const aIndex = defaultOrder.indexOf(a.name);
        const bIndex = defaultOrder.indexOf(b.name);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
      }


      return (a.name || "").localeCompare(b.name || "");
    }
    return 0;
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

        {/* Create New Shelf Section */}
        <div className="px-6 pt-4 pb-2">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-300 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-50 text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-600 font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {t("readingList.createShelf") || "Yeni Shelf Yarat"}
            </button>
          ) : (
            <form onSubmit={handleCreateShelf} className="flex gap-2 animate-fadeIn">
              <input
                type="text"
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                placeholder={t("readingList.enterShelfName") || "Shelf adı..."}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-50 border-2 border-gray-200 dark:border-gray-200 focus:border-amber-500 focus:outline-none transition-colors font-medium text-gray-900 dark:text-gray-900"
                autoFocus
                disabled={creatingLoading}
              />
              <button
                type="submit"
                disabled={!newShelfName.trim() || creatingLoading}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {creatingLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewShelfName("");
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-200 text-gray-600 dark:text-gray-600 rounded-xl transition-all"
                disabled={creatingLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>

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
                  onClick={() => {
                    setSelectedShelfId(shelf.id);

                    if (onSelect) {
                      onSelect(shelf.id);
                      setSelectedShelfId(null);
                      onClose();
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedShelfId === shelf.id
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
                        {shelf.books?.length || shelf.bookCount || 0} {(shelf.books?.length || shelf.bookCount || 0) === 1 ? t("shelfSelection.book") : t("shelfSelection.books")}
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

