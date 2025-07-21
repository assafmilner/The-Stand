// ### Module: SocketService
// A singleton class to manage WebSocket communication using socket.io-client.
// Handles initialization, reconnection, sending messages, and event subscriptions.

import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // ### Method: connect
  // Establishes a socket connection using an auth token.
  // Includes reconnection logic and returns a promise resolved on success.
  connect(token) {
    if (this.isConnected && this.socket?.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.disconnect();
      }

      const serverUrl = process.env.REACT_APP_SOCKET_URL || " ";

      this.socket = io(serverUrl, {
        auth: { token },
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        this.isConnected = true;
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        this.isConnected = false;
        reject(error);
      });

      this.socket.on("disconnect", () => {
        this.isConnected = false;
      });
    });
  }

  // ### Method: disconnect
  // Closes the current socket connection and resets internal state.
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  // ### Method: sendMessage
  // Emits a message event to the server with receiver ID and message content.
  sendMessage(receiverId, content) {
    if (!this.isConnected || !this.socket) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("send_message", {
      receiverId,
      content,
      timestamp: new Date().toISOString(),
    });
  }

  // ### Method: onReceiveMessage
  // Registers a listener for receiving messages from the server.
  onReceiveMessage(callback) {
    if (!this.socket) return;
    this.socket.off("receive_message");
    this.socket.on("receive_message", callback);
  }

  // ### Method: onMessageSent
  // Registers a listener for confirmation that a message was sent.
  onMessageSent(callback) {
    if (!this.socket) return;
    this.socket.off("message_sent");
    this.socket.on("message_sent", callback);
  }

  // ### Method: onMessageError
  // Registers a listener for message send errors.
  onMessageError(callback) {
    if (!this.socket) return;
    this.socket.off("message_error");
    this.socket.on("message_error", callback);
  }

  // ### Method: removeAllListeners
  // Unsubscribes from all message-related socket events.
  removeAllListeners() {
    if (!this.socket) return;
    this.socket.off("receive_message");
    this.socket.off("message_sent");
    this.socket.off("message_error");
  }

  // ### Method: isSocketConnected
  // Returns a boolean indicating whether the socket is connected.
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// ### Export: Singleton instance of SocketService
const socketService = new SocketService();
export default socketService;
