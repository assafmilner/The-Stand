// client/src/components/post/PostList.jsx - Flexible version
import React, { useEffect, useRef, useState, useMemo } from "react";
import usePosts from "../../hooks/usePosts";
import { useUser } from "context/UserContext";
import Post from "./Post";
import PostViewerHandler from "../modal/PostViewerHandler";
import CreatePost from "./CreatePost";
import api from "utils/api";
import teamColors from "utils/teamStyles";

const PostList = ({
  // Props for display-only mode (FriendsFeed/TeamFeed)
  posts: propsPosts = null, // If provided, use these posts
  loading: propsLoading = false, // If provided, use this loading state
  error: propsError = null, // If provided, use this error state

  // Props for fetch mode (Profile pages)
  authorId = null, // For fetching specific user's posts
  communityId = null, // For fetching community posts
  feedType = null, // "friends" | "team" | null (for generic)

  // Display options
  showCreatePost = true, // Whether to show create post
  colors: propsColors = null, // Colors (optional)
  currentUser: propsCurrentUser = null, // Current user (optional)
}) => {
  const { user } = useUser();
  const [localPosts, setLocalPosts] = useState([]);

  // Use provided user or context user
  const currentUser = propsCurrentUser || user;

  // Use provided colors or generate from user
  const colors = useMemo(() => {
    if (propsColors) return propsColors;
    return teamColors[currentUser?.favoriteTeam || "הפועל תל אביב"];
  }, [propsColors, currentUser?.favoriteTeam]);

  // Determine if we should fetch data or use provided data
  const shouldFetch = propsPosts === null;

  // Set up usePosts hook parameters
  let hookParams = {};
  if (shouldFetch) {
    if (feedType === "friends") {
      hookParams = { friendsOnly: true };
    } else if (feedType === "team") {
      hookParams = { teamOnly: true };
    } else {
      hookParams = { authorId, communityId };
    }
  }

  // Use usePosts hook only when we need to fetch data
  const hookResult = usePosts(shouldFetch ? hookParams : {});
  const {
    posts: hookPosts = [],
    loading: hookLoading = false,
    error: hookError = null,
    hasMore = false,
    loadMore = () => {},
  } = shouldFetch ? hookResult : {};

  const observerRef = useRef();

  // Determine which data to use
  const posts = shouldFetch ? hookPosts : propsPosts || [];
  const loading = shouldFetch ? hookLoading : propsLoading;
  const error = shouldFetch ? hookError : propsError;

  const canCreatePost =
    (!authorId || authorId === currentUser?._id) && showCreatePost;

  useEffect(() => {
    setLocalPosts([]);
  }, [authorId, communityId, feedType]);

  // Infinite scroll observer (only for fetch mode)
  useEffect(() => {
    if (!shouldFetch) return; // Skip for display-only mode

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.disconnect();
    };
  }, [hasMore, loadMore, shouldFetch]);

  const handlePostCreated = (newPost) => {
    setLocalPosts((prev) => [newPost, ...prev]);
  };

  const handleEditPost = async (postId, { content, media, imageFile }) => {
    try {
      let updatedPost;

      if (imageFile) {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("image", imageFile);

        const res = await api.put(`/api/posts/${postId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updatedPost = res.data;
      } else {
        const res = await api.put(`/api/posts/${postId}`, { content, media });
        updatedPost = res.data;
      }

      const enrichedPost = {
        ...updatedPost,
        authorId: {
          _id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          profilePicture: currentUser.profilePicture,
        },
      };

      setLocalPosts((prev) => {
        const exists = prev.some((p) => p._id === postId);
        return exists
          ? prev.map((p) => (p._id === postId ? enrichedPost : p))
          : [enrichedPost, ...prev];
      });
    } catch (err) {
      console.error("שגיאה בעדכון פוסט:", err);
      alert("שגיאה בעדכון פוסט");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/api/posts/${postId}`);
      setLocalPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("שגיאה במחיקת פוסט:", err);
      alert("שגיאה במחיקת הפוסט");
    }
  };

  // Merge server posts with local posts (for new/edited posts)
  const mergedPosts = posts.map((serverPost) => {
    const localOverride = localPosts.find((p) => p._id === serverPost._id);
    return localOverride || serverPost;
  });

  const onlyLocalNew = localPosts.filter(
    (lp) => !posts.some((sp) => sp._id === lp._id)
  );

  const finalPosts = [...onlyLocalNew, ...mergedPosts];

  return (
    <div className="post-list">
      {canCreatePost && (
        <div
          className="dashboard-card post-box"
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            borderTop: `4px solid ${colors.primary}`,
            backgroundColor: "var(--card-bg)",
            borderRadius: "1rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <CreatePost colors={colors} onPostCreated={handlePostCreated} />
        </div>
      )}

      {finalPosts.map((post) => (
        <Post
          key={post._id}
          post={post}
          currentUser={currentUser}
          colors={colors}
          onDelete={handleDeletePost}
        />
      ))}

      {loading && <p style={{ textAlign: "center" }}>טוען פוסטים...</p>}
      {!loading && finalPosts.length === 0 && (
        <p style={{ textAlign: "center" }}>אין פוסטים להצגה</p>
      )}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Infinite scroll anchor (only for fetch mode) */}
      {shouldFetch && <div ref={observerRef} style={{ height: 1 }} />}

      <PostViewerHandler onEditPost={handleEditPost} />
    </div>
  );
};

export default PostList;
