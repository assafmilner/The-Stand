// ### Mongoose Schema: Comment
// Represents a comment on a post. Can also be used to model replies via `parentCommentId`.
// Includes likes, nested replies, and timestamps (createdAt, updatedAt).

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

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      }
    ],

    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // If present, indicates this is a reply to another comment
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
