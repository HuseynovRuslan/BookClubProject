// Formatting helpers shared by the Bookla 2.0 application screens.

// default=false: a 404 instead of a blank 1×1 image when Open Library has no cover, so the
// typographic cover is shown.
export const openLibraryCover = (isbn) =>
  isbn ? `https://covers.openlibrary.org/b/isbn/${isbn.replace(/[-\s]/g, '')}-M.jpg?default=false` : null;

export const bookAuthor = (book) => book?.authorName || book?.author?.name || book?.author || '';
export const bookGenre = (book) => book?.genres?.[0]?.name || book?.genreName || '';

export const formatRating = (value) => (value > 0 ? Number(value).toFixed(1) : null);

export const displayName = (person) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(' ') || person?.username || person?.userName || 'Oxucu';

// "5 dəqiqə əvvəl", "dünən", "9 okt 2026".
export const timeAgo = (date) => {
  if (!date) return '';
  const then = new Date(date);
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);
  if (seconds < 60) return 'indicə';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dəqiqə əvvəl`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat əvvəl`;
  if (seconds < 172800) return 'dünən';
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün əvvəl`;
  return formatDate(then);
};

const months = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'];
export const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// Azerbaijani names for the three default shelves the API creates for every user.
export const shelfLabels = { 'Want to Read': 'Oxumaq istəyirəm', 'Currently Reading': 'Hazırda oxuyuram', Read: 'Oxudum' };
export const shelfName = (name) => shelfLabels[name] || name;
