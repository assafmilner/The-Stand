// client/src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect(token) {
    // Prevent multiple connection attempts
    if (this.isConnected || this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        // Disconnect existing socket if any
        if (this.socket) {
          this.socket.disconnect();
        }

        this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001', {
          auth: { token },
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          timeout: 10000
        });

        // Connection successful
        this.socket.on('connect', () => {
          console.log('✅ Socket connected');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          this.isConnected = false;
          this.isConnecting = false;
          reject(error);
        });

        // Disconnection
        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Socket disconnected:', reason);
          this.isConnected = false;
          this.isConnecting = false;
        });

        // Reconnection attempts
        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`🔄 Reconnection attempt ${attemptNumber}`);
          this.reconnectAttempts = attemptNumber;
        });

        // Reconnection failed
        this.socket.on('reconnect_failed', () => {
          console.error('❌ Socket reconnection failed');
          this.isConnected = false;
          this.isConnecting = false;
        });

        // Actually connect
        this.socket.connect();

      } catch (error) {
        console.error('❌ Socket connection setup error:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.listeners.clear();
  }

  // Send message using your server's event name
  sendMessage(receiverId, content) {
    if (!this.isConnected || !this.socket) {
      console.error('❌ Cannot send message: Socket not connected');
      return;
    }

    const messageData = {
      receiverId, // Using your server's field name
      content,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('send_message', messageData); // Using your server's event name
  }

  // Listen for incoming messages using your server's event name
  onReceiveMessage(callback) {
    if (!this.socket) return;

    // Remove existing listener to prevent duplicates
    this.socket.off('receive_message');
    
    // Add new listener using your server's event name
    this.socket.on('receive_message', callback);
    this.listeners.set('receive_message', callback);
  }

  // Listen for message sent confirmation using your server's event name
  onMessageSent(callback) {
    if (!this.socket) return;

    this.socket.off('message_sent');
    this.socket.on('message_sent', callback); // Using your server's event name
    this.listeners.set('message_sent', callback);
  }

  // Listen for message errors using your server's event name
  onMessageError(callback) {
    if (!this.socket) return;

    this.socket.off('message_error');
    this.socket.on('message_error', callback); // Using your server's event name
    this.listeners.set('message_error', callback);
  }

  // Remove all listeners
  removeAllListeners() {
    if (!this.socket) return;

    // Remove specific listeners
    this.listeners.forEach((callback, event) => {
      this.socket.off(event);
    });
    
    this.listeners.clear();
  }

  // Check connection status
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null
    };
  }

  // Manually trigger reconnection
  reconnect(token) {
    if (this.isConnecting) return;
    
    console.log('🔄 Manual reconnection triggered');
    this.disconnect();
    return this.connect(token);
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;