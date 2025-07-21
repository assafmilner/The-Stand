import React, { useEffect, useState } from "react";
import CreatePost from "../post/CreatePost";
import PostList from "../post/PostList";
import api from "../../utils/api";

/**
 * TeamFeed component displays the feed for the user's favorite team.
 * It fetches the relevant posts from the backend and renders a post creation box and post list.
 *
 * Props:
 * - colors: team colors for styling
 * - user: the current logged-in user
 */
function TeamFeed({ colors, user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeamPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/posts/team");

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

    if (user?.favoriteTeam) {
      fetchTeamPosts();
    }
  }, [user?.favoriteTeam]);

  // If user has no favorite team set, show a placeholder message
  if (!user?.favoriteTeam) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <p className="text-red-500 text-lg font-medium">
          לא הוגדרה קבוצה אהודה
        </p>
        <p className="text-gray-500 mt-2">
          עדכן את פרטי הפרופיל שלך כדי לראות את קהילת הקבוצה
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Post creation input box */}
      <CreatePost colors={colors} />

      {/* List of team posts */}
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

export default TeamFeed;
