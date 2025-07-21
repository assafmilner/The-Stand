import React from "react";

/**
 * LikeModal
 *
 * A modal dialog showing a list of users who liked a post.
 *
 * Props:
 * - users (array): List of user objects who liked the content.
 * - onClose (function): Function to close the modal.
 *
 * Features:
 * - Displays profile pictures and names of users who liked.
 * - Fallback image is shown if the profile picture fails to load.
 * - Clicking outside the modal closes it.
 *
 * UI Notes:
 * - Uses custom modal backdrop and container styling.
 * - Responsive and accessible for mouse interaction.
 */

const LikeModal = ({ users, onClose }) => {
  return (
    <div className="like-modal-backdrop" onClick={onClose}>
      <div className="like-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          ×
        </button>

        <h3 style={{ color: "#333", textAlign: "right", marginBottom: "16px" }}>
          אהבו את זה
        </h3>

        {users.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>אין עדיין לייקים</p>
        ) : (
          <ul className="like-list">
            {users.map((user, index) => (
              <li key={user._id || index} className="like-item">
                <img
                  src={user.profilePicture || "/defaultProfilePic.png"}
                  onError={(e) => {
                    e.target.src = "/defaultProfilePic.png";
                  }}
                  alt={user.name}
                  className="like-avatar"
                />
                <span>{user.name || "משתמש"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LikeModal;
