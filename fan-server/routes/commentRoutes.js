// ### Express Router: Comment Routes
// Defines all API endpoints related to comments and replies, including creation,
// updates, deletion, likes, and fetching comment threads per post.

const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByPost,
  getRepliesByComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  getCommentCountByPost,
} = require("../controllers/commentController");
const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, createComment);
router.get("/post/:postId", authMiddleware, getCommentsByPost);
router.get("/replies/:commentId", authMiddleware, getRepliesByComment);
router.put("/:id", authMiddleware, updateComment);
router.delete("/:id", authMiddleware, deleteComment);
router.put("/:id/like", authMiddleware, toggleLikeComment);
router.get("/count/:postId", authMiddleware, getCommentCountByPost);

module.exports = router;
