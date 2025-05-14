import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "context/UserContext";
import useComments from "../../hooks/useComments";
import Reply from "./Reply";
import ReplyInput from "./ReplyInput";
import LikeModal from "../modal/LikeModal";
import LikeButton from "./LikeButton";
import { useLike } from "../../hooks/useLike";

const Comment = ({ comment, postId }) => {
  const { user } = useUser();
  const { deleteComment } = useComments({ postId });

  const isAuthor = user?._id === comment.authorId._id;
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showLikeModal, setShowLikeModal] = useState(false);

  const { isLiked, likeCount, toggleLike } = useLike({
    type: "comment",
    id: comment._id,
    initialLikes: comment.likes || [],
    userId: user._id,
  });

  const toggleReplyInput = () => {
    setShowReplyInput((prev) => !prev);
  };

  const handleDelete = () => {
    if (window.confirm("למחוק את התגובה?")) {
      deleteComment(comment._id);
    }
  };

  return (
    <div className="comment" style={{ marginBottom: "1rem" }}>
      <div
        style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}
      >
        <img
          src={comment.authorId.profilePicture || "/default-avatar.png"}
          alt="avatar"
          style={{ width: 32, height: 32, borderRadius: "50%" }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{comment.authorId.name}</strong>{" "}
              <span style={{ color: "#888", fontSize: "0.8rem" }}>
                {formatDistanceToNow(new Date(comment.createdAt), {
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
            {comment.content}
          </div>

          {/* פעולות: לייק + הגב */}
          <div
            style={{
              marginTop: "0.5rem",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <LikeButton
              id={comment._id}
              type="comment"
              likes={comment.likes}
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
            <button
              onClick={toggleReplyInput}
              style={{
                background: "none",
                border: "none",
                color: "#4f46e5",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {showReplyInput ? "בטל" : "הגב"}
            </button>
          </div>

          {showReplyInput && (
            <ReplyInput
              postId={postId}
              parentCommentId={comment._id}
              onFinish={() => setShowReplyInput(false)}
            />
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          {comment.replies.map((reply) => (
            <Reply
              key={reply._id}
              reply={reply}
              postId={postId}
              parentCommentId={comment._id}
            />
          ))}
        </div>
      )}

      {showLikeModal && (
        <LikeModal
          users={comment.likes}
          onClose={() => setShowLikeModal(false)}
        />
      )}
    </div>
  );
};

export default Comment;
