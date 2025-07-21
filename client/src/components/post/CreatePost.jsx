import React, { useState, useRef } from "react";
import { useUser } from "../../context/UserContext";
import teamsMap from "../../utils/teams-hebrew";
import api from "utils/api";
import { Globe, Image as ImageIcon } from "lucide-react";

/**
 * CreatePost
 *
 * A post creation component allowing users to:
 * - Write text content (up to 500 characters)
 * - Attach image or video files with a live preview
 * - Submit posts to the backend via multipart/form-data
 *
 * Features:
 * - Associates the post with the user's favorite team's community
 * - Displays user's avatar and name
 * - Shows a styled preview of selected media (image/video)
 *
 * Props:
 * - onPostCreated (function): optional callback when post is successfully created
 * - colors (object): contains team-specific primary color for the publish button
 */

const CreatePost = ({ onPostCreated, colors }) => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setPreviewUrl("");
    setMediaType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;

    setLoading(true);

    const englishTeam = Object.keys(teamsMap).find(
      (key) => teamsMap[key].name === user.favoriteTeam
    );
    const communityId = teamsMap[englishTeam]?.communityId;

    const formData = new FormData();
    formData.append("authorId", user._id);
    formData.append("communityId", communityId);
    formData.append("content", content);
    if (mediaFile) formData.append("image", mediaFile);

    try {
      const { data } = await api.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const enrichedPost = {
        ...data,
        authorId: {
          _id: user._id,
          name: user.name,
          profilePicture: user.profilePicture,
        },
      };

      if (onPostCreated) onPostCreated(enrichedPost);

      setContent("");
      handleRemoveMedia();
    } catch (err) {
      console.error("Error posting:", err);
      alert("שגיאה בפרסום הפוסט");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-post-modern" onSubmit={handleSubmit}>
      <div className="post-header">
        <img
          className="profile-img"
          src={user?.profilePicture || "/default.png"}
          alt="profile"
        />
        <div className="post-meta" style={{ flex: 1, textAlign: "right" }}>
          <strong>{user?.name}</strong>
          <div
            className="privacy"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Globe size={14} /> ציבורי
          </div>
        </div>
      </div>

      <textarea
        placeholder="מה קורה ביציע?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={500}
        rows={3}
      />

      {previewUrl && (
        <div className="image-preview" style={{ position: "relative" }}>
          {mediaType === "video" ? (
            <video
              src={previewUrl}
              controls
              style={{ width: "100%", borderRadius: "12px" }}
            />
          ) : (
            <img
              src={previewUrl}
              alt="preview"
              style={{ width: "100%", borderRadius: "12px" }}
            />
          )}
          <button
            type="button"
            onClick={handleRemoveMedia}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="post-footer">
        <div
          className="post-actions"
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
        >
          <label
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              color: "#555",
            }}
          >
            <ImageIcon size={18} />
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleMediaChange}
              accept="image/*,video/*"
            />
          </label>
        </div>
        <span>{content.length}/500</span>
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: colors?.primary || "#f87171",
            color: "white",
            border: "none",
            padding: "0.4rem 1rem",
            borderRadius: "999px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "מפרסם..." : "פרסם"}
        </button>
      </div>
    </form>
  );
};

export default CreatePost;
