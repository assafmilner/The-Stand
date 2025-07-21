import React, { useState, useEffect } from "react";
import "../../styles/index.css";

/**
 * EditPostModal
 *
 * A modal component for editing an existing post.
 *
 * Props:
 * - post (object): The post object to edit. Expects `content` and optional `media`.
 * - onSave (function): Callback called with the updated post object.
 * - onCancel (function): Called when the user cancels the edit.
 *
 * Features:
 * - Allows editing the post content.
 * - Supports uploading an image or video.
 * - Shows a preview of the selected media.
 * - Allows removal of attached media.
 *
 * UI Notes:
 * - Uses a modal-style layout with a darkened backdrop.
 * - Simple styling for preview, buttons, and upload.
 * - Uses native file input under a custom-styled label.
 */

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
          <div
            className="image-preview"
            style={{ marginTop: "0.5rem", position: "relative" }}
          >
            {mediaType === "video" ? (
              <video src={previewUrl} controls style={{ width: "100%" }} />
            ) : (
              <img src={previewUrl} alt="preview" style={{ width: "100%" }} />
            )}
          </div>
        )}
        <button onClick={handleRemoveMedia} className="modal-remove-media">
          ✕
        </button>
        <label className="upload-button">
          📷 העלה מדיה
          <input
            type="file"
            hidden
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
        </label>

        <div className="modal-buttons">
          <button className="modal-cancel" onClick={onCancel}>
            ביטול
          </button>
          <button className="modal-save" onClick={handleSave}>
            שמור
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
