import React, { useState } from "react";
import { Heart, MessageCircle, X } from "lucide-react";
import axios from "axios";
import LikeModal from "./LikeModal"; // 💡 ודא שהקובץ הזה קיים

const Post = ({ post, currentUserId, onDelete, onEdit, colors }) => {
  const isOwner = currentUserId === post.authorId.email;
  const name = post.authorId.name || "משתמש";
  const profileImage = post.authorId.profilePicture;
  const createdAt = new Date(post.createdAt).toLocaleString("he-IL");
  const [liked, setLiked] = useState(post.likes?.includes(currentUserId));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showLikeModal, setShowLikeModal] = useState(false);

  const toggleLike = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.put(
        `http://localhost:3001/api/posts/${post._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (err) {
      console.error("שגיאה בעדכון לייק:", err);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "1rem",
        overflow: "hidden",
        marginBottom: "24px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        width: "100%",
        marginInline: "auto",
        direction: "rtl",
        borderTop: `6px solid ${colors?.primary || "#ccc"}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "16px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            overflow: "hidden",
            marginLeft: "12px",
            backgroundColor: "WHITE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#fff",
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "600", fontSize: "1rem", color: "#333" }}>
            {name}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#777" }}>{createdAt}</div>
        </div>

        {isOwner && (
          <div style={{ display: "flex", gap: "6px" }}>
            <button style={buttonStyle} onClick={() => onEdit(post)}>
              ערוך
            </button>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: "#eee",
                color: "#f44336",
              }}
              onClick={() => onDelete(post._id)}
            >
              מחק
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: "1rem",
          lineHeight: "1.6",
          color: "#444",
          paddingInline: "16px",
          marginBottom: "12px",
        }}
      >
        {post.content}
      </div>

      {post.media.length > 0 && (
        <div style={{ marginTop: "12px", paddingInline: "16px" }}>
          {post.media.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`media-${i}`}
              style={{
                width: "100%",
                borderRadius: "12px",
                objectFit: "cover",
                maxHeight: "500px",
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: "16px",
          borderTop: "1px solid #eee",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          color: "#888",
          fontSize: "0.9rem",
        }}
      >
        <span
          onClick={() => setShowLikeModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
            color: liked ? "#f44336" : "#888",
          }}
        >
          <Heart fill={liked ? "#f44336" : "none"} color="#f44336" size={16} />
          {likeCount} לייקים
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <MessageCircle size={16} color="#2196f3" />
          {post.comments?.length || 0} תגובות
        </span>
      </div>

      {showLikeModal && (
        <LikeModal
          users={post.likesDetails || []}
          onClose={() => setShowLikeModal(false)}
          color={colors?.primary || "#2196f3"}
        />
      )}
    </div>
  );
};

const buttonStyle = {
  padding: "4px 10px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#f0f0f0",
  color: "#333",
  cursor: "pointer",
  fontSize: "0.85rem",
};

export default Post;
