const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const {
  sendMessage,
  getConversationMessages,
  getConversations
} = require("../controllers/messageController");

// שליחת הודעה
router.post("/", authMiddleware, sendMessage);

// קבלת הודעות לשיחה
router.get("/conversation/:otherId", authMiddleware, getConversationMessages);

// קבלת רשימת שיחות
router.get("/conversations", authMiddleware, getConversations);

module.exports = router;