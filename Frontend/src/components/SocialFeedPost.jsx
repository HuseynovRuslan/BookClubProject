import { useState, useRef, useEffect } from "react";
import { Send, Trash2, MoreVertical, Edit, X, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { likeQuote, updateQuote } from "../api/quotes";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../context/AuthContext.jsx";
import GuestRestrictionModal from "./GuestRestrictionModal";
import { getImageUrl } from "../api/config";
import { formatTimestamp } from "../utils/formatTimestamp";

export default function SocialFeedPost({
  post,
  currentUsername,
  enableInteractions = false,
  onAddComment,
  onDeleteComment,
  onDeletePost,
  onViewReview,
  onLikeChange,
  onPostUpdate,
  onShowLogin,
  onShowRegister,
}) {
  const t = useTranslation();
  const navigate = useNavigate();
  const { isGuest, user: authUser } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const initials = post.username
    ? post.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "BV";
  
  // Get user avatar from post
  const userAvatar = post.userAvatar || 
                     post.user?.avatarUrl || 
                     post.user?.AvatarUrl ||
                     post.user?.profilePictureUrl ||
                     post.user?.ProfilePictureUrl ||
                    post.avatarUrl ||
                    post.avatar;

  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.review || "");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const comments = post.comments || [];
  const isReview = post.type === "review" || Boolean(post.reviewId);
  const isQuote = post.type === "quote" || Boolean(post.quoteId);
  
  // Check if current user is the post owner
  // Check by username, user ID, or post userId
  const postUserId = post.userId || post.UserId || 
                     post.user?.id || post.User?.Id ||
                     post.user?.userId || post.User?.UserId;
  const currentUserId = authUser?.id || authUser?.Id;
  const isPostOwner = post.username === currentUsername || 
                      post.user?.name === currentUsername ||
                      post.user?.username === currentUsername ||
                      (currentUserId && postUserId && currentUserId === postUserId) ||
                      (post.isLocal && currentUsername); // Local posts are always from current user

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLike = async () => {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }
    // Only Quote-lər üçün like API-si var
    if (!isQuote || !post.quoteId) {
      // Review və ya BookAdded üçün yalnız local state dəyişirik
      const newLiked = !isLiked;
      const newLikes = likes + (newLiked ? 1 : -1);
      setIsLiked(newLiked);
      setLikes(newLikes);
      // Notify parent to save to localStorage
      if (onLikeChange) {
        onLikeChange(post.id, newLikes, newLiked);
      }
      return;
    }

    if (isLiking) return; // Prevent double-click

    setIsLiking(true);
    try {
      const response = await likeQuote(post.quoteId);
      // Backend returns ApiResponse<bool> where true = liked, false = unliked
      const liked = response.data !== undefined ? response.data : response;
      setIsLiked(liked);
      // Update likes count based on like/unlike
      const newLikes = liked && !isLiked ? likes + 1 : (!liked && isLiked ? Math.max(0, likes - 1) : likes);
      setLikes(newLikes);
      // Notify parent to save to localStorage
      if (onLikeChange) {
        onLikeChange(post.id, newLikes, liked);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert optimistic update on error
      setIsLiked((prev) => !prev);
      setLikes((prev) => prev + (isLiked ? -1 : 1));
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }
    if (!commentText.trim() || !onAddComment) return;
    
    const textToSubmit = commentText.trim();
    setIsSubmittingComment(true);
    setCommentError("");
    
    try {
      // onAddComment expects (postId, text) format
      // Make it async-safe - if it returns a promise, await it
      const result = onAddComment(post.id, textToSubmit);
      if (result && typeof result.then === 'function') {
        await result;
      }
      
      // Only clear comment text after successful submission
      setCommentText("");
      setCommentError("");
      // Keep comment box open after submitting so user can add more comments
    } catch (err) {
      // Preserve comment text on error
      console.error("Error submitting comment:", err);
      setCommentError(err.message || t("post.commentError") || "Failed to submit comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCancelComment = () => {
    setCommentText("");
    setShowCommentBox(false);
  };

  const handleDeletePost = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    
    if (!onDeletePost) return;
    
    // Confirm deletion
    if (!window.confirm(t("post.confirmDelete") || "Are you sure you want to delete this post?")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDeletePost(post.id, post);
    } catch (err) {
      console.error("Error deleting post:", err);
      alert(t("post.deleteError") || "Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportPost = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    
    if (!onDeletePost) return;
    
    // Confirm report
    if (!window.confirm(t("post.confirmReport") || "Are you sure you want to report this post? It will be removed from the feed.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // Report = Delete the post
      await onDeletePost(post.id, post);
    } catch (err) {
      console.error("Error reporting post:", err);
      alert(t("post.reportError") || "Failed to report post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditPost = () => {
    setShowMenu(false);
    setIsEditing(true);
    setEditText(post.review || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(post.review || "");
  };

  const handleSaveEdit = async () => {
    if (!isQuote || !post.quoteId) return;
    
    const trimmedText = editText.trim();
    if (!trimmedText) {
      alert(t("post.quoteRequired") || "Quote text is required");
      return;
    }

    setIsDeleting(true); // Reuse loading state
    try {
      // Extract quoteId properly
      let quoteId = null;
      if (typeof post.quoteId === 'string') {
        quoteId = post.quoteId.trim();
      } else if (post.quoteId?.id) {
        quoteId = String(post.quoteId.id).trim();
      } else if (post.quoteId?.Id) {
        quoteId = String(post.quoteId.Id).trim();
      }

      if (!quoteId || quoteId === 'null' || quoteId === 'undefined' || quoteId.includes('[object')) {
        throw new Error("Invalid quoteId");
      }

      await updateQuote(quoteId, {
        Text: trimmedText,
        Tags: post.tags || null
      });

      // Update local state
      const updatedPost = { ...post, review: trimmedText };
      setIsEditing(false);
      
      // Notify parent to update the post
      if (onPostUpdate) {
        onPostUpdate(post.id, updatedPost);
      } else if (onLikeChange) {
        // Fallback to onLikeChange if onPostUpdate not available
        onLikeChange(post.id, likes, isLiked);
      }
    } catch (err) {
      console.error("Error updating quote:", err);
      alert(t("post.updateError") || "Failed to update quote. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    const bookId = post.bookId || post.BookId || post.book?.id || post.Book?.Id;
    if (bookId) {
      navigate(`/books/${bookId}`);
    }
  };

  return (
    <div className="bg-white dark:bg-white rounded-xl p-4 border-2 border-gray-100 dark:border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {userAvatar ? (() => {
          // Filter out blob URLs - they're invalid after page reload
          if (userAvatar && userAvatar.startsWith('blob:')) {
            return null;
          }
          const imageUrl = getImageUrl(userAvatar);
          if (!imageUrl) {
            return null;
          }
          return (
            <img
              src={imageUrl}
              alt={post.username || t("post.user")}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-200 shadow-md flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          );
        })() : null}
        <div 
          className={`w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex items-center justify-center text-sm font-black text-white shadow-md flex-shrink-0 ${userAvatar ? 'hidden' : 'flex'}`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900 dark:text-gray-900 truncate">
            {post.username || t("post.user")}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-600 mt-0.5">
            {formatTimestamp(post.timestamp || post.createdAt || post.CreatedAt)}
          </div>
        </div>
        {/* 3 dots menu - show for all users */}
        {onDeletePost && (
          <div className="relative ml-auto" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 text-gray-600 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg transition-all"
              title={t("post.moreOptions") || "More options"}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-white rounded-lg shadow-lg border border-gray-200 dark:border-gray-200 z-50 min-w-[120px]">
                {isPostOwner ? (
                  <>
                    {/* Owner sees Edit and Delete */}
                    {isQuote && (
                      <button
                        onClick={handleEditPost}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100 flex items-center gap-2 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        {t("post.edit") || t("common.edit") || "Edit"}
                      </button>
                    )}
                    <button
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-600 hover:bg-red-50 dark:hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("post.delete") || t("common.delete") || "Delete"}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Others see Report */}
                    <button
                      onClick={handleReportPost}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-600 hover:bg-red-50 dark:hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Flag className="w-4 h-4" />
                      {t("post.report") || "Report"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quote Display - Special layout for quotes (1000kitap style) */}
      {isQuote && post.review && (
        <div className="mb-4">
          {/* Quote text with left border and book info */}
          <div className="flex gap-4 items-start">
            {/* Left border - very thin */}
            <div className="w-0.5 bg-amber-500 rounded-full shrink-0 h-full min-h-[100px]"></div>
            {/* Quote content */}
            <div className="flex-1">
              {/* Quote text - editable if editing */}
              {isEditing ? (
                <div className="mb-3 pl-1">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-300 rounded-lg text-gray-900 dark:text-gray-900 bg-white dark:bg-white text-base font-medium italic resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-200"
                    rows={3}
                    placeholder={t("post.quoteText") || "Quote text..."}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isDeleting}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("post.save") || "Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isDeleting}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:text-gray-700 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("post.cancel") || "Cancel"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-900 dark:text-gray-900 leading-relaxed text-base font-medium italic mb-3 pl-1">
                  "{post.review}"
                </p>
              )}
              {/* Book info - cover and title side by side */}
              {(post.bookCover || post.bookTitle) && (
                <div 
                  className="flex gap-3 items-start cursor-pointer hover:opacity-80 transition-opacity pl-1"
                  onClick={handleBookClick}
                >
                  {/* Small book cover */}
                  {post.bookCover && (() => {
                    if (post.bookCover && post.bookCover.startsWith('blob:')) {
                      return null;
                    }
                    const bookCoverUrl = getImageUrl(post.bookCover);
                    if (!bookCoverUrl) return null;
                    return (
                      <img
                        src={bookCoverUrl}
                        alt={post.bookTitle || "Book cover"}
                        className="w-16 h-24 object-cover rounded-md shadow-sm shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    );
                  })()}
                  {/* Book title and author */}
                  {post.bookTitle && (
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-900">
                        {post.bookTitle}
                      </h3>
                      {(() => {
                        // Try to get author name from multiple possible locations
                        const authorName = post.bookAuthor || 
                                         post.author || 
                                         post.book?.authorName ||
                                         post.Book?.AuthorName ||
                                         post.book?.author?.name || 
                                         post.Book?.Author?.Name ||
                                         post.book?.Author?.name ||
                                         post.Book?.author?.Name ||
                                         post.authorName ||
                                         post.AuthorName ||
                                         '';
                        
                        // Debug log to see what we have
                        if (isQuote) {
                          console.log("=== Quote post author check ===");
                          console.log("post.bookAuthor:", post.bookAuthor);
                          console.log("post.author:", post.author);
                          console.log("post.book:", post.book);
                          console.log("post.book?.authorName:", post.book?.authorName);
                          console.log("post.Book?.AuthorName:", post.Book?.AuthorName);
                          console.log("post.book?.author:", post.book?.author);
                          console.log("post.Book?.Author:", post.Book?.Author);
                          console.log("Final authorName:", authorName);
                          console.log("Full post object:", post);
                        }
                        
                        // Show author name if we have it
                        if (authorName && authorName.trim() !== '') {
                          return (
                            <p className="text-xs font-normal text-gray-700 dark:text-gray-700 mt-0.5">
                              {authorName}
                            </p>
                          );
                        }
                        
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Book Cover/Image - For non-quote posts */}
      {!isQuote && (post.bookCover || post.postImage) && (
        <div className="mb-3 -mx-4">
          {post.bookCover ? (() => {
            // Filter out blob URLs - they're invalid after page reload
            if (post.bookCover && post.bookCover.startsWith('blob:')) {
              return null;
            }
            const bookCoverUrl = getImageUrl(post.bookCover);
            if (!bookCoverUrl) return null;
            return (
              // Book cover - use standard book size (not stretched)
              <img
                src={bookCoverUrl}
                alt={post.bookTitle || "Book cover"}
                className="w-full h-auto max-h-96 object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            );
          })() : (() => {
            // Allow blob URLs for newly created posts (they're valid until page reload)
            // But prefer postImageUrl (backend URL) if it exists
            const imageToUse = post.postImageUrl || post.postImage;
            const postImageUrl = imageToUse && imageToUse.startsWith('blob:') 
              ? imageToUse 
              : getImageUrl(imageToUse);
            if (!postImageUrl) return null;
            return (
              // Regular post image - Facebook style: maintain aspect ratio, reasonable max size
              <div className="flex justify-center">
                <img
                  src={postImageUrl}
                  alt="Post image"
                  className="max-w-full h-auto max-h-96 object-contain rounded-lg"
                  style={{ maxWidth: '100%', width: 'auto' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* Book Title - For non-quote posts */}
      {!isQuote && post.bookTitle && (
        <h3 className="text-lg font-black text-gray-900 dark:text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 transition-all duration-500">
          {post.bookTitle}
        </h3>
      )}

      {/* Review Text - For non-quote posts */}
      {!isQuote && post.review && (
        <p className="text-gray-700 dark:text-gray-700 mt-2 leading-relaxed text-sm">{post.review}</p>
      )}

      {/* Rating */}
      {isReview && post.rating && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-50 dark:via-amber-50 dark:to-yellow-100 px-2.5 py-1 rounded-lg border-2 border-yellow-300 dark:border-yellow-300 shadow-sm">
            <span className="text-sm text-yellow-500 drop-shadow-sm">★</span>
            <span className="text-xs font-black text-gray-900 dark:text-gray-900 ml-1">
              {post.rating.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-200">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            isLiked 
              ? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-50 dark:to-pink-50 text-red-600 dark:text-red-600 border border-red-200 dark:border-red-200' 
              : 'bg-white dark:bg-white text-gray-700 dark:text-gray-700 border border-gray-200 dark:border-gray-200 hover:border-amber-300 dark:hover:border-amber-300'
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-base">{isLiked ? "❤️" : "🤍"}</span>
          <span>{likes}</span>
        </button>
        <button
          onClick={() => {
            if (isGuest) {
              setShowGuestModal(true);
              return;
            }
            setShowCommentBox(true);
            // Scroll to comment input after a short delay to ensure it's rendered
            setTimeout(() => {
              const commentInput = document.querySelector(`textarea[placeholder*="${t("post.writeComment")}"]`);
              if (commentInput) {
                commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                commentInput.focus();
              }
            }, 100);
          }}
          className="flex items-center gap-1.5 text-gray-700 dark:text-gray-700 text-sm font-semibold hover:text-amber-600 dark:hover:text-amber-600 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{comments.length}</span>
        </button>
        {isReview && onViewReview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewReview(post);
            }}
            className="ml-auto px-3 py-1.5 rounded-lg bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            {t("post.reviewDetails")}
          </button>
        )}
      </div>

      {/* Comments Section */}
      {enableInteractions && (
        <div className="mt-3 space-y-2 pt-3 border-t border-gray-100 dark:border-gray-200">
          {comments.map((comment) => {
            const commentInitials = comment.username
              ? comment.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "U";
            const commentAvatar = comment.userAvatar || comment.avatarUrl || comment.avatar;
            
            return (
              <div
                key={comment.id}
                className="flex items-start gap-2 bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-50 dark:to-amber-50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-200"
              >
                {commentAvatar ? (() => {
                  // Filter out blob URLs - they're invalid after page reload
                  if (commentAvatar && commentAvatar.startsWith('blob:')) {
                    return null;
                  }
                  const commentImageUrl = getImageUrl(commentAvatar);
                  if (!commentImageUrl) {
                    return null;
                  }
                  return (
                    <img
                      src={commentImageUrl}
                      alt={comment.username || "User"}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-200 flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  );
                })() : null}
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex items-center justify-center text-xs font-black text-white border border-gray-200 dark:border-gray-200 flex-shrink-0 ${commentAvatar ? 'hidden' : 'flex'}`}
                >
                  {commentInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-gray-900 mb-0.5">
                    {comment.username}
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-700 mb-0.5 break-words">
                    {comment.text}
                  </p>
                  <span className="text-xs text-gray-600 dark:text-gray-600">{formatTimestamp(comment.timestamp || comment.createdAt || comment.CreatedAt)}</span>
                </div>
                {comment.username === currentUsername && onDeleteComment && (
                  <button
                    className="text-xs font-semibold text-red-600 dark:text-red-600 hover:text-red-700 dark:hover:text-red-700 px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-50 transition-all flex-shrink-0"
                    onClick={() => onDeleteComment(comment.id)}
                  >
                    {t("post.delete")}
                  </button>
                )}
              </div>
            );
          })}

          {onAddComment && (
            <div className="mt-3">
              {!showCommentBox ? (
                <button
                  onClick={() => setShowCommentBox(true)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg transition-all border border-gray-200 dark:border-gray-200"
                >
                  {t("post.writeComment") || "Write a comment..."}
                </button>
              ) : (
                <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                  <textarea
                    className="w-full p-2 rounded-lg bg-white dark:bg-white text-gray-900 dark:text-gray-900 text-sm border border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all resize-none"
                    placeholder={t("post.writeComment")}
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      setCommentError(""); // Clear error when user types
                    }}
                    rows={3}
                    autoFocus
                    disabled={isSubmittingComment}
                  />
                  {commentError && (
                    <div className="p-2 bg-red-50 dark:bg-red-50 border border-red-200 dark:border-red-200 rounded-lg">
                      <p className="text-xs text-red-600 dark:text-red-600 font-semibold">{commentError}</p>
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleCancelComment}
                      disabled={isSubmittingComment}
                      className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("post.cancel") || t("common.cancel") || "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                    >
                      {isSubmittingComment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t("common.loading") || "Sending..."}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t("post.send") || "Send"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Guest Restriction Modal */}
      <GuestRestrictionModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onLogin={onShowLogin}
        onRegister={onShowRegister}
      />
    </div>
  );
}