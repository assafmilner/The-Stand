// fan-server/server.js - OPTIMIZED VERSION
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const User = require("./models/User");
const cache = require("./utils/cacheManager");
const app = require("./app");

const server = http.createServer(app);

// Optimized Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  upgradeTimeout: 3000,
  pingTimeout: 5000,
  pingInterval: 2000,
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true
});

// Enhanced online users management
class OnlineUsersManager {
  constructor() {
    this.users = new Map(); // userId -> { socketId, lastSeen, userInfo }
    this.sockets = new Map(); // socketId -> userId
    this.rooms = new Map(); // roomId -> Set of userIds
  }

  addUser(userId, socketId, userInfo = {}) {
    this.users.set(userId, {
      socketId,
      lastSeen: Date.now(),
      userInfo,
      connectedAt: Date.now()
    });
    this.sockets.set(socketId, userId);
    
    console.log(`✅ User online: ${userId} (${userInfo.name || 'Unknown'})`);
  }

  removeUser(socketId) {
    const userId = this.sockets.get(socketId);
    if (userId) {
      this.users.delete(userId);
      this.sockets.delete(socketId);
      
      // Remove from all rooms
      for (const [roomId, userSet] of this.rooms.entries()) {
        userSet.delete(userId);
        if (userSet.size === 0) {
          this.rooms.delete(roomId);
        }
      }
      
      console.log(`❌ User offline: ${userId}`);
    }
    return userId;
  }

  getUser(userId) {
    return this.users.get(userId);
  }

  getUserBySocket(socketId) {
    const userId = this.sockets.get(socketId);
    return userId ? this.users.get(userId) : null;
  }

  updateLastSeen(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.lastSeen = Date.now();
    }
  }

  isOnline(userId) {
    return this.users.has(userId);
  }

  getOnlineCount() {
    return this.users.size;
  }

  getOnlineUsers() {
    return Array.from(this.users.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }));
  }

  joinRoom(userId, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(userId);
  }

  leaveRoom(userId, roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(userId);
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  getRoomUsers(roomId) {
    return this.rooms.get(roomId) || new Set();
  }
}

const onlineUsers = new OnlineUsersManager();

// Rate limiting for socket events
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 30;

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimits = rateLimiter.get(userId) || { count: 0, windowStart: now };
  
  // Reset window if expired
  if (now - userLimits.windowStart > RATE_LIMIT_WINDOW) {
    userLimits.count = 0;
    userLimits.windowStart = now;
  }
  
  userLimits.count++;
  rateLimiter.set(userId, userLimits);
  
  return userLimits.count <= MAX_MESSAGES_PER_WINDOW;
}

// Enhanced JWT middleware for sockets
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user info for better tracking
    const user = await User.findById(decoded.id)
      .select('name profilePicture email')
      .lean();
    
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = decoded.id;
    socket.userInfo = user;
    next();
    
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication failed"));
  }
});

