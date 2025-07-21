import React from "react";
import { usePostViewer } from "../../hooks/usePostViewer";
import EditPostModal from "./EditPostModal";

/**
 * PostViewerHandler
 *
 * A handler component that displays an editor modal for a selected post,
 * based on global post viewer state from usePostViewer().
 *
 * Props:
 * - onEditPost (function): Callback triggered when the post is edited.
 *
 * Behavior:
 * - If a post is in "edit" mode, shows EditPostModal with current post data.
 * - On save, invokes the edit callback and closes the modal.
 */

const PostViewerHandler = ({ onEditPost }) => {
  const { activePostId, activePostData, activePostMode, closePost } =
    usePostViewer();

  if (!activePostId || !activePostData) return null;

  const handleSave = (updatedData) => {
    onEditPost?.(activePostId, updatedData);
    closePost();
  };

  if (activePostMode === "edit") {
    return (
      <EditPostModal
        post={activePostData}
        onSave={handleSave}
        onCancel={closePost}
      />
    );
  }
};

export default PostViewerHandler;
