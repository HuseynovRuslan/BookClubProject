import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '../api/users';
import { getUserShelves } from '../api/shelves';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'edit', label: 'Edit Profile', icon: Edit3 },
  { id: 'socials', label: 'Social Links', icon: LinkIcon },
  { id: 'security', label: 'Security', icon: Shield },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Profile data
  const [profile, setProfile] = useState(null);
  const [socials, setSocials] = useState({});
  const [stats, setStats] = useState({ booksRead: 0, followers: 0, following: 0 });
  
  // Cover image (local state - stored in localStorage since no backend support)
  const [coverImage, setCoverImage] = useState(() => {
    return localStorage.getItem('coverImage') || null;
  });

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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [profileData, socialsData, shelvesData] = await Promise.allSettled([
        getCurrentUserProfile(),
        getUserSocialLinks(),
        getUserShelves(),
      ]);

      if (profileData.status === 'fulfilled') {
        const p = profileData.value;
        console.log('Profile data:', p);
        console.log('Profile picture URL:', p?.profilePictureUrl);
        setProfile(p);
        setProfileForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          bio: p.bio || '',
          country: p.country || '',
          websiteUrl: p.websiteUrl || '',
          dateOfBirth: p.dateOfBirth || '',
        });
      }

      if (socialsData.status === 'fulfilled') {
        const s = socialsData.value || {};
        setSocials(s);
        setSocialsForm({
          facebook: s.facebook || '',
          twitter: s.twitter || '',
          linkedIn: s.linkedin || s.linkedIn || '',
        });
      }

      if (shelvesData.status === 'fulfilled') {
        const shelves = shelvesData.value?.items || shelvesData.value || [];
        // Count books in "Read" shelf
        const readShelf = shelves.find(s => s.name === 'Read');
        const booksRead = readShelf?.bookCount || readShelf?.books?.length || 0;
        setStats(prev => ({ ...prev, booksRead }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
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
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setCoverImage(base64);
      localStorage.setItem('coverImage', base64);
      toast.success('Cover image updated');
      setUploadingCover(false);
    };
    reader.onerror = () => {
      toast.error('Failed to upload cover');
      setUploadingCover(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCover = () => {
    setCoverImage(null);
    localStorage.removeItem('coverImage');
    toast.success('Cover image removed');
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
    const first = profile?.firstName?.[0] || user?.username?.[0] || 'U';
    const last = profile?.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  // Format profile picture URL - add base URL if needed
  const getProfilePictureUrl = () => {
    const url = profile?.profilePictureUrl;
    if (!url) return null;
    
    // If already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Prepend base URL for relative paths
    const cleanPath = url.replace(/\\/g, '/'); // Replace backslashes
    return `${BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
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
          {/* Cover */}
          <div className="relative h-48 group">
            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-stone-800 via-stone-700 to-stone-900"></div>
            )}
            
            {/* Cover Upload/Delete Buttons */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="px-4 py-2 bg-white/90 hover:bg-white rounded-lg text-stone-800 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                {uploadingCover ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                {coverImage ? 'Change Cover' : 'Add Cover'}
              </button>
              {coverImage && (
                <button
                  onClick={handleDeleteCover}
                  className="px-4 py-2 bg-red-500/90 hover:bg-red-500 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 -mt-16">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-full border-4 border-white bg-stone-200 overflow-hidden shadow-lg">
                  {getProfilePictureUrl() ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Profile image failed to load:', getProfilePictureUrl());
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-700 text-white text-3xl font-bold">
                      {getInitials()}
                    </div>
                  )}
                </div>
                
                {/* Upload/Delete Buttons */}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  className="hidden"
                />
              </div>

              {/* Name & Bio */}
              <div className="flex-1 min-w-0 pt-16 sm:pt-20">
                <h1 className="text-2xl font-bold text-stone-900">
                  {profile?.firstName || profile?.lastName
                    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                    : user?.username || 'User'}
                </h1>
                <p className="text-stone-500">@{user?.username || user?.email}</p>
                {profile?.bio && (
                  <p className="text-stone-600 mt-2 line-clamp-2">{profile.bio}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 pt-2 sm:pt-20">
                <div className="text-center">
                  <div className="text-xl font-bold text-stone-900">{stats.booksRead}</div>
                  <div className="text-xs text-stone-500">Books Read</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-stone-900">{stats.followers}</div>
                  <div className="text-xs text-stone-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-stone-900">{stats.following}</div>
                  <div className="text-xs text-stone-500">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-stone-200 overflow-x-auto">
            {tabs.map((tab) => {
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

            {/* Edit Profile Tab */}
            {activeTab === 'edit' && (
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

            {/* Social Links Tab */}
            {activeTab === 'socials' && (
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

            {/* Security Tab */}
            {activeTab === 'security' && (
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
    </div>
  );
};

export default ProfilePage;
