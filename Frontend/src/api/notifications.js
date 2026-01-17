import axiosClient from './axiosClient';

/**
 * Get notifications with pagination
 * @param {number} page - Page number (default 1)
 * @param {number} pageSize - Page size (default 20)
 * @returns {Promise<PagedResult<NotificationDto>>}
 */
export const getNotifications = async (page = 1, pageSize = 20) => {
  try {
    const response = await axiosClient.get('/notifications', {
      params: { 
        pageNumber: page, 
        pageSize 
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 * @returns {Promise<number>}
 */
export const getUnreadCount = async () => {
  try {
    const response = await axiosClient.get('/notifications/unread-count');
    return response.data?.data || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} id - Notification ID
 * @returns {Promise<boolean>}
 */
export const markAsRead = async (id) => {
  try {
    const response = await axiosClient.post(`/notifications/${id}/mark-as-read`);
    return response.data?.data || false;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<number>} - Count of notifications marked as read
 */
export const markAllAsRead = async () => {
  try {
    const response = await axiosClient.post('/notifications/mark-all-as-read');
    return response.data?.data || 0;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} id - Notification ID
 * @returns {Promise<boolean>}
 */
export const deleteNotification = async (id) => {
  try {
    const response = await axiosClient.delete(`/notifications/${id}`);
    return response.data?.data || false;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};
