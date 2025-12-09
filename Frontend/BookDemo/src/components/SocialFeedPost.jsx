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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
          {initials}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {post.username || "BookVerse User"} · {post.timestamp || "Moments ago"}
        </div>
      </div>
      {(post.bookCover || post.postImage) && (
        <img
          src={post.postImage || post.bookCover}
          alt={post.bookTitle || "Post image"}
          className="w-full max-h-80 object-cover rounded-lg mb-3"
        />
      )}
      {post.bookTitle && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{post.bookTitle}</h3>
      )}
      {post.review && (
        <p className="text-gray-700 dark:text-gray-300 mt-1">{post.review}</p>
      )}
      {isReview && post.rating && (
        <div className="mt-2 text-yellow-400 font-semibold">
          {post.rating} ⭐
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 text-sm text-gray-700 dark:text-gray-300">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1 text-gray-900 dark:text-purple-300 hover:text-gray-700 dark:hover:text-purple-200 ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLiked ? "❤️" : "🤍"} {likes}
        </button>
        <span>{comments.length} comments</span>
        {isReview && onViewReview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewReview(post);
            }}
            className="text-gray-900 dark:text-purple-400 hover:text-gray-700 dark:hover:text-purple-300"
          >
            Review detayları
          </button>
        )}
      </div>

      {enableInteractions && (
        <div className="mt-4 space-y-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded p-2"
            >
              <span className="text-sm text-gray-900 dark:text-gray-200">
                <strong>{comment.username}:</strong> {comment.text} —{" "}
                <span className="text-gray-600 dark:text-gray-400">{comment.timestamp}</span>
              </span>
              {comment.username === currentUsername && onDeleteComment && (
                <button
                  className="text-xs text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-400"
                  onClick={() => onDeleteComment(comment.id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}

          {onAddComment && (
            <form className="flex gap-2 mt-2" onSubmit={handleSubmit}>
              <input
                className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                className="px-3 rounded bg-gray-900 dark:bg-purple-600 hover:bg-gray-800 dark:hover:bg-purple-700 text-white"
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