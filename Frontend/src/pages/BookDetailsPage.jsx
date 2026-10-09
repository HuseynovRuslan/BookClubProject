import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBookById, updateBookStatus } from '../api/books';
import { getUserShelves, addBookToShelf } from '../api/shelves';
import { useAuth } from '../context/AuthContext';
import ReviewSection from '../components/ReviewSection';
import { BookCover, Button, ButtonLink, Dialog, Eyebrow, Icon, Tabs } from '../components/app/ui';
import { bookAuthor, bookGenre, formatDate, formatRating, shelfName } from '../components/app/format';
import '../styles/app/books.css';

// Real API names of the three default shelves (the reading statuses); shown via shelfName().
const defaultShelfNames = ['Want to Read', 'Currently Reading', 'Read'];
const isDefaultShelf = (shelf) => shelf.isDefault === true || defaultShelfNames.includes(shelf.name);

const sortShelves = (list) =>
  [...list].sort((a, b) => {
    const aIsDefault = isDefaultShelf(a);
    const bIsDefault = isDefaultShelf(b);

    if (aIsDefault && !bIsDefault) return -1;
    if (!aIsDefault && bIsDefault) return 1;

    if (aIsDefault && bIsDefault) {
      const aIndex = defaultShelfNames.indexOf(a.name);
      const bIndex = defaultShelfNames.indexOf(b.name);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
    }

    return a.name.localeCompare(b.name);
  });

const normalizeShelves = (shelvesData) => {
  if (Array.isArray(shelvesData)) return shelvesData;
  if (Array.isArray(shelvesData?.items)) return shelvesData.items;
  if (Array.isArray(shelvesData?.data)) return shelvesData.data;
  return [];
};

const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('az');

// Language codes the API may store, shown by name; anything else is shown as stored.
const languageNames = { az: 'Azərbaycan dili', en: 'İngilis dili', ru: 'Rus dili', tr: 'Türk dili', de: 'Alman dili', fr: 'Fransız dili' };

