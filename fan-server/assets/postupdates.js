/*
-------------------------------
postRoutes

const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // מוסיפים את זה ✅
const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost
} = require("../Controllers/postController");

router.get("/", getAllPosts);

// הוספה נכונה כדי לקלוט קבצים
router.post("/", upload.single("media"), createPost); 

router.put("/:id", updatePost);
router.delete("/:id", deletePost);

module.exports = router;

----------------------------------------




*/