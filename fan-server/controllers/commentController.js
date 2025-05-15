// commentController.js - תיקון בqontroller לוודא שהעדכון עובד בדאטה בייס
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const mongoose = require('mongoose');

const createComment = async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    const authorId = req.user.id;

    if (!postId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newComment = new Comment({ postId, authorId, content, parentCommentId });
    await newComment.populate("authorId", "name profilePicture");
    await newComment.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.error("❌ Error creating comment:", err);
    res.status(500).json({ message: "Error creating comment" });
  }
};

const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  try {
    const mainComments = await Comment.find({ 
      postId, 
      parentCommentId: null 
    })
      .populate("authorId", "name profilePicture")
      .populate("likes", "name profilePicture")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const commentsWithReplies = await Promise.all(
      mainComments.map(async (comment) => {
        const replies = await Comment.find({ parentCommentId: comment._id })
          .populate("authorId", "name profilePicture")
          .populate("likes", "name profilePicture")
          .sort({ createdAt: 1 });

        const totalReplies = await Comment.countDocuments({ parentCommentId: comment._id });

        return {
          ...comment.toObject(),
          replies: replies,
          repliesCount: totalReplies,
          hasMoreReplies: totalReplies > 2
        };
      })
    );

    const totalComments = await Comment.countDocuments({ 
      postId, 
      parentCommentId: null 
    });
    const hasMore = skip + mainComments.length < totalComments;

    res.status(200).json({
      comments: commentsWithReplies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        hasMore,
        totalComments
      }
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Error fetching comments" });
  }
};

const getRepliesByComment = async (req, res) => {
  const { commentId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const replies = await Comment.find({ parentCommentId: commentId })
      .populate("authorId", "name profilePicture")
      .populate("likes", "name profilePicture")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const totalReplies = await Comment.countDocuments({ parentCommentId: commentId });
    const hasMore = skip + replies.length < totalReplies;

    res.status(200).json({
      replies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReplies / limit),
        hasMore,
        totalReplies
      }
    });
  } catch (err) {
    console.error("Error fetching replies:", err);
    res.status(500).json({ message: "Error fetching replies" });
  }
};

const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    // בדוק שהמשתמש הוא בעל התגובה
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // בדוק הרשאות
    if (comment.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    // עדכן את התגובה
    comment.content = content;
    comment.updatedAt = new Date(); // הוסף את updatedAt אם אין
    await comment.save();

    // החזר את התגובה המעודכנת עם הpopulate
    const updatedComment = await Comment.findById(id)
      .populate("authorId", "name profilePicture")
      .populate("likes", "name profilePicture");

    res.status(200).json(updatedComment);
  } catch (err) {
    console.error("❌ Error updating comment:", err);
    res.status(500).json({ message: "Error updating comment" });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    // בדוק שהמשתמש הוא בעל התגובה
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(id);
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("❌ Error deleting comment:", err);
    res.status(500).json({ message: "Error deleting comment" });
  }
};

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

const getCommentCountByPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const count = await Comment.countDocuments({ postId });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error counting comments" });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  getRepliesByComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  getCommentCountByPost,
};