import { useEffect, useRef } from 'react';
import { useGalleryStore } from '../../store/galleryStore';
import './ArtworkInfoPanel.css';

export function ArtworkInfoPanel() {
    const selectedArtwork = useGalleryStore((state) => state.selectedArtwork);
    const showArtworkPanel = useGalleryStore((state) => state.showArtworkPanel);
    const selectArtwork = useGalleryStore((state) => state.selectArtwork);
    const enterCloseUpMode = useGalleryStore((state) => state.enterCloseUpMode);
    const trackArtworkView = useGalleryStore((state) => state.trackArtworkView);

    const viewStartTime = useRef<number | null>(null);
    const trackedArtworkId = useRef<string | null>(null);

    // Extract just the ID to prevent re-renders from object reference changes
    const artworkId = selectedArtwork?.id ?? null;

    // Track view time when artwork panel is shown/hidden
    useEffect(() => {
        if (artworkId && showArtworkPanel) {
            // Only start if this is a new artwork or first time
            if (trackedArtworkId.current !== artworkId) {
                // Save previous artwork's view time if exists
                if (viewStartTime.current && trackedArtworkId.current) {
                    const duration = Date.now() - viewStartTime.current;
                    if (duration > 500) {
                        trackArtworkView(trackedArtworkId.current, duration);
                    }
                }
                // Start tracking new artwork
                viewStartTime.current = Date.now();
                trackedArtworkId.current = artworkId;
            }
        } else {
            // Panel closed or no artwork selected - save view time
            if (viewStartTime.current && trackedArtworkId.current) {
                const duration = Date.now() - viewStartTime.current;
                if (duration > 500) {
                    trackArtworkView(trackedArtworkId.current, duration);
                }
                viewStartTime.current = null;
                trackedArtworkId.current = null;
            }
        }
    }, [artworkId, showArtworkPanel, trackArtworkView]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (viewStartTime.current && trackedArtworkId.current) {
                const duration = Date.now() - viewStartTime.current;
                if (duration > 500) {
                    // Note: This may not work correctly because component unmount happens async
                    // But we keep it as a safety net
                    useGalleryStore.getState().trackArtworkView(trackedArtworkId.current, duration);
                }
            }
        };
    }, []);

    if (!selectedArtwork || !showArtworkPanel) return null;

    return (
        <div className="artwork-info-panel">
            <button className="close-btn" onClick={() => selectArtwork(null)}>
                ×
            </button>
            <h2 className="artwork-title">{selectedArtwork.title}</h2>
            <p className="artwork-artist">{selectedArtwork.artist}</p>
            <p className="artwork-year">{selectedArtwork.year}</p>
            <p className="artwork-description">{selectedArtwork.description}</p>
            <button className="closeup-btn" onClick={enterCloseUpMode}>
                🔍 자세히 보기
            </button>
        </div>
    );
}
