import React from "react";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import { usePostViewer } from "../../hooks/usePostViewer";

const Post = ({ post, currentUser, onDelete, colors }) => {
  const isOwner = currentUser?.email === post.authorId.email;
  const { openPost } = usePostViewer();

  return (
    <div className="post-card">
      <PostHeader
        author={post.authorId}
        createdAt={post.createdAt}
        isOwner={isOwner}
        onEdit={() => openPost(post._id, post)}
        onDelete={() => onDelete(post._id)}
      />

      <PostContent content={post.content} media={post.media} />

      <button
        className="view-post"
        onClick={() => openPost(post._id, post)}
      >
        צפה בפוסט
      </button>

      <PostActions
        postId={post._id}
        likes={post.likes || []}
        authorId={post.authorId._id}
        currentUser={currentUser}
        colors={colors}
      />
    </div>
  );
};

export default Post;
