import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  UserPlus,
  UserCheck,
  BookOpen,
  Calendar,
  MapPin,
  Globe,
  ExternalLink,
  Star,
  Library,
  Loader,
  MessageCircle,
  Heart,
  Clock,
  BookMarked,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getUserProfileByUsername } from '../api/users';
import { getUserShelvesById } from '../api/shelves';
import { followUser, unfollowUser, getMyFollowing, getUserFollowers, getUserFollowing } from '../api/userFollows';
import { startConversation } from '../api/messages';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import UserListModal from '../components/UserListModal';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
};

// Skeleton Components
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-32 h-32 bg-stone-200 rounded-full" />
          <div className="flex-1 text-center sm:text-left">
            <div className="h-8 bg-stone-200 rounded w-48 mb-2" />
            <div className="h-5 bg-stone-200 rounded w-32 mb-4" />
            <div className="h-4 bg-stone-200 rounded w-64 mb-4" />
            <div className="flex gap-6 justify-center sm:justify-start">
              <div className="h-10 bg-stone-200 rounded w-24" />
              <div className="h-10 bg-stone-200 rounded w-24" />
              <div className="h-10 bg-stone-200 rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Content Skeleton */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid gap-6">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="h-6 bg-stone-200 rounded w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-stone-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Shelf Preview Card with Grid Layout
