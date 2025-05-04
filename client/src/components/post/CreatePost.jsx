import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

const CreatePost = ({ communityId, onPostCreated }) => {
  const { user } = useUser();

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("authorId", user._id);
    formData.append("communityId", communityId);
    formData.append("content", content);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await axios.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // איפוס הטופס אחרי הצלחה
      setContent("");
      setImageFile(null);

      // עדכון הפיד (אם הועבר prop של onPostCreated)
      if (onPostCreated) onPostCreated(res.data);
    } catch (err) {
      setError("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {imageFile && (
        <div className="image-preview">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="Preview"
            style={{ width: "100px", marginTop: "10px" }}
          />
        </div>
      )}
      <button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Post"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default CreatePost;
