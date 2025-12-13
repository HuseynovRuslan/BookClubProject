import { apiRequest, USE_API_MOCKS, delay } from "./config";

/**
 * Create a comment on a post/review/quote
 * @param {string} postId - The ID of the post/review/quote
 * @param {string} text - The comment text
 * @param {string} postType - Type of post: 'review', 'quote', or 'post'
 * @returns {Promise<Object>} The created comment
 */
export async function createComment(postId, text, postType = 'review') {
  if (USE_API_MOCKS) {
    await delay(200);
    const newComment = {
      id: `comment-${Date.now()}`,
      postId,
      text,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    return newComment;
  }

  // Backend API endpoint for creating comments
  // Adjust the endpoint based on your backend structure
  const endpoint = `/api/Comments/create-comment`;
  const payload = {
    PostId: postId,
    PostType: postType, // 'Review', 'Quote', or 'Post'
    Text: text,
  };

  try {
    const response = await apiRequest(endpoint, {
      method: "POST",
      body: payload,
    });
    return response;
  } catch (err) {
    // If endpoint doesn't exist (404), return null to indicate API not available
    if (err.status === 404) {
      console.warn("Comments API endpoint not available, using localStorage fallback");
      return null;
    }
    throw err;
  }
}

/**
 * Delete a comment
 * @param {string} commentId - The ID of the comment to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteComment(commentId) {
  if (USE_API_MOCKS) {
    await delay(150);
    return { id: commentId };
  }

  // Backend API endpoint for deleting comments
  const endpoint = `/api/Comments/delete-comment/${encodeURIComponent(commentId)}`;

  try {
    const response = await apiRequest(endpoint, {
      method: "DELETE",
    });
    return response;
  } catch (err) {
    // If endpoint doesn't exist (404), return null to indicate API not available
    if (err.status === 404) {
      console.warn("Comments delete API endpoint not available, using localStorage fallback");
      return null;
    }
    throw err;
  }
}

/**
 * Get comments for a post
 * @param {string} postId - The ID of the post
 * @param {string} postType - Type of post: 'review', 'quote', or 'post'
 * @returns {Promise<Array>} Array of comments
 */
export async function getComments(postId, postType = 'review') {
  if (USE_API_MOCKS) {
    await delay(200);
    return [];
  }

  // Backend API endpoint for getting comments
  const params = new URLSearchParams();
  params.append("postId", postId);
  params.append("postType", postType);
  const endpoint = `/api/Comments/get-comments?${params.toString()}`;

  try {
    const response = await apiRequest(endpoint, {
      method: "GET",
    });
    return response?.items || response || [];
  } catch (err) {
    // If endpoint doesn't exist (404), return empty array
    if (err.status === 404) {
      console.warn("Comments get API endpoint not available");
      return [];
    }
    throw err;
  }
}
