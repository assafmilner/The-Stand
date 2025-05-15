import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ← הוספה

const PostHeader = ({ author, createdAt, isOwner, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate(); // ← הוספה

  if (!author) return null;

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const goToProfile = () => {
    navigate(`/profile/${author._id}`);
  };

  return (
    <div
      className="post-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        className="author-info"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          cursor: "pointer",
        }}
        onClick={goToProfile} // ← ניווט בפרופיל
      >
        <img
          src={author.profilePicture || "/default-avatar.png"}
          alt="profile"
          style={{ width: 40, height: 40, borderRadius: "50%" }}
        />
        <div>
          <strong>{author.name}</strong>
          <div style={{ fontSize: "0.8rem", color: "#888" }}>
            {formatDistanceToNow(new Date(createdAt), {
              addSuffix: true,
              locale: he,
            })}
          </div>
        </div>
      </div>

      {isOwner && (onEdit || onDelete) && (
        <div style={{ position: "relative" }}>
          <MoreHorizontal onClick={toggleMenu} style={{ cursor: "pointer" }} />
          {showMenu && (
            <div
              className="post-menu"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
                padding: "0.5rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                zIndex: 10,
              }}
            >
              {onEdit && (
                <button
                  onClick={onEdit}
                  style={{
                    color: "black",
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <Pencil size={16} />
                  ערוך
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    width: "100%",
                    color: "#e53935",
                  }}
                >
                  <Trash2 size={16} />
                  מחק
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostHeader;
