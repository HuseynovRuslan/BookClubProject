import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createShelf as apiCreateShelf,
  updateShelf as apiUpdateShelf,
  deleteShelf as apiDeleteShelf,
  addBookToShelf as apiAddBookToShelf,
  removeBookFromShelf as apiRemoveBookFromShelf,
} from "../api/shelves";
import { getMyShelves } from "../api/users";
import { useAuth } from "./AuthContext";
import { getAccessToken } from "../api/config";

const ShelvesContext = createContext(null);

export function ShelvesProvider({ children }) {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, initializing } = useAuth();

  const fetchShelves = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !isAuthenticated) {
      setLoading(false);
      setShelves([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const shelvesArray = await getMyShelves();
      setShelves(Array.isArray(shelvesArray) ? shelvesArray : []);
    } catch (err) {
      console.error("Failed to fetch shelves:", err);

      const isNetworkError =
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("ERR_CONNECTION_REFUSED") ||
        err.message?.includes("NetworkError") ||
        err.name === "TypeError" ||
        !err.status;


      if (isNetworkError) {
        const networkError = new Error("error.network");
        networkError.translationKey = "error.network";
        setError(networkError);
      } else {
        const errorMsg = err.translationKey || err.message || "error.default";
        const error = new Error(errorMsg);
        if (err.translationKey) {
          error.translationKey = err.translationKey;
        }
        setError(error);
      }

    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (initializing) {
      return;
    }

    if (isAuthenticated && user) {
      fetchShelves();
    } else if (!isAuthenticated) {
      setShelves([]);
      setLoading(false);
      setError(null);
    }
  }, [fetchShelves, isAuthenticated, user, initializing]);

  useEffect(() => {
    const handleShelfUpdate = () => {
      fetchShelves();
    };
    window.addEventListener('shelfUpdated', handleShelfUpdate);
    return () => {
      window.removeEventListener('shelfUpdated', handleShelfUpdate);
    };
  }, [fetchShelves]);

  const normalizeShelf = (shelf) => {
    if (!shelf) return null;
    const isDefault = shelf.isDefault !== undefined ? shelf.isDefault : (shelf.IsDefault !== undefined ? shelf.IsDefault : false);
    return {
      ...shelf,
      id: shelf.id || shelf.Id,
      name: shelf.name || shelf.Name,
      isDefault: isDefault,
      type: isDefault ? 'default' : (shelf.type || shelf.Type || 'custom'),
      books: (shelf.books || shelf.Books || []).map(b => ({
        ...b,
        id: b.id || b.Id || b._id,
        title: b.title || b.Title
      })),
      bookCount: shelf.bookCount || shelf.BookCount || (shelf.books || shelf.Books || []).length
    };
  };

  const createShelf = useCallback(
    async (payload) => {
      const rawShelf = await apiCreateShelf(payload);
      const shelf = normalizeShelf(rawShelf);
      setShelves((prev) => [...prev, shelf]);
      return shelf;
    },
    []
  );

  const updateShelf = useCallback(async (id, payload) => {
    const rawUpdated = await apiUpdateShelf(id, payload);
    const updated = normalizeShelf(rawUpdated);
    setShelves((prev) =>
      prev.map((shelf) => (shelf.id === id ? updated : shelf))
    );
    return updated;
  }, []);

  const deleteShelf = useCallback(async (id) => {
    await apiDeleteShelf(id);
    setShelves((prev) => prev.filter((shelf) => shelf.id !== id));
  }, []);

  const addBookToShelf = useCallback(async (shelfId, book) => {
    await apiAddBookToShelf(shelfId, book);

    await fetchShelves();
    return { id: shelfId, bookId: book?.id || book?._id };
  }, [fetchShelves]);

  const removeBookFromShelf = useCallback(async (shelfId, bookId) => {
    await apiRemoveBookFromShelf(shelfId, bookId);
    await fetchShelves();
    return { id: shelfId, bookId };
  }, [fetchShelves]);

  const value = useMemo(
    () => ({
      shelves,
      loading,
      error,
      refreshShelves: fetchShelves,
      createShelf,
      updateShelf,
      deleteShelf,
      addBookToShelf,
      removeBookFromShelf,
    }),
    [
      shelves,
      loading,
      error,
      fetchShelves,
      createShelf,
      updateShelf,
      deleteShelf,
      addBookToShelf,
      removeBookFromShelf,
    ]
  );

  return (
    <ShelvesContext.Provider value={value}>{children}</ShelvesContext.Provider>
  );
}

export function useShelves() {
  const ctx = useContext(ShelvesContext);
  if (!ctx) {
    throw new Error("useShelves must be used inside ShelvesProvider");
  }
  return ctx;
}


