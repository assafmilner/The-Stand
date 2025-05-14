import { useEffect, useState } from "react";
import axios from "axios";
import CreatePost from "../post/CreatePost";
import PostList from "../post/PostList";

function Feed({ colors, communityId, user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const url = communityId
          ? `http://localhost:3001/api/posts?communityId=${communityId}`
          : `http://localhost:3001/api/posts`;
        const res = await axios.get(url);

        // התמודדות עם התגובה החדשה
        setPosts(res.data.posts || res.data);
      } catch (err) {
        setError("בעיה בטעינת פוסטים");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [communityId]);

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  if (loading) return <p>טוען פוסטים...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
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

      <PostList posts={posts} colors={colors}  currentUser={user}  />
    </section>
  );
}

export default Feed;
