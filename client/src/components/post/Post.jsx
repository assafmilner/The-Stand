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

  return (
    <div className="post-card">
      <PostHeader
        author={post.authorId}
        createdAt={post.createdAt}
        isOwner={isOwner}
        onEdit={isOwner ? () => openPost(post._id, post, "edit") : null} // ← חשוב
        onDelete={isOwner ? () => onDelete(post._id) : null} // ← חשוב
      />

      <PostContent content={post.content} media={post.media} />

      <button
        className="view-post"
        onClick={() => openPost(post._id, post, "view")}
      >
        צפה בפוסט
      </button>

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
