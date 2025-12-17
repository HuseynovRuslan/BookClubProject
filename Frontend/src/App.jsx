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
import ProfilePage from "./components/ProfilePage";
import SearchPage from "./components/SearchPage";
import CategoriesPage from "./components/CategoriesPage";
import RecommendationsPage from "./components/RecommendationsPage";
import MorePage from "./components/MorePage";
import NewsPage from "./components/NewsPage";
import GroupsPage from "./components/GroupsPage";
import MessagesPage from "./components/MessagesPage";
import TopicPage from "./components/TopicPage";
import NotificationPage from "./components/NotificationPage";
import AdminPanelPage from "./components/AdminPanelPage";
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
    isGuest,
    initializing,
    logout,
  } = useAuth();

  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [showAuthFromGuest, setShowAuthFromGuest] = useState(false);

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('dark');
    localStorage.setItem("bookverse_theme", "light");
  }, []);

  const [localPosts, setLocalPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [userBooks, setUserBooks] = useState([]);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
    if (user && showAuthFromGuest) {
      setShowAuthFromGuest(false);
    }
  }, [user, showAuthFromGuest]);

  const getReportedPosts = () => {
    try {
      const reported = localStorage.getItem("bookverse_reported_posts");
      if (!reported) return [];
      return JSON.parse(reported);
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    if (!currentUser?.id) return;
    
    try {
      const stored = localStorage.getItem("bookverse_social_feed");
      const reportedPosts = getReportedPosts();
      if (stored) {
        const posts = JSON.parse(stored);
        const currentUserId = currentUser.id || currentUser.Id;
        const userPostsFromStorage = posts.filter(post => {
          if (reportedPosts.includes(post.id)) return false;
          
          const postUserId = post.userId || post.UserId || 
                           post.user?.id || post.User?.Id ||
                           post.user?.userId || post.User?.UserId;
          return post.isLocal || postUserId === currentUserId || 
                 (post.type === 'quote' && post.quoteId) || 
                 (post.type === 'review' && post.reviewId); 
        });
        setUserPosts(userPostsFromStorage);
      }
    } catch (err) {
    }
  }, [currentUser]);



  const handleCreatePost = (newPost) => {
   const postWithUser = {
      ...newPost,
      id: newPost.id || `local-${Date.now()}`,
      username: currentUser?.name || "You",
      likes: newPost.likes ?? 0,
      comments: [],
      timestamp: newPost.timestamp || new Date().toISOString(),
      isLocal: !newPost.id || newPost.id.startsWith('local-'),
    };
    
    setLocalPosts((prev) => {
      const updated = [postWithUser, ...prev];
      try {
        const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
        const cleanPost = { ...postWithUser };
        if (cleanPost.postImage && cleanPost.postImage.startsWith('blob:')) {
          if (cleanPost.postImageUrl) {
            cleanPost.postImage = cleanPost.postImageUrl;
          } else {
            cleanPost.postImage = null;
          }
        }
        if (cleanPost.bookCover && cleanPost.bookCover.startsWith('blob:')) {
          cleanPost.bookCover = null;
        }
        const cleanedExisting = existing.map(post => {
          const cleaned = { ...post };
          if (cleaned.postImage && cleaned.postImage.startsWith('blob:')) {
            if (cleaned.postImageUrl) {
              cleaned.postImage = cleaned.postImageUrl;
            } else {
              cleaned.postImage = null;
            }
          }
          if (cleaned.bookCover && cleaned.bookCover.startsWith('blob:')) {
            cleaned.bookCover = null;
          }
          return cleaned;
        });
        localStorage.setItem("bookverse_social_feed", JSON.stringify([cleanPost, ...cleanedExisting]));
      } catch (err) {
      }
      return updated;
    });
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
      await createBook(bookWithMeta);
      setUserBooks((prev) => [bookWithMeta, ...prev]);
    } catch (err) {
      const bookWithMeta = {
        ...newBook,
        id: `book-${Date.now()}`,
        author: currentUser?.name || "You",
      };
      setUserBooks((prev) => [bookWithMeta, ...prev]);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    const newComment = {
      id: Date.now().toString(),
      username: currentUser?.name || currentUser?.firstName || "You",
      userAvatar: currentUser?.avatarUrl || currentUser?.AvatarUrl || currentUser?.profilePictureUrl || currentUser?.ProfilePictureUrl || null,
      text: commentText,
      timestamp: new Date().toISOString(),
    };
    
    setLocalPosts((prev) => {
      const updated = prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      );
      return updated;
    });
    
    setUserPosts((prev) => {
      return prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      );
    });
    
    try {
      const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
      
      const updated = existing.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), newComment]
          };
        }
        return post;
      });
      
      setLocalPosts((prev) => {
        prev.forEach(localPost => {
          if (!updated.find(p => p.id === localPost.id)) {
            updated.push(localPost);
          }
        });
        return prev;
      });
      
      const cleanedMerged = updated.map(post => {
        const cleaned = { ...post };
        if (cleaned.postImage && cleaned.postImage.startsWith('blob:')) {
          cleaned.postImage = null;
        }
        if (cleaned.bookCover && cleaned.bookCover.startsWith('blob:')) {
          cleaned.bookCover = null;
        }
        return cleaned;
      });
      
      localStorage.setItem("bookverse_social_feed", JSON.stringify(cleanedMerged));
    } catch (err) {
      console.error("Error saving comment to localStorage:", err);
      throw err;
    }
    
    return Promise.resolve();
  };

  const handleDeleteComment = (postId, commentId) => {
    setLocalPosts((prev) => {
      const updated = prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.filter((c) => c.id !== commentId),
            }
          : post
      );
      return updated;
    });
    
    setUserPosts((prev) => {
      return prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: (post.comments || []).filter((c) => c.id !== commentId),
            }
          : post
      );
    });
    
    try {
      const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
      const updated = existing.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: (post.comments || []).filter((c) => c.id !== commentId),
            }
          : post
      );
      
      const cleanedMerged = updated.map(post => {
        const cleaned = { ...post };
        if (cleaned.postImage && cleaned.postImage.startsWith('blob:')) {
          cleaned.postImage = null;
        }
        if (cleaned.bookCover && cleaned.bookCover.startsWith('blob:')) {
          cleaned.bookCover = null;
        }
        return cleaned;
      });
      localStorage.setItem("bookverse_social_feed", JSON.stringify(cleanedMerged));
    } catch (err) {
      console.error("Error saving comment deletion to localStorage:", err);
    }
  };

  const handlePostUpdate = (postId, updatedPost) => {
    setLocalPosts((prev) => {
      const updated = prev.map((post) =>
        post.id === postId ? { ...post, ...updatedPost } : post
      );
      try {
        const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
        const merged = existing.map((p) => {
          const updatedPost = updated.find((up) => up.id === p.id);
          return updatedPost || p;
        });
        updated.forEach((up) => {
          if (!merged.find((p) => p.id === up.id)) {
            merged.push(up);
          }
        });
        localStorage.setItem("bookverse_social_feed", JSON.stringify(merged));
      } catch (err) {
        console.error("Error saving post update to localStorage:", err);
      }
      return updated;
    });
    
    setUserPosts((prev) => {
      return prev.map((post) =>
        post.id === postId ? { ...post, ...updatedPost } : post
      );
    });
  };

  const handleLikeChange = (postId, likes, isLiked) => {
    setLocalPosts((prev) => {
      const updated = prev.map((post) =>
        post.id === postId ? { ...post, likes, isLiked } : post
      );
      return updated;
    });
    
    setUserPosts((prev) => {
      return prev.map((post) =>
        post.id === postId ? { ...post, likes, isLiked } : post
      );
    });
    
    try {
      const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
      
      const updated = existing.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes,
            isLiked
          };
        }
        return post;
      });
      
      setLocalPosts((prev) => {
        prev.forEach(localPost => {
          if (!updated.find(p => p.id === localPost.id)) {
            updated.push(localPost);
          }
        });
        return prev;
      });
      
      const cleanedMerged = updated.map(post => {
        const cleaned = { ...post };
        if (cleaned.postImage && cleaned.postImage.startsWith('blob:')) {
          cleaned.postImage = null;
        }
        if (cleaned.bookCover && cleaned.bookCover.startsWith('blob:')) {
          cleaned.bookCover = null;
        }
        return cleaned;
      });
      
      localStorage.setItem("bookverse_social_feed", JSON.stringify(cleanedMerged));
    } catch (err) {
      console.error("Error saving like to localStorage:", err);
    }
  };

  const handleDeletePost = async (postId, post) => {
    try {
      if (!post || !postId) {
        console.error("Invalid post or postId:", { post, postId });
        throw new Error("Post or post ID is missing");
      }

      if (post.type === "review" && post.reviewId) {
        try {
          const { deleteReview } = await import("./api/reviews");
          const reviewId = String(post.reviewId || post.reviewId?.id || post.reviewId?.Id || post.reviewId);
          if (reviewId && reviewId !== 'undefined' && reviewId !== 'null') {
            await deleteReview(reviewId);
          } else {
            console.warn("Invalid reviewId, deleting from localStorage only:", reviewId);
          }
        } catch (reviewErr) {
          console.error("Error deleting review from backend:", reviewErr);
        }
      } else if (post.type === "quote" && post.quoteId) {
        try {
          const { deleteQuote } = await import("./api/quotes");
          let quoteId = null;
          
          if (typeof post.quoteId === 'string') {
            quoteId = post.quoteId.trim();
          } else if (typeof post.quoteId === 'object' && post.quoteId !== null) {
            quoteId = post.quoteId.id || 
                     post.quoteId.Id || 
                     post.quoteId.quoteId ||
                     post.quoteId.QuoteId ||
                     post.quoteId.data?.id ||
                     post.quoteId.data?.Id ||
                     post.quoteId.Data?.id ||
                     post.quoteId.Data?.Id ||
                     (post.quoteId.toString && post.quoteId.toString() !== '[object Object]' ? post.quoteId.toString() : null);
            
            if (quoteId) {
              quoteId = String(quoteId).trim();
            }
          }
          
          if (quoteId && quoteId !== 'null' && quoteId !== 'undefined' && !quoteId.includes('[object')) {
            await deleteQuote(quoteId);
          } else {
            console.warn("Invalid quoteId, deleting from localStorage only:", quoteId);
          }
        } catch (quoteErr) {
          console.error("Error deleting quote from backend:", quoteErr);
        }
      }
      
      setLocalPosts((prev) => {
        return prev.filter((p) => p.id !== postId);
      });
      
      setUserPosts((prev) => {
        return prev.filter((p) => p.id !== postId);
      });
      
      try {
        const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
        const filtered = existing.filter((p) => p.id !== postId);
        localStorage.setItem("bookverse_social_feed", JSON.stringify(filtered));
      } catch (err) {
        console.error("Error saving post deletion to localStorage:", err);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      throw err;
    }
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  const handleReportPost = async (postId, post) => {
    try {
      const reportedPosts = getReportedPosts();
      if (!reportedPosts.includes(postId)) {
        reportedPosts.push(postId);
        localStorage.setItem("bookverse_reported_posts", JSON.stringify(reportedPosts));
      }
      
      setUserPosts((prev) => prev.filter((p) => p.id !== postId));
      
    } catch (err) {
      console.error("Error reporting post:", err);
      throw err;
    }
  };

  const isAdmin = user?.role === "Admin" || user?.role === "admin";

  return (
    <Router>
      {initializing ? (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-amber-200 dark:border-amber-200 rounded-full mb-4">
              <div className="w-12 h-12 border-4 border-amber-600 dark:border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-600 font-semibold">Preparing your library...</p>
          </div>
        </div>
      ) : (!isAuthenticated && !isGuest) || showAuthFromGuest ? (
        <div className="min-h-screen">
          {authMode === "signup" ? (
            <SignUpPage onSwitchToSignIn={() => setAuthMode("login")} />
          ) : (
            <LoginPage onSwitchToSignUp={() => setAuthMode("signup")} />
          )}
        </div>
      ) : isAdmin ? (
        <div className="bg-white text-black min-h-screen">
          <main className="min-h-screen">
            <Routes>
              <Route path="/admin" element={<AdminPanelPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
      <div className="bg-white text-black min-h-screen">
        <Navigation
          isGuest={isGuest}
          onShowLogin={() => {
            setShowAuthFromGuest(true);
            setAuthMode("login");
          }}
          onShowSignUp={() => {
            setShowAuthFromGuest(true);
            setAuthMode("signup");
          }}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <Sidebar
          onCreatePost={() => setShowCreatePost(true)}
          onCreateBook={() => setShowCreateBook(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onShowLogin={() => {
            setShowAuthFromGuest(true);
            setAuthMode("login");
          }}
          onShowRegister={() => {
            setShowAuthFromGuest(true);
            setAuthMode("signup");
          }}
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
              element={
                <SocialFeedPage
                  currentUsername={currentUser?.name || "Guest"}
                  localPosts={localPosts}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onDeletePost={handleDeletePost}
                  onReportPost={handleReportPost}
                  onPostUpdate={handlePostUpdate}
                  onLikeChange={handleLikeChange}
                  onShowLogin={() => {
                    setShowAuthFromGuest(true);
                    setAuthMode("login");
                  }}
                  onShowRegister={() => {
                    setShowAuthFromGuest(true);
                    setAuthMode("signup");
                  }}
                />
              }
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
                  onDeletePost={handleDeletePost}
                  onReportPost={handleReportPost}
                  onPostUpdate={handlePostUpdate}
                  onLikeChange={handleLikeChange}
                  onShowLogin={() => {
                    setShowAuthFromGuest(true);
                    setAuthMode("login");
                  }}
                  onShowRegister={() => {
                    setShowAuthFromGuest(true);
                    setAuthMode("signup");
                  }}
                />
              }
            />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/topic" element={<TopicPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/reading-list" element={<ReadingListPage />} />
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
              path="/more"
              element={<MorePage />}
            />
            <Route
              path="/admin"
              element={<AdminPanelPage />}
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
                  onDeletePost={handleDeletePost}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onPostUpdate={handlePostUpdate}
                  onLikeChange={handleLikeChange}
                  onShowLogin={() => {
                    setShowAuthFromGuest(true);
                    setAuthMode("login");
                  }}
                  onShowRegister={() => {
                    setShowAuthFromGuest(true);
                    setAuthMode("signup");
                  }}
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
                  onShowLogin={() => {
                    setShowAuthFromGuest(true);
                    setAuthMode("login");
                  }}
                  onShowRegister={() => {
                    setShowAuthFromGuest(true);
                    setAuthMode("signup");
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {!isGuest && showCreatePost && (
          <CreatePostModal
            onClose={() => setShowCreatePost(false)}
            onCreate={handleCreatePost}
          />
        )}
        {!isGuest && showCreateBook && (
          <CreateBookModal
            onClose={() => setShowCreateBook(false)}
            onCreate={handleCreateBook}
          />
        )}
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onShowLogin={() => {
              setShowAuthFromGuest(true);
              setAuthMode("login");
            }}
            onShowRegister={() => {
              setShowAuthFromGuest(true);
              setAuthMode("signup");
            }}
          />
        )}
      </div>
      )}
    </Router>
  );
}

export default App;
