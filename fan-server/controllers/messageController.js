// ### Chat Controller
// Handles chat logic including message sending, retrieval, and unseen message tracking.

const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

// ### Function: getChatHistory
// Retrieves the chat history between the logged-in user and another user.
// Returns up to 100 messages sorted by creation time.
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(otherUserId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid user IDs",
      });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "name profilePicture")
      .populate("receiverId", "name profilePicture")
      .limit(100);

    res.json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error("getChatHistory error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load messages",
    });
  }
};

// ### Function: sendMessage
// Sends a new message from the authenticated user to another user.
// Validates receiver and message content.
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid receiver ID",
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Message cannot be empty",
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        error: "Message too long",
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: "Receiver not found",
      });
    }

    const message = await Message.create({
      senderId: userId,
      receiverId,
      content: content.trim(),
      isRead: false,
    });

    await message.populate("senderId", "name profilePicture");
    await message.populate("receiverId", "name profilePicture");

    res.json({
      success: true,
      message,
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
};

// ### Function: getRecentChats
// Returns the 20 most recent chat conversations the user participated in.
// Includes unread count and last message metadata per chat.
const getRecentChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    const chats = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: objectId }, { receiverId: objectId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", objectId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$content" },
          lastMessageTime: { $first: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "messages",
          let: { otherUserId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$senderId", "$$otherUserId"] },
                    { $eq: ["$receiverId", objectId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "unreadMessages",
        },
      },
      {
        $addFields: {
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ["$unreadMessages.count", 0] }, 0],
          },
        },
      },
      {
        $project: {
          user: {
            _id: "$user._id",
            name: "$user.name",
            profilePicture: "$user.profilePicture",
          },
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1,
        },
      },
      { $sort: { lastMessageTime: -1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      recentChats: chats,
    });
  } catch (err) {
    console.error("getRecentChats error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load recent chats",
    });
  }
};

// ### Function: getUnseenMessages
// Returns all unread messages received by the authenticated user.
const getUnseenMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      receiverId: userId,
      isRead: false,
    })
      .populate("senderId", "name profilePicture")
      .sort({ createdAt: -1 });

    res.json({ success: true, unseenMessages: messages });
  } catch (err) {
    console.error("getUnseenMessages error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to load unseen messages" });
  }
};

// ### Export: Chat controller methods
module.exports = {
  getChatHistory,
  sendMessage,
  getRecentChats,
  getUnseenMessages,
};
