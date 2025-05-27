// fan-server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const User = require("./models/User");
const app = require("./app");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Simple online users tracking
const onlineUsers = new Map();

// Socket authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('name profilePicture');
    
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = decoded.id;
    socket.user = user;
    next();
  } catch (err) {
    console.error("Socket auth error:", err);
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  
  // Add user to online users
  onlineUsers.set(userId, {
    socketId: socket.id,
    user: socket.user,
    lastSeen: new Date()
  });

  console.log(`✅ User connected: ${socket.user.name} (${userId})`);

  socket.on("send_message", async (data) => {
    try {
      const { receiverId, content } = data;
      const senderId = socket.userId;

      // Validation
      if (!receiverId || !content || content.trim().length === 0) {
        socket.emit("message_error", { error: "Invalid message data" });
        return;
      }

      if (content.length > 500) {
        socket.emit("message_error", { error: "Message too long" });
        return;
      }

      // Check if receiver exists
      const receiver = await User.findById(receiverId).select('name profilePicture');
      if (!receiver) {
        socket.emit("message_error", { error: "Receiver not found" });
        return;
      }

      // Create message
      const newMessage = new Message({ 
        senderId, 
        receiverId, 
        content: content.trim() 
      });
      
      const savedMessage = await newMessage.save();
      await savedMessage.populate("senderId", "name profilePicture");
      await savedMessage.populate("receiverId", "name profilePicture");

      const messageObj = savedMessage.toObject();

      // Send to receiver if online
      const receiverInfo = onlineUsers.get(receiverId);
      if (receiverInfo) {
        io.to(receiverInfo.socketId).emit("receive_message", messageObj);
      }

      // Confirm to sender
      socket.emit("message_sent", messageObj);

      console.log(`📨 Message sent: ${socket.user.name} -> ${receiver.name}`);
    } catch (err) {
      console.error("❌ send_message error:", err);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", (reason) => {
    onlineUsers.delete(userId);
    console.log(`❌ User disconnected: ${socket.user.name} (${reason})`);
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Cleanup disconnected users every 5 minutes
setInterval(() => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  for (const [userId, userInfo] of onlineUsers.entries()) {
    if (userInfo.lastSeen < fiveMinutesAgo) {
      onlineUsers.delete(userId);
    }
  }
  
  console.log(`🧹 Online users cleaned. Current: ${onlineUsers.size} users`);
}, 5 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});