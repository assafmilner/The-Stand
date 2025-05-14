// FILE: post/Post.jsx
import React from "react";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import { usePostViewer } from "../../hooks/usePostViewer";

const Post = ({ post, currentUser, onDelete, colors }) => {
  const isOwner = currentUser?.email === post.authorId.email;
  const { openPost } = usePostViewer();

  return (
    <div
      className="post-card"
      style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        marginBottom: "1rem",
        padding: "1rem",
        backgroundColor: "#fff",
      }}
    >
      <PostHeader
        author={post.authorId}
        createdAt={post.createdAt}
        isOwner={isOwner}
        onEdit={() => openPost(post._id, post)}
        onDelete={() => onDelete(post._id)}
      />

      <PostContent content={post.content} media={post.media} />

      <button
        onClick={() => openPost(post._id, post)}
        style={{
          marginTop: "0.5rem",
          background: "transparent",
          border: "none",
          color: "#4f46e5",
          fontSize: "0.85rem",
          cursor: "pointer",
        }}
      >
        צפה בפוסט
      </button>

      <PostActions
        postId={post._id}
        currentUser={currentUser}
        colors={colors}
      />
    </div>
  );
};

export default Post;
