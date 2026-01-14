import axiosClient from './axiosClient';

/**
 * Get all books with pagination
 * @param {number} pageNumber - Current page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 12)
 * @returns {Promise} - PagedResult with books data
 */
export const getAllBooks = async (pageNumber = 1, pageSize = 12) => {
  try {
    const response = await axiosClient.get('/books/get-all-books', {
      params: {
        pageNumber,
        pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

/**
 * Get book by ID
 * @param {string} id - Book ID
 * @returns {Promise<BookDetailDto>} - Book details
 */
export const getBookById = async (id) => {
  try {
    const response = await axiosClient.get(`/books/get-book-by-id/${id}`);
    // Response structure: { data: BookDetailDto, message: string }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

/**
 * Get reviews for a specific book
 * @param {string} bookId - Book ID
 * @param {number} pageNumber - Page number
 * @param {number} pageSize - Page size
 * @returns {Promise} - PagedResult with reviews
 */
export const getBookReviews = async (bookId, pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axiosClient.get(`/books/${bookId}/reviews`, {
      params: {
        pageNumber,
        pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching book reviews:', error);
    throw error;
  }
};

/**
 * Get books by genre
 * @param {number} pageNumber - Page number
 * @param {number} pageSize - Page size
 * @returns {Promise} - PagedResult with books
 */
export const getBooksByGenre = async (pageNumber = 1, pageSize = 12) => {
  try {
    const response = await axiosClient.get('/books/by-genre', {
      params: {
        pageNumber,
        pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching books by genre:', error);
    throw error;
  }
};

/**
 * Update book status (add to default shelf)
 * Endpoint: POST /api/books/{bookId}/status?targetShelfName={shelfName}
 * @param {string} bookId - Book ID
 * @param {string} targetShelfName - Shelf name: "Read", "Want to Read", or "Currently Reading"
 * @returns {Promise}
 */
export const updateBookStatus = async (bookId, targetShelfName) => {
  try {
    await axiosClient.post(`/books/${bookId}/status`, null, {
      params: {
        targetShelfName,
      },
    });
  } catch (error) {
    console.error('Error updating book status:', error);
    throw error;
  }
};
