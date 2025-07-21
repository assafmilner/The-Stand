import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const DEFAULT_LIMIT = 20;

/**
 * usePosts
 *
 * Custom hook for loading and managing posts with various filters:
 * - authorId (single user)
 * - communityId (specific fan community)
 * - friendsOnly (only show friends' posts)
 * - teamOnly (only show posts from the user's team)
 *
 * Provides pagination, error handling, and post manipulation methods.
 */
export default function usePosts({
  authorId = null,
  communityId = null,
  friendsOnly = false,
  teamOnly = false,
}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Reset state when any filter dependency changes
   */
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [authorId, communityId, friendsOnly, teamOnly]);

  /**
   * Fetch posts from the correct endpoint, based on active filters.
   * Applies pagination and sets state accordingly.
   */
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let endpoint;
        let params = {
          page,
          limit: DEFAULT_LIMIT,
        };

        // Determine API endpoint based on filters
        if (friendsOnly) {
          endpoint = "/api/posts/friends";
        } else if (teamOnly) {
          endpoint = "/api/posts/team";
        } else {
          endpoint = "/api/posts";
          if (authorId) params.authorId = authorId;
          if (communityId) params.communityId = communityId;
        }

        const { data } = await api.get(endpoint, { params });

        if (data.success) {
          const postsArray = Array.isArray(data.posts) ? data.posts : [];
          setPosts((prev) =>
            page === 1 ? postsArray : [...prev, ...postsArray]
          );
          setHasMore(
            data.pagination?.hasMore ?? postsArray.length === DEFAULT_LIMIT
          );
        } else {
          setError("Failed to load posts");
        }
      } catch (err) {
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

  /**
   * Triggers loading the next page of posts
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  /**
   * Reloads all posts from page 1
   */
  const reload = useCallback(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  /**
   * Adds a new post to the top of the list
   */
  const addPost = useCallback((newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  /**
   * Removes a post by ID
   */
  const removePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  }, []);

  /**
   * Updates an existing post with new data
   */
  const updatePost = useCallback((postId, updatedPost) => {
    setPosts((prev) =>
      prev.map((post) =>
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
    updatePost,
  };
}

/**
 * useFriendsPosts
 *
 * Shortcut hook to fetch only friends' posts.
 */
export const useFriendsPosts = () => {
  return usePosts({ friendsOnly: true });
};

/**
 * useTeamPosts
 *
 * Shortcut hook to fetch posts from the user's favorite team.
 */
export const useTeamPosts = () => {
  return usePosts({ teamOnly: true });
};
