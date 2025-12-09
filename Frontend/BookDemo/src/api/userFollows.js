import { apiRequest } from "./config";

export async function followUser(userId) {
  return apiRequest("/api/UserFollows/follow", {
    method: "POST",
    body: { userId },
  });
}

export async function unfollowUser(userId) {
  return apiRequest("/api/UserFollows/unfollow", {
    method: "POST",
    body: { userId },
  });
}

export async function getFollowers() {
  return apiRequest("/api/UserFollows/followers", {
    method: "GET",
  });
}

export async function getFollowing() {
  return apiRequest("/api/UserFollows/following", {
    method: "GET",
  });
}


