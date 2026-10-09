import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getCurrentUserProfile,
  updateUserProfile,
  getUserSocialLinks,
  updateUserSocialLinks,
  updateProfilePicture,
  deleteProfilePicture,
  changePassword,
  deleteAccount,
  getUserProfileByUsername,
  getUserProfileById,
} from '../api/users';
import { getUserShelves, getUserShelvesById } from '../api/shelves';
import { followUser, unfollowUser, getMyFollowing, getUserFollowers, getUserFollowing } from '../api/userFollows';
import { startConversation } from '../api/messages';
import { getUserFeed } from '../api/feed';
import { getUserYearChallenge } from '../api/readingChallenge';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import UserListModal from '../components/UserListModal';
import FeedItemCard from '../components/FeedItemCard';
import {
  Avatar,
  BookCover,
  Button,
  ButtonLink,
  Dialog,
  EmptyState,
  Eyebrow,
  Icon,
  LoadingState,
  SectionTitle,
  Tabs,
} from '../components/app/ui';
import { displayName, formatDate, shelfName } from '../components/app/format';
import '../styles/app/profile.css';

// Profile page (Make "Profile"): hero, shelves, reading year, activity and account settings.
// Own profile: /profile (or /profile/<own username|id>); another reader: /profile/<username|id>.

// Helper to check if user is admin
const isAdmin = (user) => {
  return user?.role === 'Admin' || user?.roles?.includes('Admin');
};

// Paged results come as an array, { data: [] } or { items: [] }.
const listFrom = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

// Date of birth is a DateOnly ("1995-05-03"); read it without a timezone shift.
const formatDateOnly = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  return match ? formatDate(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : formatDate(value);
};

const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Only http(s) links leave the app; "example.az" opens as https://example.az.
const externalUrl = (value) => {
  const url = value?.trim();
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(url)) return `https://${url}`;
  return null;
};

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Vebsayt';
  }
};

// Up to three real covers of a shelf, fanned out (Make "stacked-covers").
const StackedCovers = ({ books }) => {
  const shown = books.slice(0, 3);
  return (
    <div aria-hidden="true" className={`stacked-covers stacked-${shown.length}`}>
      {shown.length > 0
        ? shown.map((book) => <BookCover book={book} key={book.id} />)
        : [0, 1, 2].map((index) => <span className="cover-ghost" key={index} />)}
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="page profile-page">
    <section className="profile-hero" aria-busy="true">
      <div className="profile-pattern" />
      <div className="profile-main profile-skeleton" role="status" aria-label="Profil yüklənir">
        <span className="skeleton-avatar" />
        <div className="profile-copy">
          <span className="skeleton-line" style={{ width: 130 }} />
          <span className="skeleton-line skeleton-title" style={{ width: 'min(420px, 80%)' }} />
          <span className="skeleton-line" style={{ width: 110 }} />
          <span className="skeleton-line" style={{ width: 'min(560px, 95%)' }} />
        </div>
      </div>
      <div className="profile-stats" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span className="skeleton-line" key={index} style={{ width: 90, marginTop: 0 }} />
        ))}
      </div>
    </section>
  </div>
);

const editTabs = [
  { value: 'about', label: 'Haqqında' },
  { value: 'socials', label: 'Sosial şəbəkələr' },
];

