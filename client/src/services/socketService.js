// client/src/services/socketService.js - OPTIMIZED VERSION
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.listeners = new Map();
    this.messageQueue = []; // Queue for offline messages
    this.connectionPromise = null; // Prevent multiple connection attempts
    this.heartbeatInterval = null;
    this.lastActivity = Date.now();
  }

  connect(token) {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Return resolved promise if already connected
    if (this.isConnected && this.socket?.connected) {
      return Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;

        // Clean up existing socket
        if (this.socket) {
          this.socket.removeAllListeners();
          this.socket.disconnect();
        }

        this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001', {
          auth: { token },
          autoConnect: false,
          reconnection: false, // We'll handle reconnection manually
          timeout: 5000, // Reduced timeout for faster failure detection
          forceNew: true,
          transports: ['websocket', 'polling'] // Prioritize websocket
        });

        // Connection successful
        this.socket.on('connect', () => {
          console.log('✅ Socket connected:', this.socket.id);
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          
          // Process queued messages
          this.processMessageQueue();
          
          // Start heartbeat
          this.startHeartbeat();
          
          resolve();
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error.message);
          this.handleConnectionFailure();
          reject(error);
        });

        // Disconnection
        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Socket disconnected:', reason);
          this.isConnected = false;
          this.stopHeartbeat();
          
          // Auto-reconnect for client-side disconnections
          if (reason === 'io client disconnect') return;
          
          this.scheduleReconnect(token);
        });

        // Efficient event handling
        this.socket.on('receive_message', (message) => {
          this.updateActivity();
          this.emit('message_received', message);
        });

        this.socket.on('message_sent', (message) => {
          this.updateActivity();
          this.emit('message_sent_confirmed', message);
        });

        this.socket.on('message_error', (error) => {
          this.emit('message_send_error', error);
        });

        this.socket.on('new_message_notification', (notification) => {
          this.emit('notification_received', notification);
        });

        // Connect
        this.socket.connect();

      } catch (error) {
        console.error('❌ Socket setup error:', error);
        this.handleConnectionFailure();
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  disconnect() {
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    this.connectionPromise = null;
    this.listeners.clear();
    this.messageQueue = [];
  }

  // Optimized message sending with queue support
  sendMessage(receiverId, content) {
    const messageData = {
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (!this.isConnected || !this.socket?.connected) {
      // Queue message for when connection is restored
      this.messageQueue.push(messageData);
      console.warn('⚠️ Message queued - socket disconnected');
      return messageData.tempId;
    }

    this.socket.emit('send_message', messageData);
    this.updateActivity();
    return messageData.tempId;
  }

  // Process queued messages when connection is restored
  processMessageQueue() {
    if (this.messageQueue.length === 0) return;
    
    console.log(`📤 Processing ${this.messageQueue.length} queued messages`);
    
    this.messageQueue.forEach(messageData => {
      this.socket.emit('send_message', messageData);
    });
    
    this.messageQueue = [];
  }

  // Efficient event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Connection management
  handleConnectionFailure() {
    this.isConnected = false;
    this.isConnecting = false;
    this.connectionPromise = null;
  }

  scheduleReconnect(token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect(token).catch(console.error);
      }
    }, delay);
  }

  // Heartbeat to detect connection issues
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  // Public methods for components
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null,
      queuedMessages: this.messageQueue.length,
      lastActivity: this.lastActivity
    };
  }

  // Force reconnection
  async reconnect(token) {
    console.log('🔄 Manual reconnection triggered');
    this.disconnect();
    return this.connect(token);
  }

  // Cleanup method for React components
  cleanup() {
    this.listeners.clear();
  }
}

// Export singleton instance
const socketService = new SocketService();

// Global error handling
window.addEventListener('beforeunload', () => {
  socketService.disconnect();
});

export default socketService;