import React from "react";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import { usePostViewer } from "../../hooks/usePostViewer";
import { useUser } from "../../context/UserContext";

/**
 * Post
 *
 * A full post component composed of header, content, and action sections.
 * It supports owner-specific features such as editing and deleting posts.
 * Uses context to check ownership and trigger edit via PostViewer.
 *
 * Props:
 * - post (object): the post object with content, author, media, etc.
 * - onDelete (function): callback to delete the post
 * - colors (object): team-based styling (e.g., primary color)
 */

const Post = ({ post, onDelete, colors }) => {
  const { user } = useUser();
  const { openPost } = usePostViewer();

  const isOwner = user?._id === post.authorId._id;

  const handleDelete = () => {
    onDelete(post._id);
  };

  return (
    <div className="post-card">
      <PostHeader
        author={post.authorId}
        createdAt={post.createdAt}
        isOwner={isOwner}
        onEdit={isOwner ? () => openPost(post._id, post, "edit") : null}
        onDelete={isOwner ? handleDelete : null}
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
