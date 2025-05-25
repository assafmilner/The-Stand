const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const { getChatHistory, getChatList, getUnreadCount } = require("../controllers/messageController");

// Get chat history with specific user
router.get("/history/:otherUserId", authMiddleware, getChatHistory);

// Get list of users current user has chatted with
router.get("/chats", authMiddleware, getChatList);

// Get unread message count
router.get("/unread-count", authMiddleware, getUnreadCount);

module.exports = router;