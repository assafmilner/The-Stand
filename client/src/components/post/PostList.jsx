import React, { useEffect, useRef, useState, useMemo } from "react";
import usePosts from "../../hooks/usePosts";
import { useUser } from "context/UserContext";
import Post from "./Post";
import PostViewerHandler from "../modal/PostViewerHandler";
import CreatePost from "./CreatePost";
import api from "utils/api";
import teamColors from "utils/teamStyles";

const PostList = ({ authorId = null, communityId = null }) => {
  const { user } = useUser();
  const { posts, loading, error, hasMore, loadMore } = usePosts({
    authorId,
    communityId,
  });
  const [localPosts, setLocalPosts] = useState([]);
  const observerRef = useRef();

  const canCreatePost = !authorId || authorId === user?._id;

  const colors = useMemo(
    () => teamColors[user?.favoriteTeam || "הפועל תל אביב"],
    [user?.favoriteTeam]
  );

  useEffect(() => {
    setLocalPosts([]);
  }, [authorId, communityId]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.disconnect();
    };
  }, [hasMore, loadMore]);

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
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
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
          currentUser={user}
          colors={colors}
          onDelete={handleDeletePost}
        />
      ))}

      {loading && <p style={{ textAlign: "center" }}>טוען פוסטים...</p>}
      {!loading && finalPosts.length === 0 && (
        <p style={{ textAlign: "center" }}>אין פוסטים להצגה</p>
      )}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <div ref={observerRef} style={{ height: 1 }} />
      <PostViewerHandler onEditPost={handleEditPost} />
    </div>
  );
};

export default PostList;
