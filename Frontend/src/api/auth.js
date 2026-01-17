import axiosClient from './axiosClient';

/**
 * Resend email confirmation link
 * @param {string} email - User's email address
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
// Helper function to extract error message from various error formats
const extractErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';
  
  const errorData = error.response?.data;
  if (!errorData) {
    return error.message || 'An unexpected error occurred.';
  }

  // Check for ProblemDetails format (used by CustomResults.Problem)
  if (errorData.detail) {
    return errorData.detail;
  }

  // Check for ApiResponse format
  if (errorData.message) {
    return errorData.message;
  }

  // Check for errors array format
  if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
    const firstError = errorData.errors[0];
    if (typeof firstError === 'string') {
      return firstError;
    }
    if (firstError.description) {
      return firstError.description;
    }
  }

  // Check for errors object format
  if (errorData.errors && typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
    const errorValues = Object.values(errorData.errors).flat();
    if (errorValues.length > 0) {
      return errorValues[0];
    }
  }

  return errorData.title || error.message || 'An unexpected error occurred.';
};

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
    return {
      success: false,
      message: extractErrorMessage(error) || 'Failed to send confirmation email',
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
    return {
      success: false,
      message: extractErrorMessage(error) || 'Failed to send password reset email',
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
    return {
      success: false,
      message: extractErrorMessage(error) || 'Failed to reset password',
    };
  }
};
