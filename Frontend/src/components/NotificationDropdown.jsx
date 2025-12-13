import { useState, useEffect, useRef } from "react";
import { Bell, UserPlus, X } from "lucide-react";
import { getFollowers, followUser, getFollowing } from "../api/userFollows";
import { getImageUrl } from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

export default function NotificationDropdown({ isOpen, onClose, onNotificationChange }) {
  const { user } = useAuth();
  const t = useTranslation();
  const [followers, setFollowers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(new Set());
  const dropdownRef = useRef(null);

  // Get dismissed notifications from localStorage
  const getDismissedNotifications = () => {
    if (!user?.id) return [];
    try {
      const dismissed = localStorage.getItem(`dismissed_notifications_${user.id}`);
      return dismissed ? JSON.parse(dismissed) : [];
    } catch (error) {
      console.error("Error loading dismissed notifications:", error);
      return [];
    }
  };

  // Save dismissed notification to localStorage
  const saveDismissedNotification = (followerId) => {
    if (!user?.id) return;
    try {
      const dismissed = getDismissedNotifications();
      if (!dismissed.includes(followerId)) {
        dismissed.push(followerId);
        localStorage.setItem(`dismissed_notifications_${user.id}`, JSON.stringify(dismissed));
      }
    } catch (error) {
      console.error("Error saving dismissed notification:", error);
    }
  };

  // Helper function to get follower ID
  const getFollowerId = (follower) => {
    return follower.id || follower.Id || follower.followerId || follower.FollowerId || follower.userId || follower.UserId;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      loadNotifications();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Load followers (people who followed you)
      const followersList = await getFollowers();
      // Load following list to check if we already follow them back
      const following = await getFollowing();
      
      // Get dismissed notifications
      const dismissed = getDismissedNotifications();
      
      // Filter out dismissed followers and those we already follow back
      const followersArray = (followersList || []).filter((follower) => {
        const followerId = getFollowerId(follower);
        const followerIdStr = followerId?.toString();
        
        // Don't show if dismissed
        if (dismissed.includes(followerIdStr)) {
          return false;
        }
        // Don't show if we already follow them back
        const alreadyFollowing = (following || []).some((f) => {
          const id = f.id || f.Id || f.followingId || f.FollowingId || f.userId || f.UserId;
          return id?.toString() === followerIdStr;
        });
        return !alreadyFollowing;
      });
      
      setFollowers(followersArray);
      setFollowingList(following || []);
      
      // Notify parent about count change
      if (onNotificationChange) {
        onNotificationChange(followersArray.length);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setFollowers([]);
      setFollowingList([]);
      if (onNotificationChange) {
        onNotificationChange(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollowBack = async (followerId) => {
    if (processing.has(followerId)) return;
    
    setProcessing((prev) => new Set(prev).add(followerId));
    try {
      await followUser(followerId);
      // Add to following list
      const follower = followers.find((f) => {
        const id = f.id || f.Id || f.followerId || f.FollowerId || f.userId || f.UserId;
        return id?.toString() === followerId?.toString();
      });
      if (follower) {
        setFollowingList((prev) => [...prev, follower]);
      }
      // Remove from notifications after following back (they're still your follower, just hide the notification)
      setFollowers((prev) => {
        const updated = prev.filter((f) => {
          const id = f.id || f.Id || f.followerId || f.FollowerId || f.userId || f.UserId;
          return id?.toString() !== followerId?.toString();
        });
        // Notify parent about count change
        if (onNotificationChange) {
          onNotificationChange(updated.length);
        }
        return updated;
      });
    } catch (error) {
      console.error("Error following back:", error);
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(followerId);
        return next;
      });
    }
  };

  const handleDismiss = (followerId) => {
    // Save to dismissed list in localStorage
    saveDismissedNotification(followerId?.toString());
    
    // Remove from notifications (they're still your follower, we just hide the notification)
    setFollowers((prev) => {
      const updated = prev.filter((f) => {
        const id = f.id || f.Id || f.followerId || f.FollowerId || f.userId || f.UserId;
        return id?.toString() !== followerId?.toString();
      });
      // Notify parent about count change
      if (onNotificationChange) {
        onNotificationChange(updated.length);
      }
      return updated;
    });
  };

  if (!isOpen) return null;

  const getFollowerName = (follower) => {
    return follower.name || follower.Name || follower.username || follower.Username || "Unknown User";
  };

  const getFollowerAvatar = (follower) => {
    return follower.avatarUrl || follower.AvatarUrl || follower.profilePictureUrl || follower.ProfilePictureUrl;
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-[100] max-h-[500px] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b-2 border-gray-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-gray-900">
            {t("notifications.title") || "Notifications"}
          </h3>
          {followers.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-600 text-white text-xs font-bold rounded-full">
              {followers.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-600">{t("common.loading") || "Loading..."}</p>
          </div>
        ) : followers.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">
              {t("notifications.noNotifications") || "No new notifications"}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {followers.map((follower) => {
              const followerId = getFollowerId(follower);
              const followerName = getFollowerName(follower);
              const followerAvatar = getFollowerAvatar(follower);
              const isProcessing = processing.has(followerId);
              
              // Check if we already follow them back
              const alreadyFollowing = followingList.some((f) => {
                const id = f.id || f.Id || f.followingId || f.FollowingId || f.userId || f.UserId;
                return id?.toString() === followerId?.toString();
              });

              return (
                <div
                  key={followerId}
                  className="p-3 rounded-xl hover:bg-gray-50 transition-colors mb-2 border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {followerAvatar ? (
                      <img
                        src={getImageUrl(followerAvatar)}
                        alt={followerName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex items-center justify-center text-sm font-black text-white border-2 border-gray-200 ${
                        followerAvatar ? "hidden" : "flex"
                      }`}
                    >
                      {followerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        <span className="font-semibold">{followerName}</span>{" "}
                        {t("notifications.followedYou") || "started following you"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {!alreadyFollowing ? (
                          <button
                            onClick={() => handleFollowBack(followerId)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            {t("notifications.followBack") || "Follow Back"}
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">
                            {t("notifications.alreadyFollowing") || "Following"}
                          </span>
                        )}
                        <button
                          onClick={() => handleDismiss(followerId)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-all"
                        >
                          {t("common.dismiss") || "Dismiss"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
