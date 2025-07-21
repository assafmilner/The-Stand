import React, { useState, useEffect } from "react";
import { Share2, ThumbsUp, MessageCircle } from "lucide-react";
import LikeButton from "./LikeButton";
import LikeModal from "../modal/LikeModal";
import api from "utils/api";
import useComments from "../../hooks/useComments";
import CommentList from "./CommentList";

/**
 * PostActions
 *
 * This component renders the interactive actions for a post:
 * likes (with modal), comments (toggle + list), and social interaction UI.
 * Also fetches comment count on mount and supports paginated comment loading.
 *
 * Props:
 * - postId (string): ID of the post to operate on
 * - likes (array): initial list of users who liked the post
 * - authorId (string): ID of the post author (not used here, but may be useful)
 * - colors (object): style customization for team-based themes
 * - currentUser (object): current logged-in user (used for like actions)
 */

const PostActions = ({ postId, likes = [], authorId, colors, currentUser }) => {
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [localLikes, setLocalLikes] = useState(likes);
  // useComments hook for paginated comments
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    hasMore,
    loadMore,
  } = useComments({ postId });

  // fetch the total comment count
  useEffect(() => {
    api
      .get(`/api/comments/count/${postId}`)
      .then(({ data }) => setCommentCount(data.count || 0))
      .catch((err) => {
        console.error("שגיאה בשליפת מספר תגובות:", err);
        setCommentCount(0);
      });
  }, [postId]);

  useEffect(() => {
    setLocalLikes(likes);
  }, [likes]);

  return (
    <>
      <div
        style={{
          padding: "0 16px",
          paddingTop: "8px",
          textAlign: "right",
          fontSize: "1rem",
          color: "#4f46e5",
          cursor: "pointer",
        }}
        onClick={() => setShowLikeModal(true)}
      >
        ראה מי אהב
      </div>

      {/* actions row */}
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
        {/* like button */}
        <LikeButton
          id={postId}
          type="post"
          likes={localLikes}
          userId={currentUser._id}
          onLikeToggle={setLocalLikes}
          className="post-action-button"
        />

        {/* comment toggle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            className="post-action-button"
            onClick={() => setShowComments((v) => !v)}
          >
            <MessageCircle size={20} />
            <span>
              {showComments ? "הסתר תגובות" : `תגובה (${commentCount})`}
            </span>
          </button>
        </div>
      </div>

      {/* comments section */}
      {showComments && (
        <div style={{ marginTop: "1rem", padding: "0 16px" }}>
          {commentsError && <p style={{ color: "red" }}>{commentsError}</p>}
          <CommentList postId={postId} />
          {commentsLoading && <p>טוען תגובות…</p>}
          {!commentsLoading && hasMore && (
            <button
              onClick={loadMore}
              style={{
                fontSize: "0.75rem",
                border: "none",
                background: "none",
                color: "#4f46e5",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            >
              טען עוד תגובות
            </button>
          )}
        </div>
      )}

      {/* like modal */}
      {showLikeModal && (
        <LikeModal
          users={localLikes}
          onClose={() => setShowLikeModal(false)}
          color={colors?.primary}
        />
      )}
    </>
  );
};

export default PostActions;
