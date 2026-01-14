import axiosClient from './axiosClient';

/**
 * Get user's reading challenge for a specific year
 * @param {number} year - The year
 * @param {string} userId - User ID
 * @returns {Promise<UserYearChallengeDetailsDto>}
 */
export const getUserYearChallenge = async (year, userId) => {
  try {
    const response = await axiosClient.get(`/useryearchallenge/${year}`, {
      params: { userId },
    });
    return response.data.data;
  } catch (error) {
    // 404 means no challenge exists for this year
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching year challenge:', error);
    throw error;
  }
};

/**
 * Get all user's reading challenges
 * @param {string} userId - User ID
 * @param {number} year - Optional year filter
 * @returns {Promise<PagedResult<UserYearChallengeDto>>}
 */
export const getAllUserYearChallenges = async (userId, year = null) => {
  try {
    const response = await axiosClient.get('/useryearchallenge', {
      params: { userId, year },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all challenges:', error);
    throw error;
  }
};

/**
 * Create or update a reading challenge
 * @param {number} targetBooksCount - Target number of books to read
 * @returns {Promise}
 */
export const upsertUserYearChallenge = async (targetBooksCount) => {
  try {
    await axiosClient.post('/useryearchallenge/upsert', {
      targetBooksCount,
    });
  } catch (error) {
    console.error('Error upserting year challenge:', error);
    throw error;
  }
};
