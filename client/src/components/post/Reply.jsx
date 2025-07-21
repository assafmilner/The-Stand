import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useUser } from "../../context/UserContext";
import { Trash2, Pencil } from "lucide-react";
import LikeModal from "../modal/LikeModal";
import LikeButton from "./LikeButton";
import { useLike } from "../../hooks/useLike";
import api from "utils/api";

/**
 * Reply
 *
 * This component renders a single reply to a comment, including:
 * - Author info and timestamp
 * - Like button and modal
 * - Edit and delete options (for author only)
 * - Edit mode with inline saving
 *
 * Props:
 * - reply (object): the reply data to display
 * - postId (string): ID of the post this reply belongs to
 * - parentCommentId (string): ID of the parent comment
 * - onDelete (function): callback after successful deletion
 *
 * Notes:
 * - Deletion requires confirmation and triggers API call
 * - Supports optimistic UI update for editing
 * - Uses `useLike` for internal like state and sync
 */

const Reply = ({ reply, postId, parentCommentId, onDelete }) => {
  const { user } = useUser();
  const isAuthor = user?._id === reply.authorId._id;

  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(reply.content);
  const [likes, setLikes] = useState(reply.likes || []);
  const [showLikeModal, setShowLikeModal] = useState(false);

  const { isLiked, likeCount, toggleLike } = useLike({
    type: "comment",
    id: reply._id,
    initialLikes: reply.likes,
    userId: user._id,
  });

  const handleDelete = async () => {
    if (!window.confirm("למחוק את התגובה?")) return;

    try {
      await api.delete(`/api/comments/${reply._id}`);
      onDelete?.();
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        alert("אין לך הרשאה למחוק תגובה זו.");
      } else if (status === 404) {
        alert("תגובה זו לא קיימת יותר.");
        onDelete?.();
      } else {
        console.error("❌ שגיאה במחיקת תגובת בן:", err);
        alert("שגיאה כללית במחיקת תגובה.");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) return;

    try {
      const res = await api.put(
        `/api/comments/${reply._id}`,
        { content: editedContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const updated = res.data;
      setEditedContent(updated.content);
      reply.content = updated.content;
      setEditMode(false);
    } catch (err) {
      console.error("❌ שגיאה בעדכון תגובת בן:", err);
      alert("שגיאה בשמירת תגובה.");
    }
  };

  return (
    <div
      style={{
        marginRight: "2.5rem",
        marginTop: "0.75rem",
        display: "flex",
        gap: "0.75rem",
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
            <span style={{ fontSize: "0.75rem", color: "#888" }}>
              {formatDistanceToNow(new Date(reply.createdAt), {
                addSuffix: true,
                locale: he,
              })}
            </span>
          </div>

          {isAuthor && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleDelete}
                title="מחק תגובה"
                style={{
                  background: "none",
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
                  setEditedContent(reply.content);
                }}
                title="ערוך תגובה"
                style={{
                  background: "none",
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
                rows={2}
                style={{ width: "100%", borderRadius: "0.5rem" }}
              />
              <div
                style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}
              >
                <button onClick={handleSaveEdit}>💾 שמור</button>
                <button onClick={() => setEditMode(false)}>❌ בטל</button>
              </div>
            </>
          ) : (
            <div style={{ whiteSpace: "pre-wrap" }}>{reply.content}</div>
          )}
        </div>

        {/* Like + Modal */}
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
            likes={likes}
            userId={user._id}
            onLikeToggle={setLikes}
          />

          {likes.length > 0 && (
            <button
              onClick={() => setShowLikeModal(true)}
              style={{
                background: "none",
                border: "none",
                color: "#4f46e5",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              ראו מי אהב
            </button>
          )}
        </div>
      </div>

      {showLikeModal && (
        <LikeModal users={likes} onClose={() => setShowLikeModal(false)} />
      )}
    </div>
  );
};

export default Reply;
