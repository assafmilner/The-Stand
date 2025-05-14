// src/hooks/useComments.js
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';  // ודא שב־api.baseURL הוגדר ל־http://localhost:3001

const DEFAULT_LIMIT = 10; // תואם לברירת המחדל של השרת

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
        // אם יש parentId – נטען תגובות-לתגובה, אחרת תגובות ראשוניות
        const endpoint = parentId
          ? `/api/comments/replies/${parentId}`       // GET /api/comments/replies/:commentId :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
          : `/api/comments/post/${postId}`            // GET /api/comments/post/:postId :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}

        const { data } = await api.get(endpoint, {
          params: { page, limit: DEFAULT_LIMIT },
        });

        // מבנה התשובה: data.comments (לראשוניות) או data.replies (לתגובות)
        const items = parentId ? data.replies : data.comments;  // :contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5}

        setComments(prev =>
          page === 1 ? items : [...prev, ...items]
        );

        // pagination.hasMore מוחלף ב־hasMore
        setHasMore(
          data.pagination?.hasMore ??
          items.length === DEFAULT_LIMIT
        );
      } catch (err) {
        if (err.response?.status === 404) {
          // לא נמצאו עוד פריטים → נגמרה הפאג'ינציה
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

  return { comments, loading, error, hasMore, loadMore, reload };
}
