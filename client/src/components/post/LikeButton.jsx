import React, { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import api from "../../utils/api";

/**
 * LikeButton
 *
 * A like/unlike toggle component for posts or comments.
 * Supports optimistic UI updates and server synchronization.
 *
 * Features:
 * - Highlights the button if the current user has liked the item
 * - Displays the total number of likes
 * - Handles both "post" and "comment" types via dynamic API routing
 *
 * Props:
 * - id (string): ID of the post or comment
 * - type (string): "post" | "comment" (default: "post")
 * - likes (array): array of users who liked
 * - userId (string): ID of the current user
 * - onLikeToggle (function): callback with updated like list after toggle
 * - className (string): optional class name for styling
 */

export default function LikeButton({
  id,
  type = "post",
  likes = [],
  userId,
  onLikeToggle,
  className = "",
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likes.length);

  useEffect(() => {
    setLiked(likes.some((u) => (u._id || u) === userId));
    setCount(likes.length);
  }, [likes, userId]);

  const toggleLike = async () => {
    if (!id || !userId) {
      console.error("❌ LikeButton: missing id or userId");
      return;
    }

    const wasLiked = liked;
    setLiked(!wasLiked);

    const optimisticLikes = wasLiked
      ? likes.filter((u) => (u._id || u) !== userId)
      : [...likes, { _id: userId }];

    onLikeToggle?.(optimisticLikes);

    try {
      const url =
        type === "comment"
          ? `/api/comments/${id}/like`
          : `/api/posts/${id}/like`;

      const res = await api.put(url);
      const updatedLikes = res.data.likes;

      setLiked(updatedLikes.some((u) => u._id === userId));
      setCount(updatedLikes.length);
      onLikeToggle?.(updatedLikes);
    } catch (err) {
      console.error("❌ like failed:", err);
      setLiked(wasLiked);
      onLikeToggle?.(likes);
    }
  };

  return (
    <button
      onClick={toggleLike}
      className={className}
      style={{
        background: "none",
        border: "none",
        color: "#4f46e5",
        fontSize: "0.9rem",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <ThumbsUp size={18} fill={liked ? "#1877f2" : "none"} />
        <span style={{ fontWeight: 500 }}>{count > 0 ? count : null}</span>
        <span style={{ fontWeight: 500 }}>לייק</span>
      </div>
    </button>
  );
}
