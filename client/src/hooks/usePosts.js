import { useState, useEffect, useCallback } from "react";
import api from "utils/api";

const DEFAULT_LIMIT = 20;

export default function usePosts({ authorId = null, communityId = null }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset כשמשתנים פילטרים
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [authorId, communityId]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/posts", {
          params: {
            page,
            limit: DEFAULT_LIMIT,
            ...(authorId && { authorId }),
            ...(communityId && { communityId }),
          },
        });

        setPosts(prev =>
          page === 1 ? data.posts : [...prev, ...data.posts]
        );

        setHasMore(data.pagination?.hasMore ?? false);
      } catch (err) {
        console.error("שגיאה בטעינת פוסטים:", err);
        setError("לא הצלחנו לטעון את הפוסטים");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, authorId, communityId]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    reload: () => {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      setError(null);
    },
  };
}
