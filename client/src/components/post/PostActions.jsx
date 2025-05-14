import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import LikeButton from "./LikeButton";
import LikeModal from "../modal/LikeModal";
import api from "../../api";

const PostActions = ({ postId, likes = [], authorId }) => {
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // שליפת מספר תגובות אמיתי
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const { data } = await api.get(`/posts/${postId}/comments/count`);
        setCommentCount(data.count || 0);
      } catch (err) {
        console.error("שגיאה בשליפת מספר תגובות:", err);
      }
    };

    fetchCommentCount();
  }, [postId]);

  return (
    <div
      className="post-actions"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "0.75rem",
        borderTop: "1px solid #eee",
        paddingTop: "0.5rem",
      }}
    >
      {/* כפתור לייק */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <LikeButton postId={postId} likes={likes} />
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

      {/* מספר תגובות */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          color: "#666",
        }}
      >
        <MessageCircle size={18} />
        <span>{commentCount}</span>
      </div>

      {/* עתידי – שיתוף */}
      <div
        style={{ color: "#999", fontSize: "0.85rem", cursor: "not-allowed" }}
        title="בקרוב..."
      >
        🔁 שתף
      </div>

      {/* LikeModal */}
      {showLikeModal && (
        <LikeModal users={likes} onClose={() => setShowLikeModal(false)} />
      )}
    </div>
  );
};

export default PostActions;
