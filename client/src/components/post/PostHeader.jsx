import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../modal/DeleteConfirmationModal";

/**
 * PostHeader
 *
 * Displays the top section of a post, including:
 * - Author information (avatar, name, timestamp)
 * - Link to author's profile
 * - Dropdown menu for post actions (edit/delete) – only visible to the post owner
 * - Modal confirmation for delete action
 *
 * Props:
 * - author (object): the post author's data (must include _id, name, profilePicture)
 * - createdAt (string): timestamp for when the post was created
 * - isOwner (boolean): whether the current user is the post owner
 * - onEdit (function): callback to trigger editing (optional)
 * - onDelete (function): callback to trigger deletion (optional)
 */

const PostHeader = ({ author, createdAt, isOwner, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  if (!author) return null;

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const goToProfile = () => {
    navigate(`/profile/${author._id}`);
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <>
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
          onClick={goToProfile}
        >
          <img
            className="profile-img"
            src={author?.profilePicture || "/default.png"}
            alt="profile"
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
            <MoreHorizontal
              onClick={toggleMenu}
              style={{ cursor: "pointer" }}
              className="hover:bg-gray-100 rounded p-1 transition-colors"
            />
            {showMenu && (
              <div
                className="post-menu"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "0.75rem",
                  padding: "0.5rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  zIndex: 10,
                  minWidth: "120px",
                }}
              >
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    style={{
                      color: "black",
                      background: "none",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      cursor: "pointer",
                      width: "100%",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <Pencil size={16} />
                    ערוך
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDeleteClick}
                    style={{
                      background: "none",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      cursor: "pointer",
                      width: "100%",
                      color: "#e53935",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                    className="hover:bg-red-50 transition-colors"
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="מחק פוסט"
        message="האם אתה בטוח שברצונך למחוק את הפוסט הזה? לא ניתן יהיה לשחזר אותו."
        confirmText="מחק לצמיתות"
        cancelText="ביטול"
        type="danger"
      />
    </>
  );
};

export default PostHeader;
