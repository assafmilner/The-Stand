// fan-server/models/Message.js - ENHANCED VERSION
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Index for sender queries
  },
  
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Index for receiver queries
  },
  
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    minlength: [1, 'Message cannot be empty']
  },

  // Message type for future extensions (text, image, file, etc.)
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio'],
    default: 'text',
    index: true
  },

  // Read status tracking
  isRead: {
    type: Boolean,
    default: false,
    index: true // Index for unread message queries
  },

  readAt: {
    type: Date,
    default: null
  },

  // Delivery status
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending',
    index: true
  },

  // Reply functionality
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null
  },

  // Message metadata
  metadata: {
    editedAt: Date,
    deletedAt: Date,
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    originalContent: String, // Store original content if edited
  },

  // Reactions support
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Attachment support for future
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file', 'audio', 'video']
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String
  }]
}, 
{ 
  timestamps: true, // createdAt and updatedAt
  // Add text index for search functionality
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ====== PERFORMANCE OPTIMIZATIONS ======

// Compound indexes for better query performance
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 }); // Chat history queries
MessageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 }); // Reverse chat history
MessageSchema.index({ senderId: 1, createdAt: -1 }); // User's sent messages
MessageSchema.index({ receiverId: 1, createdAt: -1 }); // User's received messages
MessageSchema.index({ receiverId: 1, isRead: 1 }); // Unread messages
MessageSchema.index({ createdAt: -1 }); // Recent messages (for admin)

// Text search index for message content
MessageSchema.index({ content: 'text' });

// Compound index for conversation participants (more efficient for recent chats)
MessageSchema.index({ 
  senderId: 1, 
  receiverId: 1, 
  createdAt: -1 
}, { 
  name: 'conversation_timeline' 
});

// Sparse index for deleted messages (only index non-deleted messages)
MessageSchema.index(
  { 'metadata.isDeleted': 1 },
  { sparse: true }
);

// ====== VIRTUAL FIELDS ======

// Virtual for conversation participants (sorted for consistent room naming)
MessageSchema.virtual('conversationId').get(function() {
  const participants = [this.senderId.toString(), this.receiverId.toString()].sort();
  return participants.join('_');
});

// Virtual for message age
MessageSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for reaction count
MessageSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

// ====== METHODS ======

// Instance method to mark message as read
MessageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to add reaction
MessageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({ userId, emoji });
  return this.save();
};

// Instance method to remove reaction
MessageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  return this.save();
};

// Instance method to soft delete
MessageSchema.methods.softDelete = function() {
  this.metadata.isDeleted = true;
  this.metadata.deletedAt = new Date();
  return this.save();
};

// Instance method to edit message
MessageSchema.methods.editContent = function(newContent) {
  if (!this.metadata.isEdited) {
    this.metadata.originalContent = this.content;
    this.metadata.isEdited = true;
  }
  this.content = newContent;
  this.metadata.editedAt = new Date();
  return this.save();
};

// ====== STATIC METHODS ======

// Static method to get conversation history with pagination
MessageSchema.statics.getConversationHistory = async function(userId1, userId2, options = {}) {
  const { page = 1, limit = 50, includeDeleted = false } = options;
  const skip = (page - 1) * limit;

  const query = {
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ]
  };

  if (!includeDeleted) {
    query['metadata.isDeleted'] = { $ne: true };
  }

  const [messages, totalCount] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture')
      .populate('replyTo', 'content senderId')
      .lean(),
    
    this.countDocuments(query)
  ]);

  return {
    messages: messages.reverse(), // Return in chronological order
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNext: page < Math.ceil(totalCount / limit),
      hasPrev: page > 1
    }
  };
};

// Static method to get unread count for a user
MessageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiverId: userId,
    isRead: false,
    'metadata.isDeleted': { $ne: true }
  });
};

