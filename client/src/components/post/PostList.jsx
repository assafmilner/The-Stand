import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import Post from "./Post";
import { useUser } from "../context/UserContext";
import EditModal from "../EditModal";

const PostList = ({ communityId, colors, initialPosts = null }) => {
  const { user } = useUser();
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts);
  const [error, setError] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [page, setPage] = useState(initialPosts ? 2 : 1); // Start from 2 if we have initial posts
  const [hasMore, setHasMore] = useState(!!communityId);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();

  // Intersection Observer callback for infinite scroll
  const lastPostElementRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore]
  );

  // Load initial posts if not provided
  useEffect(() => {
    if (!initialPosts) {
      fetchPosts();
    }
  }, [communityId]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      const url = communityId
        ? `http://localhost:3001/api/posts?communityId=${communityId}&page=${pageNum}&limit=20`
        : `http://localhost:3001/api/posts?page=${pageNum}&limit=20`;

      const res = await axios.get(url);

      console.log("res.data:", res.data);
      if (pageNum === 1) {
        setPosts(res.data.posts || res.data); // תמיכה בשתי התבניות
      } else {
        setPosts((prev) => [...prev, ...(res.data.posts || res.data)]);
      }

      // אם יש pagination, השתמש בו, אחרת השתמש בברירת מחדל
      if (res.data.pagination) {
        setHasMore(res.data.pagination.hasMore);
      } else {
        // אם אין pagination, בדוק אם הגיעו פוסטים פחות מהמבוקש
        setHasMore((res.data.posts || res.data).length === 20);
      }

      setPage(pageNum);
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Error loading posts.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchPosts(page + 1);
  };

  const handleDelete = async (postId) => {
    const confirmed = window.confirm("האם את/ה בטוח/ה שברצונך למחוק את הפוסט?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:3001/api/posts/${postId}`, {
        withCredentials: true,
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert("שגיאה במחיקת הפוסט.");
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
  };

  const handleUpdate = async ({ content, media, imageFile }) => {
    if (!editingPost) return;

    try {
      let updatedPost;

      if (imageFile) {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("image", imageFile);

        const res = await axios.put(
          `http://localhost:3001/api/posts/${editingPost._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        updatedPost = res.data;
      } else {
        const res = await axios.put(
          `http://localhost:3001/api/posts/${editingPost._id}`,
          { content, media },
          { withCredentials: true }
        );
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

      setPosts((prev) =>
        prev.map((p) => (p._id === editingPost._id ? enrichedPost : p))
      );
      setEditingPost(null);
    } catch (err) {
      console.error("שגיאה בעת עדכון הפוסט:", err);
      alert("שגיאה בעת עדכון הפוסט");
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>טוען פוסטים...</p>
      </div>
    );

  if (error) return <p>{error}</p>;
  if (!posts || posts.length === 0) return <p>אין עדיין פוסטים.</p>;
  console.log("POSTS:", posts);
  return (
    <>
      <div className="post-list">
        {posts.map((post, index) => {
          // Add ref to last post for infinite scroll
          if (posts.length === index + 1) {
            return (
              <div ref={lastPostElementRef} key={post._id}>
                <Post
                  post={post}
                  colors={colors}
                  currentUser={user}
                  currentUserId={user?._id}
                  currentUserEmail={user.email}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </div>
            );
          } else {
            return (
              <Post
                key={post._id}
                post={post}
                colors={colors}
                currentUser={user}
                currentUserId={user?._id}
                currentUserEmail={user.email}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            );
          }
        })}
      </div>

      {loadingMore && (
        <div className="loading-container" style={{ padding: "20px" }}>
          <div className="loading-spinner"></div>
          <p>טוען עוד פוסטים...</p>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>הגעת לסוף הפוסטים!</p>
        </div>
      )}

      {editingPost && (
        <EditModal
          post={editingPost}
          onCancel={handleCancelEdit}
          onSave={handleUpdate}
        />
      )}
    </>
  );
};

export default PostList;
