import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, 
  Share2, Trash2, Heart, Download, FolderPlus, Check
} from 'lucide-react';

export default function LightboxModal({
  photo,
  onClose,
  onPrev,
  onNext,
  onLike,
  onFavorite,
  isFavorite = false,
  onDelete,
  albums = [],
  onAddToAlbum,
  hasPrev,
  hasNext
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleResetZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext, zoomLevel]);

  // Reset zoom whenever preview photo changes
  useEffect(() => {
    setZoomLevel(1);
    setShowAlbumPicker(false);
  }, [photo?.id]);

  if (!photo) return null;

  const { id, author, download_url, likes = 0, width, height } = photo;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 3.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.35, 0.75));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photograph by ${author}`,
          text: `Check out this shot by ${author} on Exactspace Pulse Lens!`,
          url: download_url
        });
        return;
      } catch (err) {}
    }
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(download_url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {}
  };

  const handleDirectDownload = async () => {
    try {
      const response = await fetch(download_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `exactspace-photo-${id}-${author.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Direct window open fallback
      window.open(download_url, '_blank');
    }
  };

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox-content-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar with Zoom & Action Buttons */}
        <div className="lightbox-top-toolbar">
          <div className="toolbar-left-group">
            <span className="image-author-tag">Photo by <strong>{author}</strong></span>
          </div>

          <div className="toolbar-actions-cluster">
            {/* Zoom Controls */}
            <div className="zoom-controls-pill">
              <button
                type="button"
                className="zoom-btn"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.75}
                title="Zoom Out (-)"
              >
                <ZoomOut size={16} />
              </button>
              <span className="zoom-percentage-text">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                className="zoom-btn"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.0}
                title="Zoom In (+)"
              >
                <ZoomIn size={16} />
              </button>
              {zoomLevel !== 1 && (
                <button
                  type="button"
                  className="zoom-btn"
                  onClick={handleResetZoom}
                  title="Reset Zoom (0)"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>

            {/* Favorite toggle */}
            <button
              type="button"
              className={`lightbox-action-btn ${isFavorite ? 'active-fav' : ''}`}
              onClick={() => onFavorite(id)}
              title={isFavorite ? "Remove favorite" : "Add to favorites"}
            >
              <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
            </button>

            {/* Share */}
            <button
              type="button"
              className="lightbox-action-btn"
              onClick={handleShare}
              title="Share photo link"
            >
              <Share2 size={18} />
              {copiedLink && <span className="copied-bubble">Copied!</span>}
            </button>

            {/* Move to Album */}
            <div className="album-dropdown-wrapper">
              <button
                type="button"
                className="lightbox-action-btn"
                onClick={() => setShowAlbumPicker((prev) => !prev)}
                title="Add to Album"
              >
                <FolderPlus size={18} />
              </button>

              {showAlbumPicker && (
                <div className="album-picker-menu">
                  <div className="album-picker-head">Add to Album</div>
                  {albums.length === 0 ? (
                    <div className="no-albums-hint">No custom albums yet</div>
                  ) : (
                    albums.map((album) => {
                      const isInAlbum = album.photoIds?.includes(id);
                      return (
                        <button
                          key={album.id}
                          type="button"
                          className="album-picker-item"
                          onClick={() => {
                            onAddToAlbum(album.id, id);
                            setShowAlbumPicker(false);
                          }}
                        >
                          <span>{album.title}</span>
                          {isInAlbum && <Check size={14} className="accent-check" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Delete (Move to Trash) */}
            <button
              type="button"
              className="lightbox-action-btn danger"
              onClick={() => {
                onDelete(id);
                onClose();
              }}
              title="Move to Trash"
            >
              <Trash2 size={18} />
            </button>

            {/* Close */}
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={onClose}
              aria-label="Close image preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Previous Button */}
        {hasPrev && (
          <button
            type="button"
            className="lightbox-nav-btn prev"
            onClick={onPrev}
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Next Button */}
        {hasNext && (
          <button
            type="button"
            className="lightbox-nav-btn next"
            onClick={onNext}
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {/* Image Display Stage with Zoom */}
        <div 
          className="lightbox-image-stage"
          onWheel={handleWheel}
        >
          <img
            src={download_url}
            alt={`Full size capture by ${author}`}
            className="lightbox-main-img"
            style={{
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.18s ease-out'
            }}
          />
        </div>

        {/* Bottom Details Bar */}
        <div className="lightbox-bottom-bar">
          <div className="lightbox-author-details">
            <div className="lightbox-avatar">
              {author.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="lightbox-label">Captured By</span>
              <h2 className="lightbox-name">{author}</h2>
              <span className="lightbox-sub-meta">Photo ID: #{id}</span>
            </div>
          </div>

          <div className="lightbox-actions">
            {/* FontAwesome Thumbs Up (Assignment requirement) */}
            <button
              type="button"
              className={`lightbox-thumbs-btn ${likes > 0 ? 'liked' : ''}`}
              onClick={() => onLike(id)}
              title="Click thumbs up to increment like count"
            >
              <FontAwesomeIcon icon={faThumbsUp} />
              <span className="lightbox-like-count">{likes}</span>
            </button>

            {/* Download button */}
            <button
              type="button"
              className="lightbox-download-btn"
              onClick={handleDirectDownload}
              title="Download high-resolution file"
            >
              <Download size={16} />
              <span>Download High-Res</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
