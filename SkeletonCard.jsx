import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="photo-card-item skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-footer">
        <div className="skeleton-author-info">
          <div className="skeleton-avatar" />
          <div className="skeleton-lines">
            <div className="skeleton-line sm" />
            <div className="skeleton-line md" />
          </div>
        </div>
        <div className="skeleton-btn" />
      </div>
    </div>
  );
}
