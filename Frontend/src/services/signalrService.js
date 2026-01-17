import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.notificationConnection = null;
    this.isConnected = false;
    this.isNotificationConnected = false;
    this.messageHandlers = [];
    this.userStatusHandlers = [];
    this.messageReadHandlers = [];
    this.onlineUsersListHandlers = [];
    this.notificationHandlers = [];
  }

  /**
   * Start SignalR connection
   */
  async startConnection() {
    if (this.connection && this.isConnected) {
      // Request online users list again for new subscribers
      try {
        const onlineUsers = await this.connection.invoke('GetOnlineUsers');
        this.onlineUsersListHandlers.forEach((handler) => handler(onlineUsers || []));
      } catch (e) {
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:7050';
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/messages`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry intervals
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up event handlers
    this.setupEventHandlers();

    try {
      await this.connection.start();
      this.isConnected = true;
      
      // Request online users after connection is fully established
      setTimeout(async () => {
        try {
          const onlineUsers = await this.connection.invoke('GetOnlineUsers');
          this.onlineUsersListHandlers.forEach((handler) => handler(onlineUsers || []));
        } catch (e) {
          // GetOnlineUsers may not be available - ignore
        }
      }, 100);
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      this.isConnected = false;
    }

    // Handle reconnection events
    this.connection.onreconnecting(() => {
      this.isConnected = false;
    });

    this.connection.onreconnected(() => {
      this.isConnected = true;
    });

    this.connection.onclose(() => {
      this.isConnected = false;
    });

    // Start notification hub connection
    await this.startNotificationConnection();
  }

  /**
   * Start SignalR notification connection
   */
  async startNotificationConnection() {
    if (this.notificationConnection && this.isNotificationConnected) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:7050';
    this.notificationConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up notification event handlers
    this.setupNotificationEventHandlers();

    try {
      await this.notificationConnection.start();
      this.isNotificationConnected = true;
    } catch (error) {
      console.error('SignalR Notification Connection Error:', error);
      this.isNotificationConnected = false;
    }

    // Handle reconnection events
    this.notificationConnection.onreconnecting(() => {
      this.isNotificationConnected = false;
    });

    this.notificationConnection.onreconnected(() => {
      this.isNotificationConnected = true;
    });

    this.notificationConnection.onclose(() => {
      this.isNotificationConnected = false;
    });
  }

  /**
   * Setup event handlers for notification hub
   */
  setupNotificationEventHandlers() {
    if (!this.notificationConnection) return;

    // Handle incoming notifications
    this.notificationConnection.on('ReceiveNotification', (notification) => {
      this.notificationHandlers.forEach((handler) => handler(notification));
    });
  }

  /**
   * Setup event handlers for incoming messages
   */
  setupEventHandlers() {
    if (!this.connection) return;

    // Handle incoming messages (direct to user)
    this.connection.on('ReceiveMessage', (message) => {
      this.messageHandlers.forEach((handler) => handler(message));
    });

    // Handle new messages in group
    this.connection.on('NewMessage', (message) => {
      this.messageHandlers.forEach((handler) => handler(message));
    });

    // Handle user online status
    this.connection.on('UserOnline', (userId) => {
      this.userStatusHandlers.forEach((handler) => handler(userId, true));
    });

    // Handle user offline status
    this.connection.on('UserOffline', (userId) => {
      this.userStatusHandlers.forEach((handler) => handler(userId, false));
    });

    // Handle message read notification
    this.connection.on('MessageRead', (data) => {
      this.messageReadHandlers.forEach((handler) => handler(data));
    });

    // Handle initial online users list (sent when connecting)
    this.connection.on('OnlineUsersList', (userIds) => {
      this.onlineUsersListHandlers.forEach((handler) => handler(userIds));
    });
  }

  /**
   * Stop SignalR connection
   */
  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        // Ignore stop errors
      }
      this.isConnected = false;
    }

    if (this.notificationConnection) {
      try {
        await this.notificationConnection.stop();
      } catch (error) {
        // Ignore stop errors
      }
      this.isNotificationConnected = false;
    }
  }

  /**
   * Join a conversation group
   * @param {string} otherUserId - The other user's ID
   */
  async joinConversation(otherUserId) {
    // Wait for connection if not ready (max 3 seconds)
    let attempts = 0;
    while ((!this.connection || !this.isConnected) && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!this.connection || !this.isConnected) {
      return;
    }

    try {
      await this.connection.invoke('JoinConversation', otherUserId);
    } catch (error) {
      // Ignore join errors
    }
  }

  /**
   * Leave a conversation group
   * @param {string} otherUserId - The other user's ID
   */
  async leaveConversation(otherUserId) {
    if (!this.connection || !this.isConnected) {
      return;
    }

    try {
      await this.connection.invoke('LeaveConversation', otherUserId);
    } catch (error) {
      // Ignore leave errors
    }
  }

  /**
   * Register a handler for incoming messages
   * @param {Function} handler - Callback function (message) => void
   * @returns {Function} - Unsubscribe function
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Register a handler for user status changes
   * @param {Function} handler - Callback function (userId, isOnline) => void
   * @returns {Function} - Unsubscribe function
   */
  onUserStatus(handler) {
    this.userStatusHandlers.push(handler);
    return () => {
      this.userStatusHandlers = this.userStatusHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Register a handler for message read events
   * @param {Function} handler - Callback function (data) => void
   * @returns {Function} - Unsubscribe function
   */
  onMessageRead(handler) {
    this.messageReadHandlers.push(handler);
    return () => {
      this.messageReadHandlers = this.messageReadHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Register a handler for initial online users list
   * @param {Function} handler - Callback function (userIds[]) => void
   * @returns {Function} - Unsubscribe function
   */
  onOnlineUsersList(handler) {
    this.onlineUsersListHandlers.push(handler);
    return () => {
      this.onlineUsersListHandlers = this.onlineUsersListHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Register a handler for incoming notifications
   * @param {Function} handler - Callback function (notification) => void
   * @returns {Function} - Unsubscribe function
   */
  onNotification(handler) {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Get connection state
   */
  getConnectionState() {
    return this.isConnected && this.isNotificationConnected;
  }
}

// Export singleton instance
const signalRService = new SignalRService();
export default signalRService;
