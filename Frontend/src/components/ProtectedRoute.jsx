import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component - wraps routes that require authentication AND email verification
 * 
 * Props:
 * - requireEmailVerification: boolean (default: true) - if true, requires email to be verified
 * 
 * Usage: <Route path="/protected" element={<ProtectedRoute><YourComponent /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children, requireEmailVerification = true }) => {
  const { user, isAuthenticated, emailConfirmed, loading } = useAuth();
  const location = useLocation();

  // Debug log
  console.log('🛡️ ProtectedRoute:', {
    path: location.pathname,
    isAuthenticated,
    emailConfirmed,
    loading,
    requireEmailVerification
  });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Step 1: Check if user is authenticated
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Step 2: Check if email verification is required and not verified
  // Admins bypass this check
  const isAdmin = user?.role === 'Admin' || user?.roles?.includes('Admin');

  if (requireEmailVerification && !emailConfirmed && !isAdmin) {
    console.log('❌ Email not verified, redirecting to verify-email');
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // All checks passed - render children
  console.log('✅ Access granted');
  return children;
};

export default ProtectedRoute;
