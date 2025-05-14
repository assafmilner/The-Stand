import React from "react";

const PostContent = ({ content = "", media = [] }) => {
  if (!content && media.length === 0) return null;

  return (
    <div className="post-content">
      {content && <p className="post-text">{content}</p>}

      {media.length > 0 && (
        <div className="post-media">
          {media.map((url, idx) => {
            const isVideo =
              /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|3gp|m4v)$/i.test(url);

            return isVideo ? (
              <video
                key={idx}
                className="post-video"
                src={url}
                controls
                preload="metadata"
                playsInline
                poster={url.replace(/\.[^/.]+$/, ".jpg")}
              >
                הדפדפן שלך לא תומך בתגית וידאו.
              </video>
            ) : (
              <img
                key={idx}
                className="post-image"
                src={url}
                alt={`media-${idx}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostContent;
