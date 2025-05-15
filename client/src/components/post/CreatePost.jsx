import React, { useState, useRef } from "react";
import { useUser } from "../../context/UserContext";
import teamsMap from "../../utils/teams-hebrew";
import api from "utils/api";

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
      const { data } = await api.post("/posts", formData, {
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
        <div className="post-meta" style={{ textAlign: "right" }}>
          <strong>{user?.name}</strong>
          <div className="privacy">ציבורי 🌐</div>
        </div>
      </div>

      <textarea
        placeholder="מה קורה בעולם הכדורגל?"
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
        <span>{content.length}/500</span>
        <div className="post-actions">
          <label>
            📷🎥
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleMediaChange}
              accept="image/*,video/*"
            />
          </label>
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
      </div>
    </form>
  );
};

export default CreatePost;
