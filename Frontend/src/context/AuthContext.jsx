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
        console.error('Failed to restore auth state:', error);
        // Clear corrupted data
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
      console.error('Login error:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.description ||
        error.message ||
        'Login failed. Please try again.';
      
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
      console.error('Registration error:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.description ||
        error.message ||
        'Registration failed. Please try again.';
      
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
      console.error('Logout error:', error);
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
      console.error('Failed to parse JWT:', error);
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
