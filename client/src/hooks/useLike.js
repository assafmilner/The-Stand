import { useState, useEffect, useCallback } from "react";
import api from "../api";

export const useLike = ({ type = "post", id, initialLikes = [], userId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes.length);

  useEffect(() => {
    if (!userId || !initialLikes) return;
    const liked = initialLikes.some((likeUser) =>
      typeof likeUser === "string"
        ? likeUser === userId
        : likeUser._id === userId
    );
    setIsLiked(liked);
    setLikeCount(initialLikes.length);
  }, [initialLikes, userId]);

  const toggleLike = useCallback(async () => {
    if (!userId || !id || !type) return;

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));

    const endpoint = type === "post"
      ? `/posts/${id}/like`
      : `/comments/${id}/like`;

    try {
      await api.put(endpoint, { userId });
    } catch (err) {
      console.error("שגיאה בעדכון לייק:", err);
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => prev + (isLiked ? -1 : 1));
    }
  }, [id, type, isLiked, userId]);

  return {
    isLiked,
    likeCount,
    toggleLike,
  };
};
