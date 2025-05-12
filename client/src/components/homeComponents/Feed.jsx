import { useEffect, useState } from "react";
import axios from "axios";
import CreatePost from "../post/CreatePost";
import PostList from "../post/PostList";

function Feed({ colors, communityId }) {
  const [initialPostsData, setInitialPostsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // שליפת פוסטים ראשונים בלבד (עמוד 1)
  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        const url = communityId
          ? `http://localhost:3001/api/posts?communityId=${communityId}&page=1&limit=20`
          : `http://localhost:3001/api/posts?page=1&limit=20`;

        const res = await axios.get(url);
        setInitialPostsData(res.data.posts);
      } catch (err) {
        setError("בעיה בטעינת פוסטים");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPosts();
  }, [communityId]);

  const handlePostCreated = (newPost) => {
    // מוסיף את הפוסט החדש לראש הרשימה
    setInitialPostsData((prevPosts) =>
      prevPosts ? [newPost, ...prevPosts] : [newPost]
    );
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>טוען פוסטים...</p>
      </div>
    );

  if (error) return <p>{error}</p>;

  return (
    <section>
      {/* תיבת יצירת פוסט */}
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

      {/* תצוגת הפוסטים עם Infinite Scroll */}
      <PostList
        colors={colors}
        communityId={communityId}
        initialPosts={initialPostsData}
      />
    </section>
  );
}

export default Feed;
