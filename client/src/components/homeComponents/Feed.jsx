import { useEffect, useState } from "react";
import CreatePost from "../post/CreatePost";
import PostList from "../post/PostList";
import api from "utils/api";

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
        const res = await api.get(url);

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



  if (loading) return <p>טוען פוסטים...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
      <PostList posts={posts} colors={colors} currentUser={user} />
    </section>
  );
}

export default Feed;
