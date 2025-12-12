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

const ShelvesContext = createContext(null);

export function ShelvesProvider({ children }) {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShelves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // getMyShelves already returns normalized array
      const shelvesArray = await getMyShelves();
      setShelves(Array.isArray(shelvesArray) ? shelvesArray : []);
    } catch (err) {
      console.error("Failed to fetch shelves:", err);
      
      // Check if it's a network error (connection refused, failed to fetch, etc.)
      const isNetworkError = 
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("ERR_CONNECTION_REFUSED") ||
        err.message?.includes("NetworkError") ||
        err.name === "TypeError" ||
        !err.status;
      
      if (isNetworkError) {
        setError("Backend server ilə əlaqə qurula bilmədi. Zəhmət olmasa backend serverin işlədiyini yoxlayın.");
      } else {
        setError(err.message || "Shelflər yüklənə bilmədi");
      }
      
      // Don't clear shelves on error - keep previous data if available
      // This prevents the page from showing empty state when backend is temporarily unavailable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShelves();
  }, [fetchShelves]);

  // Listen for shelf update events
  useEffect(() => {
    const handleShelfUpdate = () => {
      fetchShelves();
    };
    window.addEventListener('shelfUpdated', handleShelfUpdate);
    return () => {
      window.removeEventListener('shelfUpdated', handleShelfUpdate);
    };
  }, [fetchShelves]);

  const createShelf = useCallback(
    async (payload) => {
      const shelf = await apiCreateShelf(payload);
      setShelves((prev) => [...prev, shelf]);
      return shelf;
    },
    []
  );

  const updateShelf = useCallback(async (id, payload) => {
    const updated = await apiUpdateShelf(id, payload);
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
    // Backend returns 204 NoContent, so we refresh shelves to get updated data
    // or we can optimistically update the shelf
    await fetchShelves(); // Refresh shelves to get updated data
    // Return success indicator
    return { id: shelfId, bookId: book?.id || book?._id };
  }, [fetchShelves]);

  const removeBookFromShelf = useCallback(async (shelfId, bookId) => {
    await apiRemoveBookFromShelf(shelfId, bookId);
    // Backend returns 204 NoContent, so we refresh shelves to get updated data
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


