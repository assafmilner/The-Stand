// ### Express Router: Message Routes
// Handles user messaging features including chat history, sending messages,
// retrieving recent conversations, and unseen message count.

const express = require("express");
const router = express.Router();
const {
  getChatHistory,
  sendMessage,
  getRecentChats,
  getUnseenMessages,
} = require("../controllers/messageController");
const auth = require("../middlewares/auth");

// All routes require authentication
router.use(auth);

router.get("/unseen", getUnseenMessages);
router.get("/history/:otherUserId", getChatHistory);
router.post("/", sendMessage);
router.get("/recent", getRecentChats);

module.exports = router;
