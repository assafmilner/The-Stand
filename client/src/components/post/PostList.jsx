import React, { useEffect, useRef, useState } from "react";
import usePosts from "../../hooks/usePosts";
import { useUser } from "../context/UserContext";
import Post from "./Post";
import CreatePost from "./CreatePost";
import PostViewerHandler from "../modal/PostViewerHandler";
import api from "../../api";

const PostList = ({ authorId = null, communityId = null }) => {
  const { user } = useUser();
  const { posts, loading, error, hasMore, loadMore } = usePosts({
    authorId,
    communityId,
  });
  const [localPosts, setLocalPosts] = useState([]);
  const observerRef = useRef();

  // Reset localPosts כאשר משתנים הפילטרים
  useEffect(() => {
    setLocalPosts([]);
  }, [authorId, communityId]);

  // חיבור ל-Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.disconnect();
      }
    };
  }, [hasMore, loadMore]);

  // פוסט חדש לראש הרשימה
  const handlePostCreated = (newPost) => {
    setLocalPosts((prev) => [newPost, ...prev]);
  };

  // עדכון פוסט קיים (עריכה)
  const handleEditPost = async (postId, { content, media, imageFile }) => {
    try {
      let updatedPost;

      if (imageFile) {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("image", imageFile);

        const res = await api.put(`/posts/${postId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updatedPost = res.data;
      } else {
        const res = await api.put(`/posts/${postId}`, { content, media });
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

      setLocalPosts((prev) =>
        prev.map((p) => (p._id === postId ? enrichedPost : p))
      );
    } catch (err) {
      console.error("שגיאה בעדכון פוסט:", err);
      alert("שגיאה בעדכון פוסט");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setLocalPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("שגיאה במחיקת פוסט:", err);
      alert("שגיאה במחיקת הפוסט");
    }
  };

  const combinedPosts = [...localPosts, ...posts];

  return (
    <div className="post-list">
      {/* יצירת פוסט */}
      {!authorId && user && (
        <div style={{ marginBottom: "1rem" }}>
          <CreatePost
            onPostCreated={handlePostCreated}
            colors={user?.teamColors}
          />
        </div>
      )}

      {/* הצגת פוסטים */}
      {combinedPosts.map((post) => (
        <Post
          key={post._id}
          post={post}
          currentUser={user}
          colors={user?.teamColors}
          onDelete={handleDeletePost}
        />
      ))}

      {loading && <p style={{ textAlign: "center" }}>טוען פוסטים...</p>}
      {!loading && combinedPosts.length === 0 && (
        <p style={{ textAlign: "center" }}>אין פוסטים להצגה</p>
      )}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <div ref={observerRef} style={{ height: 1 }} />

      {/* הצגת מודאל עריכה בעת הצורך */}
      <PostViewerHandler onEditPost={handleEditPost} />
    </div>
  );
};

export default PostList;
