import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import teamsMap from "../../utils/teams-hebrew";

const CreatePost = ({ onPostCreated, colors }) => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaType, setMediaType] = useState(""); // "image" או "video"

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);

      // יצירת URL לתצוגה מקדימה
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // זיהוי סוג הקובץ
      const fileType = file.type.startsWith("video/") ? "video" : "image";
      setMediaType(fileType);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setPreviewUrl("");
    setMediaType("");
    // ניקוי ה-input
    const input = document.querySelector('input[type="file"]');
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const englishTeamName = Object.keys(teamsMap).find(
      (key) => teamsMap[key].name === user.favoriteTeam
    );
    const communityId = teamsMap[englishTeamName]?.communityId;

    const formData = new FormData();
    formData.append("authorId", user._id);
    formData.append("communityId", communityId);
    formData.append("content", content);
    if (mediaFile) {
      formData.append("image", mediaFile); // ה-field name נשאר "image" לתאימות עם השרת
    }

    try {
      const res = await axios.post(
        "http://localhost:3001/api/posts",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setContent("");
      setMediaFile(null);
      setPreviewUrl("");
      setMediaType("");

      if (onPostCreated) {
        const enrichedPost = {
          ...res.data,
          authorId: {
            _id: user._id,
            name: user.name,
            profilePicture: user.profilePicture,
          },
        };
        onPostCreated(enrichedPost);
      }
    } catch {
      alert("Error posting.");
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
        <div className="post-meta">
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

      {/* תצוגה מקדימה של מדיה */}
      {previewUrl && (
        <div className="image-preview">
          {mediaType === "video" ? (
            <video
              src={previewUrl}
              controls
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            >
              הדפדפן שלך לא תומך בתגית וידאו.
            </video>
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            />
          )}
          <button
            type="button"
            onClick={handleRemoveMedia}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              onChange={handleMediaChange}
              accept="image/*,video/*"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: colors.primary,
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
