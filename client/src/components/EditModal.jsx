import React, { useState } from "react";
import "../index.css";

const EditModal = ({ post, onSave, onCancel }) => {
  const [newContent, setNewContent] = useState(post.content);
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(post.media?.[0] || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setNewImageFile(null);
    setPreviewUrl(null);
  };

  const handleSave = () => {
    if (newContent.trim() === "") return alert("התוכן לא יכול להיות ריק");

    const updatedData = {
      content: newContent,
      media: previewUrl ? [previewUrl] : [], // אם הסרנו תמונה, רשימה ריקה
      imageFile: newImageFile, // אם יש קובץ חדש – נשלח אותו
    };

    onSave(updatedData); // נשלח את כל האובייקט במקום רק סטרינג
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
          <div className="image-preview">
            <img src={previewUrl} alt="preview" />
            <button onClick={handleRemoveImage}>הסר תמונה</button>
          </div>
        )}

        <label>
          בחר תמונה חדשה
          <input
            type="file"
            hidden
            accept="image/*"
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

export default EditModal;
