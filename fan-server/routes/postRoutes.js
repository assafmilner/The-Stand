const express = require("express");
const router = express.Router();
const upload = require('../middlewares/upload');
const authMiddleware = require("../middlewares/auth");
const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost, 
  toggleLike
} = require("../controllers/postController");


router.get("/", getAllPosts);  

router.post("/", upload.single('image'), createPost);
router.put("/:id", upload.single("image"), updatePost);
router.delete("/:id", deletePost);
router.put("/:id/like", authMiddleware, toggleLike);

module.exports = router;