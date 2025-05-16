import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";
import PostList from "../post/PostList";
import axios from "axios";

const ProfilePosts = ({ user, isOwnProfile, colors }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://localhost:3001/api/posts?authorId=${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserPosts(response.data.posts || response.data);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchUserPosts();
    }
  }, [user?._id]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="loading-spinner"></div>
        <span>טוען פוסטים...</span>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="profile-posts">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Award size={24} />
          {isOwnProfile
            ? `הפוסטים שלי (${userPosts.length})`
            : `פוסטים (${userPosts.length})`}
        </h2>

        {userPosts.length === 0 ? (
          <div className="profile-empty-posts">
            <div className="profile-empty-icon">📝</div>
            <h3 className="text-lg font-semibold mb-2">
              {isOwnProfile
                ? "עדיין לא פרסמת פוסטים"
                : "המשתמש עדיין לא פרסם פוסטים"}
            </h3>
            {isOwnProfile && (
              <>
                <p className="text-gray-500 mb-4">
                  החל לשתף את המחשבות שלך על הכדורגל!
                </p>
                <button
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.primary }}
                  onClick={() => (window.location.href = "/home")}
                >
                  צור פוסט ראשון
                </button>
              </>
            )}
          </div>
        ) : (
          <PostList
            authorId={user._id}
            colors={colors}
            showCreateButton={false}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePosts;