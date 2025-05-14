import { useState, useEffect } from "react";
import api from "../api";
import { useUser } from "../context/UserContext";

export const useComments = ({ postId }) => {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // שליפת תגובות
  useEffect(() => {
    if (!postId) return;

    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/posts/${postId}/comments`);
        setComments(data || []);
      } catch (err) {
        console.error("שגיאה בטעינת תגובות:", err);
      }
    };

    fetchComments();
  }, [postId]);

  // הוספת תגובה חדשה
  const addComment = async (text) => {
    if (!user || !text.trim()) return;

    const commentData = {
      authorId: user._id,
      content: text,
    };

    try {
      const { data } = await api.post(`/posts/${postId}/comments`, commentData);

      const newComment = {
        ...data,
        authorId: {
          _id: user._id,
          name: user.name,
          profilePicture: user.profilePicture,
        },
      };

      setComments((prev) => [...prev, newComment]);
    } catch (err) {
      console.error("שגיאה בהוספת תגובה:", err);
    }
  };

  // מחיקת תגובה
  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("שגיאה במחיקת תגובה:", err);
    }
  };

  // הכנה לתגובת תגובה
  const replyToComment = async (parentCommentId, replyText) => {
    if (!user || !replyText.trim()) return;
  
    const replyData = {
      authorId: user._id,
      content: replyText,
      parentCommentId,
    };
  
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, replyData);
  
      const newReply = {
        ...data,
        authorId: {
          _id: user._id,
          name: user.name,
          profilePicture: user.profilePicture,
        },
      };
  
      // הוספת תגובת תגובה (reply) כ־replies בתגובה הראשית
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === parentCommentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), newReply],
              }
            : comment
        )
      );
    } catch (err) {
      console.error("שגיאה בהוספת תגובת תגובה:", err);
    }
  };
  
  return {
    comments,
    loading,
    addComment,
    deleteComment,
    replyToComment,
  };
};
