const Comment = require("../models/Comment");
const Post = require("../models/Post");
const mongoose = require('mongoose');

const createComment = async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body; // קיבלנו את parentCommentId
    const authorId = req.user.id;

    if (!postId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newComment = new Comment({ postId, authorId, content, parentCommentId }); // שומרים את parentCommentId
    await newComment.populate("authorId", "name profilePicture");
    await newComment.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.error("❌ Error creating comment:", err);
    res.status(500).json({ message: "Error creating comment" });
  }
};



// קבלת כל התגובות לפוסט מסוים
const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({ postId })
      .populate("authorId", "name profilePicture")
      .populate("likes", "name profilePicture")
      .sort({ createdAt: 1 }); // לפי זמן פרסום

    // נמצא תגובות בת עבור כל תגובה
    for (let comment of comments) {
      const replies = await Comment.find({ parentCommentId: comment._id })
        .populate("authorId", "name profilePicture")
        .populate("likes", "name profilePicture");
      comment.replies = replies; // נוסיף את התגובות בת לכל תגובה
    }

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments" });
  }
};


// עדכון תוכן של תגובה
const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );
    res.status(200).json(updatedComment);
  } catch (err) {
    res.status(500).json({ message: "Error updating comment" });
  }
};

// מחיקת תגובה
const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    await Comment.findByIdAndDelete(id);
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting comment" });
  }
};

// לייק/הסרת לייק לתגובה
const toggleLikeComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId).populate("likes", "name profilePicture");
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const alreadyLiked = comment.likes.some(
      (likeUser) => likeUser._id.toString() === userId
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (likeUser) => likeUser._id.toString() !== userId
      );
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    const updatedComment = await Comment.findById(commentId).populate("likes", "name profilePicture");
    res.status(200).json(updatedComment);
  } catch (err) {
    console.error("❌ Error toggling like:", err);
    res.status(500).json({ message: "Error toggling like" });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  toggleLikeComment,
};
