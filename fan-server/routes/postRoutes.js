// ### Express Router: Post Routes
// Defines endpoints for creating, updating, deleting, and liking posts.
// Also includes feeds based on user's friends and favorite team.

const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/auth");
const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getFriendsPosts,
  getTeamPosts,
} = require("../controllers/postController");

router.get("/friends", authMiddleware, getFriendsPosts);
router.get("/team", authMiddleware, getTeamPosts);

router.get("/", authMiddleware, getPosts);
router.post("/", upload.single("image"), createPost);
router.put("/:id", upload.single("image"), updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.put("/:id/like", authMiddleware, toggleLike);

module.exports = router;
