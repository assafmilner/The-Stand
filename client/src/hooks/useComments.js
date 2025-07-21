import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const DEFAULT_LIMIT = 10;

/**
 * useComments
 *
 * Custom hook to manage loading, creating, updating, and deleting comments.
 * Supports pagination and both root-level comments and nested replies.
 *
 * Params:
 * @param {string} postId - ID of the post to fetch comments for
 * @param {string|null} parentId - optional parent comment ID (for replies)
 */
export default function useComments({ postId, parentId = null }) {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Reset state when postId or parentId changes.
   */
  useEffect(() => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [postId, parentId]);

  /**
   * Fetch comments or replies (with pagination)
   */
  useEffect(() => {
    if (!postId) return;

    const fetchComments = async () => {
      setLoading(true);
      try {
        const endpoint = parentId
          ? `/api/comments/replies/${parentId}`
          : `/api/comments/post/${postId}`;

        const { data } = await api.get(endpoint, {
          params: { page, limit: DEFAULT_LIMIT },
        });

        const items = parentId ? data.replies : data.comments;

        setComments((prev) => (page === 1 ? items : [...prev, ...items]));

        setHasMore(data.pagination?.hasMore ?? items.length === DEFAULT_LIMIT);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasMore(false);
        } else {
          console.error("Failed to load comments:", err);
          setError("Could not load comments");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, parentId, page]);

  /**
   * loadMore
   *
   * Increments the page number if more comments are available.
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((p) => p + 1);
    }
  }, [loading, hasMore]);

  /**
   * reload
   *
   * Resets pagination and triggers re-fetch.
   */
  const reload = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  /**
   * addComment
   *
   * Posts a new comment or reply and updates the local state.
   */
  const addComment = async (content, parentId = null) => {
    const res = await api.post("/api/comments", {
      postId,
      content,
      parentCommentId: parentId,
    });

    const newComment = res.data;

    if (!parentId) {
      setComments((prev) => [newComment, ...prev]);
    }

    return newComment;
  };

  /**
   * deleteComment
   *
   * Deletes a comment from the server and local state.
   */
  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment");
    }
  };

  /**
   * updateComment
   *
   * Updates a comment's content in the backend and locally.
   */
  const updateComment = async (commentId, newContent) => {
    try {
      const res = await api.put(`/api/comments/${commentId}`, {
        content: newContent,
      });

      const updated = res.data;

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                content: updated.content,
                updatedAt: updated.updatedAt,
              }
            : comment
        )
      );
    } catch (err) {
      console.error("Failed to update comment:", err);
      alert("Failed to update comment");
    }
  };

  return {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    reload,
    addComment,
    deleteComment,
    updateComment,
  };
}
