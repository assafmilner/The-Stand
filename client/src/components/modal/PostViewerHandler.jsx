import React from "react";
import { usePostViewer } from "../../hooks/usePostViewer";
import EditPostModal from "./EditPostModal";
import PostModalViewOnly from "./PostModalViewOnly";

const PostViewerHandler = ({ onEditPost }) => {
  const { activePostId, activePostData, activePostMode, closePost } = usePostViewer();

  if (!activePostId || !activePostData) return null;

  const handleSave = (updatedData) => {
    onEditPost?.(activePostId, updatedData);
    closePost();
  };

  if (activePostMode === 'edit') {
    return (
      <EditPostModal
        post={activePostData}
        onSave={handleSave}
        onCancel={closePost}
      />
    );
  } else {
    return (
      <PostModalViewOnly
        post={activePostData}
        onClose={closePost}
      />
    );
  }
};

export default PostViewerHandler;
