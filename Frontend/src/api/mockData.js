import mockBooks from "../components/mockBooks";

const SHELVES_KEY = "bookverse_mock_shelves";
const REVIEWS_KEY = "bookverse_mock_reviews";

const DEFAULT_SHELVES = [
  { id: "shelf-want", name: "Want to Read", type: "default" },
  { id: "shelf-current", name: "Currently Reading", type: "default" },
  { id: "shelf-read", name: "Read", type: "default" },
];

const DEFAULT_REVIEWS = [
  {
    id: "review-1",
    bookId: mockBooks[0]?.id ?? "1",
    rating: 5,
    text: "Absolutely loved this read! Mock review for demo purposes.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "review-2",
    bookId: mockBooks[1]?.id ?? "2",
    rating: 4,
    text: "Great pacing and characters. Can't wait to discuss it with friends.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getBookSummaryById(bookId) {
  const book =
    mockBooks.find(
      (b) => String(b.id) === String(bookId) || String(b._id) === String(bookId)
    ) || mockBooks[0];
  if (!book) {
    return null;
  }
  return {
    id: book.id || book._id,
    title: book.title,
    author: book.author || "Unknown",
    coverImage:
      book.coverImage || book.cover || book.coverUrl || "/default-book-cover.png",
    description: book.description || "",
  };
}

function readFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function loadMockShelves() {
  const stored = readFromStorage(SHELVES_KEY, null);
  if (stored && Array.isArray(stored) && stored.length) {
    return stored;
  }

  // Boş shelf'ler oluştur (demo kitap yok)
  const emptyShelves = DEFAULT_SHELVES.map((shelf) => ({
    ...shelf,
    books: [],
  }));

  writeToStorage(SHELVES_KEY, emptyShelves);
  return emptyShelves;
}

export function saveMockShelves(next) {
  writeToStorage(SHELVES_KEY, next);
  return next;
}

export function loadMockReviews() {
  const stored = readFromStorage(REVIEWS_KEY, null);
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  // Boş array döndür (demo review yok)
  writeToStorage(REVIEWS_KEY, []);
  return [];
}

export function saveMockReviews(next) {
  writeToStorage(REVIEWS_KEY, next);
  return next;
}

export function withBookDetails(review) {
  return {
    ...review,
    book: getBookSummaryById(review.bookId),
  };
}

export function ensureReviewHasBook(review) {
  if (review.book) {
    return review;
  }
  return withBookDetails(review);
}

export function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}


