// fan-server/controllers/postController.js - Enhanced with better debugging

const Post = require("../models/Post");
const User = require("../models/User");
const Friend = require("../models/Friend");

// Get posts from friends + user's own posts
const getFriendsPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log("🔥 SERVER DEBUG: getFriendsPosts called");
    console.log("🔥 SERVER DEBUG: User ID:", userId);

    // Get current user info for debugging
    const currentUser = await User.findById(userId);
    console.log("🔥 SERVER DEBUG: Current user:", {
      name: currentUser?.name,
      favoriteTeam: currentUser?.favoriteTeam
    });

    // Get user's friends
    const friendships = await Friend.find({
      $or: [
        { senderId: userId, status: 'accepted' },
        { receiverId: userId, status: 'accepted' }
      ]
    }).populate('senderId', 'name favoriteTeam').populate('receiverId', 'name favoriteTeam');

    console.log("🔥 SERVER DEBUG: Raw friendships found:", friendships.length);
    console.log("🔥 SERVER DEBUG: Friendships details:", friendships.map(f => ({
      id: f._id,
      sender: f.senderId?.name,
      receiver: f.receiverId?.name,
      status: f.status
    })));

    // Extract friend IDs
    const friendIds = friendships.map(friendship => {
      const friendId = friendship.senderId._id.toString() === userId 
        ? friendship.receiverId._id
        : friendship.senderId._id;
      
      const friendName = friendship.senderId._id.toString() === userId 
        ? friendship.receiverId.name
        : friendship.senderId.name;
      
      console.log("🔥 SERVER DEBUG: Friend found:", friendName, "ID:", friendId);
      return friendId;
    });

    // Add the current user to see their own posts too
    friendIds.push(userId);

    console.log("🔥 SERVER DEBUG: Final friend IDs array:", friendIds);
    console.log("🔥 SERVER DEBUG: Total IDs to search for (friends + self):", friendIds.length);

    // If no friends, return empty or user's own posts only
    if (friendIds.length === 1) { // Only user's own ID
      console.log("🔥 SERVER DEBUG: No friends found, showing only user's posts");
    }

    // Get posts from friends + user's own posts
    const posts = await Post.find({
      authorId: { $in: friendIds }
    })
    .populate("authorId", "name profilePicture favoriteTeam")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    console.log("🔥 SERVER DEBUG: Posts found:", posts.length);
    console.log("🔥 SERVER DEBUG: Post authors:", posts.map(p => ({
      author: p.authorId.name,
      team: p.authorId.favoriteTeam,
      content: p.content.substring(0, 50) + "..."
    })));

    // Get total count for pagination
    const totalPosts = await Post.countDocuments({
      authorId: { $in: friendIds }
    });

    const hasMore = skip + posts.length < totalPosts;

    console.log("🔥 SERVER DEBUG: getFriendsPosts FINAL RESULT:", {
      postsCount: posts.length,
      totalPosts,
      hasMore,
      page: parseInt(page),
      friendsCount: friendIds.length - 1, // Subtract 1 for self
      endpoint: 'FRIENDS'
    });

    res.json({
      success: true,
      posts,
      feedType: 'friends',
      debug: {
        friendsCount: friendIds.length - 1,
        totalUsers: friendIds.length,
        endpoint: 'getFriendsPosts'
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasMore,
        totalPosts
      }
    });

  } catch (error) {
    console.error("🔥 SERVER ERROR: getFriendsPosts failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get friends posts",
      feedType: 'friends'
    });
  }
};

