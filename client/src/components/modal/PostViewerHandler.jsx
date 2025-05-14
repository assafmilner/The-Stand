// FILE: components/modal/PostViewerHandler.jsx
import React from "react";
import { usePostViewer } from "../../hooks/usePostViewer";
import EditPostModal from "./EditPostModal";

const PostViewerHandler = ({ onEditPost }) => {
  const { activePostId, activePostData, closePost } = usePostViewer();

  if (!activePostId || !activePostData) return null;

  const handleSave = (updatedData) => {
    // אתה יכול לשלוח PUT לשרת כאן או להעביר למעלה דרך onEditPost
    onEditPost?.(activePostId, updatedData);
    closePost();
  };

  return (
    <EditPostModal
      post={activePostData}
      onSave={handleSave}
      onCancel={closePost}
    />
  );
};

export default PostViewerHandler;
