import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Camera, Edit2, LogOut, UserPlus, UserCheck, UserX, X } from "lucide-react";
import SocialFeedPost from "./SocialFeedPost";
import GuestRestrictionModal from "./GuestRestrictionModal";
import { useShelves } from "../context/ShelvesContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "../hooks/useTranslation";
import {
  updateProfile as updateProfileApi,
  updateProfilePicture,
  deleteProfilePicture,
  getUserByUsername,
  getUserById,
  getMyReviews,
} from "../api/users";
import { getImageUrl } from "../api/config";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserFollowers,
  getUserFollowing,
  isFollowing as checkIsFollowing,
} from "../api/userFollows";
import { createComment, deleteComment } from "../api/comments";

export default function ProfilePage({
  user,
  onLogout,
  onSwitchAccount,
  userPosts = [],
  userBooks = [],
  onDeletePost,
  onAddComment,
  onDeleteComment,
  onPostUpdate,
  onLikeChange,
  onShowLogin,
  onShowRegister,
}) {
  const { userId: urlParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();

  const passedUserData = location.state?.userData;
  const { user: authUser, refreshProfile, isGuest } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const baseUser = user || authUser;
  const { shelves, loading: shelvesLoading } = useShelves();
  const [profile, setProfile] = useState(baseUser);
  const [editedUser, setEditedUser] = useState(baseUser);


  const translateShelfName = (shelfName) => {
    if (!shelfName) return shelfName;
    const shelfMap = {
      "Want to Read": t("readingList.wantToRead"),
      "Currently Reading": t("readingList.currentlyReading"),
      "Read": t("readingList.read"),
      "Custom Shelves": t("readingList.customShelves"),
    };
    return shelfMap[shelfName] || shelfName;
  };
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {

    return urlParam ? "posts" : "shelves";
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profileMessage, setProfileMessage] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const [viewedUserPosts, setViewedUserPosts] = useState([]);


  const getStorageKey = (type, userId, isOwn = false) => {
    if (isOwn) {
      return `my_follow_${type}_${userId}`;
    } else {
      return `user_follow_${type}_${userId}`;
    }
  };

  const saveToStorage = (type, userId, data, isOwn = false) => {
    try {
      if (!userId) {
        return;
      }
      const key = getStorageKey(type, userId, isOwn);
      const value = JSON.stringify({
        data,
        timestamp: Date.now(),
      });
      localStorage.setItem(key, value);
    } catch (err) {

    }
  };

  const loadFromStorage = (type, userId, isOwn = false) => {
    try {
      const key = getStorageKey(type, userId, isOwn);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);

        const cacheAge = Date.now() - parsed.timestamp;
        if (cacheAge < 86400000) {
          return parsed.data;
        } else {

          return parsed.data;
        }
      }
    } catch (err) {

    }
    return null;
  };

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const avatarInputRef = useRef(null);
  const avatarMenuRef = useRef(null);
  

  const isOwnProfile = useMemo(() => {
    if (!urlParam) return true;
    if (!authUser?.id) return false;
    

    const currentUserId = authUser.id || authUser.Id;
    if (urlParam === currentUserId?.toString() || urlParam === currentUserId) {
      return true;
    }
    

    const currentUsername = authUser.email?.split("@")[0] || authUser.username;
    if (urlParam === currentUsername) {
      return true;
    }
    
    return false;
  }, [urlParam, authUser]);

  useEffect(() => {
    if (baseUser) {
      setProfile(baseUser);
      setEditedUser(baseUser);

      setPreviewImage(null);
      setImageError(false);
    }


  }, [baseUser?.id, baseUser?.email]);


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
      let freshProfile;
      if (urlParam && !isOwnProfile) {

        try {



          const passedDataMatches = passedUserData && (
            passedUserData.id === urlParam || 
            passedUserData.id?.toString() === urlParam ||
            passedUserData.username === urlParam ||
            passedUserData.username?.toLowerCase() === urlParam?.toLowerCase()
          );
          
          if (passedDataMatches) {
            freshProfile = {
              id: passedUserData.id,
              name: passedUserData.name || passedUserData.username || "User",
              username: passedUserData.username || "",
              email: passedUserData.email || "",
              bio: passedUserData.bio || "",
              role: passedUserData.role || "reader",
              avatarUrl: passedUserData.avatarUrl || null,
              firstName: passedUserData.firstName || "",
              surname: passedUserData.surname || passedUserData.lastName || "",
            };
          } else {


            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(urlParam);
            
            if (isUUID) {

              freshProfile = await getUserById(urlParam);
            }
            


            if (!freshProfile) {
              freshProfile = await getUserByUsername(urlParam);
            }
          }
          

          if (!freshProfile) {
            setProfileError(t("profile.userNotFound"));
            setProfileLoading(false);
            return null;
          }
          


          

          if ((!freshProfile.name || freshProfile.name === "User") && freshProfile.username && freshProfile.username.trim() !== "") {
            freshProfile.name = freshProfile.username;
          }
          

          freshProfile = {
            ...freshProfile,
            id: freshProfile.id || freshProfile.Id || urlParam,
            name: freshProfile.name || "User",
            firstName: freshProfile.firstName || freshProfile.FirstName || "",
            surname: freshProfile.lastName || freshProfile.LastName || freshProfile.surname || freshProfile.Surname || "",
            email: freshProfile.email || freshProfile.Email || "",
            bio: freshProfile.bio || freshProfile.Bio || "",
            role: freshProfile.role || freshProfile.Role || "reader",
            avatarUrl: freshProfile.avatarUrl || freshProfile.AvatarUrl || freshProfile.profilePictureUrl || null,
            username: freshProfile.username || freshProfile.Username || freshProfile.userName || freshProfile.UserName || freshProfile.email?.split("@")[0] || "",
          };
        } catch (err) {

          setProfileError(err.message || t("profile.loadFailed"));
          setProfileLoading(false);
          return null;
        }
      } else {

        if (authUser && !urlParam) {

          freshProfile = authUser;
        } else {

          freshProfile = await refreshProfile();
        }
      }
      
      if (freshProfile) {

        const fullName = freshProfile.firstName 
          ? `${freshProfile.firstName}${freshProfile.surname ? ` ${freshProfile.surname}` : ""}`.trim()
          : freshProfile.name || "";
        

        const normalizedProfile = {
          ...freshProfile,
          name: fullName || freshProfile.name || "",
        };
        
        setProfile(normalizedProfile);
        setEditedUser({
          ...normalizedProfile,
          email: freshProfile.email || "",
        });
        

        if (freshProfile && freshProfile.id) {
          try {


            if (isOwnProfile) {


              const cachedFollowers = loadFromStorage('followers_list', freshProfile.id, true);
              const cachedFollowing = loadFromStorage('following_list', freshProfile.id, true);
              
              if (cachedFollowers !== null && Array.isArray(cachedFollowers)) {
                setFollowersCount(cachedFollowers.length);
              }
              if (cachedFollowing !== null && Array.isArray(cachedFollowing)) {
                setFollowingCount(cachedFollowing.length);
              }
              

              const [followers, following] = await Promise.allSettled([
                getFollowers(),
                getFollowing(),
              ]);
              

              if (followers.status === 'fulfilled' && Array.isArray(followers.value)) {
                setFollowersCount(followers.value.length);
                saveToStorage('followers_list', freshProfile.id, followers.value, true);
                saveToStorage('followers_count', freshProfile.id, followers.value.length, true);
              } else {

                if (cachedFollowers !== null && Array.isArray(cachedFollowers) && cachedFollowers.length > 0) {

                } else {

                  const savedCount = loadFromStorage('followers_count', freshProfile.id, true);
                  if (savedCount !== null && typeof savedCount === 'number' && savedCount > 0) {
                    setFollowersCount(savedCount);
                  }
                }
              }
              

              if (following.status === 'fulfilled' && Array.isArray(following.value)) {
                setFollowingCount(following.value.length);
                saveToStorage('following_list', freshProfile.id, following.value, true);
                saveToStorage('following_count', freshProfile.id, following.value.length, true);
              } else {

                if (cachedFollowing !== null && Array.isArray(cachedFollowing) && cachedFollowing.length > 0) {

                } else {

                  const savedCount = loadFromStorage('following_count', freshProfile.id, true);
                  if (savedCount !== null && typeof savedCount === 'number' && savedCount > 0) {
                    setFollowingCount(savedCount);
                  }
                }
              }
              
              setIsFollowingUser(false);
            } else {


              const cachedFollowersCount = loadFromStorage('followers_count', freshProfile.id, false);
              const cachedFollowingCount = loadFromStorage('following_count', freshProfile.id, false);
              const cachedFollowers = loadFromStorage('followers_list', freshProfile.id, false);
              const cachedFollowing = loadFromStorage('following_list', freshProfile.id, false);
              

              let initialFollowersCount = 0;
              if (cachedFollowersCount !== null && typeof cachedFollowersCount === 'number') {
                initialFollowersCount = cachedFollowersCount;
              } else if (cachedFollowers !== null && Array.isArray(cachedFollowers) && cachedFollowers.length > 0) {
                initialFollowersCount = cachedFollowers.length;
              }
              setFollowersCount(initialFollowersCount);
              

              let initialFollowingCount = 0;
              if (cachedFollowingCount !== null && typeof cachedFollowingCount === 'number') {
                initialFollowingCount = cachedFollowingCount;
              } else if (cachedFollowing !== null && Array.isArray(cachedFollowing) && cachedFollowing.length > 0) {
                initialFollowingCount = cachedFollowing.length;
              }
              setFollowingCount(initialFollowingCount);
              

              try {
                const [followersResult, followingResult] = await Promise.allSettled([
                  getUserFollowers(freshProfile.id),
                  getUserFollowing(freshProfile.id),
                ]);
                

                if (followersResult.status === 'fulfilled' && Array.isArray(followersResult.value) && followersResult.value.length > 0) {
                  setFollowersCount(followersResult.value.length);
                  saveToStorage('followers_count', freshProfile.id, followersResult.value.length, false);
                  saveToStorage('followers_list', freshProfile.id, followersResult.value, false);
                } else if (initialFollowersCount > 0) {

                }
                

                if (followingResult.status === 'fulfilled' && Array.isArray(followingResult.value) && followingResult.value.length > 0) {
                  setFollowingCount(followingResult.value.length);
                  saveToStorage('following_count', freshProfile.id, followingResult.value.length, false);
                  saveToStorage('following_list', freshProfile.id, followingResult.value, false);
                } else if (initialFollowingCount > 0) {

                }
              } catch (err) {

              }
              


              try {
                const isFollowing = await checkIsFollowing(freshProfile.id);
                setIsFollowingUser(isFollowing);
              } catch (err) {
                setIsFollowingUser(false);
              }
            }
          } catch (err) {


            if (isOwnProfile && freshProfile?.id) {
              const savedFollowersCount = loadFromStorage('followers_count', freshProfile.id, true);
              const savedFollowingCount = loadFromStorage('following_count', freshProfile.id, true);
              if (savedFollowersCount !== null && typeof savedFollowersCount === 'number') {
                setFollowersCount(savedFollowersCount);
              }
              if (savedFollowingCount !== null && typeof savedFollowingCount === 'number') {
                setFollowingCount(savedFollowingCount);
              }
            } else if (freshProfile?.id) {
              const savedFollowersCount = loadFromStorage('followers_count', freshProfile.id, false);
              const savedFollowingCount = loadFromStorage('following_count', freshProfile.id, false);
              if (savedFollowersCount !== null && typeof savedFollowersCount === 'number') {
                setFollowersCount(savedFollowersCount);
              }
              if (savedFollowingCount !== null && typeof savedFollowingCount === 'number') {
                setFollowingCount(savedFollowingCount);
              }
            }
            setIsFollowingUser(false);
          }
        }
        

        if (urlParam && !isOwnProfile && freshProfile.id) {
          try {


            const reviews = await getMyReviews();

            const savedPosts = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
            

            const mappedPosts = reviews.map(review => {

              const savedPost = savedPosts.find(sp => sp.id === review.id || sp.reviewId === review.id);
              
              return {
                id: review.id,
                type: "review",
                username: freshProfile.name,
                bookTitle: review.book?.title || "",
                bookCover: review.book?.coverImageUrl || "",
                review: review.text,
                rating: review.rating,
                reviewId: review.id,
                likes: savedPost?.likes || 0,
                comments: savedPost?.comments || [],
                timestamp: review.createdAt || "Just now",
              };
            });
            
            setViewedUserPosts(mappedPosts);
          } catch (err) {

            setViewedUserPosts([]);
          }
        }
        
        return freshProfile;
      }
    } catch (err) {
      setProfileError(err.message || t("profile.loadFailed"));
      throw err;
    } finally {
      setProfileLoading(false);
    }



  }, [urlParam, isOwnProfile, passedUserData, t, authUser?.id]);

  useEffect(() => {
    loadProfile();

  }, [urlParam]);


  useEffect(() => {
    try {
      const savedPosts = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
      
      if (isOwnProfile) {

        if (userPosts.length > 0) {
          const postMap = new Map();
          

          userPosts.forEach(post => {
            postMap.set(post.id, { ...post });
          });
          

          savedPosts.forEach(savedPost => {

            let existingPost = postMap.get(savedPost.id);
            if (!existingPost && savedPost.type === 'review' && savedPost.reviewId) {

              for (const [id, post] of postMap.entries()) {
                if (post.type === 'review' && (post.id === savedPost.reviewId || post.reviewId === savedPost.reviewId)) {
                  existingPost = post;
                  break;
                }
              }
            }
            
            if (existingPost) {


              const existingCommentIds = new Set((existingPost.comments || []).map(c => c.id).filter(Boolean));
              const savedComments = (savedPost.comments || []).filter(c => c.id && !existingCommentIds.has(c.id));
              

              const mergedComments = [...(existingPost.comments || []), ...savedComments];
              
              postMap.set(existingPost.id, {
                ...existingPost,
                comments: mergedComments,
                likes: savedPost.likes !== undefined ? savedPost.likes : existingPost.likes,
                isLiked: savedPost.isLiked !== undefined ? savedPost.isLiked : existingPost.isLiked,
              });
            }
          });
          
          const mergedPosts = Array.from(postMap.values());

          setViewedUserPosts((prev) => {
            const prevIds = new Set(prev.map(p => p.id));
            const newIds = new Set(mergedPosts.map(p => p.id));
            const idsChanged = prevIds.size !== newIds.size || ![...prevIds].every(id => newIds.has(id));
            
            if (idsChanged) {
              return mergedPosts;
            }
            

            const commentsChanged = mergedPosts.some(newPost => {
              const oldPost = prev.find(p => p.id === newPost.id);
              if (!oldPost) return true;
              const oldComments = oldPost.comments || [];
              const newComments = newPost.comments || [];

              if (oldComments.length !== newComments.length) return true;
              const oldCommentIds = new Set(oldComments.map(c => c.id));
              const newCommentIds = new Set(newComments.map(c => c.id));
              return oldCommentIds.size !== newCommentIds.size || 
                     ![...oldCommentIds].every(id => newCommentIds.has(id));
            });
            
            return commentsChanged ? mergedPosts : prev;
          });
        }
      } else {


      }
    } catch (err) {

    }
  }, [userPosts, isOwnProfile]);

  const handleProfileSave = async () => {
    if (!editedUser?.name?.trim()) {
      setProfileMessage(t("profile.nameRequired"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editedUser.email && !emailRegex.test(editedUser.email)) {
      setProfileMessage(t("profile.emailInvalid"));
      return;
    }
    try {
      setProfileMessage(null);
      setProfileError(null);
      

      const nameParts = editedUser.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const surname = nameParts.slice(1).join(" ") || "";
      

      const updatedProfile = await updateProfileApi({
        firstName: firstName,
        lastName: surname,
        bio: editedUser.bio || "",
      });
      

      if (updatedProfile) {
        const fullName = updatedProfile.firstName 
          ? `${updatedProfile.firstName}${updatedProfile.surname ? ` ${updatedProfile.surname}` : ""}`.trim()
          : updatedProfile.name || "";
        

        const updatedProfileWithBio = {
          ...updatedProfile,
          name: fullName,
          bio: updatedProfile.bio || editedUser.bio || "",
        };
        
        setProfile(updatedProfileWithBio);
        setEditedUser({
          ...updatedProfileWithBio,
          email: updatedProfile.email || editedUser.email || "",
        });
      }
      

      setIsEditing(false);
      

      await loadProfile();
      
      setProfileMessage(t("profile.updated"));
      

      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {
      setProfileMessage(err.message || t("profile.updateFailed"));
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setShowAvatarMenu(false);
      return;
    }
    

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

      const updatedProfile = await updateProfilePicture(file);
      

      if (updatedProfile) {
        const fullName = updatedProfile.firstName 
          ? `${updatedProfile.firstName}${updatedProfile.surname ? ` ${updatedProfile.surname}` : ""}`.trim()
          : updatedProfile.name || "";
        

        setProfile({
          ...updatedProfile,
          name: fullName,
          avatarUrl: updatedProfile.avatarUrl || updatedProfile.AvatarUrl || updatedProfile.profilePictureUrl || updatedProfile.ProfilePictureUrl,
        });
        
        setEditedUser({
          ...updatedProfile,
          name: fullName,
          email: updatedProfile.email || editedUser.email || "",
          avatarUrl: updatedProfile.avatarUrl || updatedProfile.AvatarUrl || updatedProfile.profilePictureUrl || updatedProfile.ProfilePictureUrl,
        });
        

        setPreviewImage(null);
        setImageError(false);

        setAvatarKey(prev => prev + 1);
      }
      


      if (refreshProfile) {
        try {
          const refreshedUser = await refreshProfile();

          if (refreshedUser) {
            const fullName = refreshedUser.firstName 
              ? `${refreshedUser.firstName}${refreshedUser.surname ? ` ${refreshedUser.surname}` : ""}`.trim()
              : refreshedUser.name || "";
            
            const refreshedAvatarUrl = refreshedUser.avatarUrl || refreshedUser.AvatarUrl || refreshedUser.profilePictureUrl || refreshedUser.ProfilePictureUrl;
            
            setProfile({
              ...refreshedUser,
              name: fullName,
              avatarUrl: refreshedAvatarUrl,
            });
            
            setEditedUser({
              ...refreshedUser,
              name: fullName,
              email: refreshedUser.email || editedUser.email || "",
              avatarUrl: refreshedAvatarUrl,
            });
          }
        } catch (err) {

        }
      }
      

      loadProfile().catch(() => {});
      
      setProfileMessage(t("profile.avatarUpdated"));
      

      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {
      setPreviewImage(null);
      setProfileMessage(err.message || t("profile.avatarFailed"));
    } finally {
      setAvatarUploading(false);

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

      const updatedProfile = await deleteProfilePicture();
      

      if (updatedProfile) {
        const fullName = updatedProfile.firstName 
          ? `${updatedProfile.firstName}${updatedProfile.surname ? ` ${updatedProfile.surname}` : ""}`.trim()
          : updatedProfile.name || "";
        

        setProfile({
          ...updatedProfile,
          name: fullName,
          avatarUrl: null,
        });
        
        setEditedUser({
          ...updatedProfile,
          name: fullName,
          email: updatedProfile.email || editedUser.email || "",
          avatarUrl: null,
        });
        

        setImageError(false);

        setAvatarKey(prev => prev + 1);
      }
      


      if (refreshProfile) {
        try {
          const refreshedUser = await refreshProfile();

          if (refreshedUser) {
            const fullName = refreshedUser.firstName 
              ? `${refreshedUser.firstName}${refreshedUser.surname ? ` ${refreshedUser.surname}` : ""}`.trim()
              : refreshedUser.name || "";
            
            setProfile({
              ...refreshedUser,
              name: fullName,
              avatarUrl: null,
            });
            
            setEditedUser({
              ...refreshedUser,
              name: fullName,
              email: refreshedUser.email || editedUser.email || "",
              avatarUrl: null,
            });
          }
        } catch (err) {

        }
      }
      

      loadProfile().catch(() => {});
      
      setProfileMessage(t("profile.avatarRemoved"));
      

      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {
      setProfileMessage(err.message || t("profile.avatarRemoveFailed"));
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

  const handleFollow = async () => {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }
    if (!profile?.id || followLoading) return;
    
    const userId = profile.id || profile.Id || profile.userId || profile.UserId;
    if (!userId) {
      setProfileMessage(t("profile.error"));
      setTimeout(() => setProfileMessage(null), 3000);
      return;
    }
    
    setFollowLoading(true);
    

    const wasFollowing = isFollowingUser;
    const previousFollowersCount = followersCount;
    const previousFollowingCount = followingCount;
    
    try {
      if (isFollowingUser) {

        if (!isOwnProfile) {
          const newCount = Math.max(0, followersCount - 1);
          setFollowersCount(newCount);

          saveToStorage('followers_count', userId, newCount, false);
          

          const cachedFollowersList = loadFromStorage('followers_list', userId, false) || [];
          const currentUserId = authUser?.id || authUser?.Id;
          
          const updatedFollowersList = cachedFollowersList.filter(f => {
            const followerId = f.id || f.Id || f.userId || f.UserId || f.followerId || f.FollowerId;
            return followerId !== currentUserId;
          });
          saveToStorage('followers_list', userId, updatedFollowersList, false);

          setFollowersList(updatedFollowersList);
        }
        if (isOwnProfile) {
          const newCount = Math.max(0, followingCount - 1);
          setFollowingCount(newCount);

          saveToStorage('following_count', authUser.id, newCount);
        }
        setIsFollowingUser(false);
        
        await unfollowUser(userId);
        setProfileMessage(t("profile.unfollow"));
      } else {

        if (!isOwnProfile) {
          const newCount = followersCount + 1;
          setFollowersCount(newCount);

          saveToStorage('followers_count', userId, newCount, false);
          

          const cachedFollowersList = loadFromStorage('followers_list', userId, false) || [];
          const currentUserId = authUser?.id || authUser?.Id;
          

          const currentUserInList = cachedFollowersList.some(f => {
            const followerId = f.id || f.Id || f.userId || f.UserId || f.followerId || f.FollowerId;
            return followerId === currentUserId;
          });
          
          if (!currentUserInList && currentUserId) {

            const currentUserData = {
              id: currentUserId,
              userId: currentUserId,
              followerId: currentUserId,
              name: authUser?.name || authUser?.username || authUser?.email?.split('@')[0] || 'User',
              username: authUser?.username || authUser?.email?.split('@')[0] || '',
              email: authUser?.email || '',
              avatarUrl: authUser?.avatarUrl || authUser?.profilePictureUrl || null,
              role: authUser?.role || 'reader',
            };
            const updatedFollowersList = [...cachedFollowersList, currentUserData];
            saveToStorage('followers_list', userId, updatedFollowersList, false);

            setFollowersList(updatedFollowersList);
          } else if (currentUserInList) {

            setFollowersList(cachedFollowersList);
          }
        }
        if (isOwnProfile) {
          const newCount = followingCount + 1;
          setFollowingCount(newCount);

          if (authUser?.id) {
            saveToStorage('following_count', authUser.id, newCount, true);
          }
        }
        setIsFollowingUser(true);
        
        await followUser(userId);
        setProfileMessage(t("profile.follow"));
      }
      


      try {
        if (isOwnProfile && authUser?.id) {

          const [followers, following] = await Promise.allSettled([
            getFollowers(),
            getFollowing(),
          ]);
          

          if (followers.status === 'fulfilled' && Array.isArray(followers.value)) {
            setFollowersCount(followers.value.length);
            saveToStorage('followers_list', authUser.id, followers.value, true);
          } else {


            const currentFollowers = followersCount;
            saveToStorage('followers_count', authUser.id, currentFollowers, true);
            

            const cachedFollowers = loadFromStorage('followers_list', authUser.id, true);
            if (cachedFollowers !== null && Array.isArray(cachedFollowers)) {

              const updatedList = wasFollowing 
                ? cachedFollowers.filter(f => {
                    const fId = f.id || f.Id || f.userId || f.UserId;
                    return fId?.toString() !== userId?.toString();
                  })
                : [...cachedFollowers, { id: userId }];
              setFollowersCount(updatedList.length);
              saveToStorage('followers_list', authUser.id, updatedList, true);
            }
          }
          

          if (following.status === 'fulfilled' && Array.isArray(following.value)) {
            setFollowingCount(following.value.length);
            saveToStorage('following_list', authUser.id, following.value, true);
          } else {


            const currentFollowing = followingCount;
            saveToStorage('following_count', authUser.id, currentFollowing, true);
            

            const cachedFollowing = loadFromStorage('following_list', authUser.id, true);
            if (cachedFollowing !== null && Array.isArray(cachedFollowing)) {

              const updatedList = wasFollowing
                ? cachedFollowing.filter(f => {
                    const fId = f.id || f.Id || f.userId || f.UserId || f.followingId || f.FollowingId;
                    return fId?.toString() !== userId?.toString();
                  })
                : [...cachedFollowing, { id: userId, followingId: userId }];
              setFollowingCount(updatedList.length);
              saveToStorage('following_list', authUser.id, updatedList, true);
            }
          }
        } else {


          try {
            const isFollowingStatus = await checkIsFollowing(userId);
            setIsFollowingUser(isFollowingStatus);
            

            const [followersResult] = await Promise.allSettled([
              getUserFollowers(userId),
            ]);
            

            if (followersResult.status === 'fulfilled' && Array.isArray(followersResult.value) && followersResult.value.length > 0) {
              setFollowersCount(followersResult.value.length);
              setFollowersList(followersResult.value);

              saveToStorage('followers_count', userId, followersResult.value.length, false);
              saveToStorage('followers_list', userId, followersResult.value, false);
            } else {

              const currentFollowersCount = followersCount;
              saveToStorage('followers_count', userId, currentFollowersCount, false);
              

              const cachedFollowersList = loadFromStorage('followers_list', userId, false) || [];
              const currentUserId = authUser?.id || authUser?.Id;
              

              if (!wasFollowing && !cachedFollowersList.some(f => {
                const followerId = f.id || f.Id || f.userId || f.UserId || f.followerId || f.FollowerId;
                return followerId === currentUserId;
              }) && currentUserId) {
                const currentUserData = {
                  id: currentUserId,
                  userId: currentUserId,
                  followerId: currentUserId,
                  name: authUser?.name || authUser?.username || authUser?.email?.split('@')[0] || 'User',
                  username: authUser?.username || authUser?.email?.split('@')[0] || '',
                  email: authUser?.email || '',
                  avatarUrl: authUser?.avatarUrl || authUser?.profilePictureUrl || null,
                  role: authUser?.role || 'reader',
                };
                const updatedFollowersList = [...cachedFollowersList, currentUserData];
                saveToStorage('followers_list', userId, updatedFollowersList, false);
                setFollowersList(updatedFollowersList);
              } else if (wasFollowing && currentUserId) {

                const updatedFollowersList = cachedFollowersList.filter(f => {
                  const followerId = f.id || f.Id || f.userId || f.UserId || f.followerId || f.FollowerId;
                  return followerId !== currentUserId;
                });
                saveToStorage('followers_list', userId, updatedFollowersList, false);
                setFollowersList(updatedFollowersList);
              }
            }
            

            if (isOwnProfile && authUser?.id) {
              saveToStorage('following_count', authUser.id, followingCount, true);
            }
          } catch (err) {

            setIsFollowingUser(wasFollowing);
            if (!isOwnProfile) {
              setFollowersCount(previousFollowersCount);
            }
          }
        }
      } catch (err) {

        setIsFollowingUser(wasFollowing);
        if (!isOwnProfile) {
          setFollowersCount(previousFollowersCount);
        }
        if (isOwnProfile) {
          setFollowingCount(previousFollowingCount);
        }
      }
      

      window.dispatchEvent(new CustomEvent('followStatusChanged', { 
        detail: { userId: userId, isFollowing: !wasFollowing } 
      }));
      
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {

      setIsFollowingUser(wasFollowing);
      if (!isOwnProfile) {
        setFollowersCount(previousFollowersCount);
      }
      if (isOwnProfile) {
        setFollowingCount(previousFollowingCount);
      }
      

      let errorMessage = t("profile.error");
      
      if (err.data) {
        if (Array.isArray(err.data.errorMessages) && err.data.errorMessages.length > 0) {
          errorMessage = err.data.errorMessages[0];
        } else if (err.data.message) {
          errorMessage = err.data.message;
        } else if (err.data.detail) {
          errorMessage = err.data.detail;
        } else if (typeof err.data === 'string') {
          errorMessage = err.data;
        }
      }
      
      if (err.message && err.message !== "Request failed with error") {
        errorMessage = err.message;
      }
      
      setProfileMessage(errorMessage);
      setTimeout(() => setProfileMessage(null), 5000);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleFollowersClick = async () => {
    if (loadingFollowers) return;
    
    setShowFollowersModal(true);
    setLoadingFollowers(true);
    
    try {
      const userId = profile?.id || profile?.Id || profile?.userId || profile?.UserId;
      
      if (isOwnProfile) {

        const followers = await getFollowers();
        const followersList = Array.isArray(followers) ? followers : [];
        setFollowersList(followersList);

        setFollowersCount(followersList.length);

        if (userId) {
          saveToStorage('followers_list', userId, followersList, true);
          saveToStorage('followers_count', userId, followersList.length, true);
        }
      } else {

        if (userId) {

          const cachedFollowers = loadFromStorage('followers_list', userId, false);
          if (cachedFollowers !== null && Array.isArray(cachedFollowers) && cachedFollowers.length > 0) {
            setFollowersList(cachedFollowers);

            setFollowersCount(cachedFollowers.length);
            setLoadingFollowers(false);
            return;
          }
          

          try {
            const followers = await getUserFollowers(userId);
            const followersList = Array.isArray(followers) ? followers : [];
            setFollowersList(followersList);

            setFollowersCount(followersList.length);

            saveToStorage('followers_list', userId, followersList, false);
            saveToStorage('followers_count', userId, followersList.length, false);
          } catch (err) {

            setFollowersList([]);
            setFollowersCount(0);
          }
        } else {
          setFollowersList([]);
          setFollowersCount(0);
        }
      }
    } catch (err) {

      const userId = profile?.id || profile?.Id || profile?.userId || profile?.UserId;
      if (userId) {
        const cachedFollowers = loadFromStorage('followers_list', userId, isOwnProfile);
        if (cachedFollowers !== null && Array.isArray(cachedFollowers)) {
          setFollowersList(cachedFollowers);

          setFollowersCount(cachedFollowers.length);
        } else {
          setFollowersList([]);
          setFollowersCount(0);
        }
      } else {
        setFollowersList([]);
        setFollowersCount(0);
      }
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleFollowingClick = async () => {
    if (loadingFollowing) return;
    
    setShowFollowingModal(true);
    setLoadingFollowing(true);
    
    try {
      const userId = profile?.id || profile?.Id || profile?.userId || profile?.UserId;
      if (!userId) {
        setFollowingList([]);
        setLoadingFollowing(false);
        return;
      }
      

      const cachedFollowing = loadFromStorage('following_list', userId, isOwnProfile);
      if (cachedFollowing !== null && Array.isArray(cachedFollowing)) {
        setFollowingList(cachedFollowing);
      }
      
      if (isOwnProfile) {

        const following = await getFollowing();
        const followingArray = Array.isArray(following) ? following : [];
        setFollowingList(followingArray);
        saveToStorage('following_list', userId, followingArray, true);
      } else {


        if (cachedFollowing === null) {
          setFollowingList([]);
        }
      }
    } catch (err) {
      console.error("Error loading following:", err);

      const userId = profile?.id || profile?.Id || profile?.userId || profile?.UserId;
      if (userId) {
        const cachedFollowing = loadFromStorage('following_list', userId, isOwnProfile);
        if (cachedFollowing !== null && Array.isArray(cachedFollowing)) {
          setFollowingList(cachedFollowing);
        } else {
          setFollowingList([]);
        }
      } else {
        setFollowingList([]);
      }
    } finally {
      setLoadingFollowing(false);
    }
  };


  const getProfileOwnerId = () => {
    if (isOwnProfile) {
      return authUser?.id || authUser?.Id;
    }
    return profile?.id || profile?.Id || profile?.userId || profile?.UserId;
  };

  const profileOwnerId = getProfileOwnerId();


  const filterPostsByOwner = (posts) => {
    return posts.filter(post => {

      const postUserId = post.userId || post.UserId || 
                        post.user?.id || post.User?.Id ||
                        post.user?.userId || post.User?.UserId;
      

      const postUsername = post.username || post.user?.name || post.user?.username;
      const profileUsername = profile?.username || profile?.name;
      

      if (profileOwnerId && postUserId) {
        return String(postUserId) === String(profileOwnerId);
      }
      

      if (profileUsername && postUsername) {
        return String(postUsername).toLowerCase() === String(profileUsername).toLowerCase();
      }
      

      if (post.isLocal && isOwnProfile) {
        return true;
      }
      

      return false;
    });
  };

  const stats = {
    posts: isOwnProfile 
      ? filterPostsByOwner(userPosts).length
      : filterPostsByOwner(viewedUserPosts).filter(post => post.type !== "post").length,
    shelves: shelves?.length || 0,
  };


  const tabs = isOwnProfile ? [
    ...((profile || {}).role === "writer" ? [{ id: "my-books", label: `${t("profile.myBooks")} (${userBooks.length})` }] : []),
    { id: "shelves", label: `${t("profile.shelves")} (${stats.shelves})` },
    { id: "posts", label: `${t("profile.posts")} (${stats.posts})` },
  ] : [
    { id: "posts", label: `${t("profile.posts")} (${stats.posts})` },
  ];

  const getRating = (book) => {
    return book.rating || book.averageRating || book.avgRating || 0;
  };


  const handleDeletePost = async (postId, post) => {
    if (!onDeletePost) {
      console.error("onDeletePost is not available");
      return;
    }
    

    if (!postId || !post) {
      console.error("Invalid postId or post:", { postId, post });
      throw new Error("Post ID or post object is missing");
    }
    
    try {

      if (isOwnProfile) {
        setViewedUserPosts((prev) => prev.filter((p) => p.id !== postId));
      }
      

      await onDeletePost(postId, post);
      


    } catch (err) {
      console.error("Error deleting post in profile:", err);
      

      if (isOwnProfile && userPosts) {
        const deletedPost = userPosts.find(p => p.id === postId);
        if (deletedPost) {
          setViewedUserPosts((prev) => {

            if (!prev.find(p => p.id === postId)) {
              return [...prev, deletedPost];
            }
            return prev;
          });
        }
      }
      
      throw err;
    }
  };


  const handleAddComment = async (postId, commentText) => {
    if (!commentText || !commentText.trim()) {
      throw new Error("Comment text cannot be empty");
    }


    const post = isOwnProfile 
      ? userPosts.find(p => p.id === postId)
      : viewedUserPosts.find(p => p.id === postId);
    
    const postType = post?.type || 'review';


    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: authUser?.name || authUser?.username || authUser?.firstName || "You",
      userAvatar: authUser?.avatarUrl || authUser?.AvatarUrl || authUser?.profilePictureUrl || authUser?.ProfilePictureUrl || null,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };




    if (!isOwnProfile) {

      setViewedUserPosts((prev) => {
        return prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...(p.comments || []), newComment] }
            : p
        );
      });
    }

    let savedComment = null;
    try {

      savedComment = await createComment(postId, commentText.trim(), postType);
      
      if (savedComment) {

        const backendComment = {
          id: savedComment.id || savedComment.Id || newComment.id,
          username: savedComment.username || savedComment.Username || newComment.username,
          userAvatar: savedComment.userAvatar || savedComment.UserAvatar || savedComment.user?.avatarUrl || savedComment.User?.AvatarUrl || newComment.userAvatar,
          text: savedComment.text || savedComment.Text || savedComment.commentText || savedComment.CommentText || commentText.trim(),
          timestamp: savedComment.timestamp || savedComment.createdAt || savedComment.CreatedAt || newComment.timestamp,
          createdAt: savedComment.createdAt || savedComment.CreatedAt || newComment.createdAt,
        };
        



        if (!isOwnProfile) {
          setViewedUserPosts((prev) => {
            return prev.map((p) =>
              p.id === postId
                ? { 
                    ...p, 
                    comments: p.comments?.map(c => c.id === newComment.id ? backendComment : c) || [backendComment]
                  }
                : p
            );
          });
        }
      }

    } catch (err) {

      if (err.status !== 404) {

        if (!isOwnProfile) {
          setViewedUserPosts((prev) => {
            return prev.map((p) =>
              p.id === postId
                ? { ...p, comments: p.comments?.filter(c => c.id !== newComment.id) || [] }
                : p
            );
          });
        }
        throw err;
      }

    }



    if (isOwnProfile && onAddComment) {
      try {

        await onAddComment(postId, commentText);


      } catch (err) {


        const finalComment = savedComment ? {
          id: savedComment.id || savedComment.Id || newComment.id,
          username: savedComment.username || savedComment.Username || newComment.username,
          userAvatar: savedComment.userAvatar || savedComment.UserAvatar || savedComment.user?.avatarUrl || savedComment.User?.AvatarUrl || newComment.userAvatar,
          text: savedComment.text || savedComment.Text || savedComment.commentText || savedComment.CommentText || commentText.trim(),
          timestamp: savedComment.timestamp || savedComment.createdAt || savedComment.CreatedAt || newComment.timestamp,
          createdAt: savedComment.createdAt || savedComment.CreatedAt || newComment.createdAt,
        } : newComment;
        

        setViewedUserPosts((prev) => {
          return prev.map((p) => {
            if (p.id === postId) {
              const hasComment = p.comments?.some(c => 
                c.id === finalComment.id || 
                (c.text === finalComment.text && c.username === finalComment.username && 
                 Math.abs(new Date(c.timestamp).getTime() - new Date(finalComment.timestamp).getTime()) < 5000)
              );
              if (!hasComment) {
                return {
                  ...p,
                  comments: [...(p.comments || []), finalComment],
                };
              }
              return p;
            }
            return p;
          });
        });
      }
    } else {

      try {
        const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
        const postIndex = existing.findIndex((post) => 
          post.id === postId || 
          (post.type === 'review' && (post.reviewId === postId || post.id === postId))
        );
        
        const commentToSave = savedComment ? {
          id: savedComment.id || savedComment.Id || newComment.id,
          username: savedComment.username || savedComment.Username || newComment.username,
          userAvatar: savedComment.userAvatar || savedComment.UserAvatar || savedComment.user?.avatarUrl || savedComment.User?.AvatarUrl || newComment.userAvatar,
          text: savedComment.text || savedComment.Text || savedComment.commentText || savedComment.CommentText || commentText.trim(),
          timestamp: savedComment.timestamp || savedComment.createdAt || savedComment.CreatedAt || newComment.timestamp,
        } : newComment;
        
        if (postIndex !== -1) {
          const updated = existing.map((post) => {
            const isTargetPost = post.id === postId || 
              (post.type === 'review' && (post.reviewId === postId || post.id === postId));
            
            if (isTargetPost) {

              const hasComment = (post.comments || []).some(c => 
                c.id === commentToSave.id || 
                (c.text === commentToSave.text && c.username === commentToSave.username)
              );
              if (!hasComment) {
                return { ...post, comments: [...(post.comments || []), commentToSave] };
              }
            }
            return post;
          });
          localStorage.setItem("bookverse_social_feed", JSON.stringify(updated));
        } else {
          const postToAdd = viewedUserPosts.find((p) => p.id === postId);
          if (postToAdd) {
            const postWithComment = {
              ...postToAdd,
              ...(postToAdd.type === 'review' && !postToAdd.reviewId ? { reviewId: postToAdd.id } : {}),
              comments: [...(postToAdd.comments || []), commentToSave],
            };
            existing.push(postWithComment);
            localStorage.setItem("bookverse_social_feed", JSON.stringify(existing));
          }
        }
      } catch (err) {
        console.error("Error saving comment to localStorage:", err);
      }
    }
    
    return Promise.resolve();
  };


  const handleDeleteComment = async (postId, commentId) => {

    const post = isOwnProfile 
      ? (userPosts.find(p => p.id === postId) || viewedUserPosts.find(p => p.id === postId))
      : viewedUserPosts.find(p => p.id === postId);
    
    const comment = post?.comments?.find(c => c.id === commentId);
    
    if (!comment) {
      return;
    }


    const commentOwnerUsername = comment.username;
    const postOwnerUsername = post?.username || post?.user?.name || post?.user?.username;
    const currentUsername = authUser?.name || authUser?.username || authUser?.firstName;
    const isCommentOwner = commentOwnerUsername === currentUsername;
    const isPostOwner = postOwnerUsername === currentUsername || 
                       (post?.userId && authUser?.id && String(post.userId) === String(authUser.id)) ||
                       (post?.isLocal && isOwnProfile);
    
    if (!isCommentOwner && !isPostOwner) {
      alert("Bu comment-i silmək üçün icazəniz yoxdur");
      return;
    }



    setViewedUserPosts((prev) => {
      const updated = prev.map((p) =>
        p.id === postId
          ? { ...p, comments: p.comments?.filter(c => c.id !== commentId) || [] }
          : p
      );

      try {
        const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
        const updatedStorage = existing.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments?.filter(c => c.id !== commentId) || [] }
            : post
        );
        localStorage.setItem("bookverse_social_feed", JSON.stringify(updatedStorage));
      } catch (err) {

      }
      return updated;
    });

    try {

      const result = await deleteComment(commentId);
      

    } catch (err) {

      if (err.status !== 404) {

        setViewedUserPosts((prev) => {
          return prev.map((p) =>
            p.id === postId
              ? { ...p, comments: [...(p.comments || []), comment] }
              : p
          );
        });
        alert("Comment silinərkən xəta baş verdi. Yenidən cəhd edin.");
        return;
      }

    }
    


    if (onDeleteComment) {
      try {

        const result = onDeleteComment(postId, commentId);
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (err) {

      }
    }
    

    try {
      const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
      const updated = existing.map((post) =>
        post.id === postId
          ? { ...post, comments: post.comments?.filter(c => c.id !== commentId) || [] }
          : post
      );
      localStorage.setItem("bookverse_social_feed", JSON.stringify(updated));
    } catch (err) {

    }
  };


  const handleLikeChange = (postId, likes, isLiked) => {

    if (isOwnProfile) {
      setViewedUserPosts((prev) => {
        return prev.map((post) =>
          post.id === postId ? { ...post, likes, isLiked } : post
        );
      });
    } else {
      setViewedUserPosts((prev) => {
        return prev.map((post) =>
          post.id === postId ? { ...post, likes, isLiked } : post
        );
      });
    }
    

    try {
      const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
      const postIndex = existing.findIndex((post) => post.id === postId);
      
      if (postIndex !== -1) {

        const updated = existing.map((post) =>
          post.id === postId ? { ...post, likes, isLiked } : post
        );
        localStorage.setItem("bookverse_social_feed", JSON.stringify(updated));
      } else {

        const postToAdd = viewedUserPosts.find((p) => p.id === postId);
        if (postToAdd) {
          const postWithLike = {
            ...postToAdd,
            likes,
            isLiked,
          };
          existing.push(postWithLike);
          localStorage.setItem("bookverse_social_feed", JSON.stringify(existing));
        }
      }
    } catch (err) {

    }
    

    if (onLikeChange) {
      onLikeChange(postId, likes, isLiked);
    }
  };


  const handleReportPost = async (postId, post) => {
    try {

      const REPORTED_POSTS_KEY = "bookverse_reported_posts";
      const reportedPosts = JSON.parse(localStorage.getItem(REPORTED_POSTS_KEY) || "[]");
      if (!reportedPosts.includes(postId)) {
        reportedPosts.push(postId);
        localStorage.setItem(REPORTED_POSTS_KEY, JSON.stringify(reportedPosts));
      }
      

      setViewedUserPosts((prev) => prev.filter((p) => p.id !== postId));
      


    } catch (err) {
      throw err;
    }
  };

  const renderShelvesTab = () => {
    if (shelvesLoading) {
      return (
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-amber-600 dark:border-amber-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-700 mt-6">{t("profile.shelvesLoading")}</p>
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
            {t("profile.noShelves")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-600">
            {t("profile.noShelvesDesc")}
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
                    {translateShelfName(shelf.name)}
                  </h3>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-600 mt-1">
                    {shelf.books?.length || 0} {shelf.books?.length === 1 ? t("profile.book") : t("profile.books")}
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
              <p className="text-sm text-gray-600 dark:text-gray-600 font-semibold">{t("profile.shelfEmpty")}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPostsTab = () => {
    let postsToShow = isOwnProfile ? userPosts : viewedUserPosts;
    


    const profileOwnerId = isOwnProfile 
      ? (authUser?.id || authUser?.Id) 
      : (profile?.id || profile?.Id || profile?.userId || profile?.UserId);
    

    postsToShow = postsToShow.filter(post => {

      const postUserId = post.userId || post.UserId || 
                        post.user?.id || post.User?.Id ||
                        post.user?.userId || post.User?.UserId;
      

      const postUsername = post.username || post.user?.name || post.user?.username;
      const profileUsername = profile?.username || profile?.name;
      

      if (profileOwnerId && postUserId) {
        return String(postUserId) === String(profileOwnerId);
      }
      

      if (profileUsername && postUsername) {
        return String(postUsername).toLowerCase() === String(profileUsername).toLowerCase();
      }
      

      if (post.isLocal && isOwnProfile) {
        return true;
      }
      

      return false;
    });
    


    if (!isOwnProfile) {
      postsToShow = postsToShow.filter(post => post.type !== "post");
    }
    
    return (
      <div className="space-y-6">
        {postsToShow.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-100 dark:to-orange-100 rounded-full mb-6">
              <svg className="h-12 w-12 text-amber-500 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-900 mb-3">
              {t("profile.noPosts")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-600">
              {t("profile.noPostsDesc")}
            </p>
          </div>
        ) : (
          postsToShow.map((post) => (
            <SocialFeedPost 
              key={post.id} 
              post={post} 
              currentUsername={isOwnProfile ? (authUser?.name || authUser?.username) : (profile?.name || profile?.username)}
              enableInteractions={true}
              allowEditDelete={isOwnProfile}
              onDeletePost={isOwnProfile ? handleDeletePost : undefined}
              onReportPost={!isOwnProfile ? handleReportPost : undefined}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onLikeChange={handleLikeChange}
              onPostUpdate={isOwnProfile ? async (postId, updatedPost) => {

                setViewedUserPosts((prev) => {
                  return prev.map((p) => (p.id === postId ? { ...p, ...updatedPost } : p));
                });

                if (onPostUpdate) {
                  await onPostUpdate(postId, updatedPost);
                }
              } : undefined}
            />
          ))
        )}
      </div>
    );
  };

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
            {t("profile.noBooks")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-600">
            {t("profile.noBooksDesc")}
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
                {t("profile.title")}
              </h1>
              <p className="text-gray-700 dark:text-gray-700 text-xl sm:text-2xl mt-3 font-semibold">
                {t("profile.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-white text-gray-900 dark:text-gray-900 rounded-3xl p-8 mb-8 shadow-xl border-2 border-gray-100 dark:border-gray-200">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative z-50" ref={avatarMenuRef}>
            <div
              onClick={isOwnProfile ? handleAvatarClick : undefined}
              className={`relative group ${isOwnProfile ? "cursor-pointer" : ""}`}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-400 dark:border-purple-400 shadow-xl"
                />
              ) : profile?.avatarUrl && !imageError ? (
                <img
                  key={`profile-avatar-${profile.avatarUrl}-${avatarKey}`}
                  src={(() => {
                    const imageUrl = getImageUrl(profile.avatarUrl);
                    if (!imageUrl) return '';

                    const separator = imageUrl.includes('?') ? '&' : '?';
                    return `${imageUrl}${separator}v=${avatarKey}`;
                  })()}
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
            
            {isOwnProfile && showAvatarMenu && !avatarUploading && (
              <div className="absolute top-full left-0 mt-3 bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 rounded-2xl shadow-2xl z-[100] min-w-[180px] overflow-hidden">
                <button
                  onClick={handleSelectImage}
                  className="w-full px-5 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:via-blue-50 hover:to-indigo-50 dark:hover:from-purple-50 dark:hover:via-blue-50 dark:hover:to-indigo-50 flex items-center gap-3 transition-all"
                >
                  <Camera className="w-5 h-5 text-amber-600 dark:text-amber-600" />
                  {t("profile.selectImage")}
                </button>
                {(profile?.avatarUrl || previewImage) && (
                  <button
                    onClick={handleAvatarReset}
                    className="w-full px-5 py-3 text-left text-sm font-semibold text-red-600 dark:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-50 dark:hover:to-orange-50 flex items-center gap-3 transition-all border-t-2 border-gray-100 dark:border-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t("profile.removeImage")}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-5">
            {profileLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-amber-200 dark:border-amber-200 border-t-purple-600 dark:border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-600 font-semibold">{t("profile.loading")}</p>
              </div>
            ) : isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-gray-900">{t("profile.name")}</label>
                  <input
                    className="w-full p-4 rounded-xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-200 focus:border-purple-400 dark:focus:border-purple-400 transition-all shadow-sm"
                    value={editedUser?.name || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-gray-900">{t("profile.email")}</label>
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
                  <label className="text-sm font-bold text-gray-900 dark:text-gray-900">{t("profile.bio")}</label>
                  <textarea
                    rows={4}
                    className="w-full p-4 rounded-xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 resize-none focus:outline-none focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-200 focus:border-purple-400 dark:focus:border-purple-400 transition-all shadow-sm"
                    value={editedUser?.bio || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, bio: e.target.value })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-4xl font-black text-gray-900 dark:text-gray-900">
                    {profile?.name || "User"}
                  </h1>
                  {!isOwnProfile && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-2 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 ${
                        isFollowingUser
                          ? "bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50"
                          : "bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white"
                      } ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {followLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : isFollowingUser ? (
                        <>
                          <UserX className="w-4 h-4" />
                          {t("profile.followingBtn")}
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          {t("profile.follow")}
                        </>
                      )}
                    </button>
                  )}
                </div>
                {profile?.bio && (
                  <p className="text-gray-600 dark:text-gray-600 text-base mb-4 leading-relaxed">{profile.bio}</p>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  <div className="px-2 py-1.5 rounded-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-50 dark:to-orange-50 border border-amber-200 dark:border-amber-200 shadow-sm">
                    <div className="text-base font-black text-amber-600 dark:text-amber-600">{stats.posts}</div>
                    <div className="text-[10px] font-semibold text-gray-700 dark:text-gray-700 mt-0.5">{t("profile.posts")}</div>
                  </div>
                  <div 
                    onClick={handleFollowersClick}
                    className="px-2 py-1.5 rounded-md bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-50 dark:to-indigo-50 border border-purple-200 dark:border-purple-200 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-105"
                  >
                    <div className="text-base font-black text-purple-600 dark:text-purple-600">{followersCount}</div>
                    <div className="text-[10px] font-semibold text-gray-700 dark:text-gray-700 mt-0.5">{t("profile.followers")}</div>
                  </div>
                  <div 
                    onClick={handleFollowingClick}
                    className="px-2 py-1.5 rounded-md bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-50 dark:to-cyan-50 border border-blue-200 dark:border-blue-200 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-105"
                  >
                    <div className="text-base font-black text-blue-600 dark:text-blue-600">{followingCount}</div>
                    <div className="text-[10px] font-semibold text-gray-700 dark:text-gray-700 mt-0.5">{t("profile.following")}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {isOwnProfile ? (
              isEditing ? (
                <>
                  <button
                    onClick={handleProfileSave}
                    className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {t("profile.save")}
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
                        bio: profile?.bio || "",
                      });
                      setProfileMessage(null);
                      setProfileError(null);
                    }}
                    className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow-md"
                  >
                    {t("profile.cancel")}
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
                        bio: profile?.bio || "",
                      });
                      setIsEditing(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-5 h-5" />
                    {t("profile.edit")}
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-6 py-3 rounded-xl border-2 border-red-200 dark:border-red-200 text-red-600 dark:text-red-600 hover:bg-red-50 dark:hover:bg-red-50 font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    {t("profile.logout")}
                  </button>
                </>
              )
            ) : null}
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
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ripple-effect ${
                activeTab === tab.id 
                  ? "bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 text-white shadow-xl scale-105" 
                  : "bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 hover:border-purple-300 dark:hover:border-purple-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-fadeIn">
          {activeTab === "shelves" && isOwnProfile && renderShelvesTab()}
          {activeTab === "posts" && renderPostsTab()}
          {activeTab === "my-books" && isOwnProfile && renderMyBooksTab()}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFollowersModal(false)}>
          <div className="bg-white dark:bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-200">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-900">{t("profile.followersTitle")}</h2>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingFollowers ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : followersList.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600 dark:text-gray-600 font-semibold">{t("profile.noFollowers")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followersList.map((user, index) => {

                    const userId = user.id || user.Id || user.userId || user.UserId || user.followerId || user.FollowerId || user.followingUserId || user.FollowingUserId;
                    const username = user.username || user.Username || user.userName || user.UserName || user.email?.split("@")[0] || "";
                    const name = user.name || user.Name || username || "User";
                    const avatarUrl = getImageUrl(user.avatarUrl || user.AvatarUrl || user.profilePictureUrl || user.ProfilePictureUrl);
                    
                    if (!userId) {
                      return null;
                    }
                    
                    return (
                      <div
                        key={userId || index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowFollowersModal(false);

                          if (userId) {
                            const isCurrentUser = userId === (authUser?.id || authUser?.Id);
                            if (isCurrentUser) {

                              navigate(`/profile/${userId}`);
                            } else {

                              navigate(`/profile/${userId}`, { 
                                state: { 
                                  userData: {
                                    id: userId,
                                    name: name,
                                    username: username,
                                    avatarUrl: user.avatarUrl || user.AvatarUrl || user.profilePictureUrl || user.ProfilePictureUrl,
                                    email: user.email || user.Email,
                                    bio: user.bio || user.Bio,
                                    role: user.role || user.Role || 'reader',
                                  }
                                } 
                              });
                            }
                          }
                        }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-50 dark:to-purple-50/30 border-2 border-gray-200 dark:border-gray-200 hover:border-purple-400 dark:hover:border-purple-400 cursor-pointer transition-all hover:shadow-lg"
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-lg font-black text-white border-2 border-gray-200 dark:border-gray-200 ${avatarUrl ? 'hidden' : 'flex'}`}
                        >
                          {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-gray-900 truncate">{name}</h3>
                          {username && username !== name && (
                            <p className="text-sm text-gray-600 dark:text-gray-600 truncate">@{username}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFollowingModal(false)}>
          <div className="bg-white dark:bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-200">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-900">{t("profile.followingTitle")}</h2>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingFollowing ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : followingList.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600 dark:text-gray-600 font-semibold">{t("profile.noFollowing")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followingList.map((user, index) => {


                    const userId = user.id || user.Id || user.userId || user.UserId || user.followingId || user.FollowingId || user.followedUserId || user.FollowedUserId || user.followingUserId || user.FollowingUserId;
                    const username = user.username || user.Username || user.userName || user.UserName || user.email?.split("@")[0] || "";
                    const name = user.name || user.Name || username || "User";
                    const avatarUrl = getImageUrl(user.avatarUrl || user.AvatarUrl || user.profilePictureUrl || user.ProfilePictureUrl);
                    

                    if (!userId) {
                      return null;
                    }
                    
                    return (
                      <div
                        key={userId || index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowFollowingModal(false);

                          if (userId) {
                            const isCurrentUser = userId === (authUser?.id || authUser?.Id);
                            if (isCurrentUser) {

                              navigate(`/profile/${userId}`);
                            } else {

                              navigate(`/profile/${userId}`, { 
                                state: { 
                                  userData: {
                                    id: userId,
                                    name: name,
                                    username: username,
                                    avatarUrl: user.avatarUrl || user.AvatarUrl || user.profilePictureUrl || user.ProfilePictureUrl,
                                    email: user.email || user.Email,
                                    bio: user.bio || user.Bio,
                                    role: user.role || user.Role || 'reader',
                                  }
                                } 
                              });
                            }
                          }
                        }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-50 dark:to-blue-50/30 border-2 border-gray-200 dark:border-gray-200 hover:border-blue-400 dark:hover:border-blue-400 cursor-pointer transition-all hover:shadow-lg"
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-lg font-black text-white border-2 border-gray-200 dark:border-gray-200 ${avatarUrl ? 'hidden' : 'flex'}`}
                        >
                          {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-gray-900 truncate">{name}</h3>
                          {username && username !== name && (
                            <p className="text-sm text-gray-600 dark:text-gray-600 truncate">@{username}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guest Restriction Modal */}
      <GuestRestrictionModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onLogin={onShowLogin || onSwitchAccount}
        onRegister={onShowRegister || onSwitchAccount}
      />
    </div>
  );
}
