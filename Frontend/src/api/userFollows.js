import { apiRequest, USE_API_MOCKS, delay } from "./config";

export async function followUser(userId) {
  if (USE_API_MOCKS) {
    await delay(200);
    return { success: true };
  }
  

  try {
    const result = await apiRequest("/api/UserFollows/follow", {
      method: "POST",
      body: { FollowingId: userId },
    });
    console.log("Follow success with FollowingId:", result);
    return result;
  } catch (err) {
    console.error("Follow error:", err);
    throw err;
  }
}

export async function unfollowUser(userId) {
  if (USE_API_MOCKS) {
    await delay(200);
    return { success: true };
  }
  

  try {
    const result = await apiRequest("/api/UserFollows/unfollow", {
      method: "POST",
      body: { FollowingId: userId },
    });
    console.log("Unfollow success with FollowingId:", result);
    return result;
  } catch (err) {
    console.error("Unfollow error:", err);
    throw err;
  }
}

export async function getFollowers() {
  if (USE_API_MOCKS) {
    await delay(200);
    return [];
  }
  try {
    const response = await apiRequest("/api/UserFollows/followers", {
      method: "GET",
    });
    if (Array.isArray(response)) {
      return response;
    }
    const items = response?.items || response?.Items || [];
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.warn("Failed to load followers list:", error);
    return [];
  }
}

export async function getFollowing() {
  if (USE_API_MOCKS) {
    await delay(200);
    return [];
  }
  try {
    const response = await apiRequest("/api/UserFollows/following", {
      method: "GET",
    });
    if (Array.isArray(response)) {
      return response;
    }
    const items = response?.items || response?.Items || [];
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.warn("Failed to load following list:", error);
    return [];
  }
}

export async function getUserFollowers(userId) {
  if (USE_API_MOCKS) {
    await delay(200);
    return [];
  }
  
  try {
    const response = await apiRequest(`/api/UserFollows/followers/${encodeURIComponent(userId)}`, {
      method: "GET",
    });
    if (Array.isArray(response)) {
      return response;
    }
    const items = response?.items || response?.Items || response?.data || [];
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.warn(`Failed to load followers for user ${userId}:`, error);
    return [];
  }
}

export async function getUserFollowing(userId) {
  if (USE_API_MOCKS) {
    await delay(200);
    return [];
  }
  
  try {
    const response = await apiRequest(`/api/UserFollows/following/${encodeURIComponent(userId)}`, {
      method: "GET",
    });
    if (Array.isArray(response)) {
      return response;
    }
    const items = response?.items || response?.Items || response?.data || [];
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.warn(`Failed to load following for user ${userId}:`, error);
    return [];
  }
}

export async function isFollowing(userId) {
  if (USE_API_MOCKS) {
    await delay(150);
    return false;
  }
  try {
    const following = await getFollowing();
    console.log("isFollowing - checking userId:", userId, "against following list:", following);
    
    const normalizedUserId = userId?.toString();
    
    const isFollowingUser = following.some((user) => {
      const userIds = [
        user.id?.toString(),
        user.Id?.toString(),
        user.userId?.toString(),
        user.UserId?.toString(),
        user.followingId?.toString(),
        user.FollowingId?.toString(),
      ].filter(Boolean);
      
      return userIds.includes(normalizedUserId);
    });
    
    console.log("isFollowing - result:", isFollowingUser);
    return isFollowingUser;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}


