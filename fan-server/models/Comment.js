const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },
    
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      }],
      
    parentCommentId: {  // שדה חדש לזהות תגובת בת
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",  // מצביע לתגובה על תגובה
        default: null,
      },
  },

  
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