const TABS = [
  { value: 'about', label: 'Kitab haqqında' },
  { value: 'reviews', label: 'Oxucu rəyləri' },
];

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shelves, setShelves] = useState([]);
  const [loadingShelves, setLoadingShelves] = useState(false);
  const [showShelfDropdown, setShowShelfDropdown] = useState(false);
  const [addingToShelf, setAddingToShelf] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviewStats, setReviewStats] = useState(null);

  const fetchBookDetails = useCallback(async () => {
    try {
      setLoading(true);
      const bookData = await getBookById(id);
      setBook(bookData);
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast.error('Kitab məlumatları yüklənmədi');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBookDetails();
    setReviewStats(null);
  }, [fetchBookDetails]);

  // The user's shelves (with their books) tell which status and shelves this book already has.
  const loadShelves = useCallback(async ({ silent = false } = {}) => {
    try {
      const shelvesData = await getUserShelves();
      setShelves(normalizeShelves(shelvesData));
      return true;
    } catch (error) {
      console.error('Error fetching shelves:', error);
      if (!silent) toast.error('Rəflər yüklənmədi. Yenidən cəhd et.');
      return false;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadShelves({ silent: true });
  }, [isAuthenticated, loadShelves]);

  const fetchUserShelves = async () => {
    if (!isAuthenticated) {
      toast.info('Rəflərə kitab əlavə etmək üçün daxil ol');
      navigate('/login');
      return;
    }

    setLoadingShelves(true);
    const loaded = await loadShelves();
    setLoadingShelves(false);
    if (loaded) setShowShelfDropdown(true);
  };

  const bookIsIn = (shelf) => (shelf.books || []).some((item) => String(item?.id ?? item?.bookId) === String(id));

  // Mirror the server: a status moves the book out of the other default shelves into the target one.
  const applyStatusLocally = (statusName) =>
    setShelves((prev) =>
      prev.map((shelf) => {
        if (!isDefaultShelf(shelf)) return shelf;
        const others = (shelf.books || []).filter((item) => String(item?.id ?? item?.bookId) !== String(id));
        const books = shelf.name === statusName ? [...others, { ...book, id }] : others;
        return { ...shelf, books, bookCount: books.length };
      }),
    );

  const handleUpdateBookStatus = async (statusName) => {
    if (!isAuthenticated) {
      toast.info('Oxu statusunu dəyişmək üçün daxil ol');
      navigate('/login');
      return;
    }

    try {
      setUpdatingStatus(true);
      await updateBookStatus(id, statusName);
      applyStatusLocally(statusName);
      toast.success(`Oxu statusu: “${shelfName(statusName)}”`);
      setShowShelfDropdown(false);
    } catch (error) {
      console.error('Error updating book status:', error);
      const errorMessage =
        error.response?.data?.errors?.[0]?.description ||
        error.response?.data?.message ||
        'Oxu statusunu yeniləmək alınmadı';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleShelfClick = async (shelf) => {
    if (isDefaultShelf(shelf)) {
      await handleUpdateBookStatus(shelf.name);
      setShowShelfDropdown(false);
      return;
    }

    await handleAddToShelf(shelf.id, shelf.name);
  };

  const handleAddToShelf = async (shelfId, shelfLabel) => {
    try {
      setAddingToShelf(true);
      await addBookToShelf(shelfId, id);
      setShelves((prev) =>
        prev.map((shelf) =>
          shelf.id === shelfId && !bookIsIn(shelf)
            ? { ...shelf, books: [...(shelf.books || []), { ...book, id }], bookCount: (shelf.bookCount ?? (shelf.books || []).length) + 1 }
            : shelf,
        ),
      );
      toast.success(`“${shelfName(shelfLabel)}” rəfinə əlavə edildi`);
      setShowShelfDropdown(false);
    } catch (error) {
      console.error('Error adding book to shelf:', error);

      const status = error.response?.status;
      const errorData = error.response?.data;

      let errorMessage = 'Kitabı rəfə əlavə etmək alınmadı';

      if (status === 409) {
        // ProblemDetails carries the error code in `title`.
        const errorCode = errorData?.title || errorData?.errors?.[0]?.code || errorData?.errors?.[0]?.type;

        if (errorCode === 'Shelf.AlreadyAdded' || errorData?.errors?.[0]?.description?.includes('already')) {
          errorMessage = `Bu kitab artıq “${shelfName(shelfLabel)}” rəfindədir`;
        } else if (errorCode === 'Shelf.DefaultShelfAddDenied' || errorData?.errors?.[0]?.description?.includes('default')) {
          errorMessage = 'Standart rəflərə kitab birbaşa əlavə olunmur. Oxu statusundan istifadə et.';
        } else {
          errorMessage = errorData?.errors?.[0]?.description || errorData?.message || 'Kitab artıq bu rəfdədir';
        }
      } else if (status === 403) {
        errorMessage = 'Bu rəfi dəyişmək üçün icazən yoxdur';
      } else if (status === 404) {
        errorMessage = 'Rəf və ya kitab tapılmadı';
      } else {
        errorMessage = errorData?.errors?.[0]?.description || errorData?.message || 'Kitabı rəfə əlavə etmək alınmadı';
      }

      toast.error(errorMessage);
    } finally {
      setAddingToShelf(false);
    }
  };

  if (loading) {
    return (
      <div className="page detail-page">
        <div aria-label="Kitab yüklənir" aria-live="polite" className="detail-hero detail-loading" role="status">
          <div className="cover-stage">
            <i className="detail-skeleton-cover" />
          </div>
          <div className="detail-copy">
            <span className="detail-skeleton-line is-short" />
            <span className="detail-skeleton-line is-title" />
            <span className="detail-skeleton-line is-medium" />
            <span className="detail-skeleton-line" />
            <span className="detail-skeleton-line" />
            <span className="detail-skeleton-line is-medium" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  const author = book.author?.name || bookAuthor(book) || 'Müəllif məlum deyil';
  const hasAuthor = Boolean(book.author?.name || bookAuthor(book));
  const genre = bookGenre(book);
  const rating = formatRating(book.averageRating);
  const sortedShelves = sortShelves(shelves);
  const statusShelves = sortedShelves.filter(isDefaultShelf);
  const customShelves = sortedShelves.filter((shelf) => !isDefaultShelf(shelf));
  const currentStatus = statusShelves.find(bookIsIn)?.name || '';
  const shelvesWithBook = customShelves.filter(bookIsIn);
  const busy = addingToShelf || updatingStatus;

  const facts = [
    book.publisher && { label: 'Nəşriyyat', value: book.publisher },
    book.pageCount > 0 && { label: 'Səhifə sayı', value: book.pageCount },
    book.language && { label: 'Dil', value: languageNames[book.language.toLowerCase()] || book.language },
    book.publicationDate && { label: 'Nəşr tarixi', value: formatDate(book.publicationDate) },
    (book.isbn || book.ISBN) && { label: 'ISBN', value: book.isbn || book.ISBN, mono: true },
  ].filter(Boolean);

  return (
    <div className="page detail-page">
      <Link className="back-link" to="/books">
        ← Kitablara qayıt
      </Link>

      <section aria-labelledby="book-title" className="detail-hero">
        <div className="cover-stage">
          <BookCover book={book} large />
        </div>
        <div className="detail-copy">
          {genre && <Eyebrow>{genre}</Eyebrow>}
          <h1 id="book-title">{book.title}</h1>
          <p className="author-link author-name">{author}</p>
          <div className="rating-line">
            <span className="rating">
              <Icon name="star" /> {rating || 'Yeni'}
              {rating && <span className="sr-only"> ulduz orta qiymət</span>}
            </span>
            <span>{book.ratingCount ?? 0} qiymətləndirmə</span>
            {reviewStats && <span>{reviewStats.count} rəy</span>}
          </div>
          {book.description && <p className="lead">{book.description}</p>}
          {book.genres?.length > 0 && (
            <ul aria-label="Janrlar" className="genre-list">
              {book.genres.map((item, index) => (
                <li key={item.id || index}>{item.name || item}</li>
              ))}
            </ul>
          )}

          {isAuthenticated && (
            <>
              <div className="detail-actions">
                <label>
                  <span>Oxu statusu</span>
                  <select
                    disabled={busy}
                    onChange={(event) => event.target.value && handleUpdateBookStatus(event.target.value)}
                    value={currentStatus}
                  >
                    <option disabled value="">
                      Status seç
                    </option>
                    {defaultShelfNames.map((name) => (
                      <option key={name} value={name}>
                        {shelfName(name)}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  aria-haspopup="dialog"
                  disabled={busy || loadingShelves}
                  onClick={fetchUserShelves}
                  variant="terracotta"
                >
                  <Icon name="plus" /> {loadingShelves ? 'Yüklənir...' : 'Rəfə əlavə et'}
                </Button>
              </div>
              {shelvesWithBook.length > 0 && (
                <p className="shelf-note">
                  Rəflərində:{' '}
                  {shelvesWithBook.map((shelf, index) => (
                    <span key={shelf.id}>
                      {index > 0 && ', '}
                      <Link to={`/shelves/${shelf.id}`}>{shelfName(shelf.name)}</Link>
                    </span>
                  ))}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <section className="detail-content">
        <div>
          <Tabs active={activeTab} label="Kitab bölmələri" onChange={setActiveTab} tabs={TABS} />
          <div aria-label="Kitab haqqında" hidden={activeTab !== 'about'} role="tabpanel">
            <div className="prose">
              <h2>Kitab haqqında</h2>
              {book.description ? (
                <p className="prose-text">{book.description}</p>
              ) : (
                <p>Bu kitab üçün hələ təsvir əlavə olunmayıb.</p>
              )}
              {facts.length > 0 && (
                <dl className="book-facts">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd className={fact.mono ? 'is-mono' : ''}>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
          <div aria-label="Oxucu rəyləri" hidden={activeTab !== 'reviews'} role="tabpanel">
            <h2 className="sr-only">Oxucu rəyləri</h2>
            <ReviewSection bookId={id} onStatsChange={setReviewStats} />
          </div>
        </div>

        {hasAuthor && (
          <aside aria-labelledby="author-card-title" className="author-card">
            <Eyebrow>MÜƏLLİF HAQQINDA</Eyebrow>
            <div className="author-line">
              <div aria-hidden="true" className="author-monogram">
                {initialsOf(author)}
              </div>
              <div>
                <h3 id="author-card-title">{author}</h3>
                <span>{book.author?.bookCount > 0 ? `${book.author.bookCount} kitab` : 'Müəllif'}</span>
              </div>
            </div>
            {book.author?.bio && <p>{book.author.bio}</p>}
            <ButtonLink to={`/books?search=${encodeURIComponent(author)}`} variant="secondary">
              Müəllifin kitabları
            </ButtonLink>
          </aside>
        )}
      </section>

      {/* Shelf picker */}
      {showShelfDropdown && (
        <Dialog className="shelf-picker" labelledBy="shelf-picker-title" onClose={() => setShowShelfDropdown(false)}>
          <Eyebrow>RƏFƏ ƏLAVƏ ET</Eyebrow>
          <h2 id="shelf-picker-title">Rəf seç</h2>
          <p>“{book.title}” kitabını oxu statusuna və ya öz rəflərinə əlavə et.</p>

          {shelves.length === 0 ? (
            <div className="shelf-picker-empty">
              <p>Hələ rəfin yoxdur. Kitab əlavə etmək üçün əvvəlcə rəf yarat.</p>
              <ButtonLink to="/my-shelves" variant="secondary">
                Rəflərimə keç
              </ButtonLink>
            </div>
          ) : (
            <>
              {statusShelves.length > 0 && (
                <ShelfGroup busy={busy} isIn={bookIsIn} onPick={handleShelfClick} shelves={statusShelves} title="Oxu statusu" />
              )}
              <ShelfGroup busy={busy} isIn={bookIsIn} onPick={handleShelfClick} shelves={customShelves} title="Mənim rəflərim">
                <p className="shelf-picker-hint">
                  Hələ öz rəfin yoxdur. <Link to="/my-shelves">Kitab rəflərim</Link> səhifəsində yarada bilərsən.
                </p>
              </ShelfGroup>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
};

// One group of shelves in the picker; the shelves that already hold the book are marked and disabled.
const ShelfGroup = ({ title, shelves, isIn, busy, onPick, children }) => (
  <div className="shelf-group">
    <h3>{title}</h3>
    {shelves.length === 0 ? (
      children
    ) : (
      <ul>
        {shelves.map((shelf) => {
          const added = isIn(shelf);
          const isStatus = isDefaultShelf(shelf);
          return (
            <li key={shelf.id}>
              <button
                className={`shelf-option ${added ? 'is-added' : ''}`}
                disabled={busy || added}
                onClick={() => onPick(shelf)}
                type="button"
              >
                <span aria-hidden="true" className="shelf-option-icon">
                  <Icon name={added ? 'check' : isStatus ? 'book' : 'plus'} size={16} />
                </span>
                <span className="shelf-option-text">
                  <strong>{shelfName(shelf.name)}</strong>
                  {shelf.bookCount !== undefined && <small>{shelf.bookCount} kitab</small>}
                </span>
                {added && <em>{isStatus ? 'Cari status' : 'Bu rəfdədir'}</em>}
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

export default BookDetailsPage;
