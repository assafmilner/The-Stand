import React, { useState, useEffect } from "react";
import { ThumbsUp, MessageCircle } from "lucide-react";
import axios from "axios";
import formatTimeAgo from "../../utils/formatTimeAgo";
import LikeModal from "./LikeModal";
import CommentsList from "../comment/CommentsList";

const Post = ({ post, currentUser, onDelete, onEdit, colors }) => {
  const isOwner = currentUser?.email === post.authorId.email;
  const currentUserId = currentUser?._id;
  const name = post.authorId.name || "משתמש";
  const profileImage = post.authorId.profilePicture;

  // Format date with error handling
  let createdAt;
  try {
    if (post.createdAt) {
      const date = new Date(post.createdAt);
      if (isNaN(date.getTime())) {
        createdAt = "תאריך לא תקין";
      } else {
        createdAt = date.toLocaleString("he-IL");
      }
    } else {
      createdAt = "אין תאריך";
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    createdAt = "תאריך לא תקין";
  }

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [likeDetails, setLikeDetails] = useState([]);
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentsCount || 0);

  useEffect(() => {
    const hasDetails =
      post.likes?.length &&
      typeof post.likes[0] === "object" &&
      post.likes[0].name;

    if (hasDetails) {
      setLikeDetails(post.likes);
      setLikeCount(post.likes.length);
    } else {
      setLikeDetails([]);
      setLikeCount(post.likes?.length || 0);
    }
  }, [post.likes]);

  useEffect(() => {
    const userLiked = likeDetails.some(
      (u) => (typeof u === "object" ? u._id?.toString() : u) === currentUserId
    );

    setLiked(userLiked);
  }, [likeDetails, currentUserId]);

  const toggleLike = async () => {
    const wasLiked = liked;
    const prevLikes = [...likeDetails];

    const newLiked = !wasLiked;
    setLiked(newLiked);

    const newLikeDetails = newLiked
      ? [...prevLikes, { _id: currentUserId, name: "את/ה", profilePicture: "" }]
      : prevLikes.filter(
          (u) =>
            (typeof u === "object" ? u._id?.toString() : u) !== currentUserId
        );

    setLikeDetails(newLikeDetails);
    setLikeCount(newLikeDetails.length);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.put(
        `http://localhost:3001/api/posts/${post._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedLikes = res.data.likes;
      setLikeDetails(updatedLikes);
      setLikeCount(updatedLikes.length);
      setLiked(updatedLikes.some((u) => u._id?.toString() === currentUserId));
    } catch (err) {
      console.error("שגיאה בשליחת לייק לשרת:", err);
      setLiked(wasLiked);
      setLikeDetails(prevLikes);
      setLikeCount(prevLikes.length);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "1rem",
        overflow: "hidden",
        marginBottom: "24px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        width: "100%",
        marginInline: "auto",
        direction: "rtl",
        borderTop: `6px solid ${colors?.primary || "#ccc"}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "16px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            overflow: "hidden",
            marginLeft: "12px",
            backgroundColor: "WHITE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#fff",
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "600", fontSize: "1rem", color: "#333" }}>
            {name}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#777" }}>
            {formatTimeAgo(post.createdAt)}
          </div>
        </div>

        {isOwner && (
          <div style={{ display: "flex", gap: "6px" }}>
            <button style={buttonStyle} onClick={() => onEdit(post)}>
              ערוך
            </button>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: "#eee",
                color: "#f44336",
              }}
              onClick={() => onDelete(post._id)}
            >
              מחק
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: "1rem",
          lineHeight: "1.6",
          color: "#444",
          paddingInline: "16px",
          marginBottom: "12px",
        }}
      >
        {post.content}
      </div>

      {post.media?.length > 0 && (
        <div style={{ marginTop: "12px", paddingInline: "16px" }}>
          {post.media.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`media-${i}`}
              style={{
                width: "100%",
                borderRadius: "12px",
                objectFit: "cover",
                maxHeight: "500px",
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          padding: "0 16px",
          paddingTop: "8px",
          textAlign: "right",
          fontSize: "1rem",
          color: "#555",
          cursor: "pointer",
        }}
        onClick={() => setShowLikeModal(true)}
      >
        {likeCount} לייקים
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          borderTop: "1px solid #eee",
          padding: "12px 0",
          fontSize: "0.9rem",
          color: "#444",
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            onClick={toggleLike}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: liked ? "#1877f2" : "#888",
            }}
          >
            <ThumbsUp
              size={20}
              fill={liked ? "#1877f2" : "none"}
              color="#1877f2"
              style={{
                transition: "fill 0.3s ease, transform 0.2s",
                transform: liked ? "scale(1.2)" : "scale(1)",
              }}
            />
            לייק
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setShowComments((prev) => !prev)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#888",
            }}
          >
            <MessageCircle size={20} color="#2196f3" />
            {showComments ? "הסתר תגובות" : `תגובה (${commentCount})`}
          </button>
        </div>
      </div>

      {showComments && (
        <CommentsList
          postId={post._id}
          currentUserId={currentUserId}
          currentUser={currentUser}
          onCountUpdate={setCommentCount}
          initialComments={post.comments}
          initialCommentsCount={post.commentsCount}
        />
      )}

      {showLikeModal && (
        <LikeModal
          users={likeDetails}
          onClose={() => setShowLikeModal(false)}
          color={colors?.primary || "#2196f3"}
        />
      )}
    </div>
  );
};

const buttonStyle = {
  padding: "4px 10px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#f0f0f0",
  color: "#333",
  cursor: "pointer",
  fontSize: "0.85rem",
};

export default Post;
