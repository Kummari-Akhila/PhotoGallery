import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { Maximize2, ExternalLink, Heart, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function PhotoCard({
  photo,
  index = 0,
  onLike,
  onFavorite,
  isFavorite = false,
  onOpenPreview,
  onDelete,
  onAddToAlbum
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [imgSrc, setImgSrc] = useState(photo.download_url);
  const { settings } = useTheme();

  const { id, author, download_url, likes = 0 } = photo;

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setIsBouncing(true);
    onLike(id);
    setTimeout(() => {
      setIsBouncing(false);
    }, 280);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavorite(id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleImageError = () => {
    // If original download_url failed, try reliable Picsum cached CDN size
    if (imgSrc === download_url) {
      setImgSrc(`https://picsum.photos/id/${id}/800/600`);
    } else if (!imgSrc.includes('fastly')) {
      setImgSrc(`https://fastly.picsum.photos/id/${id}/800/600.jpg`);
    }
    // Always mark loaded so it never gets stuck in skeleton shimmer
    setImageLoaded(true);
  };

  return (
    <article className="photo-card-item" id={`photo-${id}`}>
      {/* Topline Badge with Index & Author */}
      <div className="photo-topline">
        <span className="photo-number">PHOTO {String(index + 1).padStart(3, '0')}</span>
        <span className="photo-author-label">by {author}</span>
      </div>

      {/* Clickable Image Container */}
      <div
        className={`card-media-wrapper ${imageLoaded ? 'loaded' : 'loading'}`}
        onClick={() => onOpenPreview && onOpenPreview(photo)}
        title="Click to preview in full-screen modal"
      >
        {!imageLoaded && <div className="card-media-skeleton" />}
        <img
          src={imgSrc}
          alt={`Photograph by ${author}`}
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
          className={`card-image ${imageLoaded ? 'visible' : 'fade-in'}`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />

        {/* Favorite Heart Quick Badge on Top Left */}
        <button
          type="button"
          className={`card-heart-badge ${isFavorite ? 'favorited' : ''}`}
          onClick={handleFavoriteClick}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
        </button>

        {/* Hover Overlay with actions (if showDetailsOverlay is enabled in settings) */}
        {settings.showDetailsOverlay && (
          <div className="card-hover-overlay">
            <button
              type="button"
              className="preview-badge-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreview && onOpenPreview(photo);
              }}
              title="Expand image preview with zoom & actions"
            >
              <Maximize2 size={16} />
              <span>Preview</span>
            </button>

            <button
              type="button"
              className="icon-action-pill danger"
              onClick={handleDeleteClick}
              title="Move photo to Trash"
            >
              <Trash2 size={15} />
            </button>

            <a
              href={download_url}
              target="_blank"
              rel="noreferrer noopener"
              className="icon-action-pill"
              onClick={(e) => e.stopPropagation()}
              title="Open original high-res download"
            >
              <ExternalLink size={15} />
            </a>
          </div>
        )}
      </div>

      {/* Card Info & Thumbs Up Action Bar (Assignment Requirement) */}
      <div className="card-footer-bar">
        <div className="author-meta-block">
          <div className="author-avatar-chip">
            {author.charAt(0).toUpperCase()}
          </div>
          <div className="author-text-details">
            <span className="author-badge-label">Photographer</span>
            <h3 className="author-display-name">{author}</h3>
            <p className="author-meta-sub">Captured moment • Picsum</p>
          </div>
        </div>

        {/* FontAwesome Thumbs Up Counter (Exact Assignment Specification) */}
        <button
          type="button"
          className={`fontawesome-thumbs-button ${likes > 0 ? 'liked' : ''} ${isBouncing ? 'pulse' : ''}`}
          onClick={handleLikeClick}
          aria-label={`Like photograph by ${author}, total likes: ${likes}`}
          title="Click thumbs up to increase count (click as many times as you like)"
        >
          <FontAwesomeIcon
            icon={faThumbsUp}
            className={`thumbs-fa-icon ${isBouncing ? 'fa-bounce' : ''}`}
          />
          <span className="thumbs-count-label">{likes}</span>
        </button>
      </div>
    </article>
  );
}
