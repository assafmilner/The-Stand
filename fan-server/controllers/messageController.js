// fan-server/controllers/messageController.js - FIXED AND COMPLETE VERSION
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const cache = require("../utils/cacheManager");

// Constants for optimization
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Utility function for validation
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Optimized chat history with pagination and caching
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;
    
    // Input validation
    if (!validateObjectId(userId) || !validateObjectId(otherUserId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid user IDs provided" 
      });
    }

    // Pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, parseInt(req.query.limit) || DEFAULT_PAGE_SIZE);
    const skip = (page - 1) * limit;

    // Check cache first
    const cacheKey = `chat_history_${userId}_${otherUserId}_${page}_${limit}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        messages: cachedResult.messages,
        pagination: cachedResult.pagination,
        fromCache: true
      });
    }

    // Build optimized query
    const query = {
      $or: [
        { senderId: new mongoose.Types.ObjectId(userId), receiverId: new mongoose.Types.ObjectId(otherUserId) },
        { senderId: new mongoose.Types.ObjectId(otherUserId), receiverId: new mongoose.Types.ObjectId(userId) }
      ]
    };

    // Execute queries in parallel for better performance
    const [messages, totalCount] = await Promise.all([
      Message.find(query)
        .sort({ createdAt: -1 }) // Latest first for pagination
        .skip(skip)
        .limit(limit)
        .populate("senderId", "name profilePicture", null, { lean: true })
        .populate("receiverId", "name profilePicture", null, { lean: true })
        .lean(), // Use lean() for better performance
      
      Message.countDocuments(query)
    ]);

    // Reverse messages to show oldest first in UI
    const sortedMessages = messages.reverse();
    
    // Pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const pagination = {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit
    };

    const result = {
      messages: sortedMessages,
      pagination
    };

    // Cache the result
    cache.set(cacheKey, result, CACHE_TTL);

    res.json({ success: true, ...result });

  } catch (error) {
    console.error("❌ getChatHistory error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to load chat history",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optimized message sending
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId, content, messageType = 'text', replyTo } = req.body;

    // Input validation
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: "Receiver ID and message content are required" 
      });
    }

    if (!validateObjectId(userId) || !validateObjectId(receiverId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid user IDs provided" 
      });
    }

    // Prevent self-messaging
    if (userId === receiverId) {
      return res.status(400).json({ 
        success: false, 
        error: "Cannot send message to yourself" 
      });
    }

    // Check if receiver exists
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ 
        success: false, 
        error: "Receiver not found" 
      });
    }

    // Create message
    const messageData = {
      senderId: userId,
      receiverId,
      content: content.trim(),
      messageType
    };

    if (replyTo && validateObjectId(replyTo)) {
      messageData.replyTo = replyTo;
    }

    const message = new Message(messageData);
    const savedMessage = await message.save();
    
    // Populate sender and receiver info
    await savedMessage.populate("senderId", "name profilePicture");
    await savedMessage.populate("receiverId", "name profilePicture");
    if (savedMessage.replyTo) {
      await savedMessage.populate("replyTo", "content senderId");
    }

    // Invalidate relevant caches
    const cachePatterns = [
      `chat_history_${userId}_${receiverId}`,
      `chat_history_${receiverId}_${userId}`,
      `recent_chats_${userId}`,
      `recent_chats_${receiverId}`
    ];
    
    cachePatterns.forEach(pattern => {
      cache.invalidatePattern(pattern);
    });

    res.status(201).json({ 
      success: true, 
      message: savedMessage.toObject() 
    });

  } catch (error) {
    console.error("❌ sendMessage error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to send message",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optimized recent chats with better aggregation
const getRecentChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!validateObjectId(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid user ID" 
      });
    }

    // Check cache first
    const cacheKey = `recent_chats_${userId}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        recentChats: cachedResult,
        fromCache: true
      });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // Optimized aggregation pipeline
    const pipeline = [
      // Match messages involving the user
      {
        $match: {
          $or: [
            { senderId: objectId },
            { receiverId: objectId }
          ]
        }
      },
      
      // Sort by creation time (newest first)
      { $sort: { createdAt: -1 } },
      
      // Group by the other user in the conversation
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
          lastMessageTime: { $first: "$createdAt" },
          senderId: { $first: "$senderId" },
          receiverId: { $first: "$receiverId" }
        }
      },
      
      // Lookup user information
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      
      // Unwind user info
      { $unwind: "$user" },
      
      // Project final structure
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
      
      // Sort by last message time
      { $sort: { lastMessageTime: -1 } },
      
      // Limit results
      { $limit: 20 }
    ];

    const recentChats = await Message.aggregate(pipeline);

    // Cache the result
    cache.set(cacheKey, recentChats, CACHE_TTL);

    res.json({ 
      success: true, 
      recentChats 
    });

  } catch (error) {
    console.error("❌ getRecentChats error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to load recent chats",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, otherUserId, page = 1, limit = 20 } = req.query;

    if (!query?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: "Search query is required" 
      });
    }

    const searchQuery = {
      $and: [
        // Text search
        { content: { $regex: query.trim(), $options: 'i' } },
        
        // User involvement
        {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) }
          ]
        }
      ]
    };

    // If specific chat is provided
    if (otherUserId && validateObjectId(otherUserId)) {
      searchQuery.$and.push({
        $or: [
          { 
            senderId: new mongoose.Types.ObjectId(userId), 
            receiverId: new mongoose.Types.ObjectId(otherUserId) 
          },
          { 
            senderId: new mongoose.Types.ObjectId(otherUserId), 
            receiverId: new mongoose.Types.ObjectId(userId) 
          }
        ]
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, totalCount] = await Promise.all([
      Message.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("senderId", "name profilePicture")
        .populate("receiverId", "name profilePicture")
        .lean(),
      
      Message.countDocuments(searchQuery)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("❌ searchMessages error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to search messages",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId, otherUserId } = req.params;

    if (messageId) {
      // Mark specific message as read
      const message = await Message.findOneAndUpdate(
        { 
          _id: messageId, 
          receiverId: userId 
        },
        { 
          isRead: true, 
          readAt: new Date() 
        },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({
          success: false,
          error: "Message not found or access denied"
        });
      }

      res.json({
        success: true,
        message: "Message marked as read"
      });

    } else if (otherUserId) {
      // Mark all messages in conversation as read
      const result = await Message.updateMany(
        {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );

      res.json({
        success: true,
        message: `${result.modifiedCount} messages marked as read`
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Message ID or other user ID is required"
      });
    }

  } catch (error) {
    console.error("❌ markMessagesAsRead error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark messages as read"
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error("❌ getUnreadCount error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get unread count"
    });
  }
};

// Delete message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findOneAndUpdate(
      { 
        _id: messageId, 
        senderId: userId // Only sender can delete
      },
      { 
        $set: {
          'metadata.isDeleted': true,
          'metadata.deletedAt': new Date()
        }
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found or access denied"
      });
    }

    // Invalidate caches
    cache.invalidatePattern(`chat_history_${userId}`);

    res.json({
      success: true,
      message: "Message deleted successfully"
    });

  } catch (error) {
    console.error("❌ deleteMessage error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete message"
    });
  }
};

