import { createContext, useContext, useState } from "react";

/**
 * PostViewerContext
 *
 * Provides global context for managing the currently viewed post.
 * Useful for modals, overlays, or detailed post views.
 */
const PostViewerContext = createContext();

/**
 * PostViewerProvider
 *
 * Wraps the app (or relevant tree) and provides:
 * - Active post ID and data
 * - Viewing/editing mode
 * - `openPost` and `closePost` actions
 */
export const PostViewerProvider = ({ children }) => {
  const [activePostId, setActivePostId] = useState(null);
  const [activePostData, setActivePostData] = useState(null);
  const [activePostMode, setActivePostMode] = useState("view");

  /**
   * openPost
   *
   * Sets the context to the given post ID, data, and mode.
   * `mode` can be 'view' or 'edit'
   */
  const openPost = (id, data, mode = "view") => {
    setActivePostId(id);
    setActivePostData(data);
    setActivePostMode(mode);
  };

  /**
   * closePost
   *
   * Resets the viewer state back to initial.
   */
  const closePost = () => {
    setActivePostId(null);
    setActivePostData(null);
    setActivePostMode("view");
  };

  return (
    <PostViewerContext.Provider
      value={{
        activePostId,
        activePostData,
        activePostMode,
        openPost,
        closePost,
      }}
    >
      {children}
    </PostViewerContext.Provider>
  );
};

export default PostViewerContext;
