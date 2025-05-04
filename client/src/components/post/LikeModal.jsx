import React from "react";
import "../../index.css";

const LikeModal = ({ users, onClose }) => {
  return (
    <div className="like-modal-backdrop" onClick={onClose}>
      <div
        className="like-modal"
        onClick={(e) => e.stopPropagation()} // כדי שלא יסגור בלחיצה על התוכן
      >
        <h3>אהבו את הפוסט</h3>
        <ul className="like-list">
          {users.map((user) => (
            <li key={user._id} className="like-item">
              <img
                src={user.profilePicture || "/default.png"}
                alt={user.name}
                className="like-avatar"
              />
              <span>{user.name}</span>
            </li>
          ))}
        </ul>
        <button className="close-modal" onClick={onClose}>
          סגור
        </button>
      </div>
    </div>
  );
};

export default LikeModal;
