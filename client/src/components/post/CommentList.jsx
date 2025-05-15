// CommentList.jsx - תיקון לpassage של הפרמטרים הנכונים
import React, { useState } from "react";
import useComments from "../../hooks/useComments";
import Comment from "./Comment";
import { useUser } from "../../context/UserContext";

const CommentList = ({ postId }) => {
  const { comments, addComment, deleteComment, updateComment } = useComments({
    postId,
  });
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    await addComment(newComment);
    setNewComment("");
    setLoading(false);
  };

  return (
    <div className="comment-list">
      {/* טופס תגובה */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="כתוב תגובה..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          הגב
        </button>
      </form>

      {/* רשימת תגובות */}
      {comments.map((comment) => (
        <Comment
          key={comment._id}
          comment={comment}
          postId={postId}
          currentUserId={user?._id}
          onDelete={() => deleteComment(comment._id)}
          onEdit={(commentId, newContent) => {
            updateComment(commentId, newContent);
          }}
        />
      ))}
    </div>
  );
};

export default CommentList;
