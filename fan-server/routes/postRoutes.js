const express = require("express");
const router = express.Router();
const upload = require('../middlewares/upload');
const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost
} = require("../Controllers/postController");





router.get("/", getAllPosts);
router.post("/", upload.single('image'), createPost);
router.put("/:id", upload.single("image"), updatePost);
router.delete("/:id", deletePost);



module.exports = router;
