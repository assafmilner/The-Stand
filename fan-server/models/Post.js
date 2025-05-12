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

module.exports = mongoose.model("Post", PostSchema);
