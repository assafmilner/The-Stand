import React, { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";
import { useUser } from "../context/UserContext";
import EditModal from "../EditModal";

const PostList = ({ communityId, colors }) => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const url = communityId
          ? `http://localhost:3001/api/posts?communityId=${communityId}`
          : `http://localhost:3001/api/posts`;
        const res = await axios.get(url);
        setPosts(res.data);
      } catch (err) {
        setError("Error loading posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [communityId]);

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
        // אם יש קובץ חדש - נשלח FormData
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
        // אם רק עדכון טקסט / הסרת תמונה
        const res = await axios.put(
          `http://localhost:3001/api/posts/${editingPost._id}`,
          { content, media },
          { withCredentials: true }
        );
        updatedPost = res.data;
      }

      // הוספת פרטי כותב (הכרחיים לתצוגה לאחר עדכון)
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

  if (loading) return <p>טוען פוסטים...</p>;
  if (error) return <p>{error}</p>;
  if (!posts || posts.length === 0) return <p>אין עדיין פוסטים.</p>;

  return (
    <>
      <div className="post-list">
        {posts.map((post) => (
          <Post
            key={post._id}
            post={post}
            colors={colors}
            currentUserId={user?.email}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>

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
