import axiosClient from './axiosClient';

/**
 * Get AI-powered book recommendations
 * @param {string} userQuery - Optional query to customize recommendations
 * @returns {Promise} List of book recommendations
 */
export const getAiRecommendations = async (userQuery = null) => {
  const params = userQuery ? { userQuery } : {};
  const response = await axiosClient.get('/ai/recommendations', { params });
  return response.data;
};
