import { createContext, useContext, useState } from "react";

const PostViewerContext = createContext();

export const PostViewerProvider = ({ children }) => {
  const [activePostId, setActivePostId] = useState(null);
  const [activePostData, setActivePostData] = useState(null);
  const [activePostMode, setActivePostMode] = useState('view');

  const openPost = (id, data, mode = 'view') => {
    setActivePostId(id);
    setActivePostData(data);
    setActivePostMode(mode);
  };

  const closePost = () => {
    setActivePostId(null);
    setActivePostData(null);
    setActivePostMode('view');
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
