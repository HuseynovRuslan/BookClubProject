import { apiRequest, USE_API_MOCKS, delay } from "./config";

/**
 * Create a feedback message from user to admin
 * @param {string} message - The feedback message
 * @param {Object} user - The user object (optional, for fallback)
 * @returns {Promise<Object>}
 */
export async function createFeedback(message, user = null) {
  // Get user info from user object or try to get from token
  const userId = user?.id || user?.Id || null;
  const username = user?.username || user?.Username || user?.userName || user?.name || "User";
  
  if (USE_API_MOCKS) {
    await delay(200);
    const newFeedback = {
      id: `feedback-${Date.now()}`,
      message,
      createdAt: new Date().toISOString(),
      userId: userId || "user-1",
      username: username,
    };
    
    // Save to localStorage for mock
    const existingFeedbacks = JSON.parse(localStorage.getItem("bookverse_feedbacks") || "[]");
    existingFeedbacks.push(newFeedback);
    localStorage.setItem("bookverse_feedbacks", JSON.stringify(existingFeedbacks));
    
    return newFeedback;
  }

  try {
    return await apiRequest("/api/Feedback/create-feedback", {
      method: "POST",
      body: {
        Message: message,
      },
    });
  } catch (err) {
    if (err.status === 404) {
      console.warn("Feedback API endpoint not available, using localStorage fallback");
      // Fallback to localStorage
      const newFeedback = {
        id: `feedback-${Date.now()}`,
        message,
        createdAt: new Date().toISOString(),
        userId: userId || "user-1",
        username: username,
      };
      
      const existingFeedbacks = JSON.parse(localStorage.getItem("bookverse_feedbacks") || "[]");
      existingFeedbacks.push(newFeedback);
      localStorage.setItem("bookverse_feedbacks", JSON.stringify(existingFeedbacks));
      
      return newFeedback;
    }
    throw err;
  }
}

/**
 * Get all feedbacks for admin
 * @param {Object} parameters - Query parameters (pageNumber, pageSize, etc.)
 * @returns {Promise<Object>}
 */
export async function getAllFeedbacksForAdmin(parameters = {}) {
  if (USE_API_MOCKS) {
    await delay(200);
    const feedbacks = JSON.parse(localStorage.getItem("bookverse_feedbacks") || "[]");
    
    // Sort by date (newest first)
    feedbacks.sort((a, b) => new Date(b.createdAt || b.CreatedAt) - new Date(a.createdAt || a.CreatedAt));
    
    const pageNumber = parameters.pageNumber || 1;
    const pageSize = parameters.pageSize || 20;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      Items: feedbacks.slice(startIndex, endIndex),
      TotalCount: feedbacks.length,
      PageNumber: pageNumber,
      PageSize: pageSize,
    };
  }

  const queryParams = new URLSearchParams();
  if (parameters.pageNumber) queryParams.append("pageNumber", parameters.pageNumber);
  if (parameters.pageSize) queryParams.append("pageSize", parameters.pageSize);
  
  const queryString = queryParams.toString();
  const path = `/api/Admin/feedbacks${queryString ? `?${queryString}` : ""}`;
  
  try {
    return await apiRequest(path, {
      method: "GET",
    });
  } catch (err) {
    if (err.status === 404) {
      console.warn("Feedbacks API endpoint not available, using localStorage fallback");
      // Fallback to localStorage
      const feedbacks = JSON.parse(localStorage.getItem("bookverse_feedbacks") || "[]");
      feedbacks.sort((a, b) => new Date(b.createdAt || b.CreatedAt) - new Date(a.createdAt || a.CreatedAt));
      
      const pageNumber = parameters.pageNumber || 1;
      const pageSize = parameters.pageSize || 20;
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        Items: feedbacks.slice(startIndex, endIndex),
        TotalCount: feedbacks.length,
        PageNumber: pageNumber,
        PageSize: pageSize,
      };
    }
    throw err;
  }
}

/**
 * Delete feedback as admin
 * @param {string} feedbackId - The feedback ID to delete
 * @returns {Promise<Object>}
 */
export async function deleteFeedbackAsAdmin(feedbackId) {
  if (USE_API_MOCKS) {
    await delay(150);
    const feedbacks = JSON.parse(localStorage.getItem("bookverse_feedbacks") || "[]");
    const filtered = feedbacks.filter(f => f.id !== feedbackId && f.Id !== feedbackId);
    localStorage.setItem("bookverse_feedbacks", JSON.stringify(filtered));
    return { id: feedbackId };
  }

  try {
    return await apiRequest(`/api/Admin/feedbacks/${feedbackId}`, {
      method: "DELETE",
    });
  } catch (err) {
    if (err.status === 404) {
      // Fallback to localStorage
      const feedbacks = JSON.parse(localStorage.getItem("bookverse_feedbacks") || "[]");
      const filtered = feedbacks.filter(f => f.id !== feedbackId && f.Id !== feedbackId);
      localStorage.setItem("bookverse_feedbacks", JSON.stringify(filtered));
      return { id: feedbackId };
    }
    throw err;
  }
}

