import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GallerySidebar from './components/GallerySidebar';
import GalleryHeader from './components/GalleryHeader';
import PhotoCard from './components/PhotoCard';
import SkeletonCard from './components/SkeletonCard';
import LightboxModal from './components/LightboxModal';
import GallerySettings from './components/GallerySettings';
import { useTheme } from './contexts/ThemeContext';
import { ArrowUp, AlertCircle, CheckCircle2, Heart, Trash2, Camera } from 'lucide-react';
import './App.css';

const PAGE_SIZE = 20;

const LIKES_STORAGE_KEY = 'exactspace_photo_likes_v3';
const FAVORITES_STORAGE_KEY = 'exactspace_photo_favs_v3';
const ALBUMS_STORAGE_KEY = 'exactspace_photo_albums_v3';
const TRASH_STORAGE_KEY = 'exactspace_photo_trash_v3';

const INITIAL_ALBUMS = [
  { id: 'plant-ops', title: 'Industrial APM Assets', photoIds: ['10', '11'] },
  { id: 'architecture', title: 'Architecture & Sites', photoIds: ['12', '14'] }
];

export default function App() {
  const { settings } = useTheme();

  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  // Active view: 'gallery' | 'favorites' | 'trash' | 'album-{id}'
  const [activeView, setActiveView] = useState('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Lightbox modal state
  const [previewPhotoId, setPreviewPhotoId] = useState(null);

  // Toast notice
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Likes Map: { [photoId]: number }
  const [likesMap, setLikesMap] = useState(() => {
    try {
      const stored = localStorage.getItem(LIKES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Favorites Set/Array: string[]
  const [favoritesList, setFavoritesList] = useState(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Albums: { id, title, photoIds }[]
  const [albums, setAlbums] = useState(() => {
    try {
      const stored = localStorage.getItem(ALBUMS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_ALBUMS;
    } catch {
      return INITIAL_ALBUMS;
    }
  });

  // Trash (soft-deleted photo IDs): string[]
  const [trashList, setTrashList] = useState(() => {
    try {
      const stored = localStorage.getItem(TRASH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const sentinelRef = useRef(null);
  const requestedPages = useRef(new Set());

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likesMap));
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesList));
      localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(albums));
      localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trashList));
    } catch {}
  }, [likesMap, favoritesList, albums, trashList]);

  // Monitor scroll for "Back to top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Robust pagination fetch with Set tracking to prevent ANY duplicate requests or duplicate items
  const loadPage = useCallback(async (pageNumber) => {
    if (loading || requestedPages.current.has(pageNumber) || !hasMore) return;
    requestedPages.current.add(pageNumber);
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://picsum.photos/v2/list?page=${pageNumber}&limit=${PAGE_SIZE}`);
      if (!response.ok) throw new Error(`Photo service returned ${response.status}`);
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setHasMore(false);
        return;
      }

      const normalized = data.map((photo) => ({
        id: String(photo.id),
        author: photo.author || 'Unknown photographer',
        download_url: photo.download_url,
        width: photo.width,
        height: photo.height,
        likes: likesMap[String(photo.id)] || 0,
      }));

      // Strictly deduplicate by ID so no duplicates ever enter state
      setPhotos((current) => {
        const existing = new Set(current.map((photo) => String(photo.id)));
        const uniqueIncoming = normalized.filter((photo) => !existing.has(String(photo.id)));
        return [...current, ...uniqueIncoming];
      });

      setPage(pageNumber + 1);
      if (data.length < PAGE_SIZE) setHasMore(false);
    } catch (requestError) {
      requestedPages.current.delete(pageNumber);
      setError(requestError.message || 'Unable to load photos.');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, likesMap]);

  // Initial page 1 load - only once on mount
  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll trigger via IntersectionObserver
  useEffect(() => {
    if (activeView !== 'gallery') return;

    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !loading) {
          loadPage(page);
        }
      },
      {
        root: null,
        rootMargin: '500px 0px',
        threshold: 0
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadPage, page, activeView]);

  // Requirement: "Next to each photo, add a thumbs up icon and a count(initialised to 0)... On clicking this icon, increase the count. The count should be increase as many clicks performed."
  const handleLike = (photoId) => {
    const stringId = String(photoId);
    setLikesMap((prev) => {
      const current = prev[stringId] || 0;
      return {
        ...prev,
        [stringId]: current + 1
      };
    });
  };

  // Toggle favorite
  const handleToggleFavorite = (photoId) => {
    const stringId = String(photoId);
    setFavoritesList((prev) => {
      if (prev.includes(stringId)) {
        showToast('Removed from favorites');
        return prev.filter((id) => id !== stringId);
      } else {
        showToast('Added to favorites! ❤️');
        return [...prev, stringId];
      }
    });
  };

  // Soft delete to Trash
  const handleDeletePhoto = (photoId) => {
    const stringId = String(photoId);
    setTrashList((prev) => [...new Set([...prev, stringId])]);
    showToast('Photo moved to Trash');
  };

  // Restore photo from trash
  const handleRestorePhoto = (photoId) => {
    const stringId = String(photoId);
    setTrashList((prev) => prev.filter((id) => id !== stringId));
    showToast('Photo restored from Trash');
  };

  // Restore all trash
  const handleRestoreAllTrash = () => {
    setTrashList([]);
    showToast('All photos restored from Trash');
  };

  // Empty trash permanently
  const handleEmptyTrash = () => {
    if (window.confirm('Empty trash permanently? This cannot be undone.')) {
      setTrashList([]);
      showToast('Trash emptied');
    }
  };

  // Create new album
  const handleCreateAlbum = (title) => {
    const newAlbum = {
      id: `album-${Date.now()}`,
      title,
      photoIds: []
    };
    setAlbums((prev) => [...prev, newAlbum]);
    showToast(`Album "${title}" created!`);
  };

  // Add photo to album
  const handleAddToAlbum = (albumId, photoId) => {
    const stringId = String(photoId);
    setAlbums((prev) =>
      prev.map((alb) => {
        if (alb.id !== albumId) return alb;
        const exists = alb.photoIds?.includes(stringId);
        const nextIds = exists
          ? alb.photoIds.filter((id) => id !== stringId)
          : [...(alb.photoIds || []), stringId];
        showToast(exists ? `Removed from ${alb.title}` : `Added to ${alb.title}`);
        return { ...alb, photoIds: nextIds };
      })
    );
  };

  // Refresh feed completely
  const handleRefresh = () => {
    requestedPages.current.clear();
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    setError('');
    loadPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Feed refreshed');
  };

  const totalLikesCount = useMemo(() => {
    return Object.values(likesMap).reduce((sum, count) => sum + count, 0);
  }, [likesMap]);

  // Compute view title and filter list with strict deduplication
  const { currentViewTitle, processedPhotos } = useMemo(() => {
    let title = 'All Photographs';
    let list = photos.filter((p) => !trashList.includes(String(p.id)));

    if (activeView === 'favorites') {
      title = 'Favorites';
      list = photos.filter((p) => favoritesList.includes(String(p.id)) && !trashList.includes(String(p.id)));
    } else if (activeView === 'trash') {
      title = 'Recycle Bin / Trash';
      list = photos.filter((p) => trashList.includes(String(p.id)));
    } else if (activeView.startsWith('album-')) {
      const albumId = activeView.replace('album-', '');
      const album = albums.find((a) => a.id === albumId);
      title = album ? `Album: ${album.title}` : 'Album';
      const albumPhotoIds = album?.photoIds || [];
      list = photos.filter((p) => albumPhotoIds.includes(String(p.id)) && !trashList.includes(String(p.id)));
    }

    // Attach latest likes
    let mapped = list.map((photo) => ({
      ...photo,
      likes: likesMap[String(photo.id)] || 0
    }));

    // Guaranteed deduplication
    const seenIds = new Set();
    const uniqueList = [];
    for (const p of mapped) {
      const sid = String(p.id);
      if (!seenIds.has(sid)) {
        seenIds.add(sid);
        uniqueList.push(p);
      }
    }

    // Filter by search query
    let filtered = uniqueList;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => p.author.toLowerCase().includes(q));
    }

    // Sorting
    if (sortBy === 'most-liked') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'author-az') {
      filtered.sort((a, b) => a.author.localeCompare(b.author));
    } else if (sortBy === 'id') {
      filtered.sort((a, b) => Number(a.id) - Number(b.id));
    }

    return { currentViewTitle: title, processedPhotos: filtered };
  }, [photos, trashList, activeView, favoritesList, albums, likesMap, searchQuery, sortBy]);

  // Lightbox navigation
  const currentPreviewIndex = processedPhotos.findIndex((p) => String(p.id) === String(previewPhotoId));
  const currentPreviewPhoto = currentPreviewIndex !== -1 ? processedPhotos[currentPreviewIndex] : null;

  const handlePrevPreview = () => {
    if (currentPreviewIndex > 0) {
      setPreviewPhotoId(processedPhotos[currentPreviewIndex - 1].id);
    }
  };

  const handleNextPreview = () => {
    if (currentPreviewIndex < processedPhotos.length - 1) {
      setPreviewPhotoId(processedPhotos[currentPreviewIndex + 1].id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="gallery-master-layout">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="floating-toast-alert">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar Navigation (Numonic / Forever Style) */}
      <GallerySidebar
        activeView={activeView}
        onSelectView={setActiveView}
        favoritesCount={favoritesList.length}
        trashCount={trashList.length}
        albums={albums}
        onCreateAlbum={handleCreateAlbum}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Gallery Stage */}
      <div className="gallery-stage-viewport">
        <GalleryHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          page={page}
          totalPhotos={processedPhotos.length}
          totalLikes={totalLikesCount}
          activeViewTitle={currentViewTitle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onRefresh={handleRefresh}
          isLoading={loading}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Dynamic Grid Feed (columns driven by settings.gridColumns: 1, 2, 3, or 4) */}
        <main className={`photo-dynamic-grid cols-${settings.gridColumns}`}>
          {processedPhotos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              index={index}
              photo={photo}
              onLike={handleLike}
              onFavorite={handleToggleFavorite}
              isFavorite={favoritesList.includes(String(photo.id))}
              onOpenPreview={() => setPreviewPhotoId(photo.id)}
              onDelete={handleDeletePhoto}
              onAddToAlbum={handleAddToAlbum}
            />
          ))}

          {/* Skeletons while loading next page */}
          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* Error State with Retry */}
          {error && (
            <div className="feed-status-card error-card">
              <AlertCircle size={28} className="status-icon error" />
              <h3>Unable to load more photos</h3>
              <p>{error}</p>
              <button
                type="button"
                className="retry-action-btn"
                onClick={() => loadPage(page)}
              >
                Try Again
              </button>
            </div>
          )}

          {/* End of Feed Message */}
          {!hasMore && !loading && activeView === 'gallery' && photos.length > 0 && (
            <div className="feed-status-card end-card">
              <CheckCircle2 size={28} className="status-icon success" />
              <h3>All Caught Up!</h3>
              <p>You have viewed all available photos in the gallery.</p>
              <button
                type="button"
                className="scroll-top-link"
                onClick={scrollToTop}
              >
                Back to top ↑
              </button>
            </div>
          )}

          {/* Empty State */}
          {processedPhotos.length === 0 && !loading && !error && (
            <div className="feed-status-card empty-card">
              {activeView === 'favorites' ? (
                <>
                  <Heart size={38} className="status-icon text-rose" />
                  <h3>No favorites yet</h3>
                  <p>Click the heart icon on any photo to save it to your favorites!</p>
                  <button
                    type="button"
                    className="retry-action-btn"
                    onClick={() => setActiveView('gallery')}
                  >
                    Browse Photographs
                  </button>
                </>
              ) : activeView === 'trash' ? (
                <>
                  <Trash2 size={38} className="status-icon text-muted" />
                  <h3>Trash is empty</h3>
                  <p>Photos you delete will appear here so you can restore them anytime.</p>
                </>
              ) : (
                <>
                  <Camera size={38} className="status-icon text-muted" />
                  <h3>No matching photos</h3>
                  <p>No results found for "{searchQuery}".</p>
                  <button
                    type="button"
                    className="retry-action-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                </>
              )}
            </div>
          )}

          {/* Intersection Observer Sentinel for infinite scroll */}
          {activeView === 'gallery' && <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />}
        </main>
      </div>

      {/* Lightbox Modal with Zoom, Share, Delete, Favorite, Download */}
      {currentPreviewPhoto && (
        <LightboxModal
          photo={currentPreviewPhoto}
          onClose={() => setPreviewPhotoId(null)}
          onPrev={handlePrevPreview}
          onNext={handleNextPreview}
          onLike={handleLike}
          onFavorite={handleToggleFavorite}
          isFavorite={favoritesList.includes(String(currentPreviewPhoto.id))}
          onDelete={handleDeletePhoto}
          albums={albums}
          onAddToAlbum={handleAddToAlbum}
          hasPrev={currentPreviewIndex > 0}
          hasNext={currentPreviewIndex < processedPhotos.length - 1}
        />
      )}

      {/* Settings Drawer */}
      <GallerySettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        totalPhotos={photos.length}
        totalLikes={totalLikesCount}
        trashCount={trashList.length}
        onEmptyTrash={handleEmptyTrash}
        onRestoreTrash={handleRestoreAllTrash}
      />

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          className="floating-back-to-top"
          onClick={scrollToTop}
          title="Back to top"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </div>
  );
}
