// client/src/hooks/usePosts.js - Fixed version
import { useState, useEffect, useCallback } from "react";
import api from "utils/api";

const DEFAULT_LIMIT = 20;

export default function usePosts({ 
  authorId = null, 
  communityId = null, 
  friendsOnly = false,
  teamOnly = false
}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset when filters change
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [authorId, communityId, friendsOnly, teamOnly]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let endpoint;
        let params = {
          page,
          limit: DEFAULT_LIMIT,
        };

        // ✅ Fixed endpoint selection logic
        if (friendsOnly) {
          endpoint = "/api/posts/friends"; // ✅ Correct endpoint
          console.log("🔥 usePosts: Using FRIENDS endpoint:", endpoint);
        } else if (teamOnly) {
          endpoint = "/api/posts/team"; // ✅ Correct endpoint  
          console.log("🔥 usePosts: Using TEAM endpoint:", endpoint);
        } else {
          // Generic endpoint for other cases
          endpoint = "/api/posts"; // ✅ Fixed: removed trailing slash
          console.log("🔥 usePosts: Using GENERIC endpoint:", endpoint);
          
          // Add filters for generic endpoint
          if (authorId) params.authorId = authorId;
          if (communityId) params.communityId = communityId;
        }

        console.log("🔥 usePosts: Making request to:", endpoint, "with params:", params);

        const { data } = await api.get(endpoint, { params });
        
        console.log("🔥 usePosts: Response received:", {
          success: data.success,
          postsCount: data.posts?.length,
          feedType: data.feedType
        });
        
        if (data.success) {
          const postsArray = Array.isArray(data.posts) ? data.posts : [];
          setPosts(prev =>
            page === 1 ? postsArray : [...prev, ...postsArray]
          );
      
          setHasMore(data.pagination?.hasMore ?? (postsArray.length === DEFAULT_LIMIT));
        } else {
          setError("Failed to load posts");
        }
      } catch (err) {
        console.error("🔥 usePosts ERROR:", err);
        console.error("🔥 usePosts ERROR details:", {
          friendsOnly,
          teamOnly,
          status: err.response?.status,
          url: err.config?.url
        });
        
        if (friendsOnly && err.response?.status === 401) {
          setError("נדרשת התחברות לצפייה בפוסטים מחברים");
        } else if (teamOnly && err.response?.status === 401) {
          setError("נדרשת התחברות לצפייה בפוסטים מהקהילה");
        } else if (friendsOnly) {
          setError("לא הצלחנו לטעון פוסטים מחברים");
        } else if (teamOnly) {
          setError("לא הצלחנו לטעון פוסטים מהקהילה");
        } else {
          setError("לא הצלחנו לטעון את הפוסטים");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, authorId, communityId, friendsOnly, teamOnly]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const reload = useCallback(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  const addPost = useCallback((newPost) => {
    setPosts(prev => [newPost, ...prev]);
  }, []);

  const removePost = useCallback((postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  }, []);

  const updatePost = useCallback((postId, updatedPost) => {
    setPosts(prev => 
      prev.map(post => 
        post._id === postId ? { ...post, ...updatedPost } : post
      )
    );
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    reload,
    addPost,
    removePost,
    updatePost
  };
}

// ✅ Export specific hooks that explicitly use the correct endpoints
export const useFriendsPosts = () => {
  console.log("🔥 useFriendsPosts: Hook called");
  return usePosts({ friendsOnly: true });
};

export const useTeamPosts = () => {
  console.log("🔥 useTeamPosts: Hook called");
  return usePosts({ teamOnly: true });
};