import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io('http://localhost:3001', {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  sendMessage(receiverId, content) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        receiverId,
        content
      });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message_sent', callback);
    }
  }

  onMessageError(callback) {
    if (this.socket) {
      this.socket.on('message_error', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners('receive_message');
      this.socket.removeAllListeners('message_sent');
      this.socket.removeAllListeners('message_error');
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;