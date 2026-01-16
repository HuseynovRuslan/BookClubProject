import axios from 'axios';

// Create axios instance with base configuration
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://localhost:7050/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token to all requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors globally
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on login or register pages
      // This allows proper error handling for login/register failures
      const isAuthPage = window.location.pathname === '/login' || 
                        window.location.pathname === '/register';
      
      if (!isAuthPage) {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    // Suppress 404 errors for user year challenge endpoints (expected when no challenge exists)
    if (error.response?.status === 404) {
      const url = error.config?.url || '';
      if (url.includes('/useryearchallenge/')) {
        // This is expected - user hasn't created a challenge yet
        // Return a custom error that can be handled gracefully
        const silentError = new Error('Challenge not found');
        silentError.response = error.response;
        silentError.config = error.config;
        silentError.isAxiosError = true;
        silentError.silent = true; // Flag to indicate this shouldn't be logged
        return Promise.reject(silentError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
