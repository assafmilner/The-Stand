const Post = require("../models/Post");


const getAllPosts = async (req, res) => {
  const { communityId } = req.query;
  try {
    const posts = await Post.find({ communityId })
      .populate("authorId", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

const createPost = async (req, res) => {
  const { authorId, communityId, content, media } = req.body;
  try {
    const newPost = new Post({
      authorId,
      communityId,
      content,
      media: media || []
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const { content, media } = req.body;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { content, media },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error });
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

