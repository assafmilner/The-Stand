import React from "react";
import PostList from "../post/PostList";

/**
 * FriendsFeed displays the feed of posts from the user's friends.
 * Delegates post handling and creation to the PostList component.
 *
 * Props:
 * - colors: team colors for styling
 * - user: the current logged-in user
 * - feedType: optional, defaults to "friends"
 */
const FriendsFeed = ({ colors, user, feedType = "friends" }) => {
  return (
    <PostList
      feedType={feedType}
      colors={colors}
      currentUser={user}
      showCreatePost={true}
    />
  );
};

export default FriendsFeed;
