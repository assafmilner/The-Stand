// fan-server/routes/friendRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getReceivedRequests,
  getSentRequests,
  removeFriend,
  getUserFriends
} = require("../controllers/friendController");

// All routes require authentication
router.use(authMiddleware);

// Send friend request
// POST /api/friends/send-request
router.post("/send-request", sendFriendRequest);

// Accept friend request
// PUT /api/friends/accept/:id
router.put("/accept/:id", acceptFriendRequest);

// Reject friend request
// PUT /api/friends/reject/:id
router.put("/reject/:id", rejectFriendRequest);

// Get user's friends
// GET /api/friends
router.get("/", getFriends);

// Get specific user's friends (for viewing other profiles)
// GET /api/friends/user/:userId
router.get("/user/:userId", getUserFriends);

// Get received friend requests
// GET /api/friends/requests/received
router.get("/requests/received", getReceivedRequests);

// Get sent friend requests
// GET /api/friends/requests/sent
router.get("/requests/sent", getSentRequests);

// Remove friend
// DELETE /api/friends/remove/:id
router.delete("/remove/:id", removeFriend);

module.exports = router;