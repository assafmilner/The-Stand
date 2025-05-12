import React, { useState } from "react";
import "../index.css";

const EditModal = ({ post, onSave, onCancel }) => {
  const [newContent, setNewContent] = useState(post.content);
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(post.media?.[0] || null);
  const [mediaType, setMediaType] = useState("");

  // זיהוי סוג המדיה הנוכחית
  React.useEffect(() => {
    if (previewUrl) {
      const isVideo =
        previewUrl.includes("video/") ||
        previewUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|3gp|m4v)$/i);
      setMediaType(isVideo ? "video" : "image");
    }
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMediaFile(file);

      // יצירת URL לתצוגה מקדימה
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // זיהוי סוג הקובץ
      const fileType = file.type.startsWith("video/") ? "video" : "image";
      setMediaType(fileType);
    }
  };

  const handleRemoveMedia = () => {
    setNewMediaFile(null);
    setPreviewUrl(null);
    setMediaType("");
    // ניקוי ה-input
    const input = document.querySelector('.edit-modal input[type="file"]');
    if (input) input.value = "";
  };

  const handleSave = () => {
    if (newContent.trim() === "") return alert("התוכן לא יכול להיות ריק");

    const updatedData = {
      content: newContent,
      media: previewUrl ? [previewUrl] : [], // אם הסרנו מדיה, רשימה ריקה
      imageFile: newMediaFile, // אם יש קובץ חדש – נשלח אותו
    };

    onSave(updatedData);
  };

  return (
    <div className="modal-backdrop">
      <div className="edit-modal">
        <h2>עריכת פוסט</h2>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={5}
        />

        {previewUrl && (
          <div className="image-preview" style={{ position: "relative" }}>
            {mediaType === "video" ? (
              <video src={previewUrl} controls style={{ maxWidth: "100%" }}>
                הדפדפן שלך לא תומך בתגית וידאו.
              </video>
            ) : (
              <img
                src={previewUrl}
                alt="preview"
                style={{ maxWidth: "100%" }}
              />
            )}
            <button
              onClick={handleRemoveMedia}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}

        <label style={{ display: "block", marginTop: "10px" }}>
          בחר תמונה או סרטון חדש
          <input
            type="file"
            hidden
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() =>
              document.querySelector('.edit-modal input[type="file"]').click()
            }
            style={{
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "5px",
              width: "100%",
            }}
          >
            📷🎥 העלה קובץ
          </button>
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

export default EditModal;
