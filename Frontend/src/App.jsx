import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navigation from "./components/Navigatin";
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import SocialFeedPage from "./components/SocialFeedPage";
import ReadingListPage from "./components/ReadingListPage";
import AllBooksPage from "./components/AllBooksPage";
import ProfilePage from "./components/ProfilePage";
import SearchPage from "./components/SearchPage";
import CategoriesPage from "./components/CategoriesPage";
import RecommendationsPage from "./components/RecommendationsPage";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUp";
import CreatePostModal from "./components/CreatePostModal";
import CreateBookModal from "./components/CreateBookModal";
import BookDetailModal from "./components/BookDetailModal";
import { useAuth } from "./context/AuthContext.jsx";
import "./index.css";

function App() {
  const {
    user,
    isAuthenticated,
    initializing,
    logout,
  } = useAuth();

  const [currentUser, setCurrentUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const storedTheme = localStorage.getItem("bookverse_theme");
    if (storedTheme === "dark") return true;
    if (storedTheme === "light") return false;
    return false;
  });
  const [authMode, setAuthMode] = useState("login");

  const [localPosts, setLocalPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [userBooks, setUserBooks] = useState([]);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Dark mode-u HTML elementinə əlavə et ki, Tailwind dark: prefix işləsin və yadda saxla
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
      localStorage.setItem("bookverse_theme", "dark");
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem("bookverse_theme", "light");
    }
  }, [isDarkMode]);

  const handleDarkModeToggle = () => setIsDarkMode((prev) => !prev);

  const handleCreatePost = (newPost) => {
    const postWithUser = {
      ...newPost,
      id: `local-${Date.now()}`,
      username: currentUser?.name || "You",
      likes: newPost.likes ?? 0,
      comments: [],
      timestamp: "Just now",
      isLocal: true,
    };
    setLocalPosts((prev) => [postWithUser, ...prev]);
    setUserPosts((prev) => [postWithUser, ...prev]);
  };

  const handleCreateBook = async (newBook) => {
    try {
      const { createBook } = await import("./api/books");
      const bookWithMeta = {
        ...newBook,
        id: `book-${Date.now()}`,
        author: currentUser?.name || "You",
      };
      // API-yə əlavə et (həm all books-a düşəcək)
      await createBook(bookWithMeta);
      // User books-a da əlavə et
      setUserBooks((prev) => [bookWithMeta, ...prev]);
    } catch (err) {
      console.error("Error creating book:", err);
      // Fallback: yalnız local state-ə əlavə et
      const bookWithMeta = {
        ...newBook,
        id: `book-${Date.now()}`,
        author: currentUser?.name || "You",
      };
      setUserBooks((prev) => [bookWithMeta, ...prev]);
    }
  };

  const handleAddComment = (postId, commentText) => {
    const newComment = {
      id: Date.now().toString(),
      username: currentUser?.name || "You",
      text: commentText,
      timestamp: "Just now",
    };
    setLocalPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  };

  const handleDeleteComment = (postId, commentId) => {
    setLocalPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.filter((c) => c.id !== commentId),
            }
          : post
      )
    );
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Preparing your library...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className={
          isDarkMode
            ? "bg-gray-900 text-white min-h-screen"
            : "min-h-screen"
        }
      >
        {authMode === "signup" ? (
          <SignUpPage onSwitchToSignIn={() => setAuthMode("login")} />
        ) : (
          <LoginPage onSwitchToSignUp={() => setAuthMode("signup")} />
        )}
      </div>
    );
  }

  return (
    <Router>
      <div
        className={
          isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black min-h-screen"
        }
      >
        <Navigation
          isGuest={false}
          onShowLogin={() => setAuthMode("login")}
          onShowSignUp={() => setAuthMode("signup")}
          isDarkMode={isDarkMode}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <Sidebar
          onDarkModeToggle={handleDarkModeToggle}
          isDarkMode={isDarkMode}
          onCreatePost={() => setShowCreatePost(true)}
          onCreateBook={() => setShowCreateBook(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="ml-0 md:ml-64 pt-16 p-4 md:p-6 xl:p-8 min-h-screen transition-all duration-300 max-w-[1920px] mx-auto">
          <Routes>
            <Route
              path="/"
              element={<RecommendationsPage onBookClick={handleBookClick} />}
            />
            <Route
              path="/home"
              element={<HomePage onBookClick={handleBookClick} />}
            />
            <Route
              path="/social"
              element={
                <SocialFeedPage
                  currentUsername={currentUser?.name || "Guest"}
                  localPosts={localPosts}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                />
              }
            />
            <Route path="/reading-list" element={<ReadingListPage />} />
            <Route
              path="/books"
              element={<AllBooksPage onBookClick={handleBookClick} />}
            />
            <Route
              path="/search"
              element={<SearchPage onBookClick={handleBookClick} />}
            />
            <Route
              path="/categories"
              element={<CategoriesPage onBookClick={handleBookClick} />}
            />
            <Route
              path="/recommendations"
              element={<RecommendationsPage onBookClick={handleBookClick} />}
            />
            <Route
              path="/profile"
              element={
                <ProfilePage
                  user={currentUser}
                  onUpdateProfile={(updated) => setCurrentUser(updated)}
                  onLogout={logout}
                  onSwitchAccount={() => {
                    logout();
                    setAuthMode("login");
                  }}
                  userPosts={userPosts}
                  userBooks={userBooks}
                />
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProfilePage
                  user={null}
                  onUpdateProfile={(updated) => setCurrentUser(updated)}
                  onLogout={logout}
                  onSwitchAccount={() => {
                    logout();
                    setAuthMode("login");
                  }}
                  userPosts={[]}
                  userBooks={[]}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {showCreatePost && (
          <CreatePostModal
            onClose={() => setShowCreatePost(false)}
            onCreate={handleCreatePost}
          />
        )}
        {showCreateBook && (
          <CreateBookModal
            onClose={() => setShowCreateBook(false)}
            onCreate={handleCreateBook}
          />
        )}
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
