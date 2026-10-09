import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SignalRProvider } from './context/SignalRContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/app/AppShell';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import BrowseBooksPage from './pages/BrowseBooksPage';
import BookDetailsPage from './pages/BookDetailsPage';
import MyShelvesPage from './pages/MyShelvesPage';
import ShelfDetailsPage from './pages/ShelfDetailsPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import SocialFeedPage from './pages/SocialFeedPage';
import CommunityPage from './pages/CommunityPage';
import NewsPage from './pages/NewsPage';
import FeedbackPage from './pages/FeedbackPage';
import AiRecommendationsPage from './pages/AiRecommendationsPage';
import AboutPage from './pages/info/AboutPage';
import PrivacyPage from './pages/info/PrivacyPage';
import TermsPage from './pages/info/TermsPage';

// Admin imports
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews from './pages/admin/AdminNews';
import AdminFeedbacks from './pages/admin/AdminFeedbacks';
import AdminBooks from './pages/admin/AdminBooks';
import AdminAuthors from './pages/admin/AdminAuthors';
import AdminGenres from './pages/admin/AdminGenres';
import AdminUsers from './pages/admin/AdminUsers';

// Layout component to show banner on relevant pages
const AppLayout = ({ children }) => {
  const location = useLocation();
  const hideOnRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/about', '/privacy', '/terms'];
  const isAdminRoute = location.pathname.startsWith('/admin');
  const showBanner = !hideOnRoutes.includes(location.pathname) && !isAdminRoute;

  return (
    <>
      {showBanner && <EmailVerificationBanner />}
      {children}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SignalRProvider>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Protected Routes - Require Authentication AND Email Verification.
                  The Bookla 2.0 application screens share one header and footer (AppShell). */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<HomePage />} />
                <Route path="/books" element={<BrowseBooksPage />} />
                <Route path="/books/:id" element={<BookDetailsPage />} />
                <Route path="/my-shelves" element={<MyShelvesPage />} />
                <Route path="/shelves/:id" element={<ShelfDetailsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:identifier" element={<ProfilePage />} />
                <Route path="/messages" element={<ChatPage />} />
                <Route path="/feed" element={<SocialFeedPage />} />
                <Route path="/community" element={<CommunityPage />} />
              </Route>
              <Route
                path="/ai-recommendations"
                element={
                  <ProtectedRoute>
                    <AiRecommendationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <FeedbackPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="feedbacks" element={<AdminFeedbacks />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="authors" element={<AdminAuthors />} />
                <Route path="genres" element={<AdminGenres />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </SignalRProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
