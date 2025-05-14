import { useContext } from "react";
import PostViewerContext from "../context/PostViewerContext";

export const usePostViewer = () => {
  const context = useContext(PostViewerContext);
  if (!context) {
    throw new Error("usePostViewer must be used within a PostViewerProvider");
  }
  return context;
};