// Main socket connection handler
io.on("connection", async (socket) => {
  const userId = socket.userId;
  const userInfo = socket.userInfo;
  
  // Add user to online users
  onlineUsers.addUser(userId, socket.id, userInfo);
  
  // Join user to their personal room for direct messaging
  socket.join(`user_${userId}`);
  
  // Emit online status to contacts (optional feature)
  socket.broadcast.emit('user_online', {
    userId,
    name: userInfo.name,
    profilePicture: userInfo.profilePicture
  });

  // Handle ping for connection health
  socket.on('ping', () => {
    onlineUsers.updateLastSeen(userId);
    socket.emit('pong');
  });

  // Optimized message sending
  socket.on("send_message", async (data) => {
    try {
      const { receiverId, content, tempId } = data;
      
      // Rate limiting
      if (!checkRateLimit(userId)) {
        socket.emit("message_error", {
          error: "Rate limit exceeded",
          tempId
        });
        return;
      }

      // Input validation
      if (!receiverId || !content?.trim()) {
        socket.emit("message_error", {
          error: "Invalid message data",
          tempId
        });
        return;
      }

      // Check if receiver exists (with caching)
      const receiverCacheKey = `user_exists_${receiverId}`;
      let receiverExists = cache.get(receiverCacheKey);
      
      if (receiverExists === null) {
        receiverExists = await User.exists({ _id: receiverId });
        cache.set(receiverCacheKey, !!receiverExists, 60000); // Cache for 1 minute
      }
      
      if (!receiverExists) {
        socket.emit("message_error", {
          error: "Recipient not found",
          tempId
        });
        return;
      }

      // Create and save message
      const message = new Message({
        senderId: userId,
        receiverId,
        content: content.trim()
      });

      const savedMessage = await message.save();
      
      // Populate message with user data
      await savedMessage.populate("senderId", "name profilePicture");
      await savedMessage.populate("receiverId", "name profilePicture");

      const messageObj = savedMessage.toObject();
      messageObj.tempId = tempId; // Include tempId for client correlation

      // Update cache for both users
      const cacheKeys = [
        `chat_history_${userId}_${receiverId}`,
        `chat_history_${receiverId}_${userId}`,
        `recent_chats_${userId}`,
        `recent_chats_${receiverId}`
      ];
      
      // Invalidate cache patterns instead of specific keys for efficiency
      cache.invalidatePattern(`chat_history_${userId}_${receiverId}`);
      cache.invalidatePattern(`chat_history_${receiverId}_${userId}`);
      cache.invalidatePattern(`recent_chats_${userId}`);
      cache.invalidatePattern(`recent_chats_${receiverId}`);

      // Send to receiver if online
      const receiverUser = onlineUsers.getUser(receiverId);
      if (receiverUser) {
        io.to(receiverUser.socketId).emit("receive_message", messageObj);
        
        // Send notification if receiver is not in the chat room
        if (!socket.rooms.has(`chat_${userId}_${receiverId}`)) {
          io.to(receiverUser.socketId).emit("new_message_notification", {
            senderId: messageObj.senderId._id,
            senderName: messageObj.senderId.name,
            senderAvatar: messageObj.senderId.profilePicture,
            content: messageObj.content,
            timestamp: messageObj.createdAt,
            tempId
          });
        }
      }

      // Confirm message sent to sender
      socket.emit("message_sent", messageObj);
      
      // Update last seen
      onlineUsers.updateLastSeen(userId);

    } catch (error) {
      console.error("❌ send_message error:", error);
      socket.emit("message_error", {
        error: "Failed to send message",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        tempId: data.tempId
      });
    }
  });

  // Join chat room for real-time presence
  socket.on("join_chat", ({ otherUserId }) => {
    if (otherUserId) {
      const roomId = `chat_${[userId, otherUserId].sort().join('_')}`;
      socket.join(roomId);
      onlineUsers.joinRoom(userId, roomId);
      
      // Notify other user about presence
      const otherUser = onlineUsers.getUser(otherUserId);
      if (otherUser) {
        io.to(otherUser.socketId).emit("user_joined_chat", {
          userId,
          name: userInfo.name
        });
      }
    }
  });

  // Leave chat room
  socket.on("leave_chat", ({ otherUserId }) => {
    if (otherUserId) {
      const roomId = `chat_${[userId, otherUserId].sort().join('_')}`;
      socket.leave(roomId);
      onlineUsers.leaveRoom(userId, roomId);
      
      // Notify other user about leaving
      const otherUser = onlineUsers.getUser(otherUserId);
      if (otherUser) {
        io.to(otherUser.socketId).emit("user_left_chat", {
          userId,
          name: userInfo.name
        });
      }
    }
  });

  // Typing indicators
  socket.on("typing_start", ({ receiverId }) => {
    const receiverUser = onlineUsers.getUser(receiverId);
    if (receiverUser) {
      io.to(receiverUser.socketId).emit("user_typing", {
        userId,
        name: userInfo.name
      });
    }
  });

  socket.on("typing_stop", ({ receiverId }) => {
    const receiverUser = onlineUsers.getUser(receiverId);
    if (receiverUser) {
      io.to(receiverUser.socketId).emit("user_stopped_typing", {
        userId
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`🔌 User disconnected: ${userId} (${reason})`);
    
    const removedUserId = onlineUsers.removeUser(socket.id);
    
    if (removedUserId) {
      // Notify contacts about offline status
      socket.broadcast.emit('user_offline', {
        userId: removedUserId,
        name: userInfo.name
      });
    }
  });

  // Error handling
  socket.on("error", (error) => {
    console.error(`❌ Socket error for user ${userId}:`, error);
  });
});

// Health check endpoint for socket server
app.get('/socket-health', (req, res) => {
  const stats = {
    onlineUsers: onlineUsers.getOnlineCount(),
    totalConnections: io.engine.clientsCount,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: cache.getStats()
  };
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stats
  });
});

// Periodic cleanup and maintenance
setInterval(() => {
  // Clean up rate limiter
  const now = Date.now();
  for (const [userId, limits] of rateLimiter.entries()) {
    if (now - limits.windowStart > RATE_LIMIT_WINDOW * 2) {
      rateLimiter.delete(userId);
    }
  }
  
  // Log server stats
  console.log(`📊 Server Stats - Online: ${onlineUsers.getOnlineCount()}, Connections: ${io.engine.clientsCount}`);
}, 60000); // Every minute

// Graceful shutdown
const shutdown = () => {
  console.log('🔄 Shutting down socket server...');
  
  // Close all socket connections
  io.close(() => {
    console.log('✅ Socket server closed');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Optimized server running on http://localhost:${PORT}`);
  console.log(`📊 Cache enabled, Socket.IO optimized, Rate limiting active`);
});

module.exports = { server, io, onlineUsers };