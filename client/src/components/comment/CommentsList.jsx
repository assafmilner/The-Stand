import React, { useState, useEffect } from "react";
import axios from "axios";
import Comment from "./Comment";

const CommentsList = ({
  postId,
  currentUserId,
  currentUser,
  onCountUpdate,
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState({});

  useEffect(() => {
    console.log("currentUser:", currentUser);
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `http://localhost:3001/api/comments/post/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Raw comments data:", res.data);

        // התגובות מגיעות כמערך ישיר עם replies מוטמעים
        setComments(res.data.comments || res.data);

        // חישוב כמות תגובות כללית
        if (onCountUpdate) {
          const totalCount = (res.data.comments || res.data).reduce(
            (total, comment) => {
              return total + 1 + (comment.replies?.length || 0);
            },
            0
          );
          onCountUpdate(totalCount);
        }
      } catch (err) {
        console.error("שגיאה בטעינת תגובות:", err);
      }
    };

    fetchComments();
  }, [postId, onCountUpdate]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        `http://localhost:3001/api/comments`,
        {
          postId,
          content: newComment,
          parentCommentId: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // הוספת התגובה החדשה לתחילת הרשימה
      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("שגיאה ביצירת תגובה:", err);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `http://localhost:3001/api/comments/${commentId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // יש לרענן את הנתונים אחרי לייק
      // או לעדכן באופן מקומי את הסטייט
    } catch (err) {
      console.error("שגיאה בעדכון לייק לתגובה:", err);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`http://localhost:3001/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // מחיקת התגובה או הריפליי
      setComments((prev) => {
        return prev
          .map((comment) => {
            if (comment._id === commentId) {
              return null; // מחיקת התגובה הראשית
            }
            if (comment.replies) {
              comment.replies = comment.replies.filter(
                (reply) => reply._id !== commentId
              );
            }
            return comment;
          })
          .filter(Boolean);
      });
    } catch (err) {
      console.error("שגיאה במחיקת תגובה:", err);
    }
  };

  const handleReply = async (replyContent, parentCommentId) => {
    if (!replyContent.trim()) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        `http://localhost:3001/api/comments`,
        {
          postId,
          content: replyContent,
          parentCommentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // הוספת הריפליי לתגובה המתאימה
      setComments((prev) => {
        return prev.map((comment) => {
          if (comment._id === parentCommentId) {
            return {
              ...comment,
              replies: [res.data, ...(comment.replies || [])],
              repliesCount: (comment.repliesCount || 0) + 1,
            };
          }
          return comment;
        });
      });

      setReplyTo(null);
      setReplyContent("");
    } catch (err) {
      console.error("שגיאה בפרסום תגובה:", err);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <div className="bg-gray-100 p-4 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
        <div className="p-3 space-y-3 border-b">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="border-t border-gray-200 pt-2 mt-2"
            >
              <Comment
                comment={comment}
                currentUserId={currentUserId}
                onLike={handleLike}
                onDelete={handleDelete}
                onReply={(content) => handleReply(content, comment._id)}
              />

              {/* הצגת כפתור לצפייה בתגובות */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 ml-10">
                  {!showReplies[comment._id] ? (
                    <button
                      className="bg-transparent text-gray-500 text-xs hover:underline"
                      onClick={() => toggleReplies(comment._id)}
                    >
                      הצג {comment.replies.length} תגובות
                    </button>
                  ) : (
                    <>
                      {comment.replies.map((reply) => (
                        <div
                          key={reply._id}
                          className="border-t border-gray-200 pt-2 mt-2 mr-10"
                        >
                          <Comment
                            comment={reply}
                            currentUserId={currentUserId}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            onReply={(content) =>
                              handleReply(content, comment._id)
                            }
                          />
                        </div>
                      ))}
                      <button
                        className="bg-transparent text-gray-500 text-xs hover:underline"
                        onClick={() => toggleReplies(comment._id)}
                      >
                        הסתר תגובות
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* שורת כתיבת תגובה */}
        <div className="p-3 flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 ml-2 overflow-hidden">
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm flex justify-center items-center h-full">
                {currentUser?.name?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className="flex-1 flex items-center relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="כתוב תגובה..."
              className="w-full rounded-full py-2 px-4 bg-gray-100 focus:outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddComment();
                }
              }}
            />
          </div>
          {newComment.trim() && (
            <button
              onClick={handleAddComment}
              className="mr-2 text-blue-500 font-medium"
            >
              הגב
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsList;
