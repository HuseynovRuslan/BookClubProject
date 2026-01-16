import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Camera,
  Trash2,
  MapPin,
  Globe,
  Calendar,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Linkedin,
  Shield,
  Edit3,
  Eye,
  Lock,
  AlertTriangle,
  Loader,
  Check,
  X,
  ArrowLeft,
  BookOpen,
  Users,
  UserPlus,
  UserCheck,
  MessageCircle,
  Library,
  ChevronRight,
  BookMarked,
  ExternalLink,
} from 'lucide-react';
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
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import BookCard from '../components/BookCard';
import UserListModal from '../components/UserListModal';
import FeedItemCard from '../components/FeedItemCard';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  
  // Normalize path separators (convert Windows backslashes to forward slashes)
  let normalizedPath = url.replace(/\\/g, '/');
  
  // Remove leading slash if present
  const cleanPath = normalizedPath.startsWith('/') 
    ? normalizedPath.substring(1) 
    : normalizedPath;
  
  return `${BASE_URL}/${cleanPath}`;
};

// Helper to check if user is admin
const isAdmin = (user) => {
  return user?.role === 'Admin' || user?.roles?.includes('Admin');
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'Not set';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Shelf Preview Card
const ShelfPreviewCard = ({ shelf }) => {
  const books = shelf?.books || [];
  const displayBooks = books.slice(0, 4);
  
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Library className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-stone-800">{shelf.name}</h3>
          <span className="text-sm text-stone-400">({shelf.bookCount || books.length})</span>
        </div>
        {books.length > 4 && (
          <Link
            to={`/shelves/${shelf.id}`}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      
      {displayBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {displayBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-stone-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-stone-300" />
          <p className="text-sm">No books in this shelf yet</p>
        </div>
      )}
    </div>
  );
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'shelves', label: 'Bookshelves', icon: Library },
  { id: 'activity', label: 'Activity', icon: BookOpen },
];

const editTabs = [
  { id: 'edit', label: 'Edit Profile', icon: Edit3 },
  { id: 'socials', label: 'Social Links', icon: LinkIcon },
  { id: 'security', label: 'Security', icon: Shield },
];

const ProfilePage = () => {
  const { identifier } = useParams(); // Can be username or userId
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);

  // Determine if viewing own profile
  const isOwnProfile = !identifier || identifier === user?.username || identifier === user?.id;

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Modal states
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

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

  // Fetch user feed for Activity tab
  const fetchUserFeed = useCallback(async (pageNum = 1, append = false) => {
    if (!profile?.id) return;
    
    try {
      if (pageNum === 1 && !append) {
        setFeedLoading(true);
      }

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
      const filteredItems = items.filter(item => !isAdmin(item?.user));
      
      if (append) {
        setFeedItems((prev) => [...prev, ...filteredItems]);
      } else {
        setFeedItems(filteredItems);
      }

      setHasMoreFeed(pageNum < totalPages);
      setFeedPage(pageNum);
    } catch (error) {
      console.error('Error fetching user feed:', error);
      toast.error('Failed to load activity feed');
    } finally {
      setFeedLoading(false);
    }
  }, [profile?.id]);

  // Fetch profile data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      let profileData;

      // Determine if it's own profile or another user's profile
      if (isOwnProfile) {
        // Own profile
        profileData = await getCurrentUserProfile();
      } else {
        // Another user's profile - try username first, then ID
        try {
          profileData = await getUserProfileByUsername(identifier);
        } catch (err) {
          // If username fails, try as ID
          if (err.response?.status === 404) {
            profileData = await getUserProfileById(identifier);
          } else {
            throw err;
          }
        }
      }

      // Check if profile is admin - don't show admin profiles
      if (!isOwnProfile && isAdmin(profileData)) {
        setError('User not found');
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setProfileForm({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        bio: profileData.bio || '',
        country: profileData.country || '',
        websiteUrl: profileData.websiteUrl || '',
        dateOfBirth: profileData.dateOfBirth || '',
      });

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

      const [shelvesData, socialsData, followersRes, followingRes] = await Promise.allSettled(promises);

      // Process shelves
      if (shelvesData.status === 'fulfilled') {
        let shelvesList = [];
        const data = shelvesData.value;
        if (Array.isArray(data)) {
          shelvesList = data;
        } else if (Array.isArray(data?.data)) {
          shelvesList = data.data;
        } else if (Array.isArray(data?.items)) {
          shelvesList = data.items;
        }
        
        // For other users, show only default shelves
        if (!isOwnProfile) {
          shelvesList = shelvesList.filter(s => s.isDefault);
        }
        
        setShelves(shelvesList);
        
        // Count books read
        const readShelf = shelvesList.find(s => s.name === 'Read');
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

      // Check if current user follows this profile
      if (!isOwnProfile && user?.id) {
        try {
          const myFollowingRes = await getMyFollowing(1, 1000);
          let myFollowing = [];
          if (Array.isArray(myFollowingRes)) {
            myFollowing = myFollowingRes;
          } else if (Array.isArray(myFollowingRes?.data)) {
            myFollowing = myFollowingRes.data;
          } else if (Array.isArray(myFollowingRes?.items)) {
            myFollowing = myFollowingRes.items;
          }
          const isFollowed = myFollowing.some(u => u.id === profileData.id);
          setIsFollowing(isFollowed);
        } catch (err) {
          console.error('Error checking follow status:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [identifier, isOwnProfile, user?.id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fetch activity feed when tab is active
  useEffect(() => {
    if (activeTab === 'activity' && profile?.id && feedItems.length === 0) {
      fetchUserFeed(1);
    }
  }, [activeTab, profile?.id, fetchUserFeed]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (followLoading || isOwnProfile || !profile?.id || isAdmin(profile)) return;
    
    setFollowLoading(true);
    const wasFollowing = isFollowing;
    
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowersCount(prev => wasFollowing ? prev - 1 : prev + 1);
    
    try {
      if (wasFollowing) {
        await unfollowUser(profile.id);
        toast.success(`Unfollowed ${profile.firstName || profile.username}`);
      } else {
        await followUser(profile.id);
        toast.success(`Following ${profile.firstName || profile.username}`);
      }
    } catch (error) {
      // Handle 409 Conflict
      if (error.response?.status === 409) {
        if (!wasFollowing) {
          setIsFollowing(true);
          toast.info(`Already following ${profile.firstName || profile.username}`);
        } else {
          setIsFollowing(false);
          setFollowersCount(prev => prev - 1);
        }
      } else {
        // Revert on error
        setIsFollowing(wasFollowing);
        setFollowersCount(prev => wasFollowing ? prev + 1 : prev - 1);
        toast.error(wasFollowing ? 'Failed to unfollow' : 'Failed to follow');
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
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Handle opening followers modal
  const handleOpenFollowers = async () => {
    if (!profile?.id || loadingFollowers) return;
    
    setLoadingFollowers(true);
    try {
      const response = await getUserFollowers(profile.id, 1, 100);
      
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (Array.isArray(response?.data)) {
        users = response.data;
      } else if (Array.isArray(response?.items)) {
        users = response.items;
      }
      
      // No need to filter here - backend already filters admins
      setFollowersList(users);
      setIsFollowersModalOpen(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error('Failed to load followers');
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
      
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (Array.isArray(response?.data)) {
        users = response.data;
      } else if (Array.isArray(response?.items)) {
        users = response.items;
      }
      
      // No need to filter here - backend already filters admins
      setFollowingList(users);
      setIsFollowingModalOpen(true);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error('Failed to load following');
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile(profileForm);
      toast.success('Profile updated successfully');
      setProfile(prev => ({ ...prev, ...profileForm }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSocialsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserSocialLinks(socialsForm);
      toast.success('Social links updated successfully');
      setSocials(socialsForm);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update social links');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setSaving(true);
      await changePassword(passwordForm);
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0]?.description || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingPicture(true);
      await updateProfilePicture(file);
      toast.success('Profile picture updated');
      await fetchAllData();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to upload picture';
      toast.error(errorMessage);
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePicture = async () => {
    try {
      setDeletingPicture(true);
      await deleteProfilePicture();
      toast.success('Profile picture removed');
      setProfile(prev => ({ ...prev, profilePictureUrl: null }));
    } catch (error) {
      toast.error('Failed to remove picture');
    } finally {
      setDeletingPicture(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      setSaving(true);
      await deleteAccount();
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setSaving(false);
    }
  };

  const getInitials = () => {
    const first = profile?.firstName?.[0] || user?.username?.[0] || profile?.username?.[0] || 'U';
    const last = profile?.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  const getProfilePictureUrl = () => {
    return getImageUrl(profile?.profilePictureUrl);
  };

  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : profile?.username || user?.username || 'User';

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-stone-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-stone-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-stone-500 mt-4 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <button
              onClick={() => navigate('/')}
              className="group inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="w-20 h-20 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">User not found</h2>
          <p className="text-stone-500 mb-6">{error || "The user doesn't exist or has been removed."}</p>
          <button
            onClick={() => navigate('/community')}
            className="px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            Browse Community
          </button>
        </div>
      </div>
    );
  }

  const currentTabs = isOwnProfile ? [...tabs, ...editTabs] : tabs;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-6">
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-full border-4 border-stone-100 bg-stone-200 overflow-hidden shadow-lg">
                  {getProfilePictureUrl() ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-700 to-stone-900 text-white text-3xl font-bold">
                      {getInitials()}
                    </div>
                  )}
                </div>
                
                {/* Upload/Delete Buttons - Only for own profile */}
                {isOwnProfile && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPicture}
                      className="w-9 h-9 bg-stone-900/80 hover:bg-stone-900 rounded-full flex items-center justify-center text-white transition-colors"
                      title="Upload picture"
                    >
                      {uploadingPicture ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                    {getProfilePictureUrl() && (
                      <button
                        onClick={handleDeletePicture}
                        disabled={deletingPicture}
                        className="w-9 h-9 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                        title="Remove picture"
                      >
                        {deletingPicture ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  className="hidden"
                />
              </div>

              {/* Name & Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-stone-900">{displayName}</h1>
                <p className="text-stone-500 mb-2">@{profile?.username || user?.username}</p>
                {profile?.bio && (
                  <p className="text-stone-600 mb-4">{profile.bio}</p>
                )}
                
                {/* Meta Info */}
                {!isOwnProfile && (
                  <div className="flex flex-wrap gap-4 text-sm text-stone-500 mb-4">
                    {profile?.country && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.country}
                      </span>
                    )}
                    {profile?.websiteUrl && (
                      <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-amber-600 hover:text-amber-700"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {profile?.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-6 mb-4">
                  <button
                    onClick={handleOpenFollowers}
                    disabled={loadingFollowers}
                    className="text-center hover:bg-stone-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="text-xl font-bold text-stone-900">
                      {loadingFollowers ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : followersCount}
                    </div>
                    <div className="text-xs text-stone-500">Followers</div>
                  </button>
                  <button
                    onClick={handleOpenFollowing}
                    disabled={loadingFollowing}
                    className="text-center hover:bg-stone-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="text-xl font-bold text-stone-900">
                      {loadingFollowing ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : followingCount}
                    </div>
                    <div className="text-xs text-stone-500">Following</div>
                  </button>
                  <div className="text-center px-3 py-2">
                    <div className="text-xl font-bold text-stone-900">{booksReadCount}</div>
                    <div className="text-xs text-stone-500">Books Read</div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && !isAdmin(profile) && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                        isFollowing
                          ? 'bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600'
                          : 'bg-stone-900 text-white hover:bg-stone-800'
                      }`}
                    >
                      {followLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleMessage}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-stone-200 overflow-x-auto">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? 'text-stone-900 border-b-2 border-stone-900 -mb-px'
                      : 'text-stone-500 hover:text-stone-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-stone-800">Profile Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile?.country && (
                    <div className="flex items-center gap-3 text-stone-600">
                      <MapPin className="w-5 h-5 text-stone-400" />
                      <span>{profile.country}</span>
                    </div>
                  )}
                  {profile?.websiteUrl && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-stone-400" />
                      <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-600 hover:text-stone-900 hover:underline"
                      >
                        {profile.websiteUrl}
                      </a>
                    </div>
                  )}
                  {profile?.dateOfBirth && (
                    <div className="flex items-center gap-3 text-stone-600">
                      <Calendar className="w-5 h-5 text-stone-400" />
                      <span>Born {formatDate(profile.dateOfBirth)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-stone-600">
                    <Calendar className="w-5 h-5 text-stone-400" />
                    <span>Joined {formatDate(profile?.createdAt)}</span>
                  </div>
                </div>

                {/* Social Links */}
                {(socials?.facebook || socials?.twitter || socials?.linkedin || socials?.linkedIn) && (
                  <div>
                    <h3 className="font-semibold text-stone-800 mb-3">Social Links</h3>
                    <div className="flex gap-3">
                      {socials?.facebook && (
                        <a
                          href={socials.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-stone-100 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Facebook className="w-5 h-5 text-stone-600 hover:text-blue-600" />
                        </a>
                      )}
                      {socials?.twitter && (
                        <a
                          href={socials.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-stone-100 hover:bg-sky-100 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Twitter className="w-5 h-5 text-stone-600 hover:text-sky-500" />
                        </a>
                      )}
                      {(socials?.linkedin || socials?.linkedIn) && (
                        <a
                          href={socials.linkedin || socials.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-stone-100 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Linkedin className="w-5 h-5 text-stone-600 hover:text-blue-700" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shelves Tab */}
            {activeTab === 'shelves' && (
              <div className="space-y-4">
                {shelves.length > 0 ? (
                  shelves.map((shelf) => (
                    <ShelfPreviewCard key={shelf.id} shelf={shelf} />
                  ))
                ) : (
                  <div className="text-center py-8 text-stone-400">
                    <BookMarked className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                    <h3 className="font-medium text-stone-800 mb-1">No shelves yet</h3>
                    <p className="text-sm text-stone-500">
                      {isOwnProfile ? "You haven't added any books to your shelves yet." : "This user hasn't added any books yet."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {feedLoading && feedItems.length === 0 ? (
                  // Loading skeleton
                  <>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-stone-50 rounded-xl border border-stone-200 p-4 animate-pulse">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-stone-200 rounded-full" />
                          <div className="flex-1">
                            <div className="h-4 bg-stone-200 rounded w-32 mb-2" />
                            <div className="h-3 bg-stone-200 rounded w-20" />
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="h-4 bg-stone-200 rounded w-full" />
                          <div className="h-4 bg-stone-200 rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : feedItems.length > 0 ? (
                  <>
                    {feedItems.map((item) => (
                      <FeedItemCard
                        key={item.id}
                        item={item}
                        onItemDeleted={(itemId) =>
                          setFeedItems((prev) => prev.filter((i) => i.id !== itemId))
                        }
                      />
                    ))}
                    
                    {/* Load More Button */}
                    {hasMoreFeed && (
                      <div className="text-center py-4">
                        <button
                          onClick={() => fetchUserFeed(feedPage + 1, true)}
                          disabled={feedLoading}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all font-medium disabled:opacity-50"
                        >
                          {feedLoading ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Load More'
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-stone-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                    <h3 className="font-medium text-stone-800 mb-1">No activity yet</h3>
                    <p className="text-sm text-stone-500">
                      {isOwnProfile 
                        ? "You haven't shared any quotes, reviews, or added books yet." 
                        : "This user hasn't shared any activity yet."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Edit Profile Tab - Only for own profile */}
            {isOwnProfile && activeTab === 'edit' && (
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                      placeholder="New York, USA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileForm.websiteUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Social Links Tab - Only for own profile */}
            {isOwnProfile && activeTab === 'socials' && (
              <form onSubmit={handleSocialsSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </div>
                  </label>
                  <input
                    type="url"
                    value={socialsForm.facebook}
                    onChange={(e) => setSocialsForm({ ...socialsForm, facebook: e.target.value })}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                    placeholder="https://facebook.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter / X
                    </div>
                  </label>
                  <input
                    type="url"
                    value={socialsForm.twitter}
                    onChange={(e) => setSocialsForm({ ...socialsForm, twitter: e.target.value })}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </div>
                  </label>
                  <input
                    type="url"
                    value={socialsForm.linkedIn}
                    onChange={(e) => setSocialsForm({ ...socialsForm, linkedIn: e.target.value })}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Social Links
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Security Tab - Only for own profile */}
            {isOwnProfile && activeTab === 'security' && (
              <div className="space-y-8">
                {/* Change Password */}
                <div>
                  <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1.5">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </form>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 rounded-xl p-5 bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-red-700 font-medium">
                        Type <span className="font-mono bg-red-100 px-1 rounded">DELETE</span> to confirm:
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-red-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        placeholder="Type DELETE"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={saving || deleteConfirmText !== 'DELETE'}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User List Modals */}
      <UserListModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        title="Followers"
        users={followersList}
      />
      <UserListModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        title="Following"
        users={followingList}
      />
    </div>
  );
};

export default ProfilePage;
