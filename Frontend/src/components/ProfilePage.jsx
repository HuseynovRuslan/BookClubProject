import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Camera, Edit2, LogOut, UserPlus } from "lucide-react";
import SocialFeedPost from "./SocialFeedPost";
import { useShelves } from "../context/ShelvesContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  updateProfile as updateProfileApi,
  updateProfilePicture,
  deleteProfilePicture,
} from "../api/users";
import { getImageUrl } from "../api/config";

export default function ProfilePage({
  user,
  onLogout,
  onSwitchAccount,
  userPosts = [],
  userBooks = [],
}) {
  const { user: authUser, refreshProfile } = useAuth();
  const baseUser = user || authUser;
  const { shelves, loading: shelvesLoading } = useShelves();
  const [profile, setProfile] = useState(baseUser);
  const [editedUser, setEditedUser] = useState(baseUser);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("shelves");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profileMessage, setProfileMessage] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const avatarInputRef = useRef(null);
  const avatarMenuRef = useRef(null);

  useEffect(() => {
    setProfile(baseUser);
    setEditedUser(baseUser);
    // Reset preview and image error when profile changes
    setPreviewImage(null);
    setImageError(false);
  }, [baseUser]);

  // Close avatar menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setShowAvatarMenu(false);
      }
    };
    if (showAvatarMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAvatarMenu]);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const freshProfile = await refreshProfile();
      if (freshProfile) {
        setProfile(freshProfile);
        // firstName və surname-ə görə name-i düzəldirik
        const fullName = freshProfile.firstName 
          ? `${freshProfile.firstName}${freshProfile.surname ? ` ${freshProfile.surname}` : ""}`.trim()
          : freshProfile.name || "";
        setEditedUser({
          ...freshProfile,
          name: fullName,
          email: freshProfile.email || "",
        });
        return freshProfile;
      }
    } catch (err) {
      setProfileError(err.message || "Profil yüklənmədi");
      throw err;
    } finally {
      setProfileLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileSave = async () => {
    if (!editedUser?.name?.trim()) {
      setProfileMessage("Ad boş ola bilməz");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editedUser.email && !emailRegex.test(editedUser.email)) {
      setProfileMessage("Email formatı düzgün deyil");
      return;
    }
    try {
      setProfileMessage(null);
      setProfileError(null);
      
      // name-i firstName və surname-ə ayırırıq
      const nameParts = editedUser.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const surname = nameParts.slice(1).join(" ") || "";
      
      // Update profile - note: email and role are not part of updateProfile API
      const updatedProfile = await updateProfileApi({
        firstName: firstName,
        lastName: surname,
        bio: editedUser.bio || "",
      });
      
      // Immediately update local state with the response
      if (updatedProfile) {
        setProfile(updatedProfile);
        const fullName = updatedProfile.firstName 
          ? `${updatedProfile.firstName}${updatedProfile.surname ? ` ${updatedProfile.surname}` : ""}`.trim()
          : updatedProfile.name || "";
        setEditedUser({
          ...updatedProfile,
          name: fullName,
          email: updatedProfile.email || editedUser.email || "",
        });
      }
      
      // Also refresh from server to ensure we have the latest data
      await loadProfile();
      setIsEditing(false);
      setProfileMessage("Profil yeniləndi");
      
      // Clear message after 3 seconds
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {
      setProfileMessage(err.message || "Profil yenilənmədi");
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setShowAvatarMenu(false);
      return;
    }
    
    // Create preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
    
    setAvatarUploading(true);
    setShowAvatarMenu(false);
    setProfileMessage(null);
    setProfileError(null);
    
    try {
      // Update profile picture and get updated profile
      const updatedProfile = await updateProfilePicture(file);
      
      // Immediately update local state
      if (updatedProfile) {
        setProfile(updatedProfile);
        const fullName = updatedProfile.firstName 
          ? `${updatedProfile.firstName}${updatedProfile.surname ? ` ${updatedProfile.surname}` : ""}`.trim()
          : updatedProfile.name || "";
        setEditedUser({
          ...updatedProfile,
          name: fullName,
          email: updatedProfile.email || editedUser.email || "",
        });
      }
      
      // Also refresh from server to ensure we have the latest data
      await loadProfile();
      setPreviewImage(null); // Clear preview after successful upload
      setImageError(false); // Reset image error state
      setProfileMessage("Profil şəkli yeniləndi");
      
      // Clear message after 3 seconds
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {
      setPreviewImage(null); // Clear preview on error
      setProfileMessage(err.message || "Şəkil yüklənmədi");
    } finally {
      setAvatarUploading(false);
      // Reset file input to allow selecting the same file again
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleAvatarReset = async () => {
    setAvatarUploading(true);
    setShowAvatarMenu(false);
    setPreviewImage(null);
    setProfileMessage(null);
    setProfileError(null);
    
    try {
      // Delete profile picture and get updated profile
      const updatedProfile = await deleteProfilePicture();
      
      // Immediately update local state
      if (updatedProfile) {
        setProfile(updatedProfile);
        const fullName = updatedProfile.firstName 
          ? `${updatedProfile.firstName}${updatedProfile.surname ? ` ${updatedProfile.surname}` : ""}`.trim()
          : updatedProfile.name || "";
        setEditedUser({
          ...updatedProfile,
          name: fullName,
          email: updatedProfile.email || editedUser.email || "",
        });
      }
      
      // Also refresh from server to ensure we have the latest data
      await loadProfile();
      setImageError(false); // Reset image error state
      setProfileMessage("Profil şəkli silindi");
      
      // Clear message after 3 seconds
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {
      setProfileMessage(err.message || "Şəkil silinmədi");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarClick = () => {
    if (!avatarUploading) {
      setShowAvatarMenu(!showAvatarMenu);
    }
  };

  const handleSelectImage = () => {
    setShowAvatarMenu(false);
    avatarInputRef.current?.click();
  };

  const stats = {
    posts: userPosts.length,
    shelves: shelves?.length || 0,
  };

  const tabs = [
    { id: "shelves", label: `Shelves (${stats.shelves})` },
    { id: "posts", label: `Posts (${stats.posts})` },
  ];
  if ((profile || {}).role === "writer") {
    tabs.unshift({ id: "my-books", label: `My Books (${userBooks.length})` });
  }

  const getRating = (book) => {
    return book.rating || book.averageRating || book.avgRating || 0;
  };

  const renderShelvesTab = () => {
    if (shelvesLoading) {
      return (
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-amber-600 dark:border-amber-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-700 mt-6">Shelflər yüklənir...</p>
        </div>
      );
    }
    if (!shelves?.length) {
      return (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-full mb-6">
            <svg className="h-12 w-12 text-amber-500 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900 mb-3">
            No shelves yet
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-600">
            Hələ Shelf əlavə olunmayıb.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {shelves.map((shelf) => (
          <div key={shelf.id} className="bg-white dark:bg-white rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-1 h-8 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-gray-900">
                    {shelf.name}
                  </h3>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-600 mt-1">
                    {shelf.books?.length || 0} kitab
                  </p>
                </div>
              </div>
            </div>
            {shelf.books?.length ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {shelf.books.map((book, index) => {
                  const coverImage = getImageUrl(book.coverImageUrl || book.coverImage || book.cover);
                  const rating = getRating(book);
                  return (
                    <div
                      key={book.id}
                      className="bg-white dark:bg-white rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-amber-400 dark:hover:border-amber-400 transform hover:-translate-y-2 hover:scale-[1.02] group"
                      style={{ 
                        animationDelay: `${index * 30}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      {/* Book Cover */}
                      <div className="aspect-[2/3] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 overflow-hidden relative group-hover:shadow-inner">
                        {coverImage ? (
                          <>
                            <img
                              src={coverImage}
                              alt={book.title || "Book cover"}
                              className="w-full h-full object-cover group-hover:scale-[1.15] transition-transform duration-1000 ease-out"
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out pointer-events-none"></div>
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 via-transparent to-transparent group-hover:from-amber-500/10 transition-all duration-700 pointer-events-none"></div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-400">
                            <svg className="w-24 h-24 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="p-2 bg-white dark:bg-white relative">
                        {/* Decorative top border */}
                        <div className="absolute top-0 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Title */}
                        <h3 className="font-bold text-xs text-gray-900 dark:text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 transition-all duration-500">
                          {book.title}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <div className="flex items-center bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-50 dark:via-amber-50 dark:to-yellow-100 px-2 py-1 rounded-lg border-2 border-yellow-300 dark:border-yellow-300 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                            <span className="text-xs text-yellow-500 drop-shadow-sm">★</span>
                            <span className="text-[10px] font-black text-gray-900 dark:text-gray-900 ml-1">
                              {rating > 0 ? rating.toFixed(1) : '0.0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-600 font-semibold">Shelf boşdur</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPostsTab = () => (
    <div className="space-y-6">
      {userPosts.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-full mb-6">
            <svg className="h-12 w-12 text-amber-500 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900 mb-3">
            No posts yet
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-600">
            Hələ paylaşım yoxdur.
          </p>
        </div>
      ) : (
        userPosts.map((post) => <SocialFeedPost key={post.id} post={post} />)
      )}
    </div>
  );

  const renderMyBooksTab = () => (
    <div className="space-y-6">
      {userBooks.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-full mb-6">
            <svg className="h-12 w-12 text-amber-500 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900 mb-3">
            No books yet
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-600">
            Hələ kitab dərc etməmisən.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {userBooks.map((book, index) => {
            const coverImage = getImageUrl(book.coverImageUrl || book.coverImage);
            const rating = getRating(book);
            return (
              <div 
                key={book.id} 
                className="bg-white dark:bg-white rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 dark:border-gray-200 hover:border-amber-400 dark:hover:border-amber-400 transform hover:-translate-y-2 hover:scale-[1.02] group"
                style={{ 
                  animationDelay: `${index * 30}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Book Cover */}
                <div className="aspect-[3/4] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-50 dark:via-orange-50 dark:to-red-50 overflow-hidden relative group-hover:shadow-inner">
                  {coverImage ? (
                    <>
                      <img
                        src={coverImage}
                        alt={book.title || "Book cover"}
                        className="w-full h-full object-cover group-hover:scale-[1.15] transition-transform duration-1000 ease-out"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out pointer-events-none"></div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 via-transparent to-transparent group-hover:from-amber-500/10 transition-all duration-700 pointer-events-none"></div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-400">
                      <svg className="w-24 h-24 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="p-4 bg-white dark:bg-white relative">
                  {/* Decorative top border */}
                  <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Title */}
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-900 line-clamp-2 leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 transition-all duration-500">
                    {book.title}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-50 dark:via-amber-50 dark:to-yellow-100 px-3 py-1.5 rounded-xl border-2 border-yellow-300 dark:border-yellow-300 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                      <span className="text-sm text-yellow-500 drop-shadow-sm">★</span>
                      <span className="text-xs font-black text-gray-900 dark:text-gray-900 ml-1.5">
                        {rating > 0 ? rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 bg-white dark:bg-white min-h-screen">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
      
      {/* Header Section - Ultra Modern Glassmorphism Design */}
      <div className="mb-14 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-red-50/80 dark:from-amber-50/80 dark:via-orange-50/80 dark:to-red-50/80 rounded-3xl -z-10 backdrop-blur-md"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-amber-50/40 rounded-3xl -z-10"></div>
        <div className="px-10 py-12 relative z-10">
          <div className="flex items-center gap-5 mb-5">
            <div className="relative">
              <div className="w-2 h-20 bg-gradient-to-b from-amber-500 via-orange-500 to-red-700 rounded-full shadow-xl"></div>
              <div className="absolute top-0 left-0 w-2 h-20 bg-gradient-to-b from-amber-400 via-orange-400 to-red-600 rounded-full blur-sm opacity-60 animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 bg-clip-text text-transparent leading-none mb-3 drop-shadow-sm">
                Profile
              </h1>
              <p className="text-gray-700 dark:text-gray-700 text-xl sm:text-2xl mt-3 font-semibold">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-white text-gray-900 dark:text-gray-900 rounded-3xl p-8 mb-8 shadow-xl border-2 border-gray-100 dark:border-gray-200">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative" ref={avatarMenuRef}>
            <div
              onClick={handleAvatarClick}
              className="cursor-pointer relative group"
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-400 dark:border-purple-400 shadow-xl"
                />
              ) : profile?.avatarUrl && !imageError ? (
                <img
                  key={profile.avatarUrl}
                  src={getImageUrl(profile.avatarUrl)}
                  alt={profile?.name || "Profile"}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-200 group-hover:border-purple-400 dark:group-hover:border-purple-400 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:scale-105"
                  onError={() => {
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex items-center justify-center text-4xl font-black text-white border-4 border-gray-200 dark:border-gray-200 group-hover:border-purple-400 dark:group-hover:border-purple-400 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:scale-105">
                  {profile?.name
                    ? profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </div>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            {showAvatarMenu && !avatarUploading && (
              <div className="absolute top-full left-0 mt-3 bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 rounded-2xl shadow-2xl z-10 min-w-[180px] overflow-hidden">
                <button
                  onClick={handleSelectImage}
                  className="w-full px-5 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:via-blue-50 hover:to-indigo-50 dark:hover:from-purple-50 dark:hover:via-blue-50 dark:hover:to-indigo-50 flex items-center gap-3 transition-all"
                >
                  <Camera className="w-5 h-5 text-amber-600 dark:text-amber-600" />
                  Select Image
                </button>
                {(profile?.avatarUrl || previewImage) && (
                  <button
                    onClick={handleAvatarReset}
                    className="w-full px-5 py-3 text-left text-sm font-semibold text-red-600 dark:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-50 dark:hover:to-orange-50 flex items-center gap-3 transition-all border-t-2 border-gray-100 dark:border-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Image
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-5">
            {profileLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-amber-200 dark:border-amber-200 border-t-purple-600 dark:border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-600 font-semibold">Profil yüklənir...</p>
              </div>
            ) : isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-gray-900">Ad</label>
                  <input
                    className="w-full p-4 rounded-xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-200 focus:border-purple-400 dark:focus:border-purple-400 transition-all shadow-sm"
                    value={editedUser?.name || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-gray-900">Email</label>
                  <input
                    className="w-full p-4 rounded-xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-200 focus:border-purple-400 dark:focus:border-purple-400 transition-all shadow-sm"
                    type="email"
                    value={editedUser?.email || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-gray-900">Bio</label>
                  <textarea
                    rows={4}
                    className="w-full p-4 rounded-xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 resize-none focus:outline-none focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-200 focus:border-purple-400 dark:focus:border-purple-400 transition-all shadow-sm"
                    value={editedUser?.bio || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, bio: e.target.value })
                    }
                  />
                </div>
                {/* Writer/Reader ol butonu */}
                <div className="mt-4">
                  {editedUser?.role !== "writer" ? (
                    <button
                      onClick={async () => {
                        try {
                          setProfileMessage(null);
                          setProfileError(null);
                          const nameParts = editedUser?.name?.trim().split(/\s+/) || [];
                          const firstName = nameParts[0] || "";
                          const surname = nameParts.slice(1).join(" ") || "";
                          
                          // Note: role update might need a separate endpoint
                          // For now, we'll just update the profile without role
                          await updateProfileApi({
                            firstName: firstName,
                            lastName: surname,
                            bio: editedUser.bio || "",
                          });
                          
                          const updatedProfile = await loadProfile();
                          if (updatedProfile) {
                            setProfile(updatedProfile);
                          }
                          setProfileMessage("Writer hesabına keçdiniz!");
                          setTimeout(() => setProfileMessage(null), 3000);
                        } catch (err) {
                          setProfileMessage(err.message || "Xəta baş verdi");
                        }
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      ✍️ Writer ol
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          setProfileMessage(null);
                          setProfileError(null);
                          const nameParts = editedUser?.name?.trim().split(/\s+/) || [];
                          const firstName = nameParts[0] || "";
                          const surname = nameParts.slice(1).join(" ") || "";
                          
                          // Note: role update might need a separate endpoint
                          // For now, we'll just update the profile without role
                          await updateProfileApi({
                            firstName: firstName,
                            lastName: surname,
                            bio: editedUser.bio || "",
                          });
                          
                          const updatedProfile = await loadProfile();
                          if (updatedProfile) {
                            setProfile(updatedProfile);
                          }
                          setProfileMessage("Reader hesabına qayıtdınız!");
                          setTimeout(() => setProfileMessage(null), 3000);
                        } catch (err) {
                          setProfileMessage(err.message || "Xəta baş verdi");
                        }
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      📚 Reader ol
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl font-black text-gray-900 dark:text-gray-900">
                    {profile?.name || "User"}
                  </h1>
                  <span className="px-4 py-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 text-gray-900 dark:text-gray-900 text-sm font-bold border-2 border-amber-200 dark:border-amber-200 shadow-sm">
                    {profile?.role === "writer" ? "✍️ Writer" : "📚 Reader"}
                  </span>
                </div>
                {profile?.bio && (
                  <p className="text-gray-600 dark:text-gray-600 text-base mb-4 leading-relaxed">{profile.bio}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <div className="px-2 py-1.5 rounded-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 border border-amber-200 dark:border-amber-200 shadow-sm">
                    <div className="text-base font-black text-amber-600 dark:text-amber-600">{stats.posts}</div>
                    <div className="text-[10px] font-semibold text-gray-700 dark:text-gray-700 mt-0.5">Posts</div>
                  </div>
                  <div className="px-2 py-1.5 rounded-md bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-50 dark:to-red-50 border border-blue-200 dark:border-blue-200 shadow-sm">
                    <div className="text-base font-black text-orange-600 dark:text-orange-600">{stats.shelves}</div>
                    <div className="text-[10px] font-semibold text-gray-700 dark:text-gray-700 mt-0.5">Shelves</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {isEditing ? (
              <>
                <button
                  onClick={handleProfileSave}
                  className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Yadda saxla
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    const fullName = profile?.firstName 
                      ? `${profile.firstName}${profile.surname ? ` ${profile.surname}` : ""}`.trim()
                      : profile?.name || "";
                    setEditedUser({
                      ...profile,
                      name: fullName,
                      email: profile?.email || "",
                    });
                    setProfileMessage(null);
                    setProfileError(null);
                  }}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  Ləğv et
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    const fullName = profile?.firstName 
                      ? `${profile.firstName}${profile.surname ? ` ${profile.surname}` : ""}`.trim()
                      : profile?.name || "";
                    setEditedUser({
                      ...profile,
                      name: fullName,
                      email: profile?.email || "",
                    });
                    setIsEditing(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  Profili redaktə et
                </button>
                <button
                  onClick={onSwitchAccount}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Hesabı dəyiş
                </button>
                <button
                  onClick={onLogout}
                  className="px-6 py-3 rounded-xl border-2 border-red-200 dark:border-red-200 text-red-600 dark:text-red-600 hover:bg-red-50 dark:hover:bg-red-50 font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Çıxış
                </button>
              </>
            )}
          </div>
        </div>
        {profileError && (
          <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-50 dark:to-orange-50 border-2 border-red-200 dark:border-red-200 rounded-xl shadow-lg">
            <p className="text-sm font-semibold text-red-600 dark:text-red-600">{profileError}</p>
          </div>
        )}
        {profileMessage && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-50 dark:to-emerald-50 border-2 border-green-200 dark:border-green-200 rounded-xl shadow-lg">
            <p className="text-sm font-semibold text-green-600 dark:text-green-600">{profileMessage}</p>
          </div>
        )}
      </div>

      <div className="space-y-8 relative z-10">
        <div className="flex gap-3 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                activeTab === tab.id 
                  ? "bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 text-white shadow-xl scale-105" 
                  : "bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:border-purple-300 dark:hover:border-purple-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "shelves" && renderShelvesTab()}
        {activeTab === "posts" && renderPostsTab()}
        {activeTab === "my-books" && renderMyBooksTab()}
      </div>
    </div>
  );
}
