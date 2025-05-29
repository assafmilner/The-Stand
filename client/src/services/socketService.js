// client/src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    
  }

  connect(token) {
    if (this.isConnected && this.socket?.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001', {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  sendMessage(receiverId, content) {
    if (!this.isConnected || !this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('send_message', {
      receiverId,
      content,
      timestamp: new Date().toISOString()
    });
  }

  onReceiveMessage(callback) {
    if (!this.socket) return;
    this.socket.off('receive_message');
    this.socket.on('receive_message', callback);
  }

  onMessageSent(callback) {
    if (!this.socket) return;
    this.socket.off('message_sent');
    this.socket.on('message_sent', callback);
  }

  onMessageError(callback) {
    if (!this.socket) return;
    this.socket.off('message_error');
    this.socket.on('message_error', callback);
  }

  removeAllListeners() {
    if (!this.socket) return;
    this.socket.off('receive_message');
    this.socket.off('message_sent');
    this.socket.off('message_error');
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

const socketService = new SocketService();
export default socketService;