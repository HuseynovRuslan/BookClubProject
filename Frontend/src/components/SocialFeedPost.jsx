import { useState } from "react";
import { likeQuote } from "../api/quotes";

export default function SocialFeedPost({
  post,
  currentUsername,
  enableInteractions = false,
  onAddComment,
  onDeleteComment,
  onViewReview,
}) {
  const initials = post.username
    ? post.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "BV";

  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [commentText, setCommentText] = useState("");
  const comments = post.comments || [];
  const isReview = post.type === "review" || Boolean(post.reviewId);
  const isQuote = post.type === "quote" || Boolean(post.quoteId);

  const handleLike = async () => {
    // Only Quote-lər üçün like API-si var
    if (!isQuote || !post.quoteId) {
      // Review və ya BookAdded üçün yalnız local state dəyişirik
      setIsLiked((prev) => !prev);
      setLikes((prev) => prev + (isLiked ? -1 : 1));
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
      if (liked && !isLiked) {
        setLikes((prev) => prev + 1);
      } else if (!liked && isLiked) {
        setLikes((prev) => Math.max(0, prev - 1));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !onAddComment) return;
    onAddComment(commentText.trim());
    setCommentText("");
  };

  return (
    <div className="bg-white dark:bg-white rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex items-center justify-center text-base font-black text-white shadow-lg">
          {initials}
        </div>
        <div className="flex-1">
          <div className="text-base font-bold text-gray-900 dark:text-gray-900">
            {post.username || "BookVerse User"}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-600 mt-0.5">
            {post.timestamp || "Moments ago"}
          </div>
        </div>
      </div>

      {/* Book Cover/Image */}
      {(post.bookCover || post.postImage) && (
        <div className="mb-4 rounded-xl overflow-hidden shadow-lg">
          <img
            src={post.postImage || post.bookCover}
            alt={post.bookTitle || "Post image"}
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* Book Title */}
      {post.bookTitle && (
        <h3 className="text-xl font-black text-gray-900 dark:text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 transition-all duration-500">
          {post.bookTitle}
        </h3>
      )}

      {/* Review Text */}
      {post.review && (
        <p className="text-gray-700 dark:text-gray-700 mt-2 leading-relaxed">{post.review}</p>
      )}

      {/* Rating */}
      {isReview && post.rating && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-50 dark:via-amber-50 dark:to-yellow-100 px-3 py-1.5 rounded-xl border-2 border-yellow-300 dark:border-yellow-300 shadow-md">
            <span className="text-base text-yellow-500 drop-shadow-sm">★</span>
            <span className="text-sm font-black text-gray-900 dark:text-gray-900 ml-1.5">
              {post.rating.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 mt-5 pt-4 border-t-2 border-gray-100 dark:border-gray-200">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md transform hover:scale-105 ${
            isLiked 
              ? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-50 dark:to-pink-50 text-red-600 dark:text-red-600 border-2 border-red-200 dark:border-red-200' 
              : 'bg-white dark:bg-white text-gray-700 dark:text-gray-700 border-2 border-gray-200 dark:border-gray-200 hover:border-amber-300 dark:hover:border-amber-300'
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-lg">{isLiked ? "❤️" : "🤍"}</span>
          <span>{likes}</span>
        </button>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-700 font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{comments.length} comments</span>
        </div>
        {isReview && onViewReview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewReview(post);
            }}
            className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Review detayları
          </button>
        )}
      </div>

      {/* Comments Section */}
      {enableInteractions && (
        <div className="mt-5 space-y-3 pt-4 border-t-2 border-gray-100 dark:border-gray-200">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start justify-between gap-3 bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-50 dark:to-amber-50 rounded-xl p-3 border-2 border-gray-200 dark:border-gray-200 shadow-sm"
            >
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900 dark:text-gray-900 mb-1">
                  {comment.username}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-700 mb-1">
                  {comment.text}
                </p>
                <span className="text-xs text-gray-600 dark:text-gray-600">{comment.timestamp}</span>
              </div>
              {comment.username === currentUsername && onDeleteComment && (
                <button
                  className="text-xs font-semibold text-red-600 dark:text-red-600 hover:text-red-700 dark:hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-50 transition-all"
                  onClick={() => onDeleteComment(comment.id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}

          {onAddComment && (
            <form className="flex gap-3 mt-4" onSubmit={handleSubmit}>
              <input
                className="flex-1 p-3 rounded-xl bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-2 border-gray-200 dark:border-gray-200 focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-200 focus:border-amber-400 dark:focus:border-amber-400 transition-all shadow-sm"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}