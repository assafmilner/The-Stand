import React from "react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../context/UserContext";
import { useComments } from "../../hooks/useComments";

const Reply = ({ reply, postId, parentCommentId }) => {
  const { user } = useUser();
  const { deleteComment } = useComments({ postId }); // באותה קריאה כמו תגובה רגילה

  if (!reply?.authorId) return null;

  const isAuthor = user?._id === reply.authorId._id;

  const handleDelete = () => {
    if (window.confirm("למחוק את תגובת התגובה?")) {
      deleteComment(reply._id); // מתבצע כרגיל
    }
  };

  return (
    <div
      className="reply"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        marginBottom: "1rem",
        marginLeft: "3rem",
      }}
    >
      <img
        src={reply.authorId.profilePicture || "/default-avatar.png"}
        alt="avatar"
        style={{ width: 28, height: 28, borderRadius: "50%" }}
      />

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>{reply.authorId.name}</strong>{" "}
            <span style={{ color: "#888", fontSize: "0.8rem" }}>
              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
            </span>
          </div>

          {isAuthor && (
            <button
              onClick={handleDelete}
              style={{
                background: "transparent",
                border: "none",
                color: "#888",
                cursor: "pointer",
              }}
            >
              🗑️
            </button>
          )}
        </div>

        <div style={{ marginTop: "0.25rem", whiteSpace: "pre-wrap" }}>
          {reply.content}
        </div>
      </div>
    </div>
  );
};

export default Reply;
