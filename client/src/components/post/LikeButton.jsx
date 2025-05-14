import React from "react";
import { Heart, HeartOff } from "lucide-react";
import { useLike } from "../../hooks/useLike";
import { useUser } from "../context/UserContext";

const LikeButton = ({ postId, likes = [] }) => {
  const { user } = useUser();
  const { isLiked, likeCount, toggleLike } = useLike({
    postId,
    initialLikes: likes,
    userId: user?._id,
  });

  if (!user) return null;

  return (
    <button
      onClick={toggleLike}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        border: "none",
        background: "transparent",
        color: isLiked ? "red" : "#666",
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      {isLiked ? <Heart fill="red" size={18} /> : <HeartOff size={18} />}
      <span>{likeCount}</span>
    </button>
  );
};

export default LikeButton;
