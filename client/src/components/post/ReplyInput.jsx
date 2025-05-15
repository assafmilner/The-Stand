import React, { useState } from "react";
import useComments from "../../hooks/useComments";

const ReplyInput = ({ postId, parentCommentId, onFinish }) => {
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const { addComment } = useComments({ postId });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setLoading(true);
    const newReply = await addComment(replyText, parentCommentId);
    setReplyText("");
    setLoading(false);
    onFinish?.(newReply);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "0.5rem" }}>
      <input
        type="text"
        placeholder="כתוב תגובה לתגובה..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        disabled={loading}
        style={{
          width: "100%",
          borderRadius: "0.5rem",
          padding: "0.4rem",
          border: "1px solid #ccc",
        }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: "0.3rem",
          fontSize: "0.85rem",
          background: "#4f46e5",
          color: "white",
          border: "none",
          padding: "0.4rem 0.8rem",
          borderRadius: "0.4rem",
          cursor: "pointer",
        }}
      >
        הגב
      </button>
    </form>
  );
};

export default ReplyInput;
