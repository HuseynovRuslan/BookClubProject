import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllUsers } from '../api/users';
import { followUser, unfollowUser, getMyFollowing } from '../api/userFollows';
import { useAuth } from '../context/AuthContext';
import { Avatar, Button, ButtonLink, EmptyState, Eyebrow, Icon, LoadingState, SearchField, SectionTitle } from '../components/app/ui';
import { displayName, formatDate } from '../components/app/format';
import communityHero from '../assets/app/community-hero.jpg';
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

// "Qoşulub: 14 mar 2025" — only when the API gives a real date.
const joinedOn = (date) => {
  const parsed = date ? new Date(date) : null;
  return parsed && !Number.isNaN(parsed.getTime()) && parsed.getFullYear() > 2000 ? formatDate(parsed) : null;
};

// Reader card (Make ".reader-card")
const UserCard = ({ user, isFollowing, onFollowToggle, isCurrentUser }) => {
  const [loading, setLoading] = useState(false);
  const name = displayName(user);
  const joined = joinedOn(user.createdAt);

  const handleFollowToggle = async () => {
    if (loading || isCurrentUser || isAdmin(user)) return;

    // Optimistic UI update
    setLoading(true);
    const wasFollowing = isFollowing;
    onFollowToggle(user.id, !wasFollowing);

    try {
      if (wasFollowing) {
        await unfollowUser(user.id);
        toast.success(`@${user.username} artıq izlənilmir`);
      } else {
        await followUser(user.id);
        toast.success(`İndi @${user.username} istifadəçisini izləyirsən`);
      }
    } catch (error) {
      // Handle 409 Conflict - already following/not following
      if (error.response?.status === 409) {
        if (!wasFollowing) {
          // If we tried to follow but got 409, user is already followed
          onFollowToggle(user.id, true);
          toast.info(`@${user.username} istifadəçisini artıq izləyirsən`);
        } else {
          // If we tried to unfollow but got 409, user is already not followed
          onFollowToggle(user.id, false);
          toast.info(`@${user.username} istifadəçisini izləmirsən`);
        }
      } else {
        // Revert on other errors
        onFollowToggle(user.id, wasFollowing);
        toast.error(wasFollowing ? 'İzləməni dayandırmaq alınmadı' : 'İzləmək alınmadı');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="reader-card">
      <Link aria-hidden="true" className="reader-avatar-link" tabIndex={-1} to={`/profile/${user.username}`}>
        <Avatar name={name} size="large" src={user.profilePictureUrl} />
      </Link>
      <Link className="reader-name" to={`/profile/${user.username}`}>
        <h3>{name}</h3>
        <span>@{user.username}</span>
      </Link>
      {user.bio && <p>{user.bio}</p>}
      {joined && (
        <div>
          <span>
            Qoşulub: <strong>{joined}</strong>
          </span>
        </div>
      )}

      {/* Follow Button */}
      {!isCurrentUser && !isAdmin(user) && (
        <Button
          aria-busy={loading}
          aria-label={`${isFollowing ? 'İzlənilir' : 'İzlə'}: ${name}`}
          disabled={loading}
          onClick={handleFollowToggle}
          title={isFollowing ? 'İzləməni dayandır' : undefined}
          variant={isFollowing ? 'secondary' : 'primary'}
        >
          {isFollowing ? (
            <>
              <Icon name="check" size={15} /> İzlənilir
            </>
          ) : (
            'İzlə'
          )}
        </Button>
      )}

      {isCurrentUser && (
        <ButtonLink to="/profile" variant="secondary">
          Sənin profilin
        </ButtonLink>
      )}
    </article>
  );
};

// Main Page Component
const CommunityPage = () => {
  const { user } = useAuth();

  // State
  const [users, setUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const requestRef = useRef(0);
  const searchRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch following list
  const fetchFollowingList = useCallback(async () => {
    try {
      const response = await getMyFollowing(1, 1000);

      // Handle different response formats
      let following = [];
      if (response) {
        if (Array.isArray(response)) {
          following = response;
        } else if (Array.isArray(response.data)) {
          following = response.data;
        } else if (response.items && Array.isArray(response.items)) {
          following = response.items;
        }
      }

      const ids = new Set(following.map((u) => u.id));
      setFollowingIds(ids);
    } catch (error) {
      console.error('Error fetching following list:', error);
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async (pageNum = 1, append = false) => {
    const requestId = ++requestRef.current;
    try {
      if (pageNum === 1 && !append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getAllUsers(pageNum, 12, debouncedSearch);
      // A newer search has started; its answer wins.
      if (requestId !== requestRef.current) return;

      // Handle response format
      let items = [];
      let total = 0;
      let totalPages = 1;

      if (response) {
        if (Array.isArray(response)) {
          items = response;
          total = response.length;
        } else if (Array.isArray(response.data)) {
          items = response.data;
          total = response.totalCount || items.length;
          totalPages = response.totalPages || 1;
        } else if (response.items && Array.isArray(response.items)) {
          items = response.items;
          total = response.totalCount || items.length;
          totalPages = response.totalPages || 1;
        }
      }

      // Filter out admin users
      const filteredItems = items.filter(u => !isAdmin(u));

      // Recalculate total count after filtering (subtract admin count)
      const adminCount = items.length - filteredItems.length;
      const adjustedTotal = Math.max(0, total - adminCount);

      if (append) {
        setUsers((prev) => [...prev, ...filteredItems]);
      } else {
        setUsers(filteredItems);
      }

      setError(false);
      setTotalCount(adjustedTotal);
      setHasMore(pageNum < totalPages && filteredItems.length > 0);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (requestId !== requestRef.current) return;
      if (append) {
        toast.error('Daha çox oxucu yüklənmədi');
      } else {
        setError(true);
        setUsers([]);
      }
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [debouncedSearch]);

  // Initial load
  useEffect(() => {
    fetchFollowingList();
  }, [fetchFollowingList]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Handle follow toggle
  const handleFollowToggle = (userId, isNowFollowing) => {
    setFollowingIds((prev) => {
      const newSet = new Set(prev);
      if (isNowFollowing) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchUsers(page + 1, true);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    searchRef.current?.focus();
  };

  const handleRetry = () => {
    fetchFollowingList();
    fetchUsers(1);
  };

  const resultsInfo = debouncedSearch
    ? `“${debouncedSearch}” üzrə ${totalCount} nəticə`
    : `${users.length} / ${totalCount} oxucu göstərilir`;

  return (
    <div className="page community-page">
      <section className="community-hero">
        <div>
          <Eyebrow>BOOKLA İCMASI</Eyebrow>
          <h1>
            <span className="heading-line">Eyni kitabı sevən</span>
            <span className="heading-line">insanlarla tanış ol.</span>
          </h1>
          <p>Yeni baxışlar, düşüncəli rəylər və növbəti oxu ilhamın səni gözləyir.</p>
          <form className="community-search" onSubmit={(event) => event.preventDefault()} role="search">
            <SearchField
              autoComplete="off"
              enterKeyHint="search"
              inputRef={searchRef}
              label="Oxucu axtar"
              large
              onChange={setSearchTerm}
              placeholder="Ad və ya istifadəçi adı ilə axtar..."
              type="search"
              value={searchTerm}
            />
            {searchTerm && (
              <button aria-label="Axtarışı təmizlə" className="community-search-clear" onClick={handleClearSearch} type="button">
                <Icon name="close" />
              </button>
            )}
          </form>
        </div>
        <img alt="Kitab ətrafında söhbət edən Bookla oxucuları" src={communityHero} />
      </section>

      <section aria-labelledby="community-readers-title" className="community-readers">
        <SectionTitle
          action={
            !loading && !error && users.length > 0 ? (
              <p aria-live="polite" className="community-count">
                {resultsInfo}
              </p>
            ) : null
          }
          eyebrow="KƏŞF ET"
          id="community-readers-title"
          title={debouncedSearch ? 'Axtarış nəticələri' : 'Düşüncələri ilə ilham verən oxucular'}
        />

        {loading ? (
          <LoadingState count={6} kind="readers" />
        ) : error ? (
          <EmptyState
            action={<Button onClick={handleRetry}>Yenidən cəhd et</Button>}
            text="Bağlantını yoxlayıb yenidən cəhd et."
            title="Oxucular yüklənmədi"
          />
        ) : users.length === 0 ? (
          debouncedSearch ? (
            <EmptyState
              action={
                <Button onClick={handleClearSearch} variant="secondary">
                  Axtarışı təmizlə
                </Button>
              }
              text={`“${debouncedSearch}” üzrə oxucu tapılmadı. İstifadəçi adını yoxla və ya daha qısa sorğu ilə yenidən axtar.`}
              title="Oxucu tapılmadı"
            />
          ) : (
            <EmptyState
              text="Dostlarını Bookla-ya dəvət et və oxucu icmasını birlikdə qurun."
              title="Hələ oxucu yoxdur"
            />
          )
        ) : (
          <>
            <div className="reader-grid">
              {users.map((u) => (
                <UserCard
                  isCurrentUser={u.id === user?.id}
                  isFollowing={followingIds.has(u.id)}
                  key={u.id}
                  onFollowToggle={handleFollowToggle}
                  user={u}
                />
              ))}
            </div>

            {/* Load More / End of List */}
            {hasMore ? (
              <div className="list-more">
                <Button aria-busy={loadingMore} disabled={loadingMore} onClick={handleLoadMore} variant="secondary">
                  {loadingMore ? 'Yüklənir…' : 'Daha çox oxucu göstər'}
                </Button>
              </div>
            ) : (
              <p className="list-end">Bütün oxucuları gördün.</p>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="community-note-title" className="community-note">
        <Eyebrow>İCMANI GÖZƏL EDƏN</Eyebrow>
        <h2 id="community-note-title">
          <span className="heading-line">Oxuduğunu paylaş,</span>
          <span className="heading-line">başqasının baxışını dinlə.</span>
        </h2>
        <div>
          <p>
            <strong>Düşüncəli rəylər</strong>
            <span>Kitaba dair fikrini səmimi və əsaslandırılmış şəkildə bölüş.</span>
          </p>
          <p>
            <strong>Yeni səslər</strong>
            <span>Oxu zövqünə yaxın insanları və müəllifləri kəşf et.</span>
          </p>
          <p>
            <strong>Hörmətli söhbət</strong>
            <span>Fərqli fikirlərə açıq, təhlükəsiz bir məkan yarat.</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default CommunityPage;
