import React, { useState, useEffect } from "react";
import axios from "axios";
import Comment from "./Comment";
import { groupBy } from "lodash";

const CommentsList = ({
  postId,
  currentUserId,
  currentUser,
  onCountUpdate,
}) => {
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showMoreReplies, setShowMoreReplies] = useState({});

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

        const grouped = groupBy(res.data, (c) => c.parentCommentId || "root");
        setComments(grouped);

        // עדכון כמות תגובות
        if (onCountUpdate) {
          const total =
            (grouped.root?.length || 0) +
            Object.values(grouped)
              .filter((_, key) => key !== "root")
              .reduce((sum, arr) => sum + arr.length, 0);
          onCountUpdate(total);
        }
      } catch (err) {
        console.error("שגיאה בטעינת תגובות:", err);
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        `http://localhost:3001/api/comments`,
        {
          postId,
          content: newComment,
          parentCommentId: replyTo || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments((prev) => {
        const updated = { ...prev };
        if (replyTo) {
          updated[replyTo] = updated[replyTo]
            ? [...updated[replyTo], res.data]
            : [res.data];
        } else {
          updated["root"] = [res.data, ...(updated["root"] || [])];
        }
        return updated;
      });

      setNewComment("");
      setReplyTo(null);
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

      setComments((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach(
          (key) =>
            (updated[key] = updated[key].filter((c) => c._id !== commentId))
        );
        delete updated[commentId];
        return updated;
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

      setComments((prev) => {
        const updated = { ...prev };
        updated[parentCommentId] = [
          res.data,
          ...(updated[parentCommentId] || []),
        ];
        return updated;
      });

      setReplyTo(null);
    } catch (err) {
      console.error("שגיאה בפרסום תגובה:", err);
    }
  };

  const toggleReplies = (commentId) => {
    setShowMoreReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <div className="bg-gray-100 p-4 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
        <div className="p-3 space-y-3 border-b">
          {comments.root?.map((comment) => (
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div key={comment._id}>
                <Comment
                  comment={comment}
                  currentUserId={currentUserId}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onReply={handleReply}
                />
              </div>

              {comments[comment._id]?.length > 0 && (
                <div className="mt-2 ">
                  {!showMoreReplies[comment._id] ? (
                    <button
                      className="bg-transparent text-gray-500 text-xs hover:underline"
                      onClick={() => toggleReplies(comment._id)}
                    >
                      הצג את כל {comments[comment._id].length} התגובות
                    </button>
                  ) : (
                    <>
                      {comments[comment._id].map((reply) => (
                        <div
                          key={reply._id}
                          className="border-t border-gray-200 pt-2 mt-2 mr-10"
                        >
                          <Comment
                            comment={reply}
                            currentUserId={currentUserId}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            onReply={handleReply}
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
