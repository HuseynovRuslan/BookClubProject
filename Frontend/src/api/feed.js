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
 * Get user-specific feed (activities from a specific user)
 * @param {string} userId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise} - PagedResult with feed items
 */
export const getUserFeed = async (userId, pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axiosClient.get(`/feed/user/${userId}`, {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user feed:', error);
    throw error;
  }
};

/**
 * Helper to check if user is admin
 */
const isAdmin = (user) => {
  if (!user) return false;
  const isAdminByRole = user?.role === 'Admin' || 
         user?.roles?.includes('Admin') ||
         user?.userRole === 'Admin' ||
         (Array.isArray(user?.roles) && user.roles.some(r => r === 'Admin' || r?.name === 'Admin'));
  const isAdminByUsername = user?.username?.toLowerCase() === 'admin' ||
                            user?.username?.toLowerCase().startsWith('admin_');
  return isAdminByRole || isAdminByUsername;
};

/**
 * Get suggested users to follow
 * @param {number} limit
 * @returns {Promise} - Array of users (excluding admins)
 */
export const getSuggestedUsers = async (limit = 5) => {
  try {
    const response = await axiosClient.get('/users/get-suggested-users', {
      params: { limit },
    });
    const users = response.data.data || [];
    // Filter out admin users
    return users.filter(u => !isAdmin(u));
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

// ============================================
// QUOTE CRUD OPERATIONS
// ============================================

/**
 * Delete a quote
 * @param {string} quoteId
 * @returns {Promise}
 */
export const deleteQuote = async (quoteId) => {
  try {
    await axiosClient.delete(`/quotes/delete-quote/${quoteId}`);
  } catch (error) {
    console.error('Error deleting quote:', error);
    throw error;
  }
};

/**
 * Update a quote
 * @param {string} quoteId
 * @param {string} text
 * @param {string[]} tags
 * @returns {Promise}
 */
export const updateQuote = async (quoteId, text, tags = []) => {
  try {
    await axiosClient.put(`/quotes/update-quote/${quoteId}`, {
      text,
      tags,
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    throw error;
  }
};

// ============================================
// REVIEW CRUD OPERATIONS
// ============================================

/**
 * Delete a review
 * @param {string} reviewId
 * @returns {Promise}
 */
export const deleteReview = async (reviewId) => {
  try {
    await axiosClient.delete(`/reviews/delete-review/${reviewId}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/**
 * Update a review
 * @param {string} reviewId
 * @param {number} rating
 * @param {string} reviewText
 * @returns {Promise}
 */
export const updateReview = async (reviewId, rating, reviewText) => {
  try {
    await axiosClient.put(`/reviews/update-review/${reviewId}`, {
      rating,
      reviewText,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// ============================================
// BOOKSHELF CRUD OPERATIONS
// ============================================

/**
 * Delete a bookshelf entry (remove book from shelf)
 * @param {string} bookId
 * @param {string} shelfId
 * @returns {Promise}
 */
export const deleteBookShelf = async (bookId, shelfId) => {
  try {
    await axiosClient.delete(`/shelves/remove-book-from-shelf/${shelfId}/books/${bookId}`);
  } catch (error) {
    console.error('Error deleting bookshelf entry:', error);
    throw error;
  }
};
