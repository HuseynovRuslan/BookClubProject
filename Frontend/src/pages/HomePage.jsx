import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReadingChallengeCard from '../components/ReadingChallengeCard';
import QuoteCard from '../components/QuoteCard';
import AddEditQuoteModal from '../components/AddEditQuoteModal';
import {
  Activity,
  Avatar,
  BookCard,
  BookCover,
  Button,
  ButtonLink,
  Dialog,
  EmptyState,
  Eyebrow,
  Icon,
  LoadingState,
  SearchField,
  SectionTitle,
} from '../components/app/ui';
import { bookAuthor, displayName, shelfName, timeAgo } from '../components/app/format';
import { getAllBooks } from '../api/books';
import { getUserShelves, getShelfById } from '../api/shelves';
import { getUserYearChallenge, getSocialFeed, getConversations } from '../api/dashboard';
import { getCurrentUserProfile } from '../api/users';
import { getAllQuotes } from '../api/quotes';
import { useAuth } from '../context/AuthContext';
import { useSignalR } from '../context/SignalRContext';
import '../styles/app/dashboard.css';

// Dashboard (/dashboard) in the Bookla 2.0 "Dashboard" layout. The header, navigation, notifications
// and unread counters live in AppShell; this page only loads and shows the dashboard's own data.

// Real API shelf names (the UI shows them through shelfName()).
const SHELF_CURRENT = 'Currently Reading';
const SHELF_READ = 'Read';
const SHELF_WANT = 'Want to Read';

const shelfCount = (shelf) => (shelf ? shelf.bookCount || shelf.books?.length || 0 : 0);

