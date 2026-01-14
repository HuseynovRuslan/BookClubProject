import axiosClient from './axiosClient';

/**
 * Get user's year challenge (reading goal)
 * @param {number} year - Year (default: current year)
 * @param {string} userId - User ID
 * @returns {Promise} - Challenge details with progress
 */
export const getUserYearChallenge = async (year, userId) => {
  try {
    const response = await axiosClient.get(`/useryearchallenge/${year}`, {
      params: { userId },
    });
    return response.data.data;
  } catch (error) {
    // 404 means no challenge set
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching year challenge:', error);
    throw error;
  }
};

/**
 * Create or update user's year challenge
 * @param {Object} data - { year, goalBooks }
 * @returns {Promise}
 */
export const upsertYearChallenge = async (data) => {
  try {
    await axiosClient.post('/useryearchallenge/upsert', data);
  } catch (error) {
    console.error('Error upserting year challenge:', error);
    throw error;
  }
};

/**
 * Get social feed (friends' activities)
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise} - PagedResult with feed items
 */
export const getSocialFeed = async (pageNumber = 1, pageSize = 5) => {
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
 * Get user's conversations (for unread count)
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise} - PagedResult with conversations
 */
export const getConversations = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axiosClient.get('/messages/get-conversations', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get notifications
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise}
 */
export const getNotifications = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axiosClient.get('/notifications', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};
