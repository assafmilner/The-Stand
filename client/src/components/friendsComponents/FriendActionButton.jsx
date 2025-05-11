// 📁 client/src/components/friendsComponents/FriendActionButton.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const FriendActionButton = ({ targetUserId, currentUserId }) => {
  const [status, setStatus] = useState(null); // "none", "outgoing", "incoming", "friends"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `http://localhost:3001/api/friends/status/${targetUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStatus(res.data.status);
      } catch (err) {
        console.error("שגיאה בבדיקת סטטוס החברות:", err);
      } finally {
        setLoading(false);
      }
    };

    if (targetUserId && currentUserId && targetUserId !== currentUserId) {
      fetchStatus();
    }
  }, [targetUserId, currentUserId]);

  const handleAction = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (status === "friends" || status === "outgoing") {
        console.log("➡️ שליחת ביטול חברות ל:", `http://localhost:3001/api/friends/cancel/${targetUserId}`);
        await axios.delete(
          `http://localhost:3001/api/friends/cancel/${targetUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStatus("none");
      } else if (status === "incoming") {
        console.log("➡️ אישור בקשה ל:", `http://localhost:3001/api/friends/respond/${targetUserId}`);
        await axios.post(
          `http://localhost:3001/api/friends/respond/${targetUserId}`,
          { action: "accept" },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStatus("friends");
      } else {
        console.log("➡️ שליחת בקשה ל:", `http://localhost:3001/api/friends/request/${targetUserId}`);
        await axios.post(
          `http://localhost:3001/api/friends/request/${targetUserId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStatus("outgoing");
      }
    } catch (err) {
      console.error("שגיאה בביצוע פעולה על חבר:", err);
    }
  };

  if (loading || targetUserId === currentUserId) return null;

  const buttonLabel =
    status === "friends"
      ? "בטל/י חברות"
      : status === "incoming"
      ? "אשר/י בקשה"
      : status === "outgoing"
      ? "בטל/י בקשה"
      : "שלח/י בקשת חברות";

  return (
    <button
      onClick={handleAction}
      style={{
        backgroundColor: "#f0f0f0",
        color: "#333",
        padding: "6px 12px",
        borderRadius: "20px",
        border: "1px solid #ccc",
        fontSize: "0.85rem",
        fontWeight: "500",
        cursor: "pointer",
        marginInlineStart: "auto",
        marginRight: "8px",
      }}
    >
      {buttonLabel}
    </button>
  );
};

export default FriendActionButton;
