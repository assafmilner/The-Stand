import React from "react";

const Post = ({ post, currentUserId, onDelete, onEdit }) => {
  const isOwner = currentUserId === post.authorId.email;
  const name = post.authorId.name || "משתמש";
  const profileImage = post.authorId.profilePicture;
  const createdAt = new Date(post.createdAt).toLocaleString("he-IL");

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "24px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        maxWidth: "700px",
        marginInline: "auto",
        direction: "rtl",
      }}
    >
      {/* Header */}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}
      >
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

      {/* Content */}
      <div
        style={{
          fontSize: "1rem",
          lineHeight: "1.6",
          color: "#444",
          marginBottom: "12px",
        }}
      >
        {post.content}
      </div>

      {/* Media */}
      {post.media.length > 0 && (
        <div style={{ marginTop: "12px" }}>
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

      {/* Footer: likes/comments */}
      <div
        style={{
          marginTop: "16px",
          borderTop: "1px solid #eee",
          paddingTop: "10px",
          display: "flex",
          justifyContent: "space-between",
          color: "#888",
          fontSize: "0.9rem",
        }}
      >
        <span>❤️ {post.likes?.length || 0} לייקים</span>
        <span>💬 {post.comments?.length || 0} תגובות</span>
      </div>
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
