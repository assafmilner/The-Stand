const express = require("express");
const router = express.Router();
const upload = require('../middlewares/upload');
const authMiddleware = require("../middlewares/auth");
const {
  getPosts,
  createPost,
  updatePost,
  deletePost, 
  toggleLike,
  getFriendsPosts,
  getTeamPosts
} = require("../controllers/postController");



router.get("/friends", authMiddleware, getFriendsPosts);
router.get("/team", authMiddleware, getTeamPosts);
router.get("/", getPosts);  
router.post("/", upload.single('image'), createPost);
router.put("/:id", upload.single("image"), updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.put("/:id/like", authMiddleware, toggleLike);

module.exports = router;