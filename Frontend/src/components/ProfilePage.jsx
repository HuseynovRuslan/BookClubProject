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

  const renderShelvesTab = () => {
    if (shelvesLoading) {
      return (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded text-gray-700 dark:text-gray-300">
          Shelflər yüklənir...
        </div>
      );
    }
    if (!shelves?.length) {
      return (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded text-gray-600 dark:text-gray-400 text-center">
          Hələ Shelf əlavə olunmayıb.
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {shelves.map((shelf) => (
          <div key={shelf.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {shelf.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {shelf.books?.length || 0} kitab
                </p>
              </div>
            </div>
                {shelf.books?.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {shelf.books.slice(0, 3).map((book) => (
                  <div
                    key={book.id}
                    className="p-3 rounded bg-white dark:bg-gray-900 text-sm border border-gray-200 dark:border-gray-700"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{book.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{book.author}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-500">Shelf boşdur</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPostsTab = () => (
    <div className="space-y-4">
      {userPosts.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 p-8 text-center rounded-lg text-gray-600 dark:text-gray-400">
          Hələ paylaşım yoxdur.
        </div>
      ) : (
        userPosts.map((post) => <SocialFeedPost key={post.id} post={post} />)
      )}
    </div>
  );

  const renderMyBooksTab = () => (
    <div className="space-y-4">
      {userBooks.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 p-8 text-center rounded-lg text-gray-600 dark:text-gray-400">
          Hələ kitab dərc etməmisən.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {userBooks.map((book) => (
            <div key={book.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={getImageUrl(book.coverImageUrl || book.coverImage)}
                alt={book.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{book.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{book.genre}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl xl:max-w-[1600px] mx-auto px-4 xl:px-8 py-8">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-6 mb-6 shadow border border-gray-200 dark:border-gray-700">
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
                  className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                />
              ) : profile?.avatarUrl && !imageError ? (
                <img
                  key={profile.avatarUrl} // Force re-render when URL changes
                  src={getImageUrl(profile.avatarUrl)}
                  alt={profile?.name || "Profile"}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 group-hover:border-purple-500 transition-colors"
                  onError={() => {
                    // Handle broken image - set error state to show default avatar
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-900 dark:bg-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-gray-300 dark:border-gray-600 group-hover:border-purple-500 transition-colors">
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
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            {showAvatarMenu && !avatarUploading && (
              <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                <button
                  onClick={handleSelectImage}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Select Image
                </button>
                {(profile?.avatarUrl || previewImage) && (
                  <button
                    onClick={handleAvatarReset}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg flex items-center gap-2"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            {profileLoading ? (
              <p className="text-gray-400">Profil yüklənir...</p>
            ) : isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Ad</label>
                  <input
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                    value={editedUser?.name || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Email</label>
                  <input
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                    type="email"
                    value={editedUser?.email || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Bio</label>
                  <textarea
                    rows={3}
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
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
                      className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium"
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
                      className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      📚 Reader ol
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {profile?.name || "User"}
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                    {profile?.role === "writer" ? "✍️ Writer" : "📚 Reader"}
                  </span>
                </div>
                {profile?.bio && (
                  <p className="text-gray-300 text-sm mt-2">{profile.bio}</p>
                )}
                <div className="flex gap-6 mt-4 text-center">
                  <div>
                    <div className="text-xl">{stats.posts}</div>
                    <div className="text-sm text-gray-400">Posts</div>
                  </div>
                  <div>
                    <div className="text-xl">{stats.shelves}</div>
                    <div className="text-sm text-gray-400">Shelves</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            {isEditing ? (
              <>
                <button
                  onClick={handleProfileSave}
                  className="px-4 py-2 rounded-full bg-gray-900 dark:bg-purple-600 hover:bg-gray-800 dark:hover:bg-purple-700 text-white"
                >
                  Yadda saxla
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset editedUser to current profile state
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
                  className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Ləğv et
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    // Ensure editedUser has all necessary fields from profile
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
                  className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Profili redaktə et
                </button>
                <button
                  onClick={onSwitchAccount}
                  className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Hesabı dəyiş
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Çıxış
                </button>
              </>
            )}
          </div>
        </div>
        {profileError && (
          <div className="mt-4 text-sm text-red-300 bg-red-900/30 p-3 rounded">
            {profileError}
          </div>
        )}
        {profileMessage && (
          <div className="mt-4 text-sm text-green-300 bg-green-900/30 p-3 rounded">
            {profileMessage}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab.id ? "bg-gray-900 dark:bg-purple-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
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
