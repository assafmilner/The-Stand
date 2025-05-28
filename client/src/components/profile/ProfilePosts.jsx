// client/src/components/profile/ProfilePosts.jsx - Fixed to use flexible PostList
import React from "react";
import { Award } from "lucide-react";
import PostList from "../post/PostList";

const ProfilePosts = ({ user, isOwnProfile, colors }) => {
  return (
    <div className="lg:col-span-2">
      <div className="profile-posts">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Award size={24} />
          {isOwnProfile ? `הפוסטים שלי` : `פוסטים של ${user?.name}`}
        </h2>

        {/* ✅ Use flexible PostList in FETCH mode */}
        <PostList
          authorId={user._id} // ✅ This triggers FETCH mode for this user's posts
          colors={colors}
          currentUser={user}
          showCreatePost={isOwnProfile} // Only show create post on own profile
        />
      </div>
    </div>
  );
};

export default ProfilePosts;
