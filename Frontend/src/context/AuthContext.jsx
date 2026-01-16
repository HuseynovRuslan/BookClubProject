import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { resendConfirmationEmail as resendEmailApi } from '../api/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore user session on app startup
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Clear corrupted data silently
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (usernameOrEmail, password) => {
    try {
      setLoading(true);
      
      // Call the API endpoint matching AuthController Login method
      const response = await axiosClient.post('/auth/login', {
        usernameOrEmail,
        password,
      });

      // Extract data from ApiResponse<AuthResultDto> structure
      const { data } = response.data;
      
      if (data?.accessToken) {
        // Store tokens
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Decode JWT to get user info (basic decode, not validation)
        const userPayload = parseJwt(data.accessToken);
        const userData = {
          id: userPayload.sub || userPayload.userId,
          email: userPayload.email,
          username: userPayload.username || userPayload.unique_name,
          emailConfirmed: userPayload.email_verified === 'true',
          role: userPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || userPayload.role || 'User',
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setToken(data.accessToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success(response.data.message || 'Login successful!');
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error) || 'Login failed. Please check your credentials.';
      
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (registerData) => {
    try {
      setLoading(true);
      
      // Call the API endpoint matching AuthController Register method
      const response = await axiosClient.post('/auth/register', registerData);
      
      // Registration returns ApiResponse<string>
      const message = response.data.message || 
        'Registration successful! Please check your email to confirm your account.';
      
      toast.success(message);
      return { success: true, message };
    } catch (error) {
      const errorMessage = extractErrorMessage(error) || 'Registration failed. Please try again.';
      
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (token) {
        await axiosClient.post('/auth/logout');
      }
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Reset state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      toast.info('Logged out successfully');
    }
  };

  // Resend confirmation email
  const resendConfirmationEmail = async () => {
    if (!user?.email) {
      toast.error('No email found');
      return { success: false };
    }

    const result = await resendEmailApi(user.email);
    
    if (result.success) {
      toast.success(result.message || 'Confirmation email sent!');
    } else {
      toast.error(result.message || 'Failed to send confirmation email');
    }
    
    return result;
  };

  // Update emailConfirmed status (call after email verification)
  const updateEmailConfirmed = (confirmed) => {
    if (user) {
      const updatedUser = { ...user, emailConfirmed: confirmed };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Helper function to extract error message from various error formats
  const extractErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred.';
    
    const errorData = error.response?.data;
    if (!errorData) {
      return error.message || 'An unexpected error occurred.';
    }

    // Check for ProblemDetails format (used by CustomResults.Problem)
    // Format: { title: "Error.Code", detail: "Error description", status: 401 }
    if (errorData.detail) {
      return errorData.detail;
    }

    // Check for ApiResponse format (used by successful responses)
    if (errorData.message) {
      return errorData.message;
    }

    // Check for errors array format (validation errors)
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      const firstError = errorData.errors[0];
      if (typeof firstError === 'string') {
        return firstError;
      }
      if (firstError.description) {
        return firstError.description;
      }
    }

    // Check for errors object format (validation errors as object)
    if (errorData.errors && typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
      const errorValues = Object.values(errorData.errors).flat();
      if (errorValues.length > 0) {
        return errorValues[0];
      }
    }

    // Fallback to title or generic message
    return errorData.title || error.message || 'An unexpected error occurred.';
  };

  // Helper function to decode JWT (client-side only, not for validation)
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      // Silently return empty object if JWT parsing fails
      return {};
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    emailConfirmed: user?.emailConfirmed ?? true, // Default to true for backwards compatibility
    login,
    register,
    logout,
    resendConfirmationEmail,
    updateEmailConfirmed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
