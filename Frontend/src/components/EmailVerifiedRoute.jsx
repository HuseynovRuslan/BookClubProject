import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * EmailVerifiedRoute component - wraps routes that require email verification
 * Usage: <Route path="/protected" element={<EmailVerifiedRoute><YourComponent /></EmailVerifiedRoute>} />
 */
const EmailVerifiedRoute = ({ children }) => {
    const { isAuthenticated, emailConfirmed, loading } = useAuth();

    console.log('🛡️ Protected Route Check:', { isAuthenticated, emailConfirmed, loading });

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to home with warning if email not verified
    if (!emailConfirmed) {
        toast.warning('Please verify your email to access this feature.');
        return <Navigate to="/" replace />;
    }

    // Render children if authenticated and email verified
    return children;
};

export default EmailVerifiedRoute;
