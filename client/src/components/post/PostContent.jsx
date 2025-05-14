import React from "react";

const PostContent = ({ content = "", media = [] }) => {
  if (!content && media.length === 0) return null;

  const mainMedia = media[0]; // כרגע תומכים רק בקובץ אחד
  const isVideo = mainMedia?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="post-content" style={{ margin: "0.5rem 0" }}>
      {/* טקסט */}
      {content && (
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            marginBottom: "0.5rem",
          }}
        >
          {content}
        </p>
      )}

      {/* מדיה – תמונה או וידאו */}
      {mainMedia && (
        <div
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            maxHeight: "500px",
            maxWidth: "100%",
          }}
        >
          {isVideo ? (
            <video src={mainMedia} controls style={{ width: "100%" }} />
          ) : (
            <img
              src={mainMedia}
              alt="media"
              style={{ width: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PostContent;
