import { createContext, useContext, useState } from "react";

const PostViewerContext = createContext();

export const PostViewerProvider = ({ children }) => {
  const [activePostId, setActivePostId] = useState(null);
  const [activePostData, setActivePostData] = useState(null);

  const openPost = (postId, postData = null) => {
    setActivePostId(postId);
    if (postData) setActivePostData(postData);
  };

  const closePost = () => {
    setActivePostId(null);
    setActivePostData(null);
  };

  return (
    <PostViewerContext.Provider
      value={{
        activePostId,
        activePostData,
        openPost,
        closePost,
      }}
    >
      {children}
    </PostViewerContext.Provider>
  );
};

export default PostViewerContext;
