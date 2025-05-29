import React from "react";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import { usePostViewer } from "../../hooks/usePostViewer";
import { useUser } from "../../context/UserContext";

const Post = ({ post, onDelete, colors }) => {
  const { user } = useUser();
  const { openPost } = usePostViewer();

  const isOwner = user?._id === post.authorId._id;

  const handleDelete = () => {
    // פשוט קורא ל-onDelete - המודל כבר טיפל באישור
    onDelete(post._id);
  };

  return (
    <div className="post-card">
      <PostHeader
        author={post.authorId}
        createdAt={post.createdAt}
        isOwner={isOwner}
        onEdit={isOwner ? () => openPost(post._id, post, "edit") : null}
        onDelete={isOwner ? handleDelete : null} // ← כאן השינוי - ללא window.confirm
      />

      <PostContent content={post.content} media={post.media} />

      <PostActions
        postId={post._id}
        likes={post.likes || []}
        authorId={post.authorId._id}
        currentUser={user}
        colors={colors}
      />
    </div>
  );
};

export default Post;