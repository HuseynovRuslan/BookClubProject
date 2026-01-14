import axiosClient from './axiosClient';

/**
 * Get list of conversations
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise<PagedResult<ConversationDto>>}
 */
export const getConversations = async (pageNumber = 1, pageSize = 20) => {
  try {
    const response = await axiosClient.get('/messages/get-conversations', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get messages with a specific user
 * @param {string} otherUserId - The other user's ID
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise<PagedResult<MessageDto>>}
 */
export const getMessages = async (otherUserId, pageNumber = 1, pageSize = 50) => {
  try {
    const response = await axiosClient.get(`/messages/get-messages/${otherUserId}`, {
      params: { pageNumber, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a message to another user
 * @param {string} receiverId - The receiver's user ID
 * @param {string} text - The message text
 * @returns {Promise<MessageDto>}
 */
export const sendMessage = async (receiverId, text) => {
  try {
    console.log('Sending message to:', receiverId, 'text:', text);
    const response = await axiosClient.post('/messages/send-message', {
      ReceiverId: receiverId,
      Text: text,
    });
    console.log('Message sent successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error sending message:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Mark a message as read
 * @param {string} messageId
 * @returns {Promise}
 */
export const markAsRead = async (messageId) => {
  try {
    await axiosClient.post(`/messages/mark-as-read/${messageId}`);
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} messageId
 * @returns {Promise}
 */
export const deleteMessage = async (messageId) => {
  try {
    await axiosClient.delete(`/messages/delete-message/${messageId}`);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Edit a message
 * @param {string} messageId
 * @param {string} text
 * @returns {Promise<MessageDto>}
 */
export const editMessage = async (messageId, text) => {
  try {
    const response = await axiosClient.put(`/messages/edit-message/${messageId}`, {
      text,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

/**
 * Delete a conversation
 * @param {string} conversationId
 * @returns {Promise}
 */
export const deleteConversation = async (conversationId) => {
  try {
    await axiosClient.delete(`/messages/delete-conversation/${conversationId}`);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

/**
 * Start or get a conversation with a user
 * @param {string} targetUserId - The ID of the user to start a conversation with
 * @returns {Promise<Object>} - The conversation object or user info
 */
export const startConversation = async (targetUserId) => {
  try {
    // Try to get existing conversations
    const conversations = await getConversations(1, 100);
    
    // Extract items from the response (could be data.items, items, or data)
    let conversationList = [];
    if (Array.isArray(conversations)) {
      conversationList = conversations;
    } else if (Array.isArray(conversations?.data)) {
      conversationList = conversations.data;
    } else if (Array.isArray(conversations?.items)) {
      conversationList = conversations.items;
    }
    
    // Find existing conversation with this user
    const existingConversation = conversationList.find(
      conv => conv.otherUser?.id === targetUserId
    );
    
    if (existingConversation) {
      return {
        conversationId: existingConversation.id,
        otherUserId: targetUserId,
        exists: true
      };
    }
    
    // No existing conversation found, return info to start a new one
    return {
      otherUserId: targetUserId,
      exists: false
    };
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
};