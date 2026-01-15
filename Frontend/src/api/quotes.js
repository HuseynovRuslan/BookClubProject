import axiosClient from './axiosClient';

/**
 * Get all quotes with pagination and optional filters
 * @param {number} pageNumber - Current page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 10)
 * @param {object} filters - Optional filters: { tag, userId, authorId, bookId }
 * @returns {Promise} - PagedResult with quotes data
 */
export const getAllQuotes = async (pageNumber = 1, pageSize = 10, filters = {}) => {
  try {
    const response = await axiosClient.get('/quotes/get-all-quotes', {
      params: {
        pageNumber,
        pageSize,
        Tag: filters.tag,
        UserId: filters.userId,
        AuthorId: filters.authorId,
        BookId: filters.bookId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
};

/**
 * Get current user's quotes
 * @param {number} pageNumber - Current page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 10)
 * @param {object} filters - Optional filters: { tag, authorId, bookId }
 * @returns {Promise} - PagedResult with quotes data
 */
export const getMyQuotes = async (pageNumber = 1, pageSize = 10, filters = {}) => {
  try {
    const response = await axiosClient.get('/quotes/get-my-quotes', {
      params: {
        pageNumber,
        pageSize,
        Tag: filters.tag,
        AuthorId: filters.authorId,
        BookId: filters.bookId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my quotes:', error);
    throw error;
  }
};

/**
 * Get quote by ID
 * @param {string} id - Quote ID
 * @returns {Promise<QuoteDto>} - Quote details
 */
export const getQuoteById = async (id) => {
  try {
    const response = await axiosClient.get(`/quotes/get-quote-by-id/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching quote details:', error);
    throw error;
  }
};

/**
 * Create a new quote
 * @param {object} data - Quote data: { text, bookId, authorId, tags }
 * @returns {Promise} - Created quote ID
 */
export const addQuote = async (data) => {
  try {
    const response = await axiosClient.post('/quotes/create-quote', {
      text: data.text,
      bookId: data.bookId,
      authorId: data.authorId,
      tags: data.tags || [],
    });
    return response.data;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
};

/**
 * Update an existing quote
 * @param {string} id - Quote ID
 * @param {object} data - Quote data: { text, tags }
 * @returns {Promise}
 */
export const updateQuote = async (id, data) => {
  try {
    const response = await axiosClient.put(`/quotes/update-quote/${id}`, {
      text: data.text,
      tags: data.tags || [],
    });
    return response.data;
  } catch (error) {
    console.error('Error updating quote:', error);
    throw error;
  }
};

/**
 * Delete a quote
 * @param {string} id - Quote ID
 * @returns {Promise}
 */
export const deleteQuote = async (id) => {
  try {
    const response = await axiosClient.delete(`/quotes/delete-quote/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting quote:', error);
    throw error;
  }
};

/**
 * Toggle like on a quote
 * @param {string} id - Quote ID
 * @returns {Promise<boolean>} - New like status (true = liked, false = unliked)
 */
export const toggleQuoteLike = async (id) => {
  try {
    const response = await axiosClient.post(`/quotes/toggle-quote-like/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error toggling quote like:', error);
    throw error;
  }
};
