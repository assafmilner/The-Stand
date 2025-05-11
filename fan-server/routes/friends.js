// routes/friends.js
console.log("✅ routes/friends.js loaded!");

const express = require("express");
const authenticate = require("../middlewares/auth"); // ⬅️ תעלה את זה לכאן
const router = express.Router();

const {
  sendRequest,
  cancelRequest,
  respondToRequest,
  getFriendshipStatus,
} = require("../controllers/friendController");

console.log("TYPE OF AUTH:", typeof authenticate); // עכשיו זה יחזיר: "function"

// שליחת בקשת חברות
router.post("/request/:recipientId", authenticate, sendRequest);

// ביטול בקשת חברות או הסרת חבר
router.delete("/cancel/:recipientId", authenticate, cancelRequest);

// אישור/סירוב בקשה
router.post("/respond/:requesterId", authenticate, respondToRequest);

// בדיקת סטטוס חברות
router.get("/status/:userId", authenticate, getFriendshipStatus);

module.exports = router;
