import axiosClient from './axiosClient';

/**
 * Get current user's profile
 * @returns {Promise<UserProfileDto>}
 */
export const getCurrentUserProfile = async () => {
  try {
    const response = await axiosClient.get('/users/get-current-user-profile');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
};

/**
 * Get user profile by username
 * @param {string} username
 * @returns {Promise<UserProfileDto>}
 */
export const getUserProfileByUsername = async (username) => {
  try {
    const response = await axiosClient.get(`/users/get-user-profile-by-username/${username}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 * @param {string} userId
 * @returns {Promise<UserProfileDto>}
 */
export const getUserProfileById = async (userId) => {
  try {
    const response = await axiosClient.get(`/users/get-user-profile-by-id/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} data - { firstName, lastName, bio, websiteUrl, country, dateOfBirth }
 * @returns {Promise}
 */
export const updateUserProfile = async (data) => {
  try {
    await axiosClient.put('/users/update-user-profile', data);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Get user's social links
 * @returns {Promise<SocialDto>}
 */
export const getUserSocialLinks = async () => {
  try {
    const response = await axiosClient.get('/users/get-user-social-links');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching social links:', error);
    throw error;
  }
};

/**
 * Update user's social links
 * @param {Object} data - { facebook, twitter, linkedIn }
 * @returns {Promise}
 */
export const updateUserSocialLinks = async (data) => {
  try {
    await axiosClient.put('/users/update-user-social-links', data);
  } catch (error) {
    console.error('Error updating social links:', error);
    throw error;
  }
};

/**
 * Update profile picture
 * @param {File} file - The image file to upload
 * @returns {Promise}
 */
export const updateProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('File', file); // Backend expects 'File' with capital F

    // Use axiosClient which handles base URL and auth tokens appropriately
    // Also explicitly setting Content-Type to multipart/form-data is good practice, 
    // though axios often detects it automatically with FormData
    const response = await axiosClient.patch('/users/update-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    // Error details are handled by axios interceptor usually, but we log for local debugging
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

/**
 * Delete profile picture
 * @returns {Promise}
 */
export const deleteProfilePicture = async () => {
  try {
    await axiosClient.delete('/users/delete-profile-picture');
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw error;
  }
};

/**
 * Change password
 * @param {Object} data - { currentPassword, newPassword, confirmPassword }
 * @returns {Promise}
 */
export const changePassword = async (data) => {
  try {
    await axiosClient.post('/users/change-password', data);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Delete account
 * @returns {Promise}
 */
export const deleteAccount = async () => {
  try {
    await axiosClient.delete('/users/delete-account');
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

/**
 * Get current user's reviews
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise}
 */
export const getCurrentUserReviews = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axiosClient.get('/users/get-current-user-reviews', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

/**
 * Get all users with pagination and search
 * @param {number} pageNumber
 * @param {number} pageSize
 * @param {string} searchTerm - Optional search term
 * @returns {Promise} - PagedResult with users
 */
export const getAllUsers = async (pageNumber = 1, pageSize = 20, searchTerm = '') => {
  try {
    const params = { pageNumber, pageSize };
    // Backend uses 'Query' parameter, not 'searchTerm'
    if (searchTerm) {
      params.query = searchTerm;
    }
    const response = await axiosClient.get('/users/get-all-users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

/**
 * Send feedback
 * @param {Object} data - { subject: string, message: string }
 * @returns {Promise}
 */
export const sendFeedback = async (data) => {
  try {
    await axiosClient.post('/users/send-feedback', {
      subject: data.subject,
      message: data.message,
    });
  } catch (error) {
    console.error('Error sending feedback:', error);
    throw error;
  }
};
