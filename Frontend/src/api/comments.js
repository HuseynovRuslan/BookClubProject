import { apiRequest, USE_API_MOCKS, delay } from "./config";

/**
 * @param {string} postId 
 * @param {string} text 
 * @param {string} postType 
 * @returns {Promise<Object>} 
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

  const endpoint = `/api/Comments/create-comment`;
  const payload = {
    PostId: postId,
    PostType: postType, 
    Text: text,
  };

  try {
    const response = await apiRequest(endpoint, {
      method: "POST",
      body: payload,
    });
    return response;
  } catch (err) {
    if (err.status === 404) {
      console.warn("Comments API endpoint not available, using localStorage fallback");
      return null;
    }
    throw err;
  }
}

/**
 * 
 * @param {string} commentId 
 * @returns {Promise<Object>}
 */
export async function deleteComment(commentId) {
  if (USE_API_MOCKS) {
    await delay(150);
    return { id: commentId };
  }

  const endpoint = `/api/Comments/delete-comment/${encodeURIComponent(commentId)}`;

  try {
    const response = await apiRequest(endpoint, {
      method: "DELETE",
    });
    return response;
  } catch (err) {
    if (err.status === 404) {
      console.warn("Comments delete API endpoint not available, using localStorage fallback");
      return null;
    }
    throw err;
  }
}

/**
 * @param {string} postId 
 * @param {string} postType 
 * @returns {Promise<Array>} 
 */
export async function getComments(postId, postType = 'review') {
  if (USE_API_MOCKS) {
    await delay(200);
    return [];
  }

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
    if (err.status === 404) {
      console.warn("Comments get API endpoint not available");
      return [];
    }
    throw err;
  }
}
