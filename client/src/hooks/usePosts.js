import { useState, useEffect, useCallback } from "react";
import api from "utils/api";

const DEFAULT_LIMIT = 20;

export default function usePosts({ 
  authorId = null, 
  communityId = null, 
  friendsOnly = false, // New parameter
  teamOnly = false // New parameter for team posts
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
        let endpoint = "/api/posts/team";
        let params = {
          page,
          limit: DEFAULT_LIMIT,
        };

        // Handle friends only posts
        if (friendsOnly) {
          endpoint = "/api/posts/friends";
        }
        // Handle team only posts
        else if (teamOnly) {
          endpoint = "/api/posts/team";
        }
        // Handle other filters
        else {
          if (authorId) params.authorId = authorId;
          if (communityId) params.communityId = communityId;
        }

        const { data } = await api.get(endpoint, { params });
        
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
        console.error("שגיאה בטעינת פוסטים:", err);
        
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

  // Add a post to the beginning of the list (for when user creates a new post)
  const addPost = useCallback((newPost) => {
    setPosts(prev => [newPost, ...prev]);
  }, []);

  // Remove a post (for when user deletes a post)
  const removePost = useCallback((postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  }, []);

  // Update a post (for when user edits a post)
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

// Export a specific hook for friends posts
export const useFriendsPosts = () => {
  return usePosts({ friendsOnly: true });
};

// Export a specific hook for team posts
export const useTeamPosts = () => {
  return usePosts({ teamOnly: true });
};