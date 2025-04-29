import { useState } from "react";

function Feed({ colors }) {
  const [newPostContent, setNewPostContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    console.log("פוסט חדש:", newPostContent, mediaFile);
    // כאן אפשר לשלוח לשרת
    setNewPostContent("");
    setMediaFile(null);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
  };

  return (
    <section>
      {/* תיבת יצירת פוסט */}
      <div
        className="dashboard-card post-box"
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          borderTop: `4px solid ${colors.primary}`,
          backgroundColor: "var(--card-bg)",
          borderRadius: "1rem",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* טקסט */}
        <textarea
          className="post-input"
          placeholder="מה קורה בקבוצת האוהדים שלך?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "0.75rem",
            border: "1px solid var(--border-color)",
            borderRadius: "0.75rem",
            resize: "vertical",
          }}
        />

        {/* הצגת תמונה/וידאו שנבחרו */}
        {mediaFile && (
          <div style={{ textAlign: "center", position: "relative" }}>
            {mediaFile.type.startsWith("image") ? (
              <img
                src={URL.createObjectURL(mediaFile)}
                alt="תמונה נבחרת"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "0.75rem",
                  marginTop: "0.5rem",
                }}
              />
            ) : (
              <video
                src={URL.createObjectURL(mediaFile)}
                controls
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "0.75rem",
                  marginTop: "0.5rem",
                }}
              />
            )}
            <button
              onClick={handleRemoveMedia}
              style={{
                position: "absolute",
                top: "0.5rem",
                left: "0.5rem",
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.25rem 0.5rem",
                cursor: "pointer",
                fontSize: "0.75rem",
              }}
            >
              הסר קובץ
            </button>
          </div>
        )}

        {/* כפתורים */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
          <label className="join-group-button" style={{ cursor: "pointer" }}>
            צרפ/י קובץ
            <input
              type="file"
              accept="image/*,video/*"
              style={{ display: "none" }}
              onChange={(e) => setMediaFile(e.target.files[0])}
            />
          </label>

          <button
            className="join-group-button"
            onClick={handlePostSubmit}
          >
            העל/י פוסט
          </button>
        </div>
      </div>

      {/* הצגת פוסטים קיימים */}
      <div
        className="post-card"
        style={{
          marginBottom: "1.5rem",
          borderTop: `4px solid ${colors.primary}`,
          padding: "1rem",
          backgroundColor: "var(--card-bg)",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="post-header" style={{ marginBottom: "1rem", fontWeight: "bold" }}>
          איתי כהן
        </div>
        <p>איזה שחקן סתיו טוריאללל הקבוצה הזאת בדם!! 🔥⚽</p>
        <div className="post-footer" style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <span>124 לייקים</span>
          <span>32 תגובות</span>
        </div>
      </div>
    </section>
  );
}

export default Feed;


