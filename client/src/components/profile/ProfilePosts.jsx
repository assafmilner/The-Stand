import React from "react";
import { Award } from "lucide-react";
import PostList from "../post/PostList";

/**
 * ProfilePosts displays a user's posts inside their profile.
 * Uses the shared <PostList> component in "FETCH mode" based on authorId.
 *
 * Props:
 * - user: the profile owner
 * - isOwnProfile: whether the viewer is the owner
 * - colors: team color scheme for themed UI
 */
const ProfilePosts = ({ user, isOwnProfile, colors }) => {
  return (
    <div className="lg:col-span-2">
      <div className="profile-posts">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Award size={24} />
          {isOwnProfile ? `הפוסטים שלי` : `פוסטים של ${user?.name}`}
        </h2>

        {/* Render user's posts using PostList (fetches by authorId) */}
        <PostList
          authorId={user._id}
          colors={colors}
          currentUser={user}
          showCreatePost={isOwnProfile}
        />
      </div>
    </div>
  );
};

export default ProfilePosts;
