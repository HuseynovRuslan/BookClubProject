import { useCallback, useMemo, useState, useEffect } from "react";
import { getFeed } from "../api/feed";
import { getReviewById } from "../api/reviews";
import SocialFeedPost from "./SocialFeedPost";
import ReviewDetailModal from "./reviews/ReviewDetailModal";

export default function SocialFeedPage({
  currentUsername,
  localPosts = [],
  onAddComment,
  onDeleteComment,
}) {
  const [remotePosts, setRemotePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [reviewModalError, setReviewModalError] = useState(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFeed({ page, pageSize });
      // getFeed already returns normalized format: { items, total, page, pageSize }
      const items = response.items || [];
      const totalCount = response.total || 0;
      setRemotePosts(items);
      setHasMore(
        totalCount ? page * pageSize < totalCount : items.length === pageSize
      );
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError(err.message || "Failed to load feed.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const posts = useMemo(
    () => [...localPosts, ...remotePosts],
    [localPosts, remotePosts]
  );

  const handleRemoteCommentAdd = useCallback(
    (postId, text) => {
      const newComment = {
        id: Date.now().toString(),
        username: currentUsername || "You",
        text,
        timestamp: "Just now",
      };
      setRemotePosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), newComment],
              }
            : post
        )
      );
    },
    [currentUsername]
  );

  const handleRemoteCommentDelete = useCallback((postId, commentId) => {
    setRemotePosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: (post.comments || []).filter(
                (comment) => comment.id !== commentId
              ),
            }
          : post
      )
    );
  }, []);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleViewReview = useCallback(
    async (item) => {
      setReviewModalOpen(true);
      setReviewModalError(null);
      setReviewDetail({
        id: item.reviewId || item.id,
        rating: item.rating,
        text: item.review,
        book: {
          title: item.bookTitle,
          coverImage: item.bookCover,
        },
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      });
      if (!item.reviewId) {
        return;
      }
      try {
        const fullReview = await getReviewById(item.reviewId);
        setReviewDetail(fullReview);
      } catch (err) {
        setReviewModalError(err.message || "Review detalları tapılmadı");
      }
    },
    []
  );

  return (
    <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 xl:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Social Feed</h1>
        <button
          onClick={fetchFeed}
          className="text-sm text-gray-600 dark:text-purple-400 hover:text-gray-800 dark:hover:text-purple-300"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="bg-gray-100 dark:bg-gray-800 p-8 text-center rounded-lg text-gray-700 dark:text-gray-300">
          Loading feed...
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 p-6 rounded-lg text-center">
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 rounded-full bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white"
            onClick={fetchFeed}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 p-8 text-center rounded-lg text-gray-700 dark:text-gray-300">
          No posts yet. Create one from the sidebar!
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <SocialFeedPost
                key={post.id}
                post={post}
                currentUsername={currentUsername}
                enableInteractions
                onAddComment={(text) =>
                  post.isLocal
                    ? onAddComment?.(post.id, text)
                    : handleRemoteCommentAdd(post.id, text)
                }
                onDeleteComment={(commentId) =>
                  post.isLocal
                    ? onDeleteComment?.(post.id, commentId)
                    : handleRemoteCommentDelete(post.id, commentId)
                }
                onViewReview={handleViewReview}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-400">Page {page}</span>
            <button
              onClick={handleNextPage}
              disabled={!hasMore}
              className="px-4 py-2 rounded-full border border-gray-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}

      {reviewModalOpen && reviewDetail && (
        <ReviewDetailModal
          review={reviewDetail}
          errorMessage={reviewModalError}
          onClose={() => {
            setReviewModalOpen(false);
            setReviewDetail(null);
            setReviewModalError(null);
          }}
        />
      )}

      {reviewModalOpen && reviewModalError && !reviewDetail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-xl max-w-md text-center space-y-4">
            <p>{reviewModalError}</p>
            <button
              onClick={() => {
                setReviewModalOpen(false);
                setReviewModalError(null);
              }}
              className="px-4 py-2 rounded bg-gray-900 dark:bg-purple-600 hover:bg-gray-800 dark:hover:bg-purple-500 text-white"
            >
              Bağla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

