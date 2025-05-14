// src/components/post/LikeButton.jsx
import React, { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import api from "../../utils/api";

export default function LikeButton({
  postId,
  likes,
  currentUser,
  onLikeChange, // callback חדש
  className = "",
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likes.length);

  useEffect(() => {
    setCount(likes.length);
    setLiked(likes.some((u) => (u._id || u) === currentUser?._id));
  }, [likes, currentUser]);

  const toggleLike = async () => {
    const was = liked;
    setLiked(!was);
    const newCount = was ? count - 1 : count + 1;
    setCount(newCount);

    // אופטימיסטית: עדכון ההורה
    if (onLikeChange) {
      if (was) {
        onLikeChange(likes.filter((u) => (u._id || u) !== currentUser._id));
      } else {
        onLikeChange([
          ...likes,
          { _id: currentUser._id, name: currentUser.name },
        ]);
      }
    }

    try {
      const res = await api.put(
        `/api/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      // עדכון סופי לפי שרת
      if (onLikeChange) onLikeChange(res.data.likes);
      setCount(res.data.likes.length);
      setLiked(res.data.likes.some((u) => u._id === currentUser._id));
    } catch (err) {
      console.error("❌ like failed:", err);
      // Rollback: נחזיר את המצב הקודם
      setLiked(was);
      setCount(likes.length);
      if (onLikeChange) onLikeChange(likes);
    }
  };

  return (
    <button
      onClick={toggleLike}
      className={className}
      style={{ color: liked ? "#1877f2" : "#888" }}
    >
      <ThumbsUp size={20} fill={liked ? "#1877f2" : "none"} />
      <span>לייק </span>
    </button>
  );
}
