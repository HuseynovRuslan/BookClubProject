import axiosClient from './axiosClient';

/**
 * Resend email confirmation link
 * @param {string} email - User's email address
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export const resendConfirmationEmail = async (email) => {
  try {
    const response = await axiosClient.post('/auth/reset-confirmation-email', {
      email,
    });
    return {
      success: true,
      message: response.data?.message || 'Confirmation email sent!',
    };
  } catch (error) {
    console.error('Error resending confirmation email:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send confirmation email',
    };
  }
};

/**
 * Request password reset email
 * @param {string} email - User's email address
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axiosClient.post('/auth/forgot-password', {
      email,
    });
    return {
      success: true,
      message: response.data?.message || 'Password reset email sent!',
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send password reset email',
    };
  }
};

/**
 * Reset password with token
 * @param {string} userId - User ID
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export const resetPassword = async (userId, token, newPassword) => {
  try {
    const response = await axiosClient.post('/auth/reset-password', {
      userId,
      token,
      newPassword,
    });
    return {
      success: true,
      message: response.data?.message || 'Password reset successful!',
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to reset password',
    };
  }
};
