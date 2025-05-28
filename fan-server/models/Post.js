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

PostSchema.index({ content: "text" });
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });


module.exports = mongoose.model("Post", PostSchema);