const ProfileView = ({ identifier }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);
  const settingsRef = useRef(null);
  const uploadPhotoRef = useRef(null);
  const removePhotoRef = useRef(null);

  // Determine if viewing own profile
  const isOwnProfile = !identifier || identifier === user?.username || identifier === user?.id;

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // 'notFound' | 'failed'
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Profile data - Initialize with user data if viewing own profile to prevent flickering
  const [profile, setProfile] = useState(() => {
    // Check if viewing own profile during initialization
    const checkIsOwnProfile = !identifier || identifier === user?.username || identifier === user?.id;
    if (checkIsOwnProfile && user) {
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePictureUrl: user.profilePictureUrl,
        bio: user.bio,
        country: user.country,
      };
    }
    return null;
  });
  const [socials, setSocials] = useState({});
  const [shelves, setShelves] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [booksReadCount, setBooksReadCount] = useState(0);
  const [challenge, setChallenge] = useState(null);

  // Modal states
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTab, setEditTab] = useState('about');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Activity feed state
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedPage, setFeedPage] = useState(1);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    country: '',
    websiteUrl: '',
    dateOfBirth: '',
  });

  const [socialsForm, setSocialsForm] = useState({
    facebook: '',
    twitter: '',
    linkedIn: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Fetch the user's activity feed ("Son fəaliyyət")
  const fetchUserFeed = useCallback(async (pageNum = 1, append = false) => {
    if (!profile?.id) return;

    try {
      setFeedLoading(true);

      const response = await getUserFeed(profile.id, pageNum, 10);

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

      // Filter out items from admin users (shouldn't happen but just in case)
      const filteredItems = items.filter((item) => !isAdmin(item?.user));

      if (append) {
        setFeedItems((prev) => [...prev, ...filteredItems]);
      } else {
        setFeedItems(filteredItems);
      }

      setHasMoreFeed(pageNum < totalPages);
      setFeedPage(pageNum);
    } catch (err) {
      console.error('Error fetching user feed:', err);
      toast.error('Fəaliyyət lentini yükləmək alınmadı');
    } finally {
      setFeedLoading(false);
    }
  }, [profile?.id]);

  // Fetch profile data. `silent` refreshes in place (after a new photo) without the loading
  // screen and without discarding what is typed in the edit form.
  const fetchAllData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      let profileData;

      // Determine if it's own profile or another user's profile
      if (isOwnProfile) {
        // Own profile
        profileData = await getCurrentUserProfile();
      } else {
        // Another user's profile. Notifications and comments link by user id (a GUID), everything else
        // by username: try the likelier lookup first and fall back to the other one on 404.
        const byUsername = async () => {
          const data = await getUserProfileByUsername(identifier);
          // The profile DTO has no username; the identifier that found it is the username.
          return data && !data.username ? { ...data, username: identifier } : data;
        };
        const byId = () => getUserProfileById(identifier);
        const [first, second] = GUID_PATTERN.test(identifier) ? [byId, byUsername] : [byUsername, byId];
        try {
          profileData = await first();
        } catch (err) {
          if (err.response?.status === 404) {
            profileData = await second();
          } else {
            throw err;
          }
        }
      }

      // Check if profile is admin - don't show admin profiles
      if (!isOwnProfile && isAdmin(profileData)) {
        setError('notFound');
        setLoading(false);
        return;
      }

      setProfile(profileData);
      if (!silent) {
        setProfileForm({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          bio: profileData.bio || '',
          country: profileData.country || '',
          websiteUrl: profileData.websiteUrl || '',
          dateOfBirth: profileData.dateOfBirth || '',
        });
      }

      // Fetch additional data in parallel
      const promises = [];

      // Get shelves
      if (isOwnProfile) {
        promises.push(getUserShelves());
      } else {
        promises.push(getUserShelvesById(profileData.id, 1, 10));
      }

      // Get social links (only for own profile)
      if (isOwnProfile) {
        promises.push(getUserSocialLinks());
      } else {
        promises.push(Promise.resolve(null));
      }

      // Get followers/following counts
      promises.push(getUserFollowers(profileData.id, 1, 1));
      promises.push(getUserFollowing(profileData.id, 1, 1));

      // This year's reading challenge ("Bu il"); null when the reader has not set one
      promises.push(getUserYearChallenge(new Date().getFullYear(), profileData.id));

      const [shelvesData, socialsData, followersRes, followingRes, challengeRes] = await Promise.allSettled(promises);

      // Process shelves
      if (shelvesData.status === 'fulfilled') {
        let shelvesList = listFrom(shelvesData.value);

        // For other users, show only default shelves
        if (!isOwnProfile) {
          shelvesList = shelvesList.filter((s) => s.isDefault);
        }

        setShelves(shelvesList);

        // Count books read
        const readShelf = shelvesList.find((s) => s.name === 'Read');
        setBooksReadCount(readShelf?.bookCount || readShelf?.books?.length || 0);
      }

      // Process social links
      if (socialsData.status === 'fulfilled' && socialsData.value) {
        const s = socialsData.value;
        setSocials(s);
        setSocialsForm({
          facebook: s.facebook || '',
          twitter: s.twitter || '',
          linkedIn: s.linkedin || s.linkedIn || '',
        });
      }

      // Process followers count
      if (followersRes.status === 'fulfilled') {
        const data = followersRes.value;
        setFollowersCount(data?.totalCount || data?.length || 0);
      }

      // Process following count
      if (followingRes.status === 'fulfilled') {
        const data = followingRes.value;
        setFollowingCount(data?.totalCount || data?.length || 0);
      }

      setChallenge(challengeRes.status === 'fulfilled' ? challengeRes.value || null : null);

      // Check if current user follows this profile
      if (!isOwnProfile && user?.id) {
        try {
          const myFollowingRes = await getMyFollowing(1, 1000);
          const myFollowing = listFrom(myFollowingRes);
          const isFollowed = myFollowing.some((u) => u.id === profileData.id);
          setIsFollowing(isFollowed);
        } catch (err) {
          console.error('Error checking follow status:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Profili yükləmək alınmadı');
      if (!silent) setError(err.response?.status === 404 ? 'notFound' : 'failed');
    } finally {
      setLoading(false);
    }
  }, [identifier, isOwnProfile, user?.id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Load the activity feed once the profile is on screen
  useEffect(() => {
    if (!loading && !error && profile?.id) {
      fetchUserFeed(1);
    }
  }, [loading, error, profile?.id, fetchUserFeed]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (followLoading || isOwnProfile || !profile?.id || isAdmin(profile)) return;

    setFollowLoading(true);
    const wasFollowing = isFollowing;
    const name = profile.firstName || profile.username || 'Oxucu';

    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowersCount((prev) => (wasFollowing ? prev - 1 : prev + 1));

    try {
      if (wasFollowing) {
        await unfollowUser(profile.id);
        toast.success(`${name} artıq izlənilmir`);
      } else {
        await followUser(profile.id);
        toast.success(`${name} izlənilir`);
      }
    } catch (err) {
      // Handle 409 Conflict
      if (err.response?.status === 409) {
        if (!wasFollowing) {
          setIsFollowing(true);
          toast.info(`${name} artıq izlənilir`);
        } else {
          setIsFollowing(false);
          setFollowersCount((prev) => prev - 1);
        }
      } else {
        // Revert on error
        setIsFollowing(wasFollowing);
        setFollowersCount((prev) => (wasFollowing ? prev + 1 : prev - 1));
        toast.error(wasFollowing ? 'İzləməni dayandırmaq alınmadı' : 'İzləmək alınmadı');
      }
    } finally {
      setFollowLoading(false);
    }
  };

  // Navigate to messages
  const handleMessage = async () => {
    if (!profile?.id) return;

    try {
      await startConversation(profile.id);
      navigate('/messages', { state: { selectedUserId: profile.id } });
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast.error('Söhbətə başlamaq alınmadı');
    }
  };

  // Handle opening followers modal
  const handleOpenFollowers = async () => {
    if (!profile?.id || loadingFollowers) return;

    setLoadingFollowers(true);
    try {
      const response = await getUserFollowers(profile.id, 1, 100);
      // No need to filter here - backend already filters admins
      setFollowersList(listFrom(response));
      setIsFollowersModalOpen(true);
    } catch (err) {
      console.error('Error fetching followers:', err);
      toast.error('İzləyiciləri yükləmək alınmadı');
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Handle opening following modal
  const handleOpenFollowing = async () => {
    if (!profile?.id || loadingFollowing) return;

    setLoadingFollowing(true);
    try {
      const response = await getUserFollowing(profile.id, 1, 100);
      // No need to filter here - backend already filters admins
      setFollowingList(listFrom(response));
      setIsFollowingModalOpen(true);
    } catch (err) {
      console.error('Error fetching following:', err);
      toast.error('İzlənilənləri yükləmək alınmadı');
    } finally {
      setLoadingFollowing(false);
    }
  };

  // Edit dialog opens with the saved values (unsaved edits from last time are dropped).
  const openEdit = () => {
    setProfileForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      bio: profile?.bio || '',
      country: profile?.country || '',
      websiteUrl: profile?.websiteUrl || '',
      dateOfBirth: profile?.dateOfBirth || '',
    });
    setSocialsForm({
      facebook: socials?.facebook || '',
      twitter: socials?.twitter || '',
      linkedIn: socials?.linkedin || socials?.linkedIn || '',
    });
    setEditTab('about');
    setEditOpen(true);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);

      // Sanitize payload: Convert empty strings to null for optional fields
      // Backend expects null for nullable types like DateOnly?, implies JSON serialization error if "" is sent
      const payload = {
        ...profileForm,
        dateOfBirth: profileForm.dateOfBirth || null,
        websiteUrl: profileForm.websiteUrl || null,
        bio: profileForm.bio || null,
        firstName: profileForm.firstName || null,
        lastName: profileForm.lastName || null,
        country: profileForm.country || null,
      };

      await updateUserProfile(payload);
      toast.success('Profil yeniləndi');
      window.dispatchEvent(new Event('bookla:profile-updated'));
      setProfile((prev) => ({ ...prev, ...profileForm }));
      setEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profili yeniləmək alınmadı');
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSocialsSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);
      await updateUserSocialLinks(socialsForm);
      toast.success('Sosial keçidlər yeniləndi');
      setSocials(socialsForm);
      setEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sosial keçidləri yeniləmək alınmadı');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    // Same rules as the API validator, so the reader gets the reason in Azerbaijani.
    if (passwordForm.newPassword.length < 6) {
      toast.error('Yeni şifrə ən azı 6 simvol olmalıdır');
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      toast.error('Yeni şifrə cari şifrədən fərqli olmalıdır');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Yeni şifrələr üst-üstə düşmür');
      return;
    }
    try {
      setSaving(true);
      await changePassword(passwordForm);
      toast.success('Şifrə dəyişdirildi');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      // The API answers with ProblemDetails; once validation passes, its only failure is a wrong current password.
      const code = err.response?.data?.title;
      toast.error(code === 'Users.ChangePasswordFailed' ? 'Cari şifrə yanlışdır' : 'Şifrəni dəyişmək alınmadı');
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Şəkil faylı seçin');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Şəklin ölçüsü 5 MB-dan az olmalıdır');
      return;
    }

    try {
      setUploadingPicture(true);
      await updateProfilePicture(file);
      toast.success('Profil şəkli yeniləndi');
      window.dispatchEvent(new Event('bookla:profile-updated'));
      await fetchAllData({ silent: true });
    } catch (err) {
      console.error('Upload error:', err);

      // Extract specific error message
      let errorMessage = 'Şəkli yükləmək alınmadı';
      const errorData = err.response?.data;

      if (errorData) {
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.errors) {
          // Handle ValidationProblemDetails format
          if (Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors[0]?.description || errorData.errors[0];
          } else if (typeof errorData.errors === 'object') {
            const values = Object.values(errorData.errors).flat();
            errorMessage = values[0] || 'Yoxlama xətası';
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      uploadPhotoRef.current?.focus();
    }
  };

  const handleDeletePicture = async () => {
    if (deletingPicture) return;
    try {
      setDeletingPicture(true);
      await deleteProfilePicture();
      toast.success('Profil şəkli silindi');
      window.dispatchEvent(new Event('bookla:profile-updated'));
      setProfile((prev) => ({ ...prev, profilePictureUrl: null }));
    } catch {
      toast.error('Şəkli silmək alınmadı');
    } finally {
      setDeletingPicture(false);
      // The remove button disappears on success; keep keyboard focus inside the dialog.
      requestAnimationFrame(() => (removePhotoRef.current || uploadPhotoRef.current)?.focus());
    }
  };

  const handleDeleteAccount = async () => {
    if (saving) return;
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Təsdiqləmək üçün DELETE yazın');
      return;
    }
    try {
      setSaving(true);
      await deleteAccount();
      toast.success('Hesab silindi');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hesabı silmək alınmadı');
      setSaving(false);
    }
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
  };

  const toggleSettings = () => {
    setSettingsOpen((open) => !open);
    if (!settingsOpen) {
      requestAnimationFrame(() => settingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    const failed = error === 'failed';
    return (
      <div className="page profile-page">
        <h1 className="sr-only">Profil</h1>
        <EmptyState
          title={failed ? 'Profil yüklənmədi' : 'İstifadəçi tapılmadı'}
          text={
            failed
              ? 'Profil məlumatlarını yükləmək alınmadı. Bir az sonra yenidən cəhd edin.'
              : 'Bu istifadəçi mövcud deyil və ya silinib.'
          }
          action={
            <div className="profile-empty-actions">
              {failed && <Button onClick={() => fetchAllData()}>Yenidən cəhd et</Button>}
              <ButtonLink to="/community" variant={failed ? 'secondary' : 'primary'}>
                İcmaya keç
              </ButtonLink>
            </div>
          }
        />
      </div>
    );
  }

  const username = profile.username || (isOwnProfile ? user?.username : null);
  const name = displayName({ ...profile, username });

  // Links shown under the bio: own socials come from their endpoint, other readers' from the profile.
  const links = isOwnProfile ? socials : profile.social || {};
  const website = externalUrl(profile.websiteUrl);
  const socialLinks = [
    { label: 'Facebook', url: externalUrl(links?.facebook) },
    { label: 'X', url: externalUrl(links?.twitter) },
    { label: 'LinkedIn', url: externalUrl(links?.linkedin || links?.linkedIn) },
  ].filter((link) => link.url);

  // Books on the shelves (a book can sit on several shelves, so count each once).
  const bookIds = new Set(shelves.flatMap((shelf) => (shelf.books || []).map((book) => book.id)));
  const defaultShelfTotal = shelves
    .filter((shelf) => shelf.isDefault)
    .reduce((sum, shelf) => sum + (shelf.bookCount || shelf.books?.length || 0), 0);
  const totalBooks = Math.max(bookIds.size, defaultShelfTotal);
  const shelfCount = (shelfLabel) => {
    const shelf = shelves.find((s) => s.name === shelfLabel);
    return shelf?.bookCount || shelf?.books?.length || 0;
  };

  const challengeTarget = challenge?.targetBooksCount || 0;
  const challengeDone = challenge?.completedBooksCount || 0;
  const challengePercent = challengeTarget > 0 ? Math.min(100, Math.round((challengeDone / challengeTarget) * 100)) : 0;

  return (
    <div className="page profile-page">
      <section className="profile-hero">
        <div className="profile-pattern" />
        <div className="profile-main">
          <Avatar name={name} size="hero" src={profile.profilePictureUrl} />
          <div className="profile-copy">
            <Eyebrow>{isOwnProfile ? 'MƏNİM PROFİLİM' : 'OXUCU PROFİLİ'}</Eyebrow>
            <h1>{name}</h1>
            {username && <span>@{username}</span>}
            {profile.bio && <p>{profile.bio}</p>}
            <div className="social-links">
              {profile.country && <span>{profile.country}</span>}
              {website && (
                <a href={website} rel="noopener noreferrer" target="_blank">
                  {hostOf(website)} ↗<span className="sr-only"> (yeni pəncərədə açılır)</span>
                </a>
              )}
              {socialLinks.map((link) => (
                <a href={link.url} key={link.label} rel="noopener noreferrer" target="_blank">
                  {link.label} ↗<span className="sr-only"> (yeni pəncərədə açılır)</span>
                </a>
              ))}
              {profile.dateOfBirth && <span>Doğum tarixi: {formatDateOnly(profile.dateOfBirth)}</span>}
              {profile.createdAt && <span>Qoşulub: {formatDate(profile.createdAt)}</span>}
            </div>
          </div>
          <div className="profile-action">
            {isOwnProfile ? (
              <Button onClick={openEdit} variant="secondary">
                <Icon name="edit" /> Profili redaktə et
              </Button>
            ) : (
              !isAdmin(profile) && (
                <>
                  <Button
                    aria-busy={followLoading}
                    aria-pressed={isFollowing}
                    onClick={handleFollowToggle}
                    variant={isFollowing ? 'secondary' : 'primary'}
                  >
                    {isFollowing ? 'İzlənilir' : 'İzlə'}
                  </Button>
                  <Button onClick={handleMessage} variant="secondary">
                    <Icon name="send" size={16} /> Mesaj yaz
                  </Button>
                </>
              )
            )}
          </div>
        </div>
        <div className="profile-stats">
          <div>
            <strong>{totalBooks}</strong>
            <span>kitab</span>
          </div>
          <button aria-busy={loadingFollowers} aria-haspopup="dialog" onClick={handleOpenFollowers} type="button">
            <strong>{followersCount}</strong>
            <span>izləyici</span>
          </button>
          <button aria-busy={loadingFollowing} aria-haspopup="dialog" onClick={handleOpenFollowing} type="button">
            <strong>{followingCount}</strong>
            <span>izlənilən</span>
          </button>
          <div>
            <strong>{booksReadCount}</strong>
            <span>oxunub</span>
          </div>
        </div>
      </section>

      <section className="profile-layout">
        <div>
          <SectionTitle
            action={
              isOwnProfile && (
                <ButtonLink to="/my-shelves" variant="quiet">
                  Rəflərimə keç <Icon name="arrow" />
                </ButtonLink>
              )
            }
            eyebrow="AÇIQ RƏFLƏR"
            id="profile-shelves-title"
            title="Kitab dünyası"
          />
          {shelves.length > 0 ? (
            <div className="profile-shelves">
              {shelves.map((shelf) => {
                const count = shelf.bookCount || shelf.books?.length || 0;
                return (
                  <Link key={shelf.id} to={`/shelves/${shelf.id}`}>
                    <StackedCovers books={shelf.books || []} />
                    <strong>{shelfName(shelf.name)}</strong>
                    <span>{count} kitab</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              text={isOwnProfile ? 'Hələ rəflərinizə kitab əlavə etməmisiniz.' : 'Bu oxucu hələ rəflərinə kitab əlavə etməyib.'}
              title="Hələ rəf yoxdur"
            />
          )}
        </div>
        <aside aria-labelledby="reading-year-title" className="reading-year">
          {challenge && challengeTarget > 0 ? (
            <>
              <Eyebrow>BU İL · {challenge.year || new Date().getFullYear()}</Eyebrow>
              <h2 id="reading-year-title">
                <span className="heading-line">{challengeDone} kitab,</span>
                <span className="heading-line">hədəf {challengeTarget}</span>
              </h2>
              <p>
                {challengePercent >= 100
                  ? 'İllik oxu hədəfi tamamlanıb.'
                  : `İllik oxu hədəfinin ${challengePercent}%-i tamamlanıb.`}
              </p>
              <div
                aria-label="İllik oxu hədəfi"
                aria-valuemax={challengeTarget}
                aria-valuemin={0}
                aria-valuenow={Math.min(challengeDone, challengeTarget)}
                className="progress"
                role="progressbar"
              >
                <i style={{ width: `${challengePercent}%` }} />
              </div>
              {challenge.books?.length > 0 && (
                <>
                  <p className="year-books-label">Bu il oxunanlar</p>
                  <div className="year-books">
                    {challenge.books.slice(0, 5).map((book) => (
                      <Link aria-label={book.title} key={book.bookId} title={book.title} to={`/books/${book.bookId}`}>
                        <BookCover book={book} />
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <Eyebrow>OXU XÜLASƏSİ</Eyebrow>
              <h2 id="reading-year-title">
                <span className="heading-line">{booksReadCount} kitab</span>
                <span className="heading-line">oxunub</span>
              </h2>
              <p>
                {isOwnProfile
                  ? 'Bu il üçün hələ oxu hədəfi qoymamısınız.'
                  : 'Bu il üçün oxu hədəfi qoyulmayıb.'}
              </p>
              <dl className="year-summary">
                <div>
                  <dt>Hazırda oxuyur</dt>
                  <dd>{shelfCount('Currently Reading')}</dd>
                </div>
                <div>
                  <dt>Oxumaq istəyir</dt>
                  <dd>{shelfCount('Want to Read')}</dd>
                </div>
              </dl>
              {isOwnProfile && (
                <ButtonLink to="/dashboard" variant="terracotta">
                  Oxu hədəfi qoy
                </ButtonLink>
              )}
            </>
          )}
        </aside>
      </section>

      <section aria-labelledby="profile-activity-title">
        <SectionTitle eyebrow="SON FƏALİYYƏT" id="profile-activity-title" title="Oxu gündəliyi" />
        {feedLoading && feedItems.length === 0 ? (
          <LoadingState count={2} kind="feed" />
        ) : feedItems.length > 0 ? (
          <>
            <div className="profile-feed">
              {feedItems.map((item) => (
                <FeedItemCard
                  item={item}
                  key={item.id}
                  onItemDeleted={(itemId) => setFeedItems((prev) => prev.filter((i) => i.id !== itemId))}
                />
              ))}
            </div>

            {hasMoreFeed && (
              <div className="profile-more">
                <Button
                  aria-busy={feedLoading}
                  aria-disabled={feedLoading}
                  onClick={() => !feedLoading && fetchUserFeed(feedPage + 1, true)}
                  variant="secondary"
                >
                  {feedLoading ? 'Yüklənir…' : 'Daha çox göstər'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            text={
              isOwnProfile
                ? 'Hələ sitat, rəy paylaşmamısınız və rəflərə kitab əlavə etməmisiniz.'
                : 'Bu oxucu hələ heç nə paylaşmayıb.'
            }
            title="Hələ fəaliyyət yoxdur"
          />
        )}
      </section>

      {isOwnProfile && (
        <div className="profile-settings" ref={settingsRef}>
          <button
            aria-controls="account-settings"
            aria-expanded={settingsOpen}
            className="settings-entry"
            onClick={toggleSettings}
            type="button"
          >
            Hesab və məxfilik ayarları <Icon name="arrow" />
          </button>
          {settingsOpen && (
            <div className="account-settings" id="account-settings">
              <form aria-labelledby="password-title" className="settings-card" onSubmit={handlePasswordSubmit}>
                <Eyebrow>TƏHLÜKƏSİZLİK</Eyebrow>
                <h3 id="password-title">Şifrəni dəyiş</h3>
                <label className="text-field">
                  <span>Cari şifrə</span>
                  <input
                    autoComplete="current-password"
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    type="password"
                    value={passwordForm.currentPassword}
                  />
                </label>
                <div className="form-pair">
                  <label className="text-field">
                    <span>Yeni şifrə</span>
                    <input
                      autoComplete="new-password"
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      type="password"
                      value={passwordForm.newPassword}
                    />
                  </label>
                  <label className="text-field">
                    <span>Yeni şifrənin təkrarı</span>
                    <input
                      autoComplete="new-password"
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      type="password"
                      value={passwordForm.confirmPassword}
                    />
                  </label>
                </div>
                <Button aria-busy={saving} aria-disabled={saving} type="submit">
                  {saving ? 'Dəyişdirilir…' : 'Şifrəni dəyiş'}
                </Button>
              </form>

              <div aria-labelledby="danger-title" className="settings-card danger-zone" role="group">
                <Eyebrow>TƏHLÜKƏLİ ZONA</Eyebrow>
                <h3 id="danger-title">Hesabı sil</h3>
                <p>Hesabınızı sildikdən sonra onu geri qaytarmaq mümkün olmayacaq. Zəhmət olmasa, əmin olun.</p>
                <Button onClick={() => setShowDeleteConfirm(true)} variant="danger">
                  <Icon name="trash" size={16} /> Hesabı sil
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lives outside the dialog so the dialog's focus trap only sees visible controls. */}
      {isOwnProfile && (
        <input accept="image/*" hidden onChange={handlePictureUpload} ref={fileInputRef} tabIndex={-1} type="file" />
      )}

      {editOpen && (
        <Dialog className="profile-edit-modal" labelledBy="edit-profile-title" onClose={() => setEditOpen(false)}>
          <Eyebrow>PROFİLİ REDAKTƏ ET</Eyebrow>
          <h2 id="edit-profile-title">Özün haqqında</h2>
          <Tabs active={editTab} label="Profil bölmələri" onChange={setEditTab} tabs={editTabs} />

          {editTab === 'about' ? (
            <>
              <div className="photo-field">
                <Avatar name={name} size="large" src={profile.profilePictureUrl} />
                <div>
                  <strong>Profil şəkli</strong>
                  <span>Şəkil faylı, ən çox 5 MB.</span>
                  <div className="photo-actions">
                    <Button
                      aria-busy={uploadingPicture}
                      aria-disabled={uploadingPicture}
                      onClick={() => !uploadingPicture && fileInputRef.current?.click()}
                      ref={uploadPhotoRef}
                      variant="secondary"
                    >
                      {uploadingPicture ? 'Yüklənir…' : profile.profilePictureUrl ? 'Şəkli dəyiş' : 'Şəkil yüklə'}
                    </Button>
                    {profile.profilePictureUrl && (
                      <Button
                        aria-busy={deletingPicture}
                        className="photo-remove"
                        aria-disabled={deletingPicture}
                        onClick={handleDeletePicture}
                        ref={removePhotoRef}
                        variant="quiet"
                      >
                        <Icon name="trash" size={16} /> {deletingPicture ? 'Silinir…' : 'Şəkli sil'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="form-pair">
                  <label className="text-field">
                    <span>Ad</span>
                    <input
                      autoComplete="given-name"
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      placeholder="Elçin"
                      type="text"
                      value={profileForm.firstName}
                    />
                  </label>
                  <label className="text-field">
                    <span>Soyad</span>
                    <input
                      autoComplete="family-name"
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      placeholder="Məmmədov"
                      type="text"
                      value={profileForm.lastName}
                    />
                  </label>
                </div>
                <label className="text-field">
                  <span>Bioqrafiya</span>
                  <textarea
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Özünüz və sevdiyiniz kitablar haqqında bir neçə söz…"
                    rows={4}
                    value={profileForm.bio}
                  />
                </label>
                <div className="form-pair">
                  <label className="text-field">
                    <span>Məkan</span>
                    <input
                      autoComplete="country-name"
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                      placeholder="Bakı, Azərbaycan"
                      type="text"
                      value={profileForm.country}
                    />
                  </label>
                  <label className="text-field">
                    <span>Doğum tarixi</span>
                    <input
                      autoComplete="bday"
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      type="date"
                      value={profileForm.dateOfBirth}
                    />
                  </label>
                </div>
                <label className="text-field">
                  <span>Vebsayt</span>
                  <input
                    autoComplete="url"
                    onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                    placeholder="https://saytiniz.az"
                    type="url"
                    value={profileForm.websiteUrl}
                  />
                </label>
                <div className="modal-actions">
                  <Button onClick={() => setEditOpen(false)} variant="secondary">
                    Ləğv et
                  </Button>
                  <Button aria-busy={saving} aria-disabled={saving} type="submit">
                    {saving ? 'Saxlanılır…' : 'Yadda saxla'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <form onSubmit={handleSocialsSubmit}>
              <label className="text-field">
                <span>Facebook</span>
                <input
                  onChange={(e) => setSocialsForm({ ...socialsForm, facebook: e.target.value })}
                  placeholder="https://facebook.com/istifadeci"
                  type="url"
                  value={socialsForm.facebook}
                />
              </label>
              <label className="text-field">
                <span>X (Twitter)</span>
                <input
                  onChange={(e) => setSocialsForm({ ...socialsForm, twitter: e.target.value })}
                  placeholder="https://x.com/istifadeci"
                  type="url"
                  value={socialsForm.twitter}
                />
              </label>
              <label className="text-field">
                <span>LinkedIn</span>
                <input
                  onChange={(e) => setSocialsForm({ ...socialsForm, linkedIn: e.target.value })}
                  placeholder="https://linkedin.com/in/istifadeci"
                  type="url"
                  value={socialsForm.linkedIn}
                />
              </label>
              <div className="modal-actions">
                <Button onClick={() => setEditOpen(false)} variant="secondary">
                  Ləğv et
                </Button>
                <Button aria-busy={saving} aria-disabled={saving} type="submit">
                  {saving ? 'Saxlanılır…' : 'Yadda saxla'}
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      )}

      {showDeleteConfirm && (
        <Dialog className="delete-account-modal" labelledBy="delete-account-title" onClose={closeDeleteConfirm}>
          <Eyebrow>TƏHLÜKƏLİ ZONA</Eyebrow>
          <h2 id="delete-account-title">Hesab silinsin?</h2>
          <p>Hesabınızı sildikdən sonra onu geri qaytarmaq mümkün olmayacaq. Zəhmət olmasa, əmin olun.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDeleteAccount();
            }}
          >
            <label className="text-field">
              <span>
                Təsdiqləmək üçün <strong>DELETE</strong> yazın
              </span>
              <input
                autoCapitalize="characters"
                autoComplete="off"
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                spellCheck={false}
                type="text"
                value={deleteConfirmText}
              />
            </label>
            <div className="modal-actions">
              <Button onClick={closeDeleteConfirm} variant="secondary">
                Ləğv et
              </Button>
              <Button
                aria-busy={saving}
                aria-disabled={saving}
                disabled={deleteConfirmText !== 'DELETE'}
                type="submit"
                variant="danger"
              >
                <Icon name="trash" size={16} /> {saving ? 'Silinir…' : 'Hesabı birdəfəlik sil'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* User List Modals */}
      <UserListModal
        eyebrow={name}
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        title="İzləyicilər"
        users={followersList}
      />
      <UserListModal
        eyebrow={name}
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        title="İzlənilənlər"
        users={followingList}
      />
    </div>
  );
};

// A new identifier is a new profile: remount so no state (feed, modals, follow status) carries over.
const ProfilePage = () => {
  const { identifier } = useParams(); // Can be username or userId
  return <ProfileView identifier={identifier} key={identifier || 'me'} />;
};

export default ProfilePage;
