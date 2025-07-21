import React from "react";

/**
 * PostContent
 *
 * Responsible for rendering the body of a post:
 * - Displays text content (if present)
 * - Renders media (images or videos) with fallback behavior
 *
 * Props:
 * - content (string): textual content of the post
 * - media (array): array of media URLs (image or video)
 *
 * The component handles:
 * - File type detection based on file extension
 * - Separate rendering logic for images and videos
 * - Skips rendering entirely if content and media are both empty
 */

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
