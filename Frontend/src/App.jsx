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

  // Ensure HTML element doesn't have dark class (force white mode)
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
    // When user successfully authenticates, clear the showAuthFromGuest flag
    if (user && showAuthFromGuest) {
      setShowAuthFromGuest(false);
    }
  }, [user, showAuthFromGuest]);

  // Load userPosts from localStorage on mount and when user changes
  useEffect(() => {
    if (!currentUser?.id) return;
    
    try {
      const stored = localStorage.getItem("bookverse_social_feed");
      if (stored) {
        const posts = JSON.parse(stored);
        // Filter posts that belong to current user (quotes, reviews, posts)
        const currentUserId = currentUser.id || currentUser.Id;
        const userPostsFromStorage = posts.filter(post => {
          // Check if post is from current user
          const postUserId = post.userId || post.UserId || 
                           post.user?.id || post.User?.Id ||
                           post.user?.userId || post.User?.UserId;
          // Also include posts with isLocal flag (they're from current user)
          return post.isLocal || postUserId === currentUserId || 
                 (post.type === 'quote' && post.quoteId) || // Quotes created by current user
                 (post.type === 'review' && post.reviewId); // Reviews created by current user
        });
        setUserPosts(userPostsFromStorage);
      }
    } catch (err) {
      console.error("Error loading userPosts from localStorage:", err);
    }
  }, [currentUser]);

        // Disabled: One-time cleanup - user requested to keep posts after page reload
        // useEffect(() => {
        //   try {
        //     const storageKey = "bookverse_social_feed";
        //     const stored = localStorage.getItem(storageKey);
        //     if (stored) {
        //       const posts = JSON.parse(stored);
        //       console.log(`Clearing ${posts.length} posts from localStorage`);
        //       localStorage.removeItem(storageKey);
        //       console.log("All posts cleared from localStorage");
        //     }
        //   } catch (err) {
        //     console.error("Error clearing localStorage:", err);
        //     // If there's an error, try to clear anyway
        //     try {
        //       localStorage.removeItem("bookverse_social_feed");
        //       console.log("Cleared localStorage data");
        //     } catch (clearErr) {
        //       console.error("Error clearing localStorage:", clearErr);
        //     }
        //   }
        // }, []); // Run once on mount


  const handleCreatePost = (newPost) => {
    // For new posts, keep blob URLs for immediate display (they're valid until page reload)
    // Only clean blob URLs when saving to localStorage (they won't persist after reload anyway)
    // For quotes, use the backend quoteId as the post id so it matches and persists
    const postWithUser = {
      ...newPost,
      id: newPost.id || `local-${Date.now()}`, // Use existing id if provided (e.g., quoteId for quotes)
      username: currentUser?.name || "You",
      likes: newPost.likes ?? 0,
      comments: [],
      timestamp: newPost.timestamp || new Date().toISOString(),
      isLocal: !newPost.id || newPost.id.startsWith('local-'), // Only mark as local if id starts with 'local-'
    };
    
    setLocalPosts((prev) => {
      const updated = [postWithUser, ...prev];
      // Save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
        // Remove blob URLs before saving - they're invalid after page reload
        // But keep postImageUrl if it exists (backend URL)
        const cleanPost = { ...postWithUser };
        if (cleanPost.postImage && cleanPost.postImage.startsWith('blob:')) {
          // If we have postImageUrl (backend URL), use it instead of blob URL
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
            // If we have postImageUrl (backend URL), use it instead of blob URL
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
        console.error("Error saving post to localStorage:", err);
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

  const handleAddComment = async (postId, commentText) => {
    const newComment = {
      id: Date.now().toString(),
      username: currentUser?.name || currentUser?.firstName || "You",
      userAvatar: currentUser?.avatarUrl || currentUser?.AvatarUrl || currentUser?.profilePictureUrl || currentUser?.ProfilePictureUrl || null,
      text: commentText,
      timestamp: new Date().toISOString(),
    };
    
    // Update state optimistically
    setLocalPosts((prev) => {
      const updated = prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      );
      // Save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
        const merged = existing.map(p => {
          const localPost = updated.find(lp => lp.id === p.id);
          return localPost || p;
        });
        // Add new local posts that aren't in existing
        updated.forEach(lp => {
          if (!merged.find(p => p.id === lp.id)) {
            merged.push(lp);
          }
        });
        // Remove blob URLs before saving - they're invalid after page reload
        const cleanedMerged = merged.map(post => {
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
        throw err; // Re-throw to let component handle error
      }
      return updated;
    });
    
    // Return success
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
      // Save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
        const merged = existing.map(p => {
          const localPost = updated.find(lp => lp.id === p.id);
          return localPost || p;
        });
        // Add new local posts that aren't in existing
        updated.forEach(lp => {
          if (!merged.find(p => p.id === lp.id)) {
            merged.push(lp);
          }
        });
        // Remove blob URLs before saving - they're invalid after page reload
        const cleanedMerged = merged.map(post => {
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
      return updated;
    });
  };

  const handleDeletePost = async (postId, post) => {
    try {
      // Delete from backend if it's a review or quote
      if (post.type === "review" && post.reviewId) {
        const { deleteReview } = await import("./api/reviews");
        const reviewId = String(post.reviewId || post.reviewId?.id || post.reviewId?.Id || post.reviewId);
        await deleteReview(reviewId);
      } else if (post.type === "quote" && post.quoteId) {
        const { deleteQuote } = await import("./api/quotes");
        // Ensure quoteId is a string, not an object
        let quoteId = null;
        
        // Log the structure for debugging
        console.log("post.quoteId structure:", post.quoteId, "Type:", typeof post.quoteId);
        
        if (typeof post.quoteId === 'string') {
          quoteId = post.quoteId.trim();
        } else if (typeof post.quoteId === 'object' && post.quoteId !== null) {
          // Try all possible ways to extract the ID from the object
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
          } else {
            // If we can't extract, try JSON.stringify to see the structure
            console.error("Cannot extract quoteId from object:", JSON.stringify(post.quoteId, null, 2));
            console.error("Full post object:", JSON.stringify(post, null, 2));
            throw new Error("quoteId is an object but cannot extract ID. Object keys: " + Object.keys(post.quoteId).join(', '));
          }
        } else {
          throw new Error("quoteId is not a string or object: " + typeof post.quoteId);
        }
        
        if (!quoteId || quoteId === 'null' || quoteId === 'undefined' || quoteId.includes('[object')) {
          console.error("Invalid quoteId detected:", { quoteId, postQuoteId: post.quoteId, postType: typeof post.quoteId, post });
          throw new Error("Invalid quoteId: " + quoteId);
        }
        
        console.log("Deleting quote with ID:", quoteId);
        await deleteQuote(quoteId);
      }
      // For normal posts (type: "post"), status updates, and other local posts, just remove from localStorage
      // No backend deletion needed as they're stored locally
      
      // Remove from local state
      setLocalPosts((prev) => {
        const updated = prev.filter((p) => p.id !== postId);
        // Save to localStorage
        try {
          const existing = JSON.parse(localStorage.getItem("bookverse_social_feed") || "[]");
          const filtered = existing.filter((p) => p.id !== postId);
          localStorage.setItem("bookverse_social_feed", JSON.stringify(filtered));
        } catch (err) {
          console.error("Error saving post deletion to localStorage:", err);
        }
        return updated;
      });
      
      // Remove from userPosts
      setUserPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      throw err; // Re-throw to let component handle error display
    }
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

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