// Static method to mark all messages as read in a conversation
MessageSchema.statics.markConversationAsRead = function(userId, otherUserId) {
  return this.updateMany(
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
};

// Static method to get recent conversations for a user
MessageSchema.statics.getRecentConversations = async function(userId, limit = 20) {
  const pipeline = [
    // Match messages involving the user
    {
      $match: {
        $or: [
          { senderId: new mongoose.Types.ObjectId(userId) },
          { receiverId: new mongoose.Types.ObjectId(userId) }
        ],
        'metadata.isDeleted': { $ne: true }
      }
    },
    
    // Sort by creation time (newest first)
    { $sort: { createdAt: -1 } },
    
    // Group by conversation partner
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
            "$receiverId",
            "$senderId"
          ]
        },
        lastMessage: { $first: "$content" },
        lastMessageTime: { $first: "$createdAt" },
        lastMessageType: { $first: "$messageType" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiverId", new mongoose.Types.ObjectId(userId)] },
                  { $eq: ["$isRead", false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    
    // Lookup user information
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
        pipeline: [
          { $project: { name: 1, profilePicture: 1, email: 1 } }
        ]
      }
    },
    
    // Unwind user info
    { $unwind: "$user" },
    
    // Project final structure
    {
      $project: {
        user: 1,
        lastMessage: 1,
        lastMessageTime: 1,
        lastMessageType: 1,
        unreadCount: 1
      }
    },
    
    // Sort by last message time
    { $sort: { lastMessageTime: -1 } },
    
    // Limit results
    { $limit: limit }
  ];

  return this.aggregate(pipeline);
};

// Static method for advanced search
MessageSchema.statics.searchMessages = async function(userId, searchQuery, options = {}) {
  const { otherUserId, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const searchCriteria = {
    $and: [
      // Text search
      { $text: { $search: searchQuery } },
      
      // User involvement
      {
        $or: [
          { senderId: new mongoose.Types.ObjectId(userId) },
          { receiverId: new mongoose.Types.ObjectId(userId) }
        ]
      },
      
      // Not deleted
      { 'metadata.isDeleted': { $ne: true } }
    ]
  };

  // If specific conversation is provided
  if (otherUserId) {
    searchCriteria.$and.push({
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

  const [messages, totalCount] = await Promise.all([
    this.find(searchCriteria, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture')
      .lean(),
    
    this.countDocuments(searchCriteria)
  ]);

  return {
    messages,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNext: page < Math.ceil(totalCount / limit),
      hasPrev: page > 1
    }
  };
};

// ====== MIDDLEWARE ======

// Pre-save middleware for validation and sanitization
MessageSchema.pre('save', function(next) {
  // Ensure sender and receiver are different
  if (this.senderId.toString() === this.receiverId.toString()) {
    return next(new Error('Cannot send message to yourself'));
  }
  
  // Sanitize content
  if (this.content) {
    this.content = this.content.trim();
  }
  
  next();
});

// Post-save middleware for real-time updates (can be used with Socket.IO)
MessageSchema.post('save', function(doc) {
  // Emit event for real-time updates
  // This can be picked up by your Socket.IO implementation
  if (global.io) {
    global.io.emit('message_saved', {
      messageId: doc._id,
      conversationId: doc.conversationId,
      senderId: doc.senderId,
      receiverId: doc.receiverId
    });
  }
});

// ====== PERFORMANCE HELPERS ======

// Method to clean up old messages (for maintenance)
MessageSchema.statics.cleanupOldMessages = function(daysOld = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    'metadata.isDeleted': true
  });
};

// Method to get database statistics
MessageSchema.statics.getStats = async function() {
  const [
    totalMessages,
    unreadMessages,
    deletedMessages,
    todayMessages
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ isRead: false }),
    this.countDocuments({ 'metadata.isDeleted': true }),
    this.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    })
  ]);

  return {
    totalMessages,
    unreadMessages,
    deletedMessages,
    todayMessages,
    readRate: totalMessages > 0 ? ((totalMessages - unreadMessages) / totalMessages * 100).toFixed(2) : 0
  };
};

module.exports = mongoose.model("Message", MessageSchema);