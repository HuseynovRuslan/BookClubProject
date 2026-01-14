import axiosClient from './axiosClient';

/**
 * Get personal feed (from followed users)
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise} - PagedResult with feed items
 */
export const getPersonalFeed = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axiosClient.get('/feed/get-feed', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching personal feed:', error);
    throw error;
  }
};

/**
 * Get social feed (from all users except current)
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise} - PagedResult with feed items
 */
export const getSocialFeed = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axiosClient.get('/feed/get-social-feed', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching social feed:', error);
    throw error;
  }
};

/**
 * Get suggested users to follow
 * @param {number} limit
 * @returns {Promise} - Array of users
 */
export const getSuggestedUsers = async (limit = 5) => {
  try {
    const response = await axiosClient.get('/users/get-suggested-users', {
      params: { limit },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return [];
  }
};

/**
 * Get trending books
 * @param {number} limit
 * @returns {Promise} - Array of books
 */
export const getTrendingBooks = async (limit = 5) => {
  try {
    const response = await axiosClient.get('/books/get-all-books', {
      params: { pageNumber: 1, pageSize: limit },
    });
    // Response is PagedResult with data array
    return response.data?.data || response.data?.items || [];
  } catch (error) {
    console.error('Error fetching trending books:', error);
    return [];
  }
};

/**
 * Follow a user
 * @param {string} userId
 * @returns {Promise}
 */
export const followUser = async (userId) => {
  try {
    await axiosClient.post(`/users/follow/${userId}`);
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

/**
 * Unfollow a user
 * @param {string} userId
 * @returns {Promise}
 */
export const unfollowUser = async (userId) => {
  try {
    await axiosClient.delete(`/users/unfollow/${userId}`);
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

/**
 * Like a quote
 * @param {string} quoteId
 * @returns {Promise}
 */
export const likeQuote = async (quoteId) => {
  try {
    await axiosClient.post(`/quotes/${quoteId}/like`);
  } catch (error) {
    console.error('Error liking quote:', error);
    throw error;
  }
};

/**
 * Unlike a quote
 * @param {string} quoteId
 * @returns {Promise}
 */
export const unlikeQuote = async (quoteId) => {
  try {
    await axiosClient.delete(`/quotes/${quoteId}/unlike`);
  } catch (error) {
    console.error('Error unliking quote:', error);
    throw error;
  }
};
