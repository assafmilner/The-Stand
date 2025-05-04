import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import teamsMap from "../../utils/teams-hebrew";

const CreatePost = ({ onPostCreated, colors }) => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
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
    if (imageFile) {
      formData.append("image", imageFile);
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
      setImageFile(null);
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

      {imageFile && (
        <div className="image-preview">
          <img src={URL.createObjectURL(imageFile)} alt="Preview" />
        </div>
      )}

      <div className="post-footer">
        <span>{content.length}/500</span>
        <div className="post-actions">
          <label>
            📷
            <input type="file" hidden onChange={handleImageChange} />
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
