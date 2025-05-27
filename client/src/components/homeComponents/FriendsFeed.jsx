// client/src/components/homeComponents/FriendsFeed.jsx - Using flexible PostList
import React, { useEffect, useState } from "react";
import CreatePost from "../post/CreatePost";
import PostList from "../post/PostList";
import api from "../../utils/api";

function FriendsFeed({ colors, user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 

  useEffect(() => {
    const fetchFriendsPosts = async () => {
      try {
        setLoading(true);
        setError("");


        const response = await api.get("/api/posts/friends");

        if (response.data.success) {
          setPosts(response.data.posts || []);
        } else {
          setError("API returned success: false");
        }
      } catch (err) {
        setError("API call failed: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFriendsPosts();
    }
  }, [user]);

  return (
    <section className="space-y-6">
     
      <CreatePost colors={colors} />

      {/* ✅ Use flexible PostList in DISPLAY mode */}
      <PostList
        posts={posts}
        loading={loading}
        error={error}
        colors={colors}
        currentUser={user}
        showCreatePost={false}
      />
    </section>
  );
}

export default FriendsFeed;
