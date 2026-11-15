import React, { useState } from 'react';
import { 
  Camera, Heart, FolderHeart, Trash2, Settings, Moon, Sun, 
  Sparkles, Layers, Plus, X, Folder
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function GallerySidebar({
  activeView,
  onSelectView,
  favoritesCount,
  trashCount,
  albums,
  onCreateAlbum,
  isOpen,
  onCloseMobile,
  onOpenSettings
}) {
  const { settings, toggleTheme } = useTheme();
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  const handleCreateAlbumSubmit = (e) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;
    onCreateAlbum(newAlbumTitle.trim());
    setNewAlbumTitle('');
    setShowNewAlbumModal(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`gallery-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header (Pulse Lens) */}
        <div className="gallery-sidebar-brand">
          <div className="brand-icon-box">
            <Camera size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-prefix">Exactspace</span>
            <h2 className="brand-name">Pulse Lens</h2>
          </div>
          {isOpen && (
            <button 
              type="button" 
              className="close-mobile-btn"
              onClick={onCloseMobile}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Categories (Matching Reference: Numonic.ai & Forever.com) */}
        <div className="sidebar-scroll-body">
          <div className="nav-section-label">Library</div>
          <nav className="sidebar-nav-list">
            <button
              type="button"
              className={`sidebar-nav-item ${activeView === 'gallery' ? 'active' : ''}`}
              onClick={() => {
                onSelectView('gallery');
                if (onCloseMobile) onCloseMobile();
              }}
            >
              <Layers size={18} />
              <span className="nav-label">All Photographs</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeView === 'favorites' ? 'active' : ''}`}
              onClick={() => {
                onSelectView('favorites');
                if (onCloseMobile) onCloseMobile();
              }}
            >
              <Heart size={18} className={favoritesCount > 0 ? 'text-rose' : ''} />
              <span className="nav-label">Favorites</span>
              {favoritesCount > 0 && <span className="nav-count-badge fav">{favoritesCount}</span>}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeView === 'trash' ? 'active' : ''}`}
              onClick={() => {
                onSelectView('trash');
                if (onCloseMobile) onCloseMobile();
              }}
            >
              <Trash2 size={18} />
              <span className="nav-label">Trash Bin</span>
              {trashCount > 0 && <span className="nav-count-badge">{trashCount}</span>}
            </button>
          </nav>

          {/* Albums / Collections Section */}
          <div className="sidebar-albums-header">
            <span className="nav-section-label">Albums ({albums.length})</span>
            <button
              type="button"
              className="create-album-btn"
              onClick={() => setShowNewAlbumModal(true)}
              title="Create new album"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="sidebar-albums-list">
            {albums.map((album) => {
              const isActive = activeView === `album-${album.id}`;
              return (
                <button
                  key={album.id}
                  type="button"
                  className={`album-pill-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectView(`album-${album.id}`);
                    if (onCloseMobile) onCloseMobile();
                  }}
                >
                  <Folder size={16} />
                  <span className="album-title">{album.title}</span>
                  <span className="album-item-count">{album.photoIds?.length || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="gallery-sidebar-footer">
          <button
            type="button"
            className="footer-nav-btn"
            onClick={onOpenSettings}
          >
            <Settings size={18} />
            <span>Gallery Settings</span>
          </button>

          <button
            type="button"
            className="footer-nav-btn"
            onClick={toggleTheme}
          >
            {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{settings.theme === 'dark' ? 'Light Studio' : 'Darkroom'}</span>
          </button>
        </div>

        {/* Create Album Modal */}
        {showNewAlbumModal && (
          <div className="modal-overlay" onClick={() => setShowNewAlbumModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>Create New Album</h3>
                <button 
                  type="button" 
                  className="icon-btn" 
                  onClick={() => setShowNewAlbumModal(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateAlbumSubmit}>
                <div className="form-group">
                  <label htmlFor="albumTitle">Album Name</label>
                  <input
                    id="albumTitle"
                    type="text"
                    required
                    placeholder="e.g. Architecture, Travel, Industrial APM"
                    value={newAlbumTitle}
                    onChange={(e) => setNewAlbumTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowNewAlbumModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Album
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
