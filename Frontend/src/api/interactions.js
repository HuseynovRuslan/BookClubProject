import axiosClient from './axiosClient';

/**
 * Toggle like for an entity (Quote, Review, or BookShelf)
 * @param {string} entityId - The ID of the entity to like/unlike
 * @param {string} entityType - The type of entity: "Quote", "Review", "BookShelf"
 * @returns {Promise<{isLiked: boolean, newCount: number}>}
 */
export const toggleLike = async (entityId, entityType) => {
    try {
        const response = await axiosClient.post('/likes/toggle', {
            EntityId: entityId,
            EntityType: entityType,
        });
        return response.data.data;
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
};

/**
 * Get comments for an entity
 * @param {string} targetId - The entity ID
 * @param {object} params - Pagination parameters
 * @returns {Promise<{items: Array, totalCount: number, pageNumber: number, pageSize: number}>}
 */
export const getComments = async (targetId, params = {}) => {
    try {
        const response = await axiosClient.get('/comments/get-all-comments', {
            params: { targetId, ...params },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};

/**
 * Add a comment to an entity
 * @param {string} targetId - The entity ID
 * @param {string} targetType - The entity type (Quote, Review, BookShelf)
 * @param {string} text - The comment text
 * @returns {Promise<string>} - The created comment ID
 */
export const addComment = async (targetId, targetType, text) => {
    try {
        const response = await axiosClient.post('/comments/create-comment', {
            text,
            targetId,
            targetType,
        });
        return response.data.data;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
};

/**
 * Update a comment
 * @param {string} commentId - The comment ID to update
 * @param {string} newText - The new comment text
 * @returns {Promise<void>}
 */
export const updateComment = async (commentId, newText) => {
    try {
        await axiosClient.put(`/comments/update-comment/${commentId}`, JSON.stringify(newText), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        throw error;
    }
};

/**
 * Delete a comment
 * @param {string} commentId - The comment ID to delete
 * @returns {Promise<void>}
 */
export const deleteComment = async (commentId) => {
    try {
        await axiosClient.delete(`/comments/delete-comment/${commentId}`);
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
};
