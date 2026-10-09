import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import FeedItemCard from '../components/FeedItemCard';
import { getPersonalFeed, getSocialFeed } from '../api/feed';
import { getAllUsers } from '../api/users';
import { followUser, getMyFollowing } from '../api/userFollows';
import { getAllBooks } from '../api/books';
import { useAuth } from '../context/AuthContext';
import {
  Avatar,
  BookCover,
  Button,
  ButtonLink,
  EmptyState,
  Eyebrow,
  Icon,
  LoadingState,
  SectionTitle,
  Tabs,
} from '../components/app/ui';
import { bookAuthor, displayName, formatRating } from '../components/app/format';
import '../styles/app/social.css';

// Helper to check if user is admin
const isAdmin = (user) => {
  if (!user) return false;
  // Check multiple possible field names for role
  const isAdminByRole = user?.role === 'Admin' ||
         user?.roles?.includes('Admin') ||
         user?.userRole === 'Admin' ||
         (Array.isArray(user?.roles) && user.roles.some(r => r === 'Admin' || r?.name === 'Admin'));

  // Also check by username (common admin username patterns)
  const isAdminByUsername = user?.username?.toLowerCase() === 'admin' ||
                            user?.username?.toLowerCase().startsWith('admin_');

  return isAdminByRole || isAdminByUsername;
};

const feedTabs = [
  { value: 'personal', label: 'İzlədiklərim' },
  { value: 'discover', label: 'Kəşf et' },
];

// Placeholder rows while the sidebar loads.
const SideSkeleton = ({ rows = 3 }) => (
  <div aria-label="Yüklənir" className="side-skeleton" role="status">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index}>
        <i />
        <span />
      </div>
    ))}
  </div>
);

