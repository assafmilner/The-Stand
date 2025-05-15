import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const PostModalViewOnly = ({ post, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <img
            src={post.authorId.profilePicture || '/default-avatar.png'}
            alt={post.authorId.name}
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
          <div>
            <strong>{post.authorId.name}</strong>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="modal-body">
          <p>{post.content}</p>
          {post.media.length > 0 && (
            <div>
              {post.media.map((url, idx) => {
                const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
                return isVideo ? (
                  <video key={idx} src={url} controls style={{ width: '100%' }} />
                ) : (
                  <img key={idx} src={url} alt={`media-${idx}`} style={{ width: '100%' }} />
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-close-btn" onClick={onClose}>
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModalViewOnly;
