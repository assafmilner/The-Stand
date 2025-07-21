import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useUser } from "../../context/UserContext";
import Reply from "./Reply";
import ReplyInput from "./ReplyInput";
import LikeModal from "../modal/LikeModal";
import LikeButton from "./LikeButton";
import { Pencil, Trash2 } from "lucide-react";

/**
 * Comment
 *
 * Displays a single comment including:
 * - Author avatar, name, and timestamp
 * - Comment content (editable by author)
 * - Like button with viewer list
 * - Reply toggle and input
 * - Nested replies rendering
 *
 * Props:
 * - comment: The comment object to display
 * - postId: The ID of the post the comment belongs to
 * - onDelete: Function called when the comment is deleted
 * - onEdit: Function called with updated content on save
 */

const Comment = ({ comment, postId, onDelete, onEdit }) => {
  const { user } = useUser();
  const isAuthor = user?._id === comment.authorId._id;

  const [likes, setLikes] = useState(comment.likes || []);
  const [replies, setReplies] = useState(comment.replies || []);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showLikeModal, setShowLikeModal] = useState(false);

  const handleDelete = () => {
    if (window.confirm("למחוק את התגובה?")) {
      onDelete?.();
    }
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) return;
    try {
      await onEdit(comment._id, editedContent);
      setEditMode(false);
    } catch (err) {
      console.error("שגיאה בשמירת עריכה:", err);
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
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <strong>{comment.authorId.name}</strong>
              <span style={{ color: "#888", fontSize: "0.8rem" }}>
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: he,
                })}
              </span>
            </div>

            {isAuthor && (
              <div style={{ display: "flex" }}>
                <button
                  onClick={handleDelete}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditMode(true);
                    setEditedContent(comment.content);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                  }}
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: "0.25rem" }}>
            {editMode ? (
              <>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={3}
                  style={{ width: "100%", borderRadius: "0.5rem" }}
                />
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  <button onClick={handleSaveEdit}>💾 שמור</button>
                  <button onClick={() => setEditMode(false)}>❌ בטל</button>
                </div>
              </>
            ) : (
              <div style={{ whiteSpace: "pre-wrap" }}>{comment.content}</div>
            )}
          </div>

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
              likes={likes}
              userId={user._id}
              onLikeToggle={setLikes}
            />

            <button
              onClick={() => setShowLikeModal(true)}
              style={{
                background: "none",
                border: "none",
                color: "#4f46e5",
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: 0,
              }}
            >
              ראו מי אהב
            </button>

            <button
              onClick={() => setShowReplyInput((prev) => !prev)}
              style={{
                background: "none",
                border: "none",
                color: "#4f46e5",
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {showReplyInput ? "בטל" : "הגב"}
            </button>
          </div>

          {showReplyInput && (
            <ReplyInput
              postId={postId}
              parentCommentId={comment._id}
              onFinish={(newReply) => {
                setShowReplyInput(false);
                setReplies((prev) => [...prev, newReply]);
              }}
            />
          )}

          {replies.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              {replies.map((reply) => (
                <Reply
                  key={`${reply._id}-${
                    reply.updatedAt || reply.content.length
                  }`}
                  reply={reply}
                  postId={postId}
                  parentCommentId={comment._id}
                  onDelete={() =>
                    setReplies((prev) =>
                      prev.filter((r) => r._id !== reply._id)
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showLikeModal && (
        <LikeModal users={likes} onClose={() => setShowLikeModal(false)} />
      )}
    </div>
  );
};

export default Comment;