// User Suggestion row (Make ".suggested-reader")
const UserSuggestionCard = ({ user, onFollow }) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const name = displayName(user);

  const handleFollow = async () => {
    if (loading || following || isAdmin(user)) return;

    // Optimistic UI update
    setLoading(true);
    setFollowing(true);

    try {
      await followUser(user.id);
      toast.success(`İndi @${user.username} istifadəçisini izləyirsən`);
      if (onFollow) onFollow(user.id);
    } catch (error) {
      // Handle 409 Conflict - already following
      if (error.response?.status === 409) {
        setFollowing(true);
        toast.info(`@${user.username} istifadəçisini artıq izləyirsən`);
        if (onFollow) onFollow(user.id);
      } else {
        // Revert on other errors
        setFollowing(false);
        toast.error('İzləmək alınmadı');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="suggested-reader">
      <Avatar name={name} size="small" src={user.profilePictureUrl} />
      <Link to={`/profile/${user.username}`}>
        <strong>{name}</strong>
        <span>@{user.username}</span>
      </Link>
      <Button
        aria-busy={loading}
        aria-label={`${following ? 'İzlənilir' : 'İzlə'}: ${name}`}
        disabled={following || loading}
        onClick={handleFollow}
        variant="quiet"
      >
        {following ? 'İzlənilir' : 'İzlə'}
      </Button>
    </li>
  );
};

// Trending Book row
const TrendingBookCard = ({ book, rank }) => {
  const rating = formatRating(book.averageRating);
  return (
    <li>
      <Link className="trending-book" to={`/books/${book.id}`}>
        <span aria-hidden="true" className="trending-rank">
          {rank}
        </span>
        <BookCover book={book} />
        <span className="trending-copy">
          <strong>{book.title}</strong>
          <span>{bookAuthor(book) || 'Müəllif məlum deyil'}</span>
          {rating && (
            <span className="rating">
              <Icon name="star" size={12} /> {rating}
              <span className="sr-only"> ulduz</span>
            </span>
          )}
        </span>
      </Link>
    </li>
  );
};

// Empty feed
const FeedEmptyState = ({ feedType, onSwitchFeed }) =>
  feedType === 'personal' ? (
    <EmptyState
      action={
        <div className="feed-empty-actions">
          <Button onClick={onSwitchFeed}>İcmanın lentinə bax</Button>
          <ButtonLink to="/community" variant="secondary">
            Oxucu tap
          </ButtonLink>
        </div>
      }
      text="Oxucuları izlə ki, nə oxuduqlarını, sevdikləri sitatları və paylaşdıqları rəyləri burada görəsən."
      title="Lentin hələ sakitdir"
    />
  ) : (
    <EmptyState
      action={
        <ButtonLink to="/community" variant="secondary">
          Oxucu tap
        </ButtonLink>
      }
      text="İcmada hələ fəaliyyət yoxdur. İlk paylaşan sən ol!"
      title="Kəşf ediləcək bir şey hələ yoxdur"
    />
  );

// Main Page Component
const SocialFeedPage = () => {
  const { user } = useAuth();

  // Feed State
  const [feedType, setFeedType] = useState('personal'); // 'personal' or 'discover'
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestRef = useRef(0);

  // Sidebar State
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [sidebarError, setSidebarError] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState(false);

  // Fetch feed
  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    const requestId = ++requestRef.current;
    try {
      if (pageNum === 1 && !append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const fetchFn = feedType === 'personal' ? getPersonalFeed : getSocialFeed;
      const response = await fetchFn(pageNum, 10);
      // The other tab was opened meanwhile; ignore this answer.
      if (requestId !== requestRef.current) return;

      // Handle different response formats
      // PagedResult format: { data: [], totalPages, pageNumber, pageSize, totalCount }
      // Or direct array
      let items = [];
      let totalPages = 1;

      if (response) {
        if (Array.isArray(response)) {
          items = response;
        } else if (Array.isArray(response.data)) {
          items = response.data;
          totalPages = response.totalPages || 1;
        } else if (response.items && Array.isArray(response.items)) {
          items = response.items;
          totalPages = response.totalPages || 1;
        }
      }

      // Filter out items from admin users
      const filteredItems = items.filter(item => !isAdmin(item?.user));

      if (append) {
        setFeedItems((prev) => [...prev, ...filteredItems]);
      } else {
        setFeedItems(filteredItems);
      }

      setError(false);
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching feed:', error);
      if (requestId !== requestRef.current) return;
      if (append) {
        toast.error('Lentin davamı yüklənmədi');
      } else {
        setError(true);
        setFeedItems([]);
      }
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }, [feedType]);

  // Fetch all books for trending calculation (same as HomePage)
  const fetchAllBooks = useCallback(async () => {
    try {
      setLoadingBooks(true);
      const response = await getAllBooks(1, 1000);
      const allBooksData = response?.items || (Array.isArray(response) ? response : []);
      setAllBooks(allBooksData);
      setBooksError(false);
    } catch (err) {
      console.error('Error loading books:', err);
      setAllBooks([]);
      setBooksError(true);
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  // Calculate trending books using the same algorithm as HomePage
  const trendingBooks = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    // Trending: Most rated/popular (by rating count) - same as HomePage
    return [...allBooks]
      .sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))
      .slice(0, 5); // Show top 5 in sidebar
  }, [allBooks]);

  // Fetch sidebar data (Who to Follow)
  const fetchSidebarData = useCallback(async () => {
    setSidebarLoading(true);
    try {
      // Fetch in parallel: all users, current user's following list
      const [allUsersRes, followingRes] = await Promise.all([
        getAllUsers(1, 30), // Get first 30 users
        getMyFollowing(1, 1000), // Get all users I'm following
      ]);

      // Parse users response
      let allUsers = [];
      if (allUsersRes) {
        if (Array.isArray(allUsersRes)) {
          allUsers = allUsersRes;
        } else if (Array.isArray(allUsersRes.data)) {
          allUsers = allUsersRes.data;
        } else if (allUsersRes.items && Array.isArray(allUsersRes.items)) {
          allUsers = allUsersRes.items;
        }
      }

      // Parse following response
      let following = [];
      if (followingRes) {
        if (Array.isArray(followingRes)) {
          following = followingRes;
        } else if (Array.isArray(followingRes.data)) {
          following = followingRes.data;
        } else if (followingRes.items && Array.isArray(followingRes.items)) {
          following = followingRes.items;
        }
      }

      // Get set of following IDs for quick lookup
      const followingIds = new Set(following.map((u) => u.id));
      const currentUserId = user?.id;

      // Filter out: users I already follow + myself + admins
      const eligibleUsers = allUsers.filter(
        (u) => u.id !== currentUserId && !followingIds.has(u.id) && !isAdmin(u)
      );

      // Shuffle and pick 3 random users
      const shuffled = eligibleUsers.sort(() => Math.random() - 0.5);
      const suggested = shuffled.slice(0, 3);

      setSuggestedUsers(suggested);
      setSidebarError(false);
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
      setSuggestedUsers([]);
      setSidebarError(true);
    } finally {
      setSidebarLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  useEffect(() => {
    fetchSidebarData();
  }, [fetchSidebarData]);

  useEffect(() => {
    fetchAllBooks();
  }, [fetchAllBooks]);

  // Refresh feed
  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeed(1);
  };

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(page + 1, true);
    }
  };

  // Switch feed type
  const handleSwitchFeed = (type) => {
    if (type !== feedType) {
      setFeedType(type);
      setPage(1);
      setFeedItems([]);
      setLoading(true);
      setError(false);
    }
  };

  const activeTab = feedTabs.find((tab) => tab.value === feedType);

  return (
    <div className="page feed-page">
      <header className="page-heading-row">
        <div>
          <Eyebrow>OXUCU GÜNDƏLİYİ</Eyebrow>
          <h1>Fəaliyyət lenti</h1>
          <p>Oxuduqlarınızın ətrafında başlayan söhbətlər.</p>
        </div>
        <Button
          aria-busy={refreshing}
          className="feed-refresh"
          disabled={refreshing || loading}
          onClick={handleRefresh}
          variant="secondary"
        >
          <svg aria-hidden="true" className={`icon ${refreshing ? 'spinning' : ''}`} height="16" viewBox="0 0 24 24" width="16">
            <path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4" />
          </svg>
          {refreshing ? 'Yenilənir…' : 'Yenilə'}
        </Button>
      </header>

      <div className="feed-layout">
        <div>
          <Tabs active={feedType} label="Lent növü" onChange={handleSwitchFeed} tabs={feedTabs} />
          <div aria-label={activeTab?.label} role="tabpanel">
            <h2 className="sr-only">Son fəaliyyətlər</h2>
            {loading ? (
              <LoadingState kind="feed" />
            ) : error ? (
              <EmptyState
                action={<Button onClick={() => fetchFeed(1)}>Yenidən cəhd et</Button>}
                text="Bağlantını yoxlayıb yenidən cəhd et."
                title="Fəaliyyət lenti yüklənmədi"
              />
            ) : !feedItems || feedItems.length === 0 ? (
              <FeedEmptyState feedType={feedType} onSwitchFeed={() => handleSwitchFeed('discover')} />
            ) : (
              <>
                <div className="feed-list">
                  {feedItems.map((item) => (
                    <FeedItemCard
                      item={item}
                      key={item.id}
                      onItemDeleted={(itemId) => setFeedItems((prev) => prev.filter((i) => i.id !== itemId))}
                    />
                  ))}
                </div>

                {/* Load More / End of Feed */}
                {hasMore ? (
                  <div className="list-more">
                    <Button aria-busy={loadingMore} disabled={loadingMore} onClick={handleLoadMore} variant="secondary">
                      {loadingMore ? 'Yüklənir…' : 'Daha çox göstər'}
                    </Button>
                  </div>
                ) : (
                  <p className="list-end">Lentin sonuna çatdın.</p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="feed-side">
          <aside aria-labelledby="suggested-title" className="suggested">
            <SectionTitle eyebrow="TANIYA BİLƏRSƏN" id="suggested-title" title="Yeni oxucular" />
            {sidebarLoading ? (
              <SideSkeleton />
            ) : suggestedUsers.length > 0 ? (
              <ul className="suggested-list">
                {suggestedUsers.map((suggestion) => (
                  <UserSuggestionCard
                    key={suggestion.id}
                    onFollow={(id) => setSuggestedUsers((prev) => prev.filter((u) => u.id !== id))}
                    user={suggestion}
                  />
                ))}
              </ul>
            ) : sidebarError ? (
              <p className="suggested-empty">Təkliflər yüklənmədi. Oxucuları icma səhifəsində tapa bilərsən.</p>
            ) : (
              <p className="suggested-empty">Hələlik yeni təklif yoxdur. Bütün oxucuları icma səhifəsində tapa bilərsən.</p>
            )}
            <ButtonLink to="/community" variant="secondary">
              İcmanı kəşf et
            </ButtonLink>
          </aside>

          <aside aria-labelledby="trending-title" className="feed-trending">
            <SectionTitle eyebrow="OXUCULARIN SEÇİMİ" id="trending-title" title="Populyar kitablar" />
            {sidebarLoading || loadingBooks ? (
              <SideSkeleton />
            ) : trendingBooks.length > 0 ? (
              <ol className="trending-list">
                {trendingBooks.map((book, idx) => (
                  <TrendingBookCard book={book} key={book.id} rank={idx + 1} />
                ))}
              </ol>
            ) : (
              <p className="suggested-empty">{booksError ? 'Kitablar yüklənmədi.' : 'Hələ populyar kitab yoxdur.'}</p>
            )}
            <ButtonLink to="/books" variant="quiet">
              Bütün kitablar <Icon name="arrow" size={15} />
            </ButtonLink>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SocialFeedPage;
