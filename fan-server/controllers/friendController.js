// fan-server/controllers/friendController.js
const Friend = require("../models/Friend");
const User = require("../models/User");
const mongoose = require("mongoose");

// Send friend request
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    // Validation
    if (!receiverId) {
      return res.status(400).json({ 
        success: false, 
        error: "Receiver ID is required" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid receiver ID" 
      });
    }

    // Can't send friend request to yourself
    if (senderId === receiverId) {
      return res.status(400).json({ 
        success: false, 
        error: "Cannot send friend request to yourself" 
      });
    }

    // Get both users
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    // Check if they have the same favorite team
    if (sender.favoriteTeam !== receiver.favoriteTeam) {
      return res.status(400).json({ 
        success: false, 
        error: "You can only send friend requests to fans of the same team" 
      });
    }

    // Check if friendship already exists
    const existingFriendship = await Friend.getFriendshipStatus(senderId, receiverId);
    
    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({ 
          success: false, 
          error: "You are already friends" 
        });
      } else if (existingFriendship.status === 'pending') {
        return res.status(400).json({ 
          success: false, 
          error: "Friend request already sent" 
        });
      }
    }

    // Create friend request
    const friendRequest = new Friend({
      senderId,
      receiverId,
      status: 'pending'
    });

    await friendRequest.save();
    await friendRequest.populate('senderId', 'name profilePicture favoriteTeam');
    await friendRequest.populate('receiverId', 'name profilePicture favoriteTeam');

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      friendRequest
    });

  } catch (error) {
    console.error("Error sending friend request:", error);
    if (error.code === 'DUPLICATE_FRIENDSHIP') {
      return res.status(400).json({ 
        success: false, 
        error: "Friend request already exists" 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: "Failed to send friend request" 
    });
  }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid request ID" 
      });
    }

    const friendRequest = await Friend.findById(id);
    
    if (!friendRequest) {
      return res.status(404).json({ 
        success: false, 
        error: "Friend request not found" 
      });
    }

    // Only the receiver can accept the request
    if (friendRequest.receiverId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: "You can only accept friend requests sent to you" 
      });
    }

    // Check if already accepted
    if (friendRequest.status === 'accepted') {
      return res.status(400).json({ 
        success: false, 
        error: "Friend request already accepted" 
      });
    }

    // Accept the request
    friendRequest.status = 'accepted';
    await friendRequest.save();
    
    await friendRequest.populate('senderId', 'name profilePicture favoriteTeam');
    await friendRequest.populate('receiverId', 'name profilePicture favoriteTeam');

    res.json({
      success: true,
      message: "Friend request accepted",
      friendship: friendRequest
    });

  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to accept friend request" 
    });
  }
};

// Reject friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid request ID" 
      });
    }

    const friendRequest = await Friend.findById(id);
    
    if (!friendRequest) {
      return res.status(404).json({ 
        success: false, 
        error: "Friend request not found" 
      });
    }

    // Only the receiver can reject the request
    if (friendRequest.receiverId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: "You can only reject friend requests sent to you" 
      });
    }

    // Reject the request
    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json({
      success: true,
      message: "Friend request rejected"
    });

  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to reject friend request" 
    });
  }
};

// Get user's friends
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const friendships = await Friend.find({
      $or: [
        { senderId: userId, status: 'accepted' },
        { receiverId: userId, status: 'accepted' }
      ]
    })
    .populate('senderId', 'name profilePicture favoriteTeam location')
    .populate('receiverId', 'name profilePicture favoriteTeam location')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Transform to get friend data (not the user himself)
    const friends = friendships.map(friendship => {
      const friend = friendship.senderId._id.toString() === userId 
        ? friendship.receiverId 
        : friendship.senderId;
      
      return {
        ...friend.toObject(),
        friendshipDate: friendship.updatedAt,
        friendshipId: friendship._id
      };
    });

    const totalFriends = await Friend.countDocuments({
      $or: [
        { senderId: userId, status: 'accepted' },
        { receiverId: userId, status: 'accepted' }
      ]
    });

    const hasMore = skip + friends.length < totalFriends;

    res.json({
      success: true,
      friends,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalFriends / limit),
        hasMore,
        totalFriends
      }
    });

  } catch (error) {
    console.error("Error getting friends:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get friends" 
    });
  }
};

// Get received friend requests
const getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Friend.find({
      receiverId: userId,
      status: 'pending'
    })
    .populate('senderId', 'name profilePicture favoriteTeam location')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: requests.map(req => ({
        id: req._id,
        sender: req.senderId,
        createdAt: req.createdAt
      }))
    });

  } catch (error) {
    console.error("Error getting received requests:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get friend requests" 
    });
  }
};

// Get sent friend requests
const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Friend.find({
      senderId: userId,
      status: 'pending'
    })
    .populate('receiverId', 'name profilePicture favoriteTeam location')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: requests.map(req => ({
        id: req._id,
        receiver: req.receiverId,
        createdAt: req.createdAt
      }))
    });

  } catch (error) {
    console.error("Error getting sent requests:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get sent requests" 
    });
  }
};

// Remove friend
const removeFriend = async (req, res) => {
  try {
    const { id } = req.params; // Friend's user ID
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid friend ID" 
      });
    }

    // Find the friendship
    const friendship = await Friend.findOne({
      $or: [
        { senderId: userId, receiverId: id, status: 'accepted' },
        { senderId: id, receiverId: userId, status: 'accepted' }
      ]
    });

    if (!friendship) {
      return res.status(404).json({ 
        success: false, 
        error: "Friendship not found" 
      });
    }

    // Delete the friendship
    await Friend.findByIdAndDelete(friendship._id);

    res.json({
      success: true,
      message: "Friend removed successfully"
    });

  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to remove friend" 
    });
  }
};

// Get specific user's friends (for viewing other profiles)
const getUserFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid user ID" 
      });
    }

    // Check if the user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    const friendships = await Friend.find({
      $or: [
        { senderId: userId, status: 'accepted' },
        { receiverId: userId, status: 'accepted' }
      ]
    })
    .populate('senderId', 'name profilePicture favoriteTeam location')
    .populate('receiverId', 'name profilePicture favoriteTeam location')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Transform to get friend data (not the target user himself)
    const friends = friendships.map(friendship => {
      const friend = friendship.senderId._id.toString() === userId 
        ? friendship.receiverId 
        : friendship.senderId;
      
      return {
        ...friend.toObject(),
        friendshipDate: friendship.updatedAt,
        friendshipId: friendship._id
      };
    });

    const totalFriends = await Friend.countDocuments({
      $or: [
        { senderId: userId, status: 'accepted' },
        { receiverId: userId, status: 'accepted' }
      ]
    });

    const hasMore = skip + friends.length < totalFriends;

    res.json({
      success: true,
      friends,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalFriends / limit),
        hasMore,
        totalFriends
      }
    });

  } catch (error) {
    console.error("Error getting user friends:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get user friends" 
    });
  }
};


module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getReceivedRequests,
  getSentRequests,
  removeFriend,
  getUserFriends
};