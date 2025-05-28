// client/src/components/homeComponents/Feed.jsx - Simplified to let PostList handle everything

import React from "react";
import PostList from "../post/PostList";

const FriendsFeed = ({ colors, user, feedType = "friends" }) => {
  // Simply pass the props to PostList and let it handle the data fetching and updates
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