const ShelfPreviewCard = ({ shelf, userId }) => {
  const books = shelf?.books || [];
  const displayBooks = books.slice(0, 8); // Show up to 8 books in grid
  
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Library className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-stone-800">{shelf.name}</h3>
          <span className="text-sm text-stone-400">({shelf.bookCount || books.length})</span>
        </div>
        {books.length > 8 && (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

// Stat Card
const StatCard = ({ icon: Icon, label, value, color = 'stone' }) => (
  <div className="text-center">
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${color}-100 mb-2`}>
      <Icon className={`w-5 h-5 text-${color}-600`} />
    </div>
    <p className="text-2xl font-bold text-stone-800">{value}</p>
    <p className="text-sm text-stone-500">{label}</p>
  </div>
);

// Main Component
const PublicProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [profile, setProfile] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  
  // Check if viewing own profile
  const isOwnProfile = user?.username?.toLowerCase() === username?.toLowerCase();

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!username) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch profile
      const profileData = await getUserProfileByUsername(username);
      setProfile(profileData);
      
      if (profileData?.id) {
        // Fetch shelves, followers, following in parallel
        const [shelvesRes, followersRes, followingRes] = await Promise.allSettled([
          getUserShelvesById(profileData.id, 1, 10),
          getUserFollowers(profileData.id, 1, 1),
          getUserFollowing(profileData.id, 1, 1),
        ]);
        
        // Process shelves
        if (shelvesRes.status === 'fulfilled') {
          const shelvesData = shelvesRes.value;
          let shelvesList = [];
          if (Array.isArray(shelvesData)) {
            shelvesList = shelvesData;
          } else if (Array.isArray(shelvesData?.data)) {
            shelvesList = shelvesData.data;
          } else if (Array.isArray(shelvesData?.items)) {
            shelvesList = shelvesData.items;
          }
          // Filter to show only default shelves (Read, Want to Read, Currently Reading)
          const defaultShelves = shelvesList.filter(s => s.isDefault);
          setShelves(defaultShelves);
        }
        
        // Process followers count
        if (followersRes.status === 'fulfilled') {
          const followersData = followersRes.value;
          setFollowersCount(followersData?.totalCount || followersData?.length || 0);
        }
        
        // Process following count
        if (followingRes.status === 'fulfilled') {
          const followingData = followingRes.value;
          setFollowingCount(followingData?.totalCount || followingData?.length || 0);
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
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('User not found');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [username, isOwnProfile, user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (followLoading || isOwnProfile || !profile?.id) return;
    
    setFollowLoading(true);
    const wasFollowing = isFollowing;
    
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowersCount(prev => wasFollowing ? prev - 1 : prev + 1);
    
    try {
      if (wasFollowing) {
        await unfollowUser(profile.id);
        toast.success(`Unfollowed ${profile.firstName || username}`);
      } else {
        await followUser(profile.id);
        toast.success(`Following ${profile.firstName || username}`);
      }
    } catch (error) {
      // Handle 409 Conflict
      if (error.response?.status === 409) {
        if (!wasFollowing) {
          setIsFollowing(true);
          toast.info(`Already following ${profile.firstName || username}`);
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
      const result = await startConversation(profile.id);
      // Navigate to messages page with the user ID
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
      
      // Extract users from the response
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (Array.isArray(response?.data)) {
        users = response.data;
      } else if (Array.isArray(response?.items)) {
        users = response.items;
      }
      
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
      
      // Extract users from the response
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (Array.isArray(response?.data)) {
        users = response.data;
      } else if (Array.isArray(response?.items)) {
        users = response.items;
      }
      
      setFollowingList(users);
      setIsFollowingModalOpen(true);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error('Failed to load following');
    } finally {
      setLoadingFollowing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </header>
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="w-20 h-20 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">User not found</h2>
          <p className="text-stone-500 mb-6">The user @{username} doesn't exist or has been removed.</p>
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

  const profilePicUrl = getImageUrl(profile.profilePictureUrl);
  const initials = profile.firstName && profile.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`
    : username?.[0]?.toUpperCase() || '?';
  const fullName = profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : username;
  const booksRead = shelves.find(s => s.name === 'Read')?.bookCount || 0;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-stone-800">Profile</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center text-white text-4xl font-bold overflow-hidden ring-4 ring-stone-100 shadow-lg">
              {profilePicUrl ? (
                <img src={profilePicUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-stone-900">{fullName}</h1>
              <p className="text-stone-500 mb-3">@{username}</p>
              
              {profile.bio && (
                <p className="text-stone-600 mb-4 max-w-lg">{profile.bio}</p>
              )}
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm text-stone-500 mb-4">
                {profile.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.country}
                  </span>
                )}
                {profile.websiteUrl && (
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
                {profile.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(profile.createdAt)}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 justify-center sm:justify-start mb-6">
                <button
                  onClick={handleOpenFollowers}
                  className="text-center hover:bg-stone-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  disabled={loadingFollowers}
                >
                  <p className="text-xl font-bold text-stone-800">
                    {loadingFollowers ? (
                      <Loader className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      followersCount
                    )}
                  </p>
                  <p className="text-sm text-stone-500 hover:text-amber-600 transition-colors">Followers</p>
                </button>
                <button
                  onClick={handleOpenFollowing}
                  className="text-center hover:bg-stone-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  disabled={loadingFollowing}
                >
                  <p className="text-xl font-bold text-stone-800">
                    {loadingFollowing ? (
                      <Loader className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      followingCount
                    )}
                  </p>
                  <p className="text-sm text-stone-500 hover:text-amber-600 transition-colors">Following</p>
                </button>
                <div className="text-center px-3 py-2">
                  <p className="text-xl font-bold text-stone-800">{booksRead}</p>
                  <p className="text-sm text-stone-500">Books Read</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center sm:justify-start">
                {isOwnProfile ? (
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors font-medium"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Shelves Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
              <Library className="w-5 h-5 text-amber-500" />
              Bookshelves
            </h2>
          </div>

          {shelves.length > 0 ? (
            <div className="space-y-4">
              {shelves.map((shelf) => (
                <ShelfPreviewCard key={shelf.id} shelf={shelf} userId={profile.id} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
              <BookMarked className="w-12 h-12 mx-auto text-stone-300 mb-3" />
              <h3 className="font-medium text-stone-800 mb-1">No public shelves</h3>
              <p className="text-sm text-stone-500">
                {fullName} hasn't added any books to their shelves yet.
              </p>
            </div>
          )}
        </div>

        {/* Social Links */}
        {profile.social && (profile.social.facebook || profile.social.twitter || profile.social.linkedin) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Connect</h2>
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex flex-wrap gap-4">
                {profile.social.facebook && (
                  <a
                    href={profile.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                )}
                {profile.social.twitter && (
                  <a
                    href={profile.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </a>
                )}
                {profile.social.linkedin && (
                  <a
                    href={profile.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
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

export default PublicProfilePage;