// Get posts from users with the same favorite team
const getTeamPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log("🔥 SERVER DEBUG: getTeamPosts called");
    console.log("🔥 SERVER DEBUG: User ID:", userId);

    // Get current user's favorite team
    const currentUser = await User.findById(userId);
    if (!currentUser || !currentUser.favoriteTeam) {
      console.log("🔥 SERVER ERROR: User favorite team not found");
      return res.status(400).json({
        success: false,
        error: "User favorite team not found",
        feedType: 'team'
      });
    }

    console.log("🔥 SERVER DEBUG: User's favorite team:", currentUser.favoriteTeam);

    // Get all users with the same favorite team
    const teamUsers = await User.find({
      favoriteTeam: currentUser.favoriteTeam
    }).select('_id name');

    const teamUserIds = teamUsers.map(user => user._id);

    console.log("🔥 SERVER DEBUG: Team users found:", teamUsers.length);
    console.log("🔥 SERVER DEBUG: Team users:", teamUsers.map(u => u.name));

    // Get posts from users with the same favorite team
    const posts = await Post.find({
      authorId: { $in: teamUserIds }
    })
    .populate("authorId", "name profilePicture favoriteTeam")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    console.log("🔥 SERVER DEBUG: Team posts found:", posts.length);
    console.log("🔥 SERVER DEBUG: Team post authors:", posts.map(p => ({
      author: p.authorId.name,
      team: p.authorId.favoriteTeam,
      content: p.content.substring(0, 50) + "..."
    })));

    // Get total count for pagination
    const totalPosts = await Post.countDocuments({
      authorId: { $in: teamUserIds }
    });

    const hasMore = skip + posts.length < totalPosts;

    console.log("🔥 SERVER DEBUG: getTeamPosts FINAL RESULT:", {
      postsCount: posts.length,
      totalPosts,
      hasMore,
      team: currentUser.favoriteTeam,
      teamUsersTotal: teamUsers.length,
      endpoint: 'TEAM'
    });

    res.json({
      success: true,
      posts,
      team: currentUser.favoriteTeam,
      feedType: 'team',
      debug: {
        teamUsersCount: teamUsers.length,
        endpoint: 'getTeamPosts'
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasMore,
        totalPosts
      }
    });

  } catch (error) {
    console.error("🔥 SERVER ERROR: getTeamPosts failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get team posts",
      feedType: 'team'
    });
  }
};

// Generic getPosts (keep for backward compatibility)
const getPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      authorId, 
      communityId,
      friendsOnly = false
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    console.log("🔥 SERVER DEBUG: getPosts called with params:", {
      page, limit, authorId, communityId, friendsOnly,
      hasUser: !!req.user
    });

    // ⚠️ THIS SHOULD NOT BE USED FOR FEED FUNCTIONALITY
    console.log("⚠️  SERVER WARNING: Generic getPosts called - this should not be used for feed/community");

    // Handle friends only filter
    if (friendsOnly === 'true' && req.user) {
      const userId = req.user.id;
      
      // Get user's friends
      const friendships = await Friend.find({
        $or: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' }
        ]
      });

      // Extract friend IDs
      const friendIds = friendships.map(friendship => {
        return friendship.senderId.toString() === userId 
          ? friendship.receiverId 
          : friendship.senderId;
      });

      // Add the current user to see their own posts too
      friendIds.push(userId);

      query.authorId = { $in: friendIds };
    }

    // Handle other existing filters
    if (authorId) {
      query.authorId = authorId;
    }

    if (communityId) {
      query.communityId = communityId;
    }

    const posts = await Post.find(query)
      .populate("authorId", "name profilePicture favoriteTeam")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments(query);
    const hasMore = skip + posts.length < totalPosts;

    console.log("🔥 SERVER DEBUG: getPosts returning:", {
      postsCount: posts.length,
      totalPosts,
      hasMore,
      endpoint: 'GENERIC'
    });

    res.json({
      success: true,
      posts,
      feedType: 'generic',
      debug: {
        endpoint: 'getPosts (generic)'
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasMore,
        totalPosts
      }
    });

  } catch (error) {
    console.error("🔥 SERVER ERROR: getPosts failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get posts",
      feedType: 'generic'
    });
  }
};

const createPost = async (req, res) => {
  try {
    const { authorId, communityId, content } = req.body;
    const mediaUrl = req.file ? req.file.path : null;

    if (!authorId || !communityId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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
    // First, find the post to check ownership
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is the author of the post
    if (post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    // Delete the post
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post", error: error.message });
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
  getPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getFriendsPosts,
  getTeamPosts, 
};