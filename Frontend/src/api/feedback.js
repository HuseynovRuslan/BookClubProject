import axiosClient from './axiosClient';

/**
 * Send feedback to admin
 * @param {string} subject - The feedback subject
 * @param {string} message - The feedback message
 * @returns {Promise} API response
 */
export const createFeedback = async (subject, message) => {
    const response = await axiosClient.post('/users/send-feedback', { subject, message });
    return response.data;
};
