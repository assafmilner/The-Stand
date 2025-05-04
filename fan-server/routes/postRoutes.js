const express = require("express");
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost
} = require("../Controllers/postController");




router.get("/", getAllPosts);
router.post("/", upload.single('image'), createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);



module.exports = router;
