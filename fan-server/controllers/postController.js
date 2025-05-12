const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

const getAllPosts = async (req, res) => {
  try {
    // Extract pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Extract community filter
    const { communityId } = req.query;
    const filter = communityId ? { communityId } : {};

    // Get posts with pagination
    const posts = await Post.find(filter)
      .populate("authorId", "name email profilePicture")
      .populate("likes", "name email profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(filter);
    const hasMore = skip + posts.length < totalPosts;

    // For each post, get only the first 2 comments
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("authorId", "name profilePicture")
          .populate("likes", "name profilePicture")
          .sort({ createdAt: 1 })
          .limit(2);

        const totalComments = await Comment.countDocuments({ postId: post._id });

        return {
          ...post.toObject(),
          comments: comments,
          commentsCount: totalComments,
          hasMoreComments: totalComments > 2
        };
      })
    );

    res.status(200).json({
      posts: postsWithComments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore,
        totalPosts
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

const createPost = async (req, res) => {
  try {
    const { authorId, communityId, content } = req.body;
    const mediaUrl = req.file ? req.file.path : null;

    // 🛡️ בדיקה: כל השדות חייבים להתקבל
    if (!authorId || !communityId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🧠 בדיקה: המשתמש קיים בפועל
    const userExists = await User.findById(authorId);
    if (!userExists) {
      return res.status(400).json({ message: "Invalid authorId: user not found" });
    }

    const newPost = new Post({
      authorId,
      communityId,
      content,
      media: mediaUrl ? [mediaUrl] : [],
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const mediaUrl = req.file ? req.file.path : undefined;

    const updateData = { content };
    if (mediaUrl) {
      updateData.media = [mediaUrl];
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("שגיאה בעדכון פוסט:", err);
    res.status(500).json({ error: "שגיאה בעדכון פוסט" });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
};

const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId).populate("likes", "name profilePicture");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const alreadyLiked = post.likes.some(
      (likeUser) => likeUser._id.toString() === userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (likeUser) => likeUser._id.toString() !== userId
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(postId).populate("likes", "name profilePicture");

    res.json(updatedPost);
  } catch (error) {
    console.error("שגיאה בעדכון לייק:", error);
    res.status(500).json({ error: "Error updating like" });
  }
};

module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike
};