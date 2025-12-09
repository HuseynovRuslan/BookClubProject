import { useState, useMemo, useEffect } from "react";
import { useShelves } from "../context/ShelvesContext.jsx";
import { updateBookStatus } from "../api/books";
import BookCard from "./BookCard";

export default function ReadingListPage() {
  const {
    shelves,
    loading,
    error,
    updateShelf,
    deleteShelf,
    removeBookFromShelf,
    refreshShelves,
  } = useShelves();
  const [editingShelfId, setEditingShelfId] = useState(null);
  const [editingShelfName, setEditingShelfName] = useState("");
  const [actionMessage, setActionMessage] = useState(null);

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
    
    const defaultShelves = ["Want to Read", "Currently Reading", "Read"];
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

  const handleMoveBook = async (book, targetShelfName) => {
    try {
      const bookId = book.id || book._id;
      await updateBookStatus(bookId, targetShelfName);
      setActionMessage(`"${book.title}" ${targetShelfName} siyahısına köçürüldü`);
      // Refresh shelves
      await refreshShelves();
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err) {
      setActionMessage(err.message || "Kitab köçürmək alınmadı");
      setTimeout(() => setActionMessage(null), 2500);
    }
  };

  return (
    <div className="max-w-7xl xl:max-w-[1600px] mx-auto px-4 xl:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">Reading Shelves</h1>
      </div>

      {actionMessage && (
        <div className="mb-4 text-sm text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/40 p-3 rounded">
          {actionMessage}
        </div>
      )}

      {loading && (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded text-center text-gray-700 dark:text-gray-300">
          Shelflər yüklənir...
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 p-4 rounded">
          {error}
        </div>
      )}

      {!loading && !error && sortedShelves.length === 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 p-8 text-center rounded text-gray-600 dark:text-gray-400">
          Hələ heç bir shelf yoxdur.
        </div>
      )}

      <div className="space-y-8">
        {sortedShelves.map((shelf) => {
          const isWantToRead = shelf.name === "Want to Read";
          
          return (
          <div key={shelf.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              {editingShelfId === shelf.id ? (
                <form className="flex gap-2" onSubmit={handleShelfRename}>
                  <input
                    value={editingShelfName}
                    onChange={(e) => setEditingShelfName(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 text-sm border border-gray-300 dark:border-gray-600"
                  />
                  <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
                    Saxla
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingShelfId(null)}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                  >
                    Ləğv et
                  </button>
                </form>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{shelf.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {shelf.books?.length || 0} kitab
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => startRename(shelf)}
                  className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  Yenilə
                </button>
                {shelf.type !== "default" && (
                  <button
                    onClick={() => deleteShelf(shelf.id)}
                    className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    Sil
                  </button>
                )}
              </div>
            </div>

            {shelf.books?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 xl:gap-6">
                {shelf.books.map((book) => (
                  <div
                    key={book.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex flex-col gap-2"
                  >
                    <BookCard
                      book={book}
                      onClick={() => {}}
                      enableShelfControls={false}
                    />
                    {isWantToRead ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleMoveBook(book, "Currently Reading")}
                          className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          Currently Reading
                        </button>
                        <button
                          onClick={() => handleMoveBook(book, "Read")}
                          className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          Read
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => removeBookFromShelf(shelf.id, book.id)}
                        className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Bu shelf boşdur. Home Page və ya All Books-dan kitab əlavə edə
                bilərsən.
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
