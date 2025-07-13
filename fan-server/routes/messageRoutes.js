// fan-server/routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const {
  getChatHistory,
  sendMessage,
  getRecentChats,
  getUnseenMessages
} = require("../controllers/messageController");
const auth = require("../middlewares/auth");

// All routes require authentication
router.use(auth);

router.get("/unseen", getUnseenMessages);
// Get chat history between current user and another user
// GET /api/messages/history/:otherUserId
router.get("/history/:otherUserId", getChatHistory);

// Send a message to another user  
// POST /api/messages
router.post("/", sendMessage);

// Get recent chats for current user
// GET /api/messages/recent
router.get("/recent", getRecentChats);

module.exports = router;