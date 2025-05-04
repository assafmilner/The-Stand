const Post = require("../models/Post");
const User = require("../models/User");

const getAllPosts = async (req, res) => {
  const { communityId } = req.query;
  const filter = communityId ? { communityId } : {}; // זה פותר את הבעיה

  try {
    const posts = await Post.find(filter)
      .populate("authorId", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
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

module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  deletePost
};

