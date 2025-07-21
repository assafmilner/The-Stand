// ### Mongoose Schema: Post
// Represents a post in a community feed. Includes content, media, and likes.
// Posts belong to a specific user (`authorId`) and community (`communityId`).

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  communityId: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  media: {
    type: [String],
    default: [],
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: [],
  }],

  createdAt: {
    type: Date,
    default: Date.now,
  },
},
{ timestamps: true }
);

// Indexes for optimized search and feed sorting
PostSchema.index({ content: "text" });                // Full-text search on post content
PostSchema.index({ authorId: 1, createdAt: -1 });     // Author feed sorting
PostSchema.index({ createdAt: -1 });                  // Global feed or community sorting

module.exports = mongoose.model("Post", PostSchema);
