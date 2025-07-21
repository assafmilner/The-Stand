// ### Entry Point: Server with Express + Socket.IO
// Initializes HTTP server, WebSocket handling, JWT-based socket authentication,
// real-time chat messaging, and online user tracking.

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const User = require("./models/User");
const app = require("./app");

// Create HTTP server
const server = http.createServer(app);
require("dotenv").config();
console.log("CLIENT_URL =", process.env.CLIENT_URL);

// Determine allowed origin for CORS
const origin = (() => {
  const envOrigin =
    process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "*";
  if (!envOrigin || envOrigin === "/:" || envOrigin.trim() === "") {
    console.warn("CLIENT_URL missing or invalid – falling back to '*'");
    return "*";
  }
  return envOrigin;
})();

// Initialize Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track connected users
const onlineUsers = new Map();

// Socket authentication middleware (JWT)
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name profilePicture");

    if (!user) return next(new Error("User not found"));

    socket.userId = decoded.id;
    socket.user = user;
    next();
  } catch (err) {
    console.error("Socket auth error:", err);
    next(new Error("Invalid token"));
  }
});

// Handle socket connection
io.on("connection", (socket) => {
  const userId = socket.userId;

  // Register user as online
  onlineUsers.set(userId, {
    socketId: socket.id,
    user: socket.user,
    lastSeen: new Date(),
  });

  // Handle sending messages
  socket.on("send_message", async ({ receiverId, content }) => {
    try {
      const senderId = socket.userId;

      if (!receiverId || !content || content.trim().length === 0) {
        return socket.emit("message_error", { error: "Invalid message data" });
      }

      if (content.length > 500) {
        return socket.emit("message_error", { error: "Message too long" });
      }

      const receiver = await User.findById(receiverId).select(
        "name profilePicture"
      );
      if (!receiver) {
        return socket.emit("message_error", { error: "Receiver not found" });
      }

      const newMessage = new Message({
        senderId,
        receiverId,
        content: content.trim(),
      });

      const savedMessage = await newMessage.save();
      await savedMessage.populate("senderId", "name profilePicture");
      await savedMessage.populate("receiverId", "name profilePicture");

      const messageObj = savedMessage.toObject();

      const receiverInfo = onlineUsers.get(receiverId);
      if (receiverInfo) {
        io.to(receiverInfo.socketId).emit("receive_message", messageObj);
      }

      socket.emit("message_sent", messageObj);
    } catch (err) {
      console.error("send_message error:", err);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
  });

  // Handle socket-level errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Periodic cleanup of stale connections
setInterval(() => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  for (const [userId, userInfo] of onlineUsers.entries()) {
    if (userInfo.lastSeen < fiveMinutesAgo) {
      onlineUsers.delete(userId);
    }
  }
}, 5 * 60 * 1000);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