const shorten = (text, max) => {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).replace(/\s+\S*$/, '')}…` : clean;
};

const profilePath = (person) => `/profile/${person?.username || person?.userName || person?.id}`;

const BookLink = ({ id, title }) => (id ? <Link to={`/books/${id}`}>{title}</Link> : title);

// One line describing a social feed item (FeedItemDto: Review | Quote | BookAdded).
const activityText = (item) => {
  const bookId = item.book?.id || item.review?.bookId || item.quote?.bookId;
  const title = item.book?.title || item.review?.bookTitle || item.quote?.book?.title;
  switch (item.activityType) {
    case 'Review':
      return title ? (
        <>
          “<BookLink id={bookId} title={title} />” haqqında rəy yazdı.
        </>
      ) : (
        'kitab haqqında rəy yazdı.'
      );
    case 'Quote':
      return title ? (
        <>
          “<BookLink id={bookId} title={title} />” kitabından sitat paylaşdı.
        </>
      ) : (
        'sitat paylaşdı.'
      );
    case 'BookAdded':
      return title ? (
        <>
          “<BookLink id={bookId} title={title} />” kitabını “{shelfName(item.shelfName)}” rəfinə əlavə etdi.
        </>
      ) : (
        'rəfinə yeni kitab əlavə etdi.'
      );
    default:
      return 'yeni paylaşım etdi.';
  }
};

const ErrorNote = ({ text, onRetry }) => (
  <div className="dash-error" role="alert">
    <p>{text}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="secondary">
        Yenidən cəhd et
      </Button>
    )}
  </div>
);

// A Make "book-row" section: SectionTitle + five book cards, with loading and empty states.
const BookRowSection = ({ id, eyebrow, title, books, loading, emptyText, count = 5 }) => {
  // Safety check: ensure books is an array
  const safeBooks = Array.isArray(books) ? books : [];
  return (
    <section aria-labelledby={id} className="book-row-section">
      <SectionTitle
        action={
          <ButtonLink to="/books" variant="quiet">
            Hamısına bax <Icon name="arrow" />
          </ButtonLink>
        }
        eyebrow={eyebrow}
        id={id}
        title={title}
      />
      {loading ? (
        <LoadingState count={count} kind="books" />
      ) : safeBooks.length === 0 ? (
        <p className="dash-note book-row-empty">{emptyText}</p>
      ) : (
        <div className="book-row">
          {safeBooks.slice(0, count).map((book) => (
            <BookCard book={book} key={book.id} />
          ))}
        </div>
      )}
    </section>
  );
};

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  // Live total of unread messages; AppShell keeps it up to date.
  const { unreadCount: unreadMessages } = useSignalR();
  const navigate = useNavigate();

  // Data states
  const [allBooks, setAllBooks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [feed, setFeed] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Loading and error states
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);
  const [booksError, setBooksError] = useState(false);
  const [dashboardErrors, setDashboardErrors] = useState({ shelves: false, feed: false, conversations: false });

  const [searchTerm, setSearchTerm] = useState('');

  // Challenge modal state
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeBooks, setChallengeBooks] = useState([]);

  // Quotes state
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [quotesError, setQuotesError] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteModalMode, setQuoteModalMode] = useState('add');
  const [editingQuote, setEditingQuote] = useState(null);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    // Always fetch books and quotes
    fetchAllBooks();
    fetchQuotes();

    // Fetch dashboard data only if authenticated
    if (isAuthenticated && user) {
      fetchDashboardData();
    } else {
      setLoadingDashboard(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      setLoadingQuotes(true);
      setQuotesError(false);
      const res = await getAllQuotes(1, 30);
      const items = res?.items || res?.data || res || [];
      setQuotes(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Error loading quotes:', err);
      setQuotesError(true);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const fetchAllBooks = async () => {
    try {
      setLoadingBooks(true);
      setBooksError(false);
      // Fetch all books in a single call with large page size
      const response = await getAllBooks(1, 1000);

      // Safe data extraction: handle both PagedResult and array responses
      const allBooksData = response?.items || (Array.isArray(response) ? response : []);
      setAllBooks(allBooksData);
    } catch (err) {
      console.error('Error loading books:', err);
      setAllBooks([]); // Set empty array on error
      setBooksError(true);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const currentYear = new Date().getFullYear();

      // Fetch all dashboard data in parallel
      const results = await Promise.allSettled([
        getUserShelves(),
        getUserYearChallenge(currentYear, user?.id),
        getSocialFeed(1, 5),
        getConversations(1, 10),
        getCurrentUserProfile(),
      ]);

      // Process shelves
      if (results[0].status === 'fulfilled') {
        const shelvesData = results[0].value;
        if (Array.isArray(shelvesData)) {
          setShelves(shelvesData);
        } else if (shelvesData?.items) {
          setShelves(shelvesData.items);
        }
      }

      // Process challenge
      if (results[1].status === 'fulfilled') {
        setChallenge(results[1].value);
      }

      // Process feed
      if (results[2].status === 'fulfilled') {
        const feedData = results[2].value;
        setFeed(feedData?.items || feedData || []);
      }

      // Process conversations (the unread total itself is kept by AppShell)
      if (results[3].status === 'fulfilled') {
        const convData = results[3].value;
        setConversations(convData?.items || convData || []);
      }

      // Process user profile
      if (results[4].status === 'fulfilled') {
        setUserProfile(results[4].value);
      }

      setDashboardErrors({
        shelves: results[0].status === 'rejected',
        feed: results[2].status === 'rejected',
        conversations: results[3].status === 'rejected',
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoadingDashboard(false);
      setDashboardLoaded(true);
    }
  };

  // Computed data
  // Books across all shelves; a book kept on several shelves counts once.
  const totalBooksInShelves = useMemo(() => {
    const ids = new Set();
    let withoutList = 0;
    shelves.forEach((shelf) => {
      if (Array.isArray(shelf.books) && shelf.books.length > 0) shelf.books.forEach((book) => ids.add(book.id));
      else withoutList += shelf.bookCount || 0;
    });
    return ids.size + withoutList;
  }, [shelves]);

  const currentShelf = useMemo(() => shelves.find((s) => s.name === SHELF_CURRENT), [shelves]);
  const readShelf = useMemo(() => shelves.find((s) => s.name === SHELF_READ), [shelves]);
  const wantShelf = useMemo(() => shelves.find((s) => s.name === SHELF_WANT), [shelves]);
  const currentBooks = currentShelf?.books || [];
  const currentCount = shelfCount(currentShelf);
  const currentBook = currentBooks[0];

  // Client-side filtering and sorting for book sections
  const trendingBooks = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    // Trending: Most rated/popular (by rating count)
    return [...allBooks].sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0)).slice(0, 10);
  }, [allBooks]);

  const topRatedBooks = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    // Top Rated: Highest average rating (filter out 0 ratings)
    return [...allBooks]
      .filter((book) => (book.averageRating || 0) > 0)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 10);
  }, [allBooks]);

  const newArrivals = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    // New Arrivals: Most recently created
    return [...allBooks]
      .filter((book) => book.createdAt) // Only include books with createdAt
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending: newest first
      })
      .slice(0, 10);
  }, [allBooks]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/books?search=${encodeURIComponent(searchTerm)}` : '/books');
  };

  // Handle opening challenge modal
  const handleOpenChallengeModal = async () => {
    if (!challenge) return;

    // Find "Read" shelf
    const readShelfForChallenge = shelves.find((s) => s.name === SHELF_READ);
    if (readShelfForChallenge?.id) {
      try {
        const shelfData = await getShelfById(readShelfForChallenge.id);
        setChallengeBooks(shelfData?.books || []);
      } catch (error) {
        console.error('Error fetching Read shelf:', error);
        setChallengeBooks([]);
      }
    }
    setShowChallengeModal(true);
  };

  // Quote modal handlers
  const handleOpenAddQuote = () => {
    setQuoteModalMode('add');
    setEditingQuote(null);
    setShowQuoteModal(true);
  };

  const handleOpenEditQuote = (quote) => {
    setQuoteModalMode('edit');
    setEditingQuote(quote);
    setShowQuoteModal(true);
  };

  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false);
    setEditingQuote(null);
  };

  const handleQuoteSuccess = () => {
    // A new quote is listed first; show it.
    if (quoteModalMode === 'add') setQuoteIndex(0);
    fetchQuotes(); // Refresh quotes list
  };

  // Calculate challenge progress
  const challengeProgress = challenge
    ? Math.min(((challenge.completedBooksCount || 0) / (challenge.targetBooksCount || 1)) * 100, 100)
    : 0;
  const currentYear = new Date().getFullYear();

  const firstName = userProfile?.firstName || user?.firstName || user?.username || '';
  const dashboardPending = loadingDashboard && !dashboardLoaded;
  const stripValue = (value) => (dashboardPending || dashboardErrors.shelves ? '–' : value);

  // Quotes carousel: keep the index inside the list after a delete or refresh.
  const activeQuoteIndex = quotes.length ? Math.min(quoteIndex, quotes.length - 1) : 0;
  const activeQuote = quotes[activeQuoteIndex];
  const showQuote = (step) => setQuoteIndex((activeQuoteIndex + step + quotes.length) % quotes.length);

  const recentConversations = conversations.slice(0, 3);

  return (
    <div className="page page-dashboard">
      {/* Greeting and search */}
      <section className="dashboard-intro">
        <div>
          <Eyebrow>{firstName ? `Salam, ${firstName}` : 'Salam'}</Eyebrow>
          <h1>
            <span className="heading-line">Oxu dünyana</span>
            <span className="heading-line">
              <em>yenidən xoş gəldin.</em>
            </span>
          </h1>
          <p>Yarımçıq qalan hekayələr, dostlarından yeni rəylər və növbəti kitabın burada səni gözləyir.</p>
        </div>
        <form onSubmit={handleSearch} role="search">
          <SearchField
            label="Kitab axtar"
            large
            onChange={setSearchTerm}
            placeholder="Kitab, müəllif və ya janr axtar..."
            value={searchTerm}
          />
          {searchTerm.trim() && (
            <Button className="dashboard-search-action" type="submit" variant="quiet">
              “{searchTerm.trim()}” üçün axtar <Icon name="arrow" />
            </Button>
          )}
        </form>
      </section>

      {/* Currently reading + yearly challenge */}
      <section className="dashboard-grid">
        <div aria-busy={dashboardPending} aria-labelledby="reading-now-title" className="reading-now">
          {dashboardPending ? (
            <>
              <SectionTitle eyebrow="Hazırda oxuyursan" id="reading-now-title" title="Rəfin yüklənir…" />
              <div aria-label="Məzmun yüklənir" className="reading-now-loading" role="status">
                <span className="dash-skeleton" />
                <div>
                  <span className="dash-skeleton" />
                  <span className="dash-skeleton" />
                  <span className="dash-skeleton" />
                </div>
              </div>
            </>
          ) : dashboardErrors.shelves ? (
            <div className="reading-now-empty">
              <SectionTitle eyebrow="Hazırda oxuyursan" id="reading-now-title" title="Rəflərini yükləmək alınmadı" />
              <p>Bağlantını yoxla və yenidən cəhd et.</p>
              <Button onClick={fetchDashboardData} variant="secondary">
                Yenidən cəhd et
              </Button>
            </div>
          ) : currentBook ? (
            <>
              <SectionTitle
                eyebrow="Hazırda oxuyursan"
                id="reading-now-title"
                title={currentCount > 1 ? `${currentCount} hekayə davam edir` : 'Hekayən davam edir'}
              />
              <div className="current-book">
                <Link aria-hidden="true" className="current-cover" tabIndex={-1} to={`/books/${currentBook.id}`}>
                  <BookCover book={currentBook} />
                </Link>
                <div>
                  {bookAuthor(currentBook) && <p className="book-genre">{bookAuthor(currentBook)}</p>}
                  <h3>
                    <Link to={`/books/${currentBook.id}`}>{currentBook.title}</Link>
                  </h3>
                  {currentBook.description && <p>{shorten(currentBook.description, 150)}</p>}
                  <span className="current-shelf-note">
                    “{shelfName(SHELF_CURRENT)}” rəfində <strong>{currentCount} kitab</strong> var
                  </span>
                  <div className="current-actions">
                    <ButtonLink to={`/books/${currentBook.id}`}>
                      Kitabın səhifəsi <Icon name="arrow" />
                    </ButtonLink>
                    {currentCount > 1 && currentShelf?.id && (
                      <ButtonLink to={`/shelves/${currentShelf.id}`} variant="quiet">
                        Rəfdəki bütün kitablar <Icon name="arrow" />
                      </ButtonLink>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="reading-now-empty">
              <SectionTitle eyebrow="Hazırda oxuyursan" id="reading-now-title" title="Hələ heç bir kitaba başlamamısan" />
              <p>
                Bir kitab seç və onu “{shelfName(SHELF_CURRENT)}” rəfinə əlavə et — oxuduğun hekayə burada
                görünəcək.
              </p>
              <ButtonLink to="/books">
                Kitablara bax <Icon name="arrow" />
              </ButtonLink>
            </div>
          )}
        </div>

        <ReadingChallengeCard onUpdate={fetchDashboardData} onViewBooks={handleOpenChallengeModal} year={currentYear} />
      </section>

      {/* Library counts */}
      <section aria-busy={dashboardPending} aria-label="Kitabxanam" className="library-strip">
        <div>
          <span>Kitabxanam</span>
          <strong>{stripValue(totalBooksInShelves)}</strong>
          <small>{dashboardPending || dashboardErrors.shelves ? 'ümumi kitab' : `kitab, ${shelves.length} rəf`}</small>
        </div>
        <div>
          <span>Oxunur</span>
          <strong>{stripValue(currentCount)}</strong>
          <small>aktiv hekayə</small>
        </div>
        <div>
          <span>Oxunub</span>
          <strong>{stripValue(shelfCount(readShelf))}</strong>
          <small>tamamlanıb</small>
        </div>
        <div>
          <span>Saxlanılıb</span>
          <strong>{stripValue(shelfCount(wantShelf))}</strong>
          <small>növbədədir</small>
        </div>
        <ButtonLink to="/my-shelves" variant="quiet">
          Rəflərimə bax <Icon name="arrow" />
        </ButtonLink>
      </section>

      {/* Book rows from the real catalogue */}
      {booksError ? (
        <section aria-labelledby="books-error-title">
          <SectionTitle eyebrow="Kitablar" id="books-error-title" title="Növbəti səhifən burada başlaya bilər" />
          <ErrorNote onRetry={fetchAllBooks} text="Kitabları yükləmək alınmadı." />
        </section>
      ) : !loadingBooks && allBooks.length === 0 ? (
        <section aria-labelledby="books-empty-title">
          <SectionTitle eyebrow="Kitablar" id="books-empty-title" title="Növbəti səhifən burada başlaya bilər" />
          <EmptyState text="Kataloqa kitab əlavə olunanda burada görünəcək." title="Hələ kitab yoxdur" />
        </section>
      ) : (
        <BookRowSection
          books={trendingBooks}
          emptyText="Hələ kitab tapılmadı."
          eyebrow="Gündəmdə"
          id="trending-title"
          loading={loadingBooks}
          title="Növbəti səhifən burada başlaya bilər"
        />
      )}

      {/* Quote + social preview */}
      <section className="quote-social-grid">
        <div aria-labelledby="quotes-title" className="quote-card" role="region">
          <div className="quote-card-head">
            <Eyebrow>
              <span id="quotes-title">İcmadan sitatlar</span>
            </Eyebrow>
            {!loadingQuotes && quotes.length > 1 && (
              <div className="quote-nav">
                <button aria-label="Əvvəlki sitat" onClick={() => showQuote(-1)} type="button">
                  <Icon name="back" />
                </button>
                <span aria-live="polite">
                  {activeQuoteIndex + 1} / {quotes.length}
                </span>
                <button aria-label="Növbəti sitat" onClick={() => showQuote(1)} type="button">
                  <Icon name="arrow" />
                </button>
              </div>
            )}
          </div>

          {loadingQuotes && quotes.length === 0 ? (
            <div aria-label="Sitatlar yüklənir" className="quote-card-loading" role="status">
              <span className="dash-skeleton" />
              <span className="dash-skeleton" />
              <span className="dash-skeleton" />
            </div>
          ) : quotesError ? (
            <ErrorNote onRetry={fetchQuotes} text="Sitatları yükləmək alınmadı." />
          ) : activeQuote ? (
            <QuoteCard key={activeQuote.id} onDelete={fetchQuotes} onEdit={handleOpenEditQuote} quote={activeQuote} />
          ) : (
            <div className="quote-card-empty">
              <h3>Hələ heç kim sitat paylaşmayıb.</h3>
              <p>İlk sətri sən paylaş — sevdiyin kitabdan səni düşündürən bir parça.</p>
            </div>
          )}

          <div className="quote-card-foot">
            <Button onClick={handleOpenAddQuote} variant="secondary">
              <Icon name="plus" size={16} /> Sitat paylaş
            </Button>
          </div>
        </div>

        <div aria-labelledby="social-title" className="social-preview" role="region">
          <SectionTitle
            action={
              <ButtonLink to="/feed" variant="quiet">
                Lentə keç <Icon name="arrow" />
              </ButtonLink>
            }
            eyebrow="İcmadan"
            id="social-title"
            title="Oxucular nə paylaşır?"
          />
          {dashboardPending ? (
            <div aria-label="Lent yüklənir" className="dash-activity-loading" role="status">
              {[0, 1, 2].map((key) => (
                <div key={key}>
                  <span className="dash-skeleton" />
                  <span className="dash-skeleton" />
                </div>
              ))}
            </div>
          ) : dashboardErrors.feed ? (
            <ErrorNote onRetry={fetchDashboardData} text="Lenti yükləmək alınmadı." />
          ) : feed.length === 0 ? (
            <EmptyState
              action={
                <ButtonLink to="/community" variant="secondary">
                  Oxucuları kəşf et
                </ButtonLink>
              }
              text="İzlədiyin oxucuların rəyləri, sitatları və rəf yenilikləri burada görünəcək."
              title="Hələ paylaşım yoxdur"
            />
          ) : (
            feed.map((item) => (
              <Activity
                compact
                key={`${item.activityType}-${item.id}`}
                person={item.user}
                text={activityText(item)}
                time={timeAgo(item.createdAt)}
                to={item.user ? profilePath(item.user) : undefined}
              />
            ))
          )}
        </div>
      </section>

      {/* The error / empty-catalogue message is shown once, above. */}
      {(loadingBooks || (!booksError && allBooks.length > 0)) && (
        <>
          <BookRowSection
            books={topRatedBooks}
            emptyText="Hələ reytinq alan kitab yoxdur."
            eyebrow="Ən yüksək reytinq"
            id="top-rated-title"
            loading={loadingBooks}
            title="Oxucuların ən çox bəyəndikləri"
          />

          <BookRowSection
            books={newArrivals}
            emptyText="Hələ yeni əlavə olunan kitab yoxdur."
            eyebrow="Yeni əlavələr"
            id="new-arrivals-title"
            loading={loadingBooks}
            title="Kitabxanaya yeni gələnlər"
          />
        </>
      )}

      {/* Recent conversations + shortcuts */}
      <section className="dash-extras">
        <div aria-labelledby="messages-title" className="dash-panel" role="region">
          <SectionTitle
            action={
              <ButtonLink to="/messages" variant="quiet">
                Mesajlara keç <Icon name="arrow" />
              </ButtonLink>
            }
            eyebrow="Mesajlar"
            id="messages-title"
            title="Son söhbətlər"
          />
          {unreadMessages > 0 && (
            <p className="dash-unread">
              <strong>{unreadMessages}</strong> oxunmamış mesajın var
            </p>
          )}
          {dashboardPending ? (
            <div aria-label="Söhbətlər yüklənir" className="dash-activity-loading" role="status">
              {[0, 1].map((key) => (
                <div key={key}>
                  <span className="dash-skeleton" />
                  <span className="dash-skeleton" />
                </div>
              ))}
            </div>
          ) : dashboardErrors.conversations ? (
            <ErrorNote onRetry={fetchDashboardData} text="Söhbətləri yükləmək alınmadı." />
          ) : recentConversations.length === 0 ? (
            <EmptyState
              action={
                <ButtonLink to="/community" variant="secondary">
                  Oxucularla tanış ol
                </ButtonLink>
              }
              text="İcmadan bir oxucuya yaz — söhbətlərin burada görünəcək."
              title="Hələ söhbətin yoxdur"
            />
          ) : (
            <ul className="dash-conversations">
              {recentConversations.map((conversation) => {
                const name = displayName(conversation.otherUser);
                const unread = conversation.unreadCount || 0;
                return (
                  <li key={conversation.id}>
                    <Link
                      className={`dash-conversation ${unread > 0 ? 'is-unread' : ''}`}
                      to={conversation.otherUser?.id ? `/messages?user=${conversation.otherUser.id}` : '/messages'}
                    >
                      <Avatar name={name} size="small" src={conversation.otherUser?.profilePictureUrl} />
                      <span>
                        <strong>{name}</strong>
                        <small>{conversation.lastMessageText || 'Hələ mesaj yoxdur'}</small>
                      </span>
                      {conversation.lastMessageAt && (
                        <time dateTime={conversation.lastMessageAt}>{timeAgo(conversation.lastMessageAt)}</time>
                      )}
                      {unread > 0 && (
                        <span aria-label={`${unread} oxunmamış`} className="nav-badge">
                          {unread}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <nav aria-labelledby="shortcuts-title" className="dash-shortcuts">
          <SectionTitle eyebrow="Qısa yollar" id="shortcuts-title" title="Növbəti addımın" />
          <ul>
            <li>
              <Link to="/books">
                <span>
                  <strong>Kitablara bax</strong>
                  <small>Kataloqda axtar və yeni kitab tap</small>
                </span>
                <Icon name="arrow" />
              </Link>
            </li>
            <li>
              <Link to="/my-shelves">
                <span>
                  <strong>Yeni rəf yarat</strong>
                  <small>Kitablarını öz qaydanla düz</small>
                </span>
                <Icon name="arrow" />
              </Link>
            </li>
            <li>
              <Link to="/ai-recommendations">
                <span>
                  <strong>Süni intellekt tövsiyələri</strong>
                  <small>Zövqünə uyğun kitab təklifləri</small>
                </span>
                <Icon name="arrow" />
              </Link>
            </li>
          </ul>
        </nav>
      </section>

      {/* Challenge books */}
      {showChallengeModal && (
        <Dialog className="dash-modal-wide" labelledBy="challenge-books-title" onClose={() => setShowChallengeModal(false)}>
          <Eyebrow>{currentYear} oxu hədəfi</Eyebrow>
          <h2 id="challenge-books-title">Oxuduqların</h2>
          <p>
            {challenge?.completedBooksCount || 0} / {challenge?.targetBooksCount || 0} kitab tamamlanıb
          </p>
          <div className="progress-label">
            <span>İrəliləyiş</span>
            <strong>{Math.round(challengeProgress)}%</strong>
          </div>
          <div
            aria-label="Hədəf irəliləyişi"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(challengeProgress)}
            className="progress"
            role="progressbar"
          >
            <i style={{ width: `${challengeProgress}%` }} />
          </div>

          <h3 className="dash-dialog-subtitle">“{shelfName(SHELF_READ)}” rəfindəki kitablar</h3>
          {challengeBooks.length === 0 ? (
            <div className="dash-dialog-empty">
              <p>Hələ oxunmuş kitab yoxdur. İrəliləyişi izləmək üçün kitabları “{shelfName(SHELF_READ)}” rəfinə əlavə et.</p>
              <ButtonLink onClick={() => setShowChallengeModal(false)} to="/books">
                Kitablara bax <Icon name="arrow" />
              </ButtonLink>
            </div>
          ) : (
            <ul className="dash-book-list">
              {challengeBooks.map((book) => (
                <li key={book.id}>
                  <Link onClick={() => setShowChallengeModal(false)} to={`/books/${book.id}`}>
                    <BookCover book={book} className="cover-thumb" />
                    <span>
                      <strong>{book.title}</strong>
                      <small>{bookAuthor(book) || 'Müəllif məlum deyil'}</small>
                    </span>
                    <span aria-label="Oxunub" className="dash-check" role="img">
                      <Icon name="check" size={16} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {challengeBooks.length > 0 && (
            <div className="modal-actions">
              <ButtonLink onClick={() => setShowChallengeModal(false)} to="/my-shelves" variant="secondary">
                Bütün rəflərə bax
              </ButtonLink>
            </div>
          )}
        </Dialog>
      )}

      {/* Add/Edit Quote Modal */}
      <AddEditQuoteModal
        initialData={editingQuote}
        isOpen={showQuoteModal}
        mode={quoteModalMode}
        onClose={handleCloseQuoteModal}
        onSuccess={handleQuoteSuccess}
      />
    </div>
  );
};

export default HomePage;
