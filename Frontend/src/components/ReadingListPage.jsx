import { useState, useMemo, useEffect, useRef } from "react";
import { useShelves } from "../context/ShelvesContext.jsx";
import { updateBookStatus } from "../api/books";
import { getImageUrl } from "../api/config";
import { useTranslation } from "../hooks/useTranslation";
import ShelfSelectionModal from "./ShelfSelectionModal";
import { MoreVertical, Move, Trash2 } from "lucide-react";

export default function ReadingListPage() {
  const t = useTranslation();
  const {
    shelves,
    loading,
    error,
    updateShelf,
    deleteShelf,
    removeBookFromShelf,
    addBookToShelf,
    refreshShelves,
  } = useShelves();
  const [editingShelfId, setEditingShelfId] = useState(null);
  const [editingShelfName, setEditingShelfName] = useState("");
  const [actionMessage, setActionMessage] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [showShelfModal, setShowShelfModal] = useState(false);
  const [showBookMenu, setShowBookMenu] = useState({}); // { bookId: true/false }
  const menuRefs = useRef({});

  // Listen for shelf updates
  useEffect(() => {
    const handleShelfUpdate = () => {
      refreshShelves();
    };
    window.addEventListener('shelfUpdated', handleShelfUpdate);
    return () => {
      window.removeEventListener('shelfUpdated', handleShelfUpdate);
    };
  }, [refreshShelves]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = Object.keys(menuRefs.current).every(
        (bookId) => !menuRefs.current[bookId]?.contains(event.target)
      );
      if (clickedOutside) {
        setShowBookMenu({});
      }
    };

    if (Object.keys(showBookMenu).some(key => showBookMenu[key])) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBookMenu]);

  const handleShelfRename = async (event) => {
    event.preventDefault();
    if (!editingShelfName.trim()) return;
    try {
      await updateShelf(editingShelfId, { name: editingShelfName.trim() });
      setEditingShelfId(null);
      setEditingShelfName("");
      setActionMessage("Shelf adı yeniləndi");
    } catch (err) {
      setActionMessage(err.message || "Shelf yenilənmədi");
    }
  };

  const startRename = (shelf) => {
    setEditingShelfId(shelf.id);
    setEditingShelfName(shelf.name);
  };

  // Sort shelves: Want to Read, Currently Reading, Read first, then others
  const sortedShelves = useMemo(() => {
    if (!shelves || shelves.length === 0) return [];
    
    const defaultShelves = [t("readingList.wantToRead"), t("readingList.currentlyReading"), t("readingList.read")];
    const defaultShelvesList = [];
    const customShelvesList = [];
    
    shelves.forEach(shelf => {
      const shelfName = shelf.name || "";
      if (defaultShelves.includes(shelfName)) {
        defaultShelvesList.push(shelf);
      } else {
        customShelvesList.push(shelf);
      }
    });
    
    // Sort default shelves in the specified order
    defaultShelvesList.sort((a, b) => {
      const aIndex = defaultShelves.indexOf(a.name);
      const bIndex = defaultShelves.indexOf(b.name);
      return aIndex - bIndex;
    });
    
    return [...defaultShelvesList, ...customShelvesList];
  }, [shelves]);

  const handleMoveBook = async (book, currentShelfId, targetShelfId) => {
    try {
      const targetShelf = shelves.find(s => s.id === targetShelfId);
      if (!targetShelf) {
        setActionMessage(t("readingList.shelfNotFound"));
        setTimeout(() => setActionMessage(null), 2500);
        return;
      }
      
      const bookId = book.id || book._id;
      
      // First, remove from current shelf
      if (currentShelfId) {
        await removeBookFromShelf(currentShelfId, bookId);
      }
      
      // Then, add to target shelf
      await addBookToShelf(targetShelfId, book);
      
      setActionMessage(`"${book.title}" ${t("readingList.bookMovedTo")} ${targetShelf.name}`);
      await refreshShelves();
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      setActionMessage(err.message || t("readingList.moveFailed"));
      setTimeout(() => setActionMessage(null), 2500);
    }
  };

  const handleDeleteBook = async (shelfId, bookId) => {
    try {
      await removeBookFromShelf(shelfId, bookId);
      const book = shelves.find(s => s.id === shelfId)?.books?.find(b => (b.id || b._id) === bookId);
      setActionMessage(`"${book?.title || t("shelfSelection.book")}" ${t("readingList.bookDeleted")}`);
      await refreshShelves();
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      setActionMessage(err.message || t("readingList.deleteFailed"));
      setTimeout(() => setActionMessage(null), 2500);
    }
  };

  const openMoveModal = (book, shelf) => {
    setSelectedBook(book);
    setSelectedShelf(shelf);
    setShowShelfModal(true);
    setShowBookMenu({});
  };

  const handleShelfSelect = async (targetShelfId) => {
    if (!selectedBook || !selectedShelf) return;
    
    await handleMoveBook(selectedBook, selectedShelf.id, targetShelfId);
  };

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

  const toggleBookMenu = (bookId) => {
    setShowBookMenu(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  return (
    <div className="max-w-7xl xl:max-w-[1600px] mx-auto px-4 xl:px-8 py-8 bg-white dark:bg-white min-h-screen">
      {/* Modern Header Section */}
      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 rounded-3xl -z-10 backdrop-blur-sm"></div>
        <div className="px-8 py-10 relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-1.5 h-16 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-lg"></div>
            <div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-tight">
                {t("readingList.title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-600 text-lg sm:text-xl mt-2 font-semibold">
                {t("readingList.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 text-sm text-amber-700 dark:text-amber-700 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 border border-amber-200 dark:border-amber-200 p-4 rounded-xl shadow-md">
          {actionMessage}
        </div>
      )}

      {loading && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-50 dark:to-gray-100 p-8 rounded-2xl text-center border-2 border-gray-200 dark:border-gray-200 shadow-lg">
          <div className="inline-flex items-center gap-3 text-gray-700 dark:text-gray-700">
            <div className="w-6 h-6 border-3 border-gray-300 dark:border-gray-300 border-t-amber-600 dark:border-t-amber-600 rounded-full animate-spin"></div>
            <span className="text-lg font-semibold">{t("readingList.loading")}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-50 dark:to-pink-50 border-2 border-red-200 dark:border-red-200 text-red-700 dark:text-red-700 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold text-lg mb-2">
                {/* Error mesajı artıq config.js-də kullanıcı dostu formata çevrilir */}
                {typeof error === 'string' 
                  ? (error.startsWith("error.") ? t(error) : error)
                  : (error?.translationKey 
                      ? (error.status ? t(error.translationKey).replace("{status}", error.status) : t(error.translationKey))
                      : (error?.message || t("error.default")))}
              </p>
              <p className="text-sm text-red-600 dark:text-red-600">
                {t("common.retry")}
              </p>
            </div>
            <button
              onClick={() => refreshShelves()}
              className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 whitespace-nowrap"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      )}

      {!loading && !error && sortedShelves.length === 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-50 dark:to-gray-100 p-12 text-center rounded-2xl border-2 border-gray-200 dark:border-gray-200 shadow-lg">
          <p className="text-gray-600 dark:text-gray-600 text-xl font-semibold">Hələ heç bir shelf yoxdur.</p>
        </div>
      )}

      <div className="space-y-10">
        {sortedShelves.map((shelf) => {
          const isWantToRead = shelf.name === t("readingList.wantToRead");
          
          return (
          <div key={shelf.id} className="bg-white dark:bg-white border-2 border-gray-100 dark:border-gray-200 rounded-3xl p-8 space-y-6 shadow-xl hover:shadow-2xl transition-all duration-500">
            {/* Shelf Header - Modern Design */}
            <div className="flex items-center justify-between pb-6 border-b-2 border-gray-100 dark:border-gray-200">
              {editingShelfId === shelf.id ? (
                <form className="flex gap-3 flex-1" onSubmit={handleShelfRename}>
                  <input
                    value={editingShelfName}
                    onChange={(e) => setEditingShelfName(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-gray-50 text-gray-900 dark:text-gray-900 rounded-xl px-4 py-3 text-base border-2 border-gray-200 dark:border-gray-200 focus:border-amber-400 dark:focus:border-amber-400 focus:outline-none transition-colors font-semibold"
                    autoFocus
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                    {t("common.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingShelfId(null)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-200 hover:bg-gray-300 dark:hover:bg-gray-300 text-gray-900 dark:text-gray-900 rounded-xl font-bold transition-all transform hover:scale-105"
                  >
                    {t("common.cancel")}
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-1.5 h-12 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-md"></div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-900 mb-1">{translateShelfName(shelf.name)}</h2>
                    <p className="text-gray-600 dark:text-gray-600 text-base font-semibold">
                      {shelf.books?.length || 0} {shelf.books?.length === 1 ? t("readingList.book") : t("readingList.books")}
                    </p>
                  </div>
                </div>
              )}
              {editingShelfId !== shelf.id && (
                <div className="flex gap-3">
                  <button
                    onClick={() => startRename(shelf)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 text-gray-900 dark:text-gray-900 text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    {t("readingList.refresh")}
                  </button>
                  {shelf.type !== "default" && (
                    <button
                      onClick={() => deleteShelf(shelf.id)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      Sil
                    </button>
                  )}
                </div>
              )}
            </div>

            {shelf.books?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-5 xl:gap-6">
                {shelf.books.map((book) => {
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
                      key={book.id}
                      className="bg-white dark:bg-white rounded-2xl p-4 flex flex-col gap-3 border-2 border-gray-100 dark:border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                    >
                      {/* Book Cover Image */}
                      <div className="aspect-[3/4] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 rounded-xl overflow-hidden mb-2 relative">
                        {coverImage ? (
                          <>
                            <img
                              src={coverImage}
                              alt={book.title || "Book cover"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-400">
                            <svg
                              className="w-16 h-16 opacity-40"
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
                          </div>
                        )}
                      </div>
                      
                      {/* Book Title */}
                      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-900 line-clamp-2 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-600 transition-colors">
                        {book.title}
                      </h3>
                      
                      {/* Rating Star - Always Visible */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-50 dark:to-amber-50 px-2.5 py-1 rounded-full border border-yellow-200 dark:border-yellow-200">
                          <span className="text-xs text-yellow-500">★</span>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-800 ml-1">
                            {rating > 0 ? rating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Book Options Menu */}
                      <div className="relative mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookMenu(book.id || book._id);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-100 dark:to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-200 dark:hover:to-gray-300 text-gray-900 dark:text-gray-900 text-xs font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <MoreVertical className="w-4 h-4" />
                          Options
                        </button>
                        
                        {showBookMenu[book.id || book._id] && (
                          <div 
                            ref={(el) => {
                              const bookId = book.id || book._id;
                              if (el) menuRefs.current[bookId] = el;
                              else delete menuRefs.current[bookId];
                            }}
                            className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-white rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-200 overflow-hidden z-10"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openMoveModal(book, shelf);
                              }}
                              className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-50 dark:hover:to-cyan-50 flex items-center gap-2 transition-all"
                            >
                              <Move className="w-4 h-4 text-blue-600 dark:text-blue-600" />
                              {t("readingList.moveToEllipsis")}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBook(shelf.id, book.id || book._id);
                                setShowBookMenu({});
                              }}
                              className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 dark:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-50 dark:hover:to-orange-50 flex items-center gap-2 transition-all border-t border-gray-100 dark:border-gray-100"
                            >
                              <Trash2 className="w-4 h-4" />
                              {t("readingList.delete")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-50 dark:to-gray-100 rounded-2xl border-2 border-gray-200 dark:border-gray-200">
                <p className="text-gray-600 dark:text-gray-600 text-base font-semibold">
                  {t("readingList.emptyShelf")}
                </p>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Shelf Selection Modal */}
      <ShelfSelectionModal
        isOpen={showShelfModal}
        onClose={() => {
          setShowShelfModal(false);
          setSelectedBook(null);
          setSelectedShelf(null);
        }}
        book={selectedBook}
        mode="move"
        currentShelfId={selectedShelf?.id}
        onSelect={handleShelfSelect}
      />
    </div>
  );
}
