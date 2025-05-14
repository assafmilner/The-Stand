// FILE: client/src/components/modal/EditPostModal.jsx
import React, { useState, useEffect } from "react";
import "../../index.css";

const EditPostModal = ({ post, onSave, onCancel }) => {
  const [newContent, setNewContent] = useState(post.content || "");
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(post.media?.[0] || null);
  const [mediaType, setMediaType] = useState("");

  useEffect(() => {
    if (previewUrl) {
      const isVideo = previewUrl.match(/\.(mp4|webm|ogg|mov)$/i);
      setMediaType(isVideo ? "video" : "image");
    }
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewMediaFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
  };

  const handleRemoveMedia = () => {
    setNewMediaFile(null);
    setPreviewUrl(null);
    setMediaType("");
  };

  const handleSave = () => {
    if (!newContent.trim()) {
      alert("תוכן הפוסט לא יכול להיות ריק");
      return;
    }

    const updated = {
      content: newContent,
      media: previewUrl ? [previewUrl] : [],
      imageFile: newMediaFile,
    };

    onSave(updated);
  };

  return (
    <div className="modal-backdrop">
      <div className="edit-modal">
        <h2>עריכת פוסט</h2>

        <textarea
          rows={4}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />

        {previewUrl && (
          <div className="image-preview" style={{ marginTop: "0.5rem", position: "relative" }}>
            {mediaType === "video" ? (
              <video src={previewUrl} controls style={{ width: "100%" }} />
            ) : (
              <img src={previewUrl} alt="preview" style={{ width: "100%" }} />
            )}
            <button onClick={handleRemoveMedia} className="modal-remove-media">✕</button>
          </div>
        )}

        <label className="upload-button">
          📷🎥 העלה מדיה
          <input type="file" hidden accept="image/*,video/*" onChange={handleFileChange} />
        </label>

        <div className="modal-buttons">
          <button className="modal-cancel" onClick={onCancel}>ביטול</button>
          <button className="modal-save" onClick={handleSave}>שמור</button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