// Edit message
const editMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message content is required"
      });
    }

    const message = await Message.findOne({
      _id: messageId,
      senderId: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found or access denied"
      });
    }

    // Store original content if first edit
    if (!message.metadata.isEdited) {
      message.metadata.originalContent = message.content;
      message.metadata.isEdited = true;
    }
    
    message.content = content.trim();
    message.metadata.editedAt = new Date();
    
    await message.save();
    await message.populate("senderId", "name profilePicture");
    await message.populate("receiverId", "name profilePicture");

    // Invalidate caches
    cache.invalidatePattern(`chat_history_${userId}`);

    res.json({
      success: true,
      message: message.toObject()
    });

  } catch (error) {
    console.error("❌ editMessage error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to edit message"
    });
  }
};

// Add reaction to message
const addReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found"
      });
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(
      r => r.userId.toString() !== userId.toString()
    );
    
    // Add new reaction
    message.reactions.push({ userId, emoji });
    await message.save();

    res.json({
      success: true,
      message: "Reaction added successfully",
      reactions: message.reactions
    });

  } catch (error) {
    console.error("❌ addReaction error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add reaction"
    });
  }
};

// Get message statistics
const getMessageStats = async (req, res) => {
  try {
    const [
      totalMessages,
      unreadMessages,
      todayMessages,
      totalUsers
    ] = await Promise.all([
      Message.countDocuments(),
      Message.countDocuments({ isRead: false }),
      Message.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      User.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        totalMessages,
        unreadMessages,
        todayMessages,
        totalUsers,
        readRate: totalMessages > 0 ? ((totalMessages - unreadMessages) / totalMessages * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error("❌ getMessageStats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get message statistics"
    });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  getRecentChats,
  searchMessages,
  markMessagesAsRead,
  getUnreadCount,
  deleteMessage,
  editMessage,
  addReaction,
  getMessageStats
};