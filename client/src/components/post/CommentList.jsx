import React, { useState } from "react";
import { useComments } from "../../hooks/useComments";
import Comment from "./Comment";
import { useUser } from "../context/UserContext";

const CommentList = ({ postId }) => {
  const { comments, addComment } = useComments({ postId });
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
    <div className="comment-list" style={{ marginTop: "1rem" }}>
      {/* טופס תגובה */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
      >
        <input
          type="text"
          placeholder="כתוב תגובה..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            borderRadius: "20px",
            border: "1px solid #ccc",
            padding: "0.5rem 1rem",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#4f46e5",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          תגיב
        </button>
      </form>

      {/* רשימת תגובות */}
      {comments.map((comment) => (
        <Comment key={comment._id} comment={comment} postId={postId} />
      ))}
    </div>
  );
};

export default CommentList;
