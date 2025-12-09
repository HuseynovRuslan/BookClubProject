import { apiRequest, USE_API_MOCKS, delay } from "./config";
import {
  loadMockShelves,
  saveMockShelves,
  generateId,
  getBookSummaryById,
} from "./mockData";

function normalizeBookInput(bookOrId) {
  if (!bookOrId) {
    return null;
  }
  if (typeof bookOrId === "object") {
    return {
      id: bookOrId.id || bookOrId._id,
      title: bookOrId.title,
      author: bookOrId.author || "Unknown",
      coverImage:
        bookOrId.coverImage ||
        bookOrId.cover ||
        bookOrId.coverUrl ||
        "/default-book-cover.png",
      description: bookOrId.description || "",
    };
  }
  return getBookSummaryById(bookOrId);
}

export async function getShelfById(id) {
  if (USE_API_MOCKS) {
    await delay(150);
    const shelf = loadMockShelves().find((s) => s.id === id);
    if (!shelf) {
      throw new Error("Shelf not found");
    }
    return shelf;
  }
  return apiRequest(`/api/Shelves/get-shelf-by-id/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createShelf(payload) {
  if (USE_API_MOCKS) {
    await delay(200);
    const shelves = loadMockShelves();
    const newShelf = {
      id: generateId("shelf"),
      name: payload.name?.trim() || "New Shelf",
      description: payload.description || "",
      type: "custom",
      books: [],
    };
    const next = [...shelves, newShelf];
    saveMockShelves(next);
    return newShelf;
  }
  return apiRequest("/api/Shelves/create-shelf", {
    method: "POST",
    body: payload,
  });
}

export async function updateShelf(id, payload) {
  if (USE_API_MOCKS) {
    await delay(200);
    const shelves = loadMockShelves();
    const next = shelves.map((shelf) =>
      shelf.id === id
        ? {
          ...shelf,
          name: payload.name ?? shelf.name,
          description: payload.description ?? shelf.description,
        }
        : shelf
    );
    saveMockShelves(next);
    return next.find((shelf) => shelf.id === id);
  }
  return apiRequest("/api/Shelves/update-shelf", {
    method: "PUT",
    body: payload,
  });
}

export async function deleteShelf(id) {
  if (USE_API_MOCKS) {
    await delay(150);
    const shelves = loadMockShelves();
    const target = shelves.find((shelf) => shelf.id === id);
    if (!target) {
      throw new Error("Shelf not found");
    }
    if (target.type === "default") {
      throw new Error("Default shelves cannot be deleted");
    }
    const next = shelves.filter((shelf) => shelf.id !== id);
    saveMockShelves(next);
    return { id };
  }
  return apiRequest(`/api/Shelves/delete-shelf/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function addBookToShelf(shelfId, bookOrId) {
  if (USE_API_MOCKS) {
    await delay(200);
    const shelves = loadMockShelves();
    const idx = shelves.findIndex((shelf) => shelf.id === shelfId);
    if (idx === -1) {
      throw new Error("Shelf not found");
    }
    const book = normalizeBookInput(bookOrId);
    if (!book) {
      throw new Error("Book not found");
    }
    const alreadyExists = shelves[idx].books.some(
      (b) => String(b.id) === String(book.id)
    );
    if (!alreadyExists) {
      shelves[idx].books.unshift({
        ...book,
        addedAt: new Date().toISOString(),
      });
    }
    saveMockShelves([...shelves]);
    return shelves[idx];
  }
  const bookId = typeof bookOrId === "object" ? (bookOrId?.id || bookOrId?._id) : bookOrId;
  if (!bookId) {
    throw new Error("Book ID is required");
  }
  if (!shelfId) {
    throw new Error("Shelf ID is required");
  }
  // Backend returns 204 NoContent, so we return the shelfId and bookId for success
  await apiRequest(`/api/Shelves/add-book-to-shelf/${encodeURIComponent(shelfId)}/books/${encodeURIComponent(bookId)}`, {
    method: "POST",
  });
  // Return a simple success object since backend returns 204
  return { id: shelfId, bookId };
}

export async function removeBookFromShelf(shelfId, bookId) {
  if (USE_API_MOCKS) {
    await delay(150);
    const shelves = loadMockShelves();
    const idx = shelves.findIndex((shelf) => shelf.id === shelfId);
    if (idx === -1) {
      throw new Error("Shelf not found");
    }
    shelves[idx].books = shelves[idx].books.filter(
      (book) => String(book.id) !== String(bookId)
    );
    saveMockShelves([...shelves]);
    return shelves[idx];
  }
  if (!shelfId || !bookId) {
    throw new Error("Shelf ID and Book ID are required");
  }
  // Backend returns 204 NoContent, so we return success indicator
  await apiRequest(
    `/api/Shelves/remove-book-from-shelf/${encodeURIComponent(shelfId)}/books/${encodeURIComponent(bookId)}`,
    {
      method: "DELETE",
    }
  );
  return { id: shelfId, bookId };
}

