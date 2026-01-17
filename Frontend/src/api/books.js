import axiosClient from './axiosClient';

/**
 * Get all books with pagination and optional search query
 * @param {number} pageNumber - Current page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 12, max: 50)
 * @param {string} query - Optional search query to filter books by title, author, or genre
 * @param {string} sortColumn - Optional column to sort by (e.g., 'CreatedAt', 'AverageRating', 'RatingCount')
 * @param {string} sortOrder - Sort order: 'asc' or 'desc' (default: 'desc')
 * @returns {Promise} - PagedResult with books data
 */
export const getAllBooks = async (pageNumber = 1, pageSize = 12, query = null, sortColumn = null, sortOrder = 'desc') => {
  try {
    const params = {
      pageNumber,
      pageSize: Math.min(pageSize, 1000), // Allow up to 1000 for HomePage
    };
    
    if (query) {
      params.query = query;
    }
    
    if (sortColumn) {
      params.sortColumn = sortColumn;
      params.sortOrder = sortOrder;
    }
    
    const response = await axiosClient.get('/books/get-all-books', { params });
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

/**
 * Add genres to a book
 * Endpoint: POST /api/books/{bookId}/genres
 * @param {string} bookId - Book ID
 * @param {string[]} genreIds - Array of genre IDs
 * @returns {Promise}
 */
export const addGenresToBook = async (bookId, genreIds) => {
  try {
    await axiosClient.post(`/books/${bookId}/genres`, genreIds);
  } catch (error) {
    console.error('Error adding genres to book:', error);
    throw error;
  }
};
