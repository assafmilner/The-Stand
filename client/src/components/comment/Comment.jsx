import React, { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import formatTimeAgo from "../../utils/formatTimeAgo";
import LikeModal from "../post/LikeModal";

const Comment = ({ comment, currentUserId, onLike, onDelete, onReply }) => {
  // כל הHooks חייבים להיות למעלה, לפני כל early return
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // useEffect חייב להיות כאן, לפני כל early return
  useEffect(() => {
    if (!comment || !comment.likes) return;

    const likes = comment.likes;
    setLikeCount(likes.length);

    if (likes && currentUserId) {
      setLiked(
        likes.some((user) => {
          // בדיקה אם לייק הוא string או object
          if (typeof user === "string") {
            return user === currentUserId;
          } else if (typeof user === "object" && user._id) {
            return user._id === currentUserId;
          }
          return false;
        })
      );
    }
  }, [comment, currentUserId]);

  // רק עכשיו אפשר לעשות early returns
  if (!comment) {
    return null;
  }

  const {
    authorId,
    content,
    createdAt,
    likes = [],
    _id,
    parentCommentId,
  } = comment;

  // בדיקות תקינות נוספות
  if (!authorId || !content || !_id) {
    console.error("Missing required comment data:", comment);
    return null;
  }

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1));
    if (onLike) {
      onLike(_id, newLiked);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !onReply) return;

    onReply(replyContent, _id);
    setIsReplying(false);
    setReplyContent("");
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(_id);
    }
  };

  return (
    <div className={`relative ${parentCommentId ? "ml-10" : ""}`}>
      {/* מחיקה */}
      {currentUserId === authorId?._id && (
        <button
          onClick={handleDelete}
          className="bg-transparent absolute top-1 left-2 text-red-500 text-xs hover:underline"
        >
          מחק
        </button>
      )}

      {/* אזור פרופיל + תגובה */}
      <div className="flex items-start gap-2 mb-1">
        <img
          src={authorId?.profilePicture || "/default-avatar.png"}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-800">
              {authorId?.name || "משתמש"}
            </span>
          </div>
          <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-800">
            {content}
          </div>

          {/* פעולות: זמן, הגב, לייק, ספירת לייקים */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <button
              onClick={() => setIsReplying(true)}
              className="bg-transparent text-gray-500 hover:underline"
            >
              הגב
            </button>
            <button
              onClick={handleLike}
              className="bg-transparent text-gray-500 hover:underline"
            >
              {liked ? "בטל לייק" : "לייק"}
            </button>
            {likeCount > 0 && (
              <button
                onClick={() => setShowLikeModal(true)}
                className="bg-transparent text-gray-500 hover:underline"
              >
                {likeCount} לייקים
              </button>
            )}
            <span>{formatTimeAgo(createdAt)}</span>
          </div>
        </div>
      </div>

      {/* תיבת תגובה */}
      {isReplying && (
        <div className="mt-2 mr-10">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="כתוב תגובה..."
            rows="2"
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
          <button
            onClick={handleReplySubmit}
            className="bg-transparent mt-1 text-blue-500 text-sm hover:underline"
          >
            שלח תגובה
          </button>
        </div>
      )}

      {/* מודאל לייקים */}
      {showLikeModal && (
        <LikeModal
          users={likes || []}
          onClose={() => setShowLikeModal(false)}
        />
      )}
    </div>
  );
};

export default Comment;
