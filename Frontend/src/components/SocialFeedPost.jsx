import { useState, useRef, useEffect } from "react";
import { Send, Trash2, MoreVertical, Edit, X, Flag, Check, Bookmark } from "lucide-react";
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
  allowEditDelete = false,
  onAddComment,
  onDeleteComment,
  onDeletePost,
  onReportPost,
  onViewReview,
  onLikeChange,
  onPostUpdate,
  onShowLogin,
  onShowRegister,
  onToggleSave,
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
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const SAVED_KEY = "bookverse_saved_posts";
  

  useEffect(() => {
    if (post.likes !== undefined) {
      setLikes(post.likes);
    }
    if (post.isLiked !== undefined) {
      setIsLiked(post.isLiked);
    }
  }, [post.likes, post.isLiked]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      const savedIds = raw ? JSON.parse(raw) : [];
      setIsSaved(savedIds.includes(post.id));
    } catch {
      setIsSaved(false);
    }
  }, [post.id]);
  

  useEffect(() => {

  }, [post.comments]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.review || post.text || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  

  useEffect(() => {
    if (!isEditing) {
      setEditText(post.review || post.text || "");
    }
  }, [post.review, post.text, isEditing]);


  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showDeleteConfirm) {
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showDeleteConfirm]);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const comments = post.comments || [];

  const displayedComments = showAllComments ? comments : comments.slice(0, 1);
  const isReview = post.type === "review" || Boolean(post.reviewId);
  const isQuote = post.type === "quote" || Boolean(post.quoteId);
  


  const postUserId = post.userId || post.UserId || 
                     post.user?.id || post.User?.Id ||
                     post.user?.userId || post.User?.UserId;
  const currentUserId = authUser?.id || authUser?.Id;
  const isPostOwner = post.username === currentUsername || 
                      post.user?.name === currentUsername ||
                      post.user?.username === currentUsername ||
                      (currentUserId && postUserId && currentUserId === postUserId) ||
                      (post.isLocal && currentUsername);


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
    

    setLikeAnimation(true);
    setTimeout(() => setLikeAnimation(false), 400);
    

    if (!isQuote || !post.quoteId) {

      const newLiked = !isLiked;
      const newLikes = likes + (newLiked ? 1 : -1);
      setIsLiked(newLiked);
      setLikes(newLikes);

      if (onLikeChange) {
        onLikeChange(post.id, newLikes, newLiked);
      }
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await likeQuote(post.quoteId);

      const liked = response.data !== undefined ? response.data : response;
      setIsLiked(liked);

      const newLikes = liked && !isLiked ? likes + 1 : (!liked && isLiked ? Math.max(0, likes - 1) : likes);
      setLikes(newLikes);

      if (onLikeChange) {
        onLikeChange(post.id, newLikes, liked);
      }
    } catch (err) {

      setIsLiked((prev) => !prev);
      setLikes((prev) => prev + (isLiked ? -1 : 1));
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleSave = () => {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      const savedIds = raw ? JSON.parse(raw) : [];
      let updated;
      if (savedIds.includes(post.id)) {
        updated = savedIds.filter((id) => id !== post.id);
        setIsSaved(false);
      } else {
        updated = [...savedIds, post.id];
        setIsSaved(true);
      }
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      if (onToggleSave) {
        onToggleSave(post.id, updated.includes(post.id));
      }
    } catch {
      // ignore storage errors
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


      const result = onAddComment(post.id, textToSubmit);
      if (result && typeof result.then === 'function') {
        await result;
      }
      

      setCommentText("");
      setCommentError("");

    } catch (err) {

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
    


    if (!isPostOwner) {
      alert(t("post.noPermission") || "You don't have permission to delete this post.");
      return;
    }
    
    if (!onDeletePost) return;
    

    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      await onDeletePost(post.id, post);
    } catch (err) {
      alert(t("post.deleteError") || "Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportPost = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    

    if (!window.confirm(t("post.confirmReport") || "Are you sure you want to report this post? It will be removed from your feed.")) {
      return;
    }
    
    setIsDeleting(true);
    try {


      if (onReportPost) {
        await onReportPost(post.id, post);
      } else {

        const reportedPosts = JSON.parse(localStorage.getItem("bookverse_reported_posts") || "[]");
        if (!reportedPosts.includes(post.id)) {
          reportedPosts.push(post.id);
          localStorage.setItem("bookverse_reported_posts", JSON.stringify(reportedPosts));
        }
      }
    } catch (err) {
      alert(t("post.reportError") || "Failed to report post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditPost = () => {
    setShowMenu(false);
    setIsEditing(true);
    setEditText(post.review || post.text || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(post.review || post.text || "");
  };

  const handleSaveEdit = async () => {


    if (!isPostOwner) {
      alert(t("post.noPermission") || "You don't have permission to edit this post.");
      return;
    }
    
    const trimmedText = editText.trim();
    if (!trimmedText) {
      alert(t("post.textRequired") || "Post text is required");
      return;
    }

    setIsDeleting(true);
    try {

      if (isQuote && post.quoteId) {

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
        } else if (typeof post.quoteId === 'number') {
          quoteId = String(post.quoteId).trim();
        }

        if (!quoteId || quoteId === 'null' || quoteId === 'undefined' || quoteId.includes('[object')) {
          console.error("Invalid quoteId detected:", { quoteId, postQuoteId: post.quoteId, postType: typeof post.quoteId, post });
          throw new Error("Invalid quoteId: " + quoteId);
        }


        const updatePayload = {
          Text: trimmedText,
        };
        

        if (post.tags !== undefined && post.tags !== null) {
          updatePayload.Tags = Array.isArray(post.tags) ? post.tags : (post.tags ? [post.tags] : []);
        }

        console.log("Updating quote with ID:", quoteId, "Payload:", updatePayload);
        
        try {
          await updateQuote(quoteId, updatePayload);
        } catch (quoteErr) {
          console.error("Error updating quote from backend:", quoteErr);


          if (quoteErr.status !== 404) {
            throw quoteErr;
          }
          console.warn("Quote update endpoint not found (404), updating localStorage only");
        }


        const updatedPost = { ...post, review: trimmedText, text: trimmedText };
        setIsEditing(false);
        

        if (onPostUpdate) {
          await onPostUpdate(post.id, updatedPost);
        } else if (onLikeChange) {

          onLikeChange(post.id, likes, isLiked);
        }
        


      }

      else if (isReview && post.reviewId) {
        const { updateReview } = await import("../api/reviews");
        const reviewId = String(post.reviewId || post.reviewId?.id || post.reviewId?.Id || post.reviewId);
        
        await updateReview(reviewId, {
          text: trimmedText,
          rating: post.rating || 0
        });


        const updatedPost = { ...post, review: trimmedText, text: trimmedText };
        setIsEditing(false);
        

        if (onPostUpdate) {
          await onPostUpdate(post.id, updatedPost);
        } else if (onLikeChange) {
          onLikeChange(post.id, likes, isLiked);
        }
        


      }

      else {

        const updatedPost = { ...post, review: trimmedText, text: trimmedText };
        setIsEditing(false);
        

        if (onPostUpdate) {
          await onPostUpdate(post.id, updatedPost);
        } else if (onLikeChange) {
          onLikeChange(post.id, likes, isLiked);
        }
        


      }
    } catch (err) {
      console.error("Error updating post:", err);
      

      let errorMessage = t("post.updateError") || "Failed to update post. Please try again.";
      
      if (err.message) {
        const message = err.message.toLowerCase();
        if (message.includes("invalid quoteid") || message.includes("invalid quote")) {
          errorMessage = t("post.invalidQuoteId") || "Invalid quote ID. Please refresh and try again.";
        } else if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
          errorMessage = t("error.network") || "Network error. Please check your connection and try again.";
        } else if (message.includes("permission") || message.includes("unauthorized") || message.includes("forbidden")) {
          errorMessage = t("post.noPermission") || "You don't have permission to edit this post.";
        } else if (err.status === 404) {
          errorMessage = t("post.updateEndpointNotFound") || "Update endpoint not found. Please try again later.";
        } else if (err.status === 400 || err.status === 422) {
          errorMessage = t("error.400") || "Invalid data. Please check your input and try again.";
        } else if (err.status === 401) {
          errorMessage = t("error.401") || "You must log in. Please log in again.";
        } else {

          errorMessage = err.message;
        }
      } else if (err.status) {
        errorMessage = t(`error.${err.status}`) || t("post.updateError") || "Failed to update post. Please try again.";
      }
      
      alert(errorMessage);
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
            {formatTimestamp(post.timestamp || post.createdAt || post.CreatedAt, t)}
          </div>
        </div>
        {/* 3 dots menu - show if onDeletePost or onReportPost is available */}
        {(onDeletePost || onReportPost) && (
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
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-white rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-200 z-50 min-w-[180px] overflow-hidden backdrop-blur-sm">
                {(allowEditDelete && isPostOwner) || (isPostOwner && onDeletePost) ? (
                  <>
                    {/* Profile Page or Social Feed: Owner sees Edit and Delete */}
                    <button
                      onClick={handleEditPost}
                      className="w-full px-4 py-3 text-left text-sm font-bold text-amber-700 dark:text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-50 dark:hover:to-orange-50 flex items-center gap-3 transition-all duration-200 group"
                    >
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-100 group-hover:bg-amber-200 dark:group-hover:bg-amber-200 transition-colors">
                        <Edit className="w-4 h-4 text-amber-600 dark:text-amber-600" />
                      </div>
                      {t("post.edit") || t("common.edit") || "Edit"}
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-200"></div>
                    <button
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                      className="w-full px-4 py-3 text-left text-sm font-bold text-red-600 dark:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-50 dark:hover:to-pink-50 flex items-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-100 group-hover:bg-red-200 dark:group-hover:bg-red-200 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-600" />
                      </div>
                      {isDeleting ? (t("common.deleting") || "Deleting...") : (t("post.delete") || t("common.delete") || "Delete")}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Social Feed: Non-owners see Report (post owner cannot report their own post) */}
                    {onReportPost && !isPostOwner && (
                      <button
                        onClick={handleReportPost}
                        disabled={isDeleting}
                        className="w-full px-4 py-3 text-left text-sm font-bold text-red-600 dark:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-50 dark:hover:to-pink-50 flex items-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-100 group-hover:bg-red-200 dark:group-hover:bg-red-200 transition-colors">
                          <Flag className="w-4 h-4 text-red-600 dark:text-red-600" />
                        </div>
                        {t("post.report") || "Report"}
                      </button>
                    )}
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
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isDeleting}
                      className="px-5 py-2.5 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t("common.saving") || "Saving..."}
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          {t("post.save") || "Save"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isDeleting}
                      className="px-5 py-2.5 bg-white dark:bg-white border-2 border-gray-300 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-400 text-gray-700 dark:text-gray-700 text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
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

            if (post.bookCover && post.bookCover.startsWith('blob:')) {
              return null;
            }
            const bookCoverUrl = getImageUrl(post.bookCover);
            if (!bookCoverUrl) return null;
            return (

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


            const imageToUse = post.postImageUrl || post.postImage;
            const postImageUrl = imageToUse && imageToUse.startsWith('blob:') 
              ? imageToUse 
              : getImageUrl(imageToUse);
            if (!postImageUrl) return null;
            return (

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

      {/* Review/Post Text - Editable for all post types */}
      {!isQuote && (post.review || post.text) && (
        <div className="mb-3">
          {isEditing ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-300 rounded-lg text-gray-900 dark:text-gray-900 bg-white dark:bg-white text-base font-medium resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-200"
                rows={4}
                placeholder={isReview ? (t("post.reviewText") || "Review text...") : (t("post.postText") || "Post text...")}
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("common.saving") || "Saving..."}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t("post.save") || "Save"}
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-white dark:bg-white border-2 border-gray-300 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-400 text-gray-700 dark:text-gray-700 text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {t("post.cancel") || "Cancel"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-900 dark:text-gray-900 leading-relaxed text-base font-medium">
              {post.review || post.text}
            </p>
          )}
        </div>
      )}

      {/* Review/Post Text - Editable for all post types (non-quote) */}
      {!isQuote && (post.review || post.text) && (
        <div className="mb-3">
          {isEditing ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-300 rounded-lg text-gray-900 dark:text-gray-900 bg-white dark:bg-white text-base font-medium resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-200"
                rows={4}
                placeholder={isReview ? (t("post.reviewText") || "Review text...") : (t("post.postText") || "Post text...")}
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("common.saving") || "Saving..."}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t("post.save") || "Save"}
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-white dark:bg-white border-2 border-gray-300 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-400 text-gray-700 dark:text-gray-700 text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {t("post.cancel") || "Cancel"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-700 mt-2 leading-relaxed text-sm">{post.review || post.text}</p>
          )}
        </div>
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
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''} ${likeAnimation ? 'animate-heartPulse' : ''}`}
        >
          <span className={`text-base transition-transform ${likeAnimation ? 'animate-heartPulse' : ''}`}>
            {isLiked ? "❤️" : "🤍"}
          </span>
          <span className="transition-all">{likes}</span>
        </button>
        <button
          onClick={() => {
            if (isGuest) {
              setShowGuestModal(true);
              return;
            }

            if (comments.length > 1) {
              setShowAllComments(!showAllComments);
            }

            if (comments.length <= 1) {
              setShowCommentBox(true);

              setTimeout(() => {
                const commentInput = document.querySelector(`textarea[placeholder*="${t("post.writeComment")}"]`);
                if (commentInput) {
                  commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  commentInput.focus();
                }
              }, 100);
            }
          }}
          className="flex items-center gap-1.5 text-gray-700 dark:text-gray-700 text-sm font-semibold hover:text-amber-600 dark:hover:text-amber-600 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{comments.length}</span>
        </button>
        <button
          onClick={handleToggleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
            isSaved
              ? "bg-amber-50 border-amber-300 text-amber-700"
              : "bg-white border-gray-200 text-gray-700 hover:border-amber-300"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{isSaved ? "Saved" : "Save"}</span>
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
        <div className="mt-4 space-y-3 pt-4 border-t-2 border-gray-200 dark:border-gray-200">
          {displayedComments.map((comment) => {
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
                className="flex items-start gap-3 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 dark:from-white dark:via-amber-50/30 dark:to-orange-50/20 rounded-xl p-3 border-2 border-gray-200 dark:border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                {commentAvatar ? (() => {

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
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-200 dark:border-amber-200 shadow-md flex-shrink-0 group-hover:border-amber-300 dark:group-hover:border-amber-300 transition-all"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  );
                })() : null}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex items-center justify-center text-xs font-black text-white border-2 border-amber-200 dark:border-amber-200 shadow-md flex-shrink-0 group-hover:border-amber-300 dark:group-hover:border-amber-300 transition-all ${commentAvatar ? 'hidden' : 'flex'}`}
                >
                  {commentInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-900">
                      {comment.username}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatTimestamp(comment.timestamp || comment.createdAt || comment.CreatedAt, t)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-700 mb-2 break-words leading-relaxed">
                    {comment.text}
                  </p>
                </div>
                {/* Show delete button if comment belongs to current user OR post owner is current user */}
                {((comment.username === currentUsername) || isPostOwner) && onDeleteComment && (
                  <button
                    className="text-xs font-bold text-red-600 dark:text-red-600 hover:text-red-700 dark:hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-50 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={async () => {
                      try {
                        const result = onDeleteComment(post.id, comment.id);

                        if (result && typeof result.then === 'function') {
                          await result;
                        }
                      } catch (err) {

                      }
                    }}
                    title={t("post.delete") || "Delete comment"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}

          {onAddComment && (
            <div className="mt-4">
              {!showCommentBox ? (
                <button
                  onClick={() => setShowCommentBox(true)}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-50 dark:hover:to-orange-50 rounded-xl transition-all border-2 border-gray-200 dark:border-gray-200 hover:border-amber-300 dark:hover:border-amber-300 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {t("post.writeComment") || "Write a comment..."}
                </button>
              ) : (
                <form className="flex flex-col gap-3 animate-slideDown bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 dark:from-white dark:via-amber-50/30 dark:to-orange-50/20 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-200 shadow-lg" onSubmit={handleSubmit}>
                  <textarea
                    className="w-full p-3 rounded-xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 text-sm border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all resize-none shadow-sm"
                    placeholder={t("post.writeComment") || "Write your comment..."}
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      setCommentError("");
                    }}
                    rows={3}
                    autoFocus
                    disabled={isSubmittingComment}
                  />
                  {commentError && (
                    <div className="p-3 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 dark:from-red-50 dark:via-orange-50 dark:to-red-50 border-2 border-red-300 dark:border-red-300 rounded-xl shadow-md">
                      <p className="text-xs text-red-600 dark:text-red-600 font-bold">{commentError}</p>
                    </div>
                  )}
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={handleCancelComment}
                      disabled={isSubmittingComment}
                      className="px-4 py-2 bg-white dark:bg-white border-2 border-gray-300 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-400 text-gray-700 dark:text-gray-700 text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
                    >
                      {t("post.cancel") || t("common.cancel") || "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="px-5 py-2 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-amber-700 hover:via-orange-700 hover:to-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center gap-2"
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white dark:bg-white rounded-3xl max-w-md w-full border-2 border-gray-200 dark:border-gray-200 shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 border-b-2 border-gray-200 dark:border-gray-200 bg-gradient-to-br from-red-500 to-pink-500 bg-opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent rounded-t-3xl"></div>
              <div className="relative flex items-center justify-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-100 dark:to-pink-100">
                  <Trash2 className="w-8 h-8 text-red-600 dark:text-red-600" />
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 text-center">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-900 mb-3">
                {t("post.confirmDeleteTitle") || "Delete Post?"}
              </h2>
              <p className="text-gray-700 dark:text-gray-700 mb-6">
                {t("post.confirmDelete") || "Are you sure you want to delete this post? This action cannot be undone."}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-white dark:bg-white border-2 border-gray-300 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-400 text-gray-700 dark:text-gray-700 text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md"
                >
                  {t("post.cancel") || t("common.cancel") || "Cancel"}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-gradient-to-br from-red-600 via-pink-600 to-red-700 hover:from-red-700 hover:via-pink-700 hover:to-red-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("common.deleting") || "Deleting..."}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {t("post.delete") || t("common.delete") || "Delete"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
