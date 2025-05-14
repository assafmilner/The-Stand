import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal } from "lucide-react";

const PostHeader = ({ author, createdAt, isAuthor }) => {
  const [showMenu, setShowMenu] = useState(false);

  if (!author) return null;

  const toggleMenu = () => setShowMenu((prev) => !prev);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "0.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <img
          src={author.profilePicture || "/default-avatar.png"}
          alt="profile"
          style={{ width: 40, height: 40, borderRadius: "50%" }}
        />
        <div>
          <strong>{author.name}</strong>
          <div style={{ fontSize: "0.8rem", color: "#888" }}>
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      {isAuthor && (
        <div style={{ position: "relative" }}>
          <MoreHorizontal onClick={toggleMenu} style={{ cursor: "pointer" }} />
          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                padding: "0.5rem",
                zIndex: 999,
              }}
            >
              <button onClick={() => alert("עריכת פוסט - TO DO")}>
                ✏️ ערוך
              </button>
              <br />
              <button onClick={() => alert("מחיקת פוסט - TO DO")}>
                🗑️ מחק
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostHeader;
