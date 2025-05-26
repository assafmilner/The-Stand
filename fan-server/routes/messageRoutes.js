// fan-server/routes/messageRoutes.js - SIMPLIFIED AND COMPATIBLE VERSION
const express = require("express");
const router = express.Router();
const {
  getChatHistory,
  sendMessage,
  getRecentChats,
  searchMessages,
  markMessagesAsRead,
  getUnreadCount,
  deleteMessage,
  editMessage,
  addReaction,
  getMessageStats
} = require("../controllers/messageController");

const auth = require("../middlewares/auth");

// Basic validation helper
const validateObjectId = (id) => {
  return id && id.match(/^[0-9a-fA-F]{24}$/);
};

// ===== CORE ROUTES (Your existing functionality) =====

// Get chat history between user and another user
router.get("/history/:otherUserId", auth, getChatHistory);

// Send a new message
router.post("/", auth, sendMessage);

// Get recent conversations
router.get("/recent", auth, getRecentChats);

// ===== ENHANCED ROUTES (New functionality) =====

// Search messages
router.get("/search", auth, searchMessages);

// Mark specific message as read
router.put("/:messageId/read", auth, (req, res, next) => {
  if (!validateObjectId(req.params.messageId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid message ID format"
    });
  }
  next();
}, markMessagesAsRead);

// Mark all messages in conversation as read
router.put("/conversation/:otherUserId/read", auth, (req, res, next) => {
  if (!validateObjectId(req.params.otherUserId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid user ID format"
    });
  }
  next();
}, markMessagesAsRead);

// Get unread message count
router.get("/unread-count", auth, getUnreadCount);

// Delete a message (soft delete)
router.delete("/:messageId", auth, (req, res, next) => {
  if (!validateObjectId(req.params.messageId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid message ID format"
    });
  }
  next();
}, deleteMessage);

// Edit a message
router.put("/:messageId", auth, (req, res, next) => {
  if (!validateObjectId(req.params.messageId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid message ID format"
    });
  }
  
  if (!req.body.content || !req.body.content.trim()) {
    return res.status(400).json({
      success: false,
      error: "Message content is required"
    });
  }
  
  next();
}, editMessage);

// Add reaction to a message
router.post("/:messageId/reaction", auth, (req, res, next) => {
  if (!validateObjectId(req.params.messageId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid message ID format"
    });
  }
  
  if (!req.body.emoji || !req.body.emoji.trim()) {
    return res.status(400).json({
      success: false,
      error: "Emoji is required"
    });
  }
  
  next();
}, addReaction);

// Get message statistics (optional - for admin/analytics)
router.get("/stats", auth, getMessageStats);

module.exports = router;