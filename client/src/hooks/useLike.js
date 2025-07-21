import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

/**
 * useLike
 *
 * Custom React hook to manage like functionality for posts or comments.
 *
 * @param {Object} options
 * @param {"post"|"comment"} options.type - Entity type being liked
 * @param {string} options.id - The post/comment ID
 * @param {Array} options.initialLikes - List of user IDs or objects who liked it
 * @param {string} options.userId - Current logged-in user's ID
 */
export const useLike = ({ type = "post", id, initialLikes = [], userId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes.length);

  /**
   * Initializes the like state based on whether the user has already liked.
   */
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

  /**
   * toggleLike
   *
   * Optimistically toggles like state and calls the backend to sync.
   * Reverts in case of error.
   */
  const toggleLike = useCallback(async () => {
    if (!userId || !id || !type) return;

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));

    const endpoint =
      type === "post" ? `/posts/${id}/like` : `/comments/${id}/like`;

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
