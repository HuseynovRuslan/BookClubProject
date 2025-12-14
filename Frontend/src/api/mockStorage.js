const MOCK_USER_KEY = "bookverse_mock_user";
const MOCK_BOOKS_KEY = "bookverse_mock_created_books";

const DEFAULT_MOCK_ACCOUNT = {
  id: "mock-user",
  name: "Demo Reader",
  surname: "",
  email: "demo@bookverse.com",
  password: "password123",
  role: "reader",
  bio: "",
};

export function loadMockAccount() {
  try {
    const raw = localStorage.getItem(MOCK_USER_KEY);
    return raw ? JSON.parse(raw) : { ...DEFAULT_MOCK_ACCOUNT };
  } catch {
    return { ...DEFAULT_MOCK_ACCOUNT };
  }
}

export function saveMockAccount(account) {
  try {
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(account));
  } catch {
  }
}

export function clearMockAccount() {
  try {
    localStorage.removeItem(MOCK_USER_KEY);
  } catch {
  }
}

export function loadCreatedBooks() {
  try {
    const raw = localStorage.getItem(MOCK_BOOKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCreatedBook(book) {
  try {
    const existing = loadCreatedBooks();
    const updated = [...existing, book];
    localStorage.setItem(MOCK_BOOKS_KEY, JSON.stringify(updated));
    return book;
  } catch {
    return book;
  }
}


