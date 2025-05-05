const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  toggleLikeComment,
} = require("../controllers/commentController");
const authMiddleware = require("../middlewares/auth");


router.post("/", authMiddleware, createComment);
router.get("/post/:postId", authMiddleware, getCommentsByPost);
router.put("/:id", authMiddleware, updateComment);
router.delete("/:id", authMiddleware, deleteComment);
router.put("/:id/like", authMiddleware, toggleLikeComment);

module.exports = router;
