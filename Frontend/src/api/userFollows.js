import axiosClient from './axiosClient';

/**
 * Follow a user
 * @param {string} userId - The ID of the user to follow
 * @returns {Promise}
 */
export const followUser = async (userId) => {
  try {
    const response = await axiosClient.post('/userfollows/follow', {
      followingId: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

/**
 * Unfollow a user
 * @param {string} userId - The ID of the user to unfollow
 * @returns {Promise}
 */
export const unfollowUser = async (userId) => {
  try {
    const response = await axiosClient.post('/userfollows/unfollow', {
      followingId: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

/**
 * Get current user's followers
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise} - PagedResult with followers
 */
export const getMyFollowers = async (pageNumber = 1, pageSize = 20) => {
  try {
    const response = await axiosClient.get('/userfollows/followers', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
};

/**
 * Get current user's following list
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise} - PagedResult with following users
 */
export const getMyFollowing = async (pageNumber = 1, pageSize = 100) => {
  try {
    const response = await axiosClient.get('/userfollows/following', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching following:', error);
    throw error;
  }
};

/**
 * Get followers of a specific user
 * @param {string} userId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise} - PagedResult with followers
 */
export const getUserFollowers = async (userId, pageNumber = 1, pageSize = 20) => {
  try {
    const response = await axiosClient.get(`/userfollows/followers/${userId}`, {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user followers:', error);
    throw error;
  }
};

/**
 * Get following list of a specific user
 * @param {string} userId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise} - PagedResult with following users
 */
export const getUserFollowing = async (userId, pageNumber = 1, pageSize = 20) => {
  try {
    const response = await axiosClient.get(`/userfollows/following/${userId}`, {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user following:', error);
    throw error;
  }
};
