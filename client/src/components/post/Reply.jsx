import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../context/UserContext";
import { useComments } from "../../hooks/useComments";
import LikeButton from "./LikeButton";
import LikeModal from "../modal/LikeModal";
import { useLike } from "../../hooks/useLike";

const Reply = ({ reply, postId, parentCommentId }) => {
  const { user } = useUser();
  const { deleteComment } = useComments({ postId });
  const isAuthor = user?._id === reply.authorId._id;
  const [showLikeModal, setShowLikeModal] = useState(false);

  const { isLiked, likeCount, toggleLike } = useLike({
    type: "comment", // גם reply זו תגובה עם parentCommentId
    id: reply._id,
    initialLikes: reply.likes || [],
    userId: user._id,
  });
  
  if (!reply?.authorId) return null;

  const handleDelete = () => {
    if (window.confirm("למחוק את תגובת התגובה?")) {
      deleteComment(reply._id);
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
              {formatDistanceToNow(new Date(reply.createdAt), {
                addSuffix: true,
              })}
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

        {/* פעולות: לייק + modal */}
        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <LikeButton
            id={reply._id}
            type="comment"
            likes={reply.likes}
            userId={user._id}
          />
          <button
            onClick={() => setShowLikeModal(true)}
            style={{
              fontSize: "0.75rem",
              border: "none",
              background: "none",
              color: "#4f46e5",
              cursor: "pointer",
            }}
          >
            ראו מי אהב
          </button>
        </div>

        {showLikeModal && (
          <LikeModal
            users={reply.likes}
            onClose={() => setShowLikeModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Reply;
