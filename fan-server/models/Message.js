// ### Mongoose Schema: Message
// Handles private messaging between users, supports efficient querying, and includes utility statics and virtuals.

const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });

// Virtual field for UI-friendly timestamp
MessageSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Get full conversation between two users (limited)
MessageSchema.statics.getConversation = function (
  userId1,
  userId2,
  limit = 50
) {
  return this.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate("senderId", "name profilePicture")
    .populate("receiverId", "name profilePicture");
};

// Mark messages as read
MessageSchema.statics.markAsRead = function (senderId, receiverId) {
  return this.updateMany(
    { senderId, receiverId, isRead: false },
    { isRead: true }
  );
};

// Prevent empty message string
MessageSchema.pre("save", function (next) {
  if (this.content && this.content.length === 0) {
    next(new Error("Message content cannot be empty"));
  }
  next();
});

module.exports = mongoose.model("Message", MessageSchema);
