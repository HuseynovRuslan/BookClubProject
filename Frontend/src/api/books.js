import { apiRequest, USE_API_MOCKS, delay } from "./config";
import mockBooks from "../components/mockBooks";
import { loadCreatedBooks, saveCreatedBook } from "./mockStorage";

export async function getAllBooks({ page = 1, pageSize = 20, query } = {}) {
  if (USE_API_MOCKS) {
    await delay(300);
    const createdBooks = loadCreatedBooks();
    let allBooks = [...mockBooks, ...createdBooks];
    
    // Filter by query if provided
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      allBooks = allBooks.filter((book) => {
        const titleMatch = book.title?.toLowerCase().includes(searchTerm);
        const authorMatch = book.author?.toLowerCase().includes(searchTerm) || 
                           book.authorName?.toLowerCase().includes(searchTerm);
        const genreMatch = Array.isArray(book.genre)
          ? book.genre.some((g) => (g.name || g).toLowerCase().includes(searchTerm))
          : (book.genre?.name || book.genre || "").toLowerCase().includes(searchTerm);
        return titleMatch || authorMatch || genreMatch;
      });
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = allBooks.slice(start, end);
    return {
      items,
      total: allBooks.length,
      page,
      pageSize,
    };
  }
  const params = new URLSearchParams();
  if (page) params.append("PageNumber", page);
  if (pageSize) params.append("PageSize", pageSize);
  if (query && query.trim()) params.append("Query", query.trim());
  return apiRequest(`/api/Books/get-all-books?${params.toString()}`, { method: "GET" });
}

export async function getBookById(id) {
  if (USE_API_MOCKS) {
    await delay(150);
    const createdBooks = loadCreatedBooks();
    const allBooks = [...mockBooks, ...createdBooks];
    const book =
      allBooks.find(
        (b) => String(b.id) === String(id) || String(b._id) === String(id)
      ) || null;
    if (!book) {
      throw new Error("Book not found (mock)");
    }
    return book;
  }
  // Backend ApiResponse<BookDetailDto> qaytarır: { isSuccess, message, data: { ... } }
  const response = await apiRequest(`/api/Books/get-book-by-id/${encodeURIComponent(id)}`, { method: "GET" });
  // ApiResponse wrapper-dan data-nı çıxar
  // Handle both ApiResponse format (data property) and direct object
  const bookData = response?.data || response?.Data || response;
  
  // Normalize Author object to string if needed (for backward compatibility)
  if (bookData && bookData.author && typeof bookData.author === 'object') {
    bookData.authorName = bookData.author.name || bookData.author.Name || bookData.authorName;
  } else if (bookData && bookData.Author && typeof bookData.Author === 'object') {
    bookData.authorName = bookData.Author.name || bookData.Author.Name || bookData.authorName;
  }
  
  return bookData;
}

export async function updateBookStatus(bookId, targetShelfName) {
  if (USE_API_MOCKS) {
    await delay(150);
    return { id: bookId, status: targetShelfName, updatedAt: new Date().toISOString() };
  }
  // Backend expects targetShelfName as query parameter
  const params = new URLSearchParams();
  if (targetShelfName) {
    params.append("targetShelfName", targetShelfName);
  }
  return apiRequest(`/api/Books/${encodeURIComponent(bookId)}/status?${params.toString()}`, {
    method: "POST",
  });
}

export async function createBook(bookData) {
  if (USE_API_MOCKS) {
    await delay(200);
    const newBook = {
      ...bookData,
      id: bookData.id || `book-${Date.now()}`,
      rating: bookData.rating || 0,
      reviews: bookData.reviews || [],
      createdAt: new Date().toISOString(),
    };
    saveCreatedBook(newBook);
    return newBook;
  }
  return apiRequest("/api/Books/create-book", {
    method: "POST",
    body: bookData,
  });
}

export async function addGenresToBook(bookId, genreIds) {
  if (USE_API_MOCKS) {
    await delay(200);
    return { bookId, genreIds, message: "Genres added (mock)" };
  }
  // Backend expects a JSON array directly (List<string> GenreIds)
  // The endpoint signature is: AddGenresToBook(string bookId, [FromBody] List<string> GenreIds)
  const genreIdsArray = Array.isArray(genreIds) ? genreIds : [genreIds];
  return apiRequest(`/api/Books/${encodeURIComponent(bookId)}/genres`, {
    method: "POST",
    body: JSON.stringify(genreIdsArray),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function removeGenreFromBook(bookId, genreId) {
  if (USE_API_MOCKS) {
    await delay(200);
    return { bookId, genreId, message: "Genre removed (mock)" };
  }
  return apiRequest(
    `/api/Books/${encodeURIComponent(bookId)}/genres/${encodeURIComponent(genreId)}`,
    {
      method: "DELETE",
    }
  );
}

export async function getBooksByGenre(genreName, { page = 1, pageSize = 20 } = {}) {
  if (USE_API_MOCKS) {
    await delay(300);
    const createdBooks = loadCreatedBooks();
    const allBooks = [...mockBooks, ...createdBooks];
    const filteredBooks = allBooks.filter((book) => {
      const genres = book.genre
        ? Array.isArray(book.genre)
          ? book.genre
          : [book.genre]
        : [];
      return genres.some((g) => {
        const genreNameToMatch = (g.name || g || "").toLowerCase();
        const searchName = (genreName || "").toLowerCase();
        return genreNameToMatch === searchName || genreNameToMatch.includes(searchName);
      });
    });
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filteredBooks.slice(start, end);
    return {
      items,
      total: filteredBooks.length,
      page,
      pageSize,
    };
  }
  const params = new URLSearchParams();
  if (genreName) params.append("Query", genreName);
  if (page) params.append("PageNumber", page);
  if (pageSize) params.append("PageSize", pageSize);
  return apiRequest(`/api/Books/by-genre?${params.toString()}`, { method: "GET" });
}


