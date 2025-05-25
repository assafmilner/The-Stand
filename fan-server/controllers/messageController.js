const Message = require("../models/Message");
const mongoose = require("mongoose");

// Get chat history between current user and another user
const getChatHistory = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;
    
    // Get messages between these two users
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    })
    .populate("senderId", "name profilePicture")
    .populate("receiverId", "name profilePicture")
    .sort({ createdAt: 1 }); // Oldest first
    
    res.status(200).json({
      success: true,
      messages,
      count: messages.length
    });
    
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chat history",
      error: error.message
    });
  }
};

// Get list of users that current user has chatted with
const getChatList = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Get unique users who have chatted with current user
    const chatUsers = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(currentUserId) },
            { receiverId: new mongoose.Types.ObjectId(currentUserId) }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(currentUserId)] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $last: "$content" },
          lastMessageTime: { $last: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          "user.name": 1,
          "user.profilePicture": 1,
          "user._id": 1,
          lastMessage: 1,
          lastMessageTime: 1
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      chatUsers
    });
    
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chat list",
      error: error.message
    });
  }
};

// Get unread message count for current user
const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // For simplicity, we'll count all messages received by the user
    // In a real app, you'd have a 'read' field in messages
    const unreadCount = await Message.countDocuments({
      receiverId: currentUserId,
      // In future: isRead: false
    });
    
    // For now, simulate a random unread count for demo purposes
    const simulatedCount = Math.floor(Math.random() * 5);
    
    res.status(200).json({
      success: true,
      count: simulatedCount
    });
    
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
      error: error.message
    });
  }
};

module.exports = {
  getChatHistory,
  getChatList,
  getUnreadCount
};