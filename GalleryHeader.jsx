import React from 'react';
import { 
  Menu, Search, RefreshCw, LayoutGrid, SlidersHorizontal, Settings, 
  Moon, Sun, Filter, Layers, Heart, Sparkles 
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function GalleryHeader({
  onOpenMobileSidebar,
  page,
  totalPhotos,
  totalLikes,
  activeViewTitle,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onRefresh,
  isLoading,
  onOpenSettings
}) {
  const { settings, toggleTheme } = useTheme();

  return (
    <header className="gallery-main-header">
      <div className="header-top-row">
        <div className="header-left-actions">
          <button 
            type="button" 
            className="mobile-sidebar-toggle"
            onClick={onOpenMobileSidebar}
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
          
          <div className="view-title-block">
            <h1 className="active-view-title">{activeViewTitle}</h1>
            <span className="active-view-count">{totalPhotos} photographs loaded</span>
          </div>
        </div>

        <div className="header-right-actions">
          {/* Refresh Button */}
          <button
            type="button"
            className="toolbar-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh stream from page 1"
          >
            <RefreshCw size={17} className={isLoading ? 'spinning' : ''} />
            <span className="btn-label-desktop">Refresh</span>
          </button>

          {/* Quick theme mode toggle */}
          <button
            type="button"
            className="toolbar-btn icon-only"
            onClick={toggleTheme}
            title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Settings button */}
          <button
            type="button"
            className="toolbar-btn"
            onClick={onOpenSettings}
            title="Gallery Settings"
          >
            <Settings size={18} />
            <span className="btn-label-desktop">Settings</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="gallery-search-and-filter-bar">
        <div className="search-box-capsule">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search photographer by name (e.g. Alejandro, Dan, Paul)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="sort-filter-group">
          <div className="sort-dropdown-wrapper">
            <SlidersHorizontal size={15} className="sort-icon-indicator" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="sort-select-dropdown"
              aria-label="Sort order"
            >
              <option value="default">Sort: Default Feed</option>
              <option value="most-liked">Sort: Most Liked First</option>
              <option value="author-az">Sort: Author (A-Z)</option>
              <option value="id">Sort: Photo ID</option>
            </select>
          </div>

          {/* Quick Grid Column Selector */}
          <div className="grid-cols-quick-pills">
            {[1, 2, 3, 4].map((cols) => (
              <button
                key={cols}
                type="button"
                className={`col-pill ${settings.gridColumns === cols ? 'active' : ''}`}
                onClick={() => onOpenSettings()}
                title={`Layout: ${cols} Column${cols > 1 ? 's' : ''}`}
              >
                {cols}C
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
