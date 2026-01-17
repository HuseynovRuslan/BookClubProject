import axiosClient from './axiosClient';

/**
 * Get current user's shelves
 * Endpoint: GET /api/users/get-current-user-shelves
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Page size (default: 50 to get all shelves)
 * @returns {Promise} - PagedResult with user's shelves
 */
export const getUserShelves = async (pageNumber = 1, pageSize = 50) => {
  try {
    const response = await axiosClient.get('/users/get-current-user-shelves', {
      params: {
        pageNumber,
        pageSize,
      },
    });
    // Returns PagedResult<ShelfDto>
    return response.data;
  } catch (error) {
    console.error('Error fetching user shelves:', error);
    throw error;
  }
};

/**
 * Get shelf by ID
 * @param {string} shelfId - Shelf ID
 * @returns {Promise} - Shelf details with books
 */
export const getShelfById = async (shelfId) => {
  try {
    const response = await axiosClient.get(`/shelves/get-shelf-by-id/${shelfId}`);
    // Response structure: { data: ShelfDto, message: string }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching shelf:', error);
    throw error;
  }
};

/**
 * Create a new shelf
 * @param {Object} shelfData - { name: string }
 * @returns {Promise} - Created shelf
 */
export const createShelf = async (shelfData) => {
  try {
    const response = await axiosClient.post('/shelves/create-shelf', shelfData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating shelf:', error);
    throw error;
  }
};

/**
 * Update shelf
 * @param {Object} shelfData - { id: string, name: string }
 * @returns {Promise} - Updated shelf
 */
export const updateShelf = async (shelfData) => {
  try {
    // Backend expects { shelfId, name } not { id, name }
    const payload = {
      shelfId: shelfData.id,
      name: shelfData.name,
    };
    const response = await axiosClient.put('/shelves/update-shelf', payload);
    return response.data.data;
  } catch (error) {
    console.error('Error updating shelf:', error);
    throw error;
  }
};

/**
 * Delete shelf
 * @param {string} shelfId - Shelf ID
 * @returns {Promise}
 */
export const deleteShelf = async (shelfId) => {
  try {
    await axiosClient.delete(`/shelves/delete-shelf/${shelfId}`);
  } catch (error) {
    console.error('Error deleting shelf:', error);
    throw error;
  }
};

/**
 * Add book to shelf
 * Based on ShelvesController: POST /api/shelves/add-book-to-shelf/{shelfId}/books/{bookId}
 * @param {string} shelfId - Shelf ID
 * @param {string} bookId - Book ID
 * @returns {Promise}
 */
export const addBookToShelf = async (shelfId, bookId) => {
  try {
    const response = await axiosClient.post(
      `/shelves/add-book-to-shelf/${shelfId}/books/${bookId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error adding book to shelf:', error);
    throw error;
  }
};

/**
 * Remove book from shelf
 * @param {string} shelfId - Shelf ID
 * @param {string} bookId - Book ID
 * @returns {Promise}
 */
export const removeBookFromShelf = async (shelfId, bookId) => {
  try {
    await axiosClient.delete(
      `/shelves/remove-book-from-shelf/${shelfId}/books/${bookId}`
    );
  } catch (error) {
    console.error('Error removing book from shelf:', error);
    throw error;
  }
};

/**
 * Get shelves for a specific user by ID
 * @param {string} userId - User ID
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Page size (default: 50)
 * @returns {Promise} - PagedResult with user's shelves
 */
export const getUserShelvesById = async (userId, pageNumber = 1, pageSize = 50) => {
  try {
    const response = await axiosClient.get(`/users/${userId}/shelves`, {
      params: {
        pageNumber,
        pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user shelves:', error);
    throw error;
  }
};
