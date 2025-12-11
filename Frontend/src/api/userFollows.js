import { apiRequest, USE_API_MOCKS, delay } from "./config";

export async function followUser(userId) {
  if (USE_API_MOCKS) {
    await delay(200);
    return { success: true };
  }
  
  // Backend endpoint: POST /api/UserFollows/follow with body: { FollowingId }
  // Backend requires "FollowingId" field (not userId or UserId)
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
  
  // Backend endpoint: POST /api/UserFollows/unfollow with body: { FollowingId }
  // Backend requires "FollowingId" field (not userId or UserId)
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

// Get followers of the current user
export async function getFollowers() {
  if (USE_API_MOCKS) {
    await delay(200);
    return [];
  }
  try {
    const response = await apiRequest("/api/UserFollows/followers", {
      method: "GET",
    });
    // Handle both array and wrapped response
    if (Array.isArray(response)) {
      return response;
    }
    return response?.items || response?.Items || [];
  } catch (error) {
    // If endpoint doesn't exist or returns error, return empty array
    console.warn("Failed to load followers list:", error);
    return [];
  }
}

// Get users the current user is following
export async function getFollowing() {
  if (USE_API_MOCKS) {
    await delay(200);
    return [];
  }
  try {
    const response = await apiRequest("/api/UserFollows/following", {
      method: "GET",
    });
    // Handle both array and wrapped response
    if (Array.isArray(response)) {
      return response;
    }
    return response?.items || response?.Items || [];
  } catch (error) {
    // If endpoint doesn't exist or returns error, return empty array
    console.warn("Failed to load following list:", error);
    return [];
  }
}

// Get followers of a specific user
// NOTE: Backend may not have this endpoint, so we handle 404 gracefully
export async function getUserFollowers(userId) {
  if (USE_API_MOCKS) {
    await delay(200);
    return [];
  }
  
  // Backend doesn't have /api/UserFollows/followers/{userId} endpoint
  // Return empty array to avoid 404 errors in console
  // If backend adds this endpoint in the future, uncomment the code below
  /*
  try {
    const response = await apiRequest(`/api/UserFollows/followers/${encodeURIComponent(userId)}`, {
      method: "GET",
    });
    if (Array.isArray(response)) {
      return response;
    }
    return response?.items || response?.Items || [];
  } catch (error) {
    if (error.status === 404) {
      return [];
    }
    return [];
  }
  */
  return [];
}

// Get users that a specific user is following
// NOTE: Backend may not have this endpoint, so we handle 404 gracefully
export async function getUserFollowing(userId) {
  if (USE_API_MOCKS) {
    await delay(200);
    return [];
  }
  
  // Backend doesn't have /api/UserFollows/following/{userId} endpoint
  // Return empty array to avoid 404 errors in console
  // If backend adds this endpoint in the future, uncomment the code below
  /*
  try {
    const response = await apiRequest(`/api/UserFollows/following/${encodeURIComponent(userId)}`, {
      method: "GET",
    });
    if (Array.isArray(response)) {
      return response;
    }
    return response?.items || response?.Items || [];
  } catch (error) {
    if (error.status === 404) {
      return [];
    }
    return [];
  }
  */
  return [];
}

// Check if current user is following a specific user
export async function isFollowing(userId) {
  if (USE_API_MOCKS) {
    await delay(150);
    return false;
  }
  try {
    const following = await getFollowing();
    console.log("isFollowing - checking userId:", userId, "against following list:", following);
    
    // Normalize userId for comparison
    const normalizedUserId = userId?.toString();
    
    // Check if userId exists in following list
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
    // Silently return false on error
    return false;
  }
}


