// fan-server/controllers/messageController.js
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid user IDs" 
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "name profilePicture")
      .populate("receiverId", "name profilePicture")
      .limit(100); // Limit to last 100 messages for performance

    res.json({ 
      success: true, 
      messages 
    });
  } catch (err) {
    console.error("getChatHistory error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to load messages" 
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId, content } = req.body;

    // Validation
    if (!receiverId || !content) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid receiver ID" 
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Message cannot be empty" 
      });
    }

    if (content.length > 500) {
      return res.status(400).json({ 
        success: false, 
        error: "Message too long" 
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ 
        success: false, 
        error: "Receiver not found" 
      });
    }

    const message = await Message.create({
      senderId: userId,
      receiverId,
      content: content.trim()
    });

    await message.populate("senderId", "name profilePicture");
    await message.populate("receiverId", "name profilePicture");

    res.json({ 
      success: true, 
      message 
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to send message" 
    });
  }
};

const getRecentChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    const chats = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: objectId },
            { receiverId: objectId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", objectId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$content" },
          lastMessageTime: { $first: "$createdAt" }
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
          user: {
            _id: "$user._id",
            name: "$user.name",
            profilePicture: "$user.profilePicture"
          },
          lastMessage: 1,
          lastMessageTime: 1
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      },
      {
        $limit: 20 // Limit to 20 recent chats
      }
    ]);

    res.json({ 
      success: true, 
      recentChats: chats 
    });
  } catch (err) {
    console.error("getRecentChats error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to load recent chats" 
    });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  getRecentChats
};