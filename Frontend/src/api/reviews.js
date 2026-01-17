import axiosClient from './axiosClient';

/**
 * Get all reviews for a specific book
 * @param {string} bookId - The book ID
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Page size (default: 20)
 * @returns {Promise<PagedResult<BookReviewDto>>}
 */
export const getReviewsByBookId = async (bookId, pageNumber = 1, pageSize = 20) => {
  try {
    const response = await axiosClient.get('/reviews/get-all-reviews', {
      params: { bookId, pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

/**
 * Get a single review by ID
 * @param {string} reviewId - The review ID
 * @returns {Promise<BookReviewDto>}
 */
export const getReviewById = async (reviewId) => {
  try {
    const response = await axiosClient.get(`/reviews/get-review-by-id/${reviewId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

/**
 * Create a new review for a book
 * @param {Object} data - Review data
 * @param {string} data.bookId - The book ID
 * @param {number} data.rating - Rating (1-5)
 * @param {string} data.reviewText - Review comment/text
 * @returns {Promise<string>} - The created review ID
 */
export const createReview = async (data) => {
  try {
    const response = await axiosClient.post('/reviews/create-book-review', {
      bookId: data.bookId,
      rating: data.rating,
      reviewText: data.reviewText,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

/**
 * Update an existing review
 * @param {string} reviewId - The review ID
 * @param {Object} data - Update data
 * @param {number} [data.rating] - New rating (1-5)
 * @param {string} [data.reviewText] - New review text
 * @returns {Promise<void>}
 */
export const updateReview = async (reviewId, data) => {
  try {
    await axiosClient.put(`/reviews/update-review/${reviewId}`, {
      rating: data.rating,
      reviewText: data.reviewText,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Delete a review
 * @param {string} reviewId - The review ID
 * @returns {Promise<void>}
 */
export const deleteReview = async (reviewId) => {
  try {
    await axiosClient.delete(`/reviews/delete-review/${reviewId}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/**
 * Get all reviews by a specific user
 * @param {string} userId - The user ID
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Page size (default: 20)
 * @returns {Promise<PagedResult<BookReviewDto>>}
 */
export const getReviewsByUserId = async (userId, pageNumber = 1, pageSize = 20) => {
  try {
    const response = await axiosClient.get('/reviews/get-all-reviews', {
      params: { userId, pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};
