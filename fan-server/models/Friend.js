// ### Mongoose Schema: Friend
// Represents a friendship relation between two users.
// Includes compound indexes for optimized query performance and duplicate prevention.

const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for uniqueness and performance
FriendSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
FriendSchema.index({ receiverId: 1, status: 1 });
FriendSchema.index({ senderId: 1, status: 1 });

// Prevents duplicate friendships in either direction
FriendSchema.pre("save", async function (next) {
  const existingFriendship = await this.constructor.findOne({
    $or: [
      { senderId: this.senderId, receiverId: this.receiverId },
      { senderId: this.receiverId, receiverId: this.senderId },
    ],
  });

  if (existingFriendship && !this.isNew) {
    return next();
  }

  if (existingFriendship) {
    const error = new Error("Friendship request already exists");
    error.code = "DUPLICATE_FRIENDSHIP";
    return next(error);
  }

  next();
});

// Returns the friendship status between two users (if exists)
FriendSchema.statics.getFriendshipStatus = function (userId1, userId2) {
  return this.findOne({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  });
};

// Returns all friends (both directions) of a user
FriendSchema.statics.getFriends = function (userId) {
  return this.find({
    $or: [
      { senderId: userId, status: "accepted" },
      { receiverId: userId, status: "accepted" },
    ],
  })
    .populate("senderId", "name profilePicture favoriteTeam")
    .populate("receiverId", "name profilePicture favoriteTeam");
};

module.exports = mongoose.model("Friend", FriendSchema);
