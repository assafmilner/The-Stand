import { useContext } from "react";
import PostViewerContext from "../context/PostViewerContext";

/**
 * usePostViewer
 *
 * Custom hook to access the PostViewerContext.
 * Exposes activePostId, activePostData, activePostMode, and control functions.
 *
 * Must be used inside a PostViewerProvider.
 */
export const usePostViewer = () => {
  const context = useContext(PostViewerContext);
  if (!context) {
    throw new Error("usePostViewer must be used within a PostViewerProvider");
  }
  return context;
};
