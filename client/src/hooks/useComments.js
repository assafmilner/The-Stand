// useComments.js - תיקון הhook להוסיף את addComment
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const DEFAULT_LIMIT = 10;

export default function useComments({ postId, parentId = null }) {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // איפוס המצב כשמשתנים postId או parentId
  useEffect(() => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [postId, parentId]);

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

        setComments(prev =>
          page === 1 ? items : [...prev, ...items]
        );

        setHasMore(
          data.pagination?.hasMore ??
          items.length === DEFAULT_LIMIT
        );
      } catch (err) {
        if (err.response?.status === 404) {
          setHasMore(false);
        } else {
          console.error('שגיאה בטעינת תגובות:', err);
          setError('לא הצלחנו לטעון את התגובות');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, parentId, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
    }
  }, [loading, hasMore]);

  const reload = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  // הוסף את הפונקציה addComment שחסרה
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
  
    return newComment; // ← מחזיר גם אם זה reply
  };
  
  
  // הוסף את הפונקציה deleteComment שחסרה
  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/api/comments/${commentId}`);
      
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error("שגיאה במחיקת תגובה:", err);
      alert("שגיאה במחיקת תגובה");
    }
  };

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
      console.error("שגיאה בעדכון תגובה:", err);
      alert("שגיאה בעדכון תגובה");
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
    updateComment 
  };
}