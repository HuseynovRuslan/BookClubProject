import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SignalRProvider } from './context/SignalRContext';
import ProtectedRoute from './components/ProtectedRoute';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
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
  const hideOnRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
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
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />

              {/* Protected Routes - Require Authentication */}
              <Route
                path="/books"
                element={
                  <ProtectedRoute>
                    <BrowseBooksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/books/:id"
                element={
                  <ProtectedRoute>
                    <BookDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-shelves"
                element={
                  <ProtectedRoute>
                    <MyShelvesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shelves/:id"
                element={
                  <ProtectedRoute>
                    <ShelfDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:identifier"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <SocialFeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <CommunityPage />
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
