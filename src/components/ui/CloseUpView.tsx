import { useEffect, useRef } from 'react';
import { useGalleryStore } from '../../store/galleryStore';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import './CloseUpView.css';

export function CloseUpView() {
    const { isCloseUpMode, selectedArtwork, exitCloseUpMode, trackArtworkView } = useGalleryStore();
    const { isMobile } = useDeviceDetect();

    const viewStartTime = useRef<number | null>(null);
    const trackedArtworkId = useRef<string | null>(null);

    const artworkId = selectedArtwork?.id ?? null;

    // Track close-up view time
    useEffect(() => {
        if (isCloseUpMode && artworkId) {
            // Start tracking close-up view time
            viewStartTime.current = Date.now();
            trackedArtworkId.current = artworkId;
        } else {
            // Close-up mode ended - save view time
            if (viewStartTime.current && trackedArtworkId.current) {
                const duration = Date.now() - viewStartTime.current;
                if (duration > 500) {
                    trackArtworkView(trackedArtworkId.current, duration);
                }
                viewStartTime.current = null;
                trackedArtworkId.current = null;
            }
        }
    }, [isCloseUpMode, artworkId, trackArtworkView]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (viewStartTime.current && trackedArtworkId.current) {
                const duration = Date.now() - viewStartTime.current;
                if (duration > 500) {
                    useGalleryStore.getState().trackArtworkView(trackedArtworkId.current, duration);
                }
            }
        };
    }, []);

    if (!isCloseUpMode || !selectedArtwork) return null;

    return (
        <div className="closeup-view" onClick={exitCloseUpMode}>
            {/* Info panel with integrated close button at top center */}
            <div className="closeup-header" onClick={(e) => e.stopPropagation()}>
                <div className="closeup-info">
                    <button className="closeup-close-btn" onClick={exitCloseUpMode}>✕</button>
                    <h2>{selectedArtwork.title}</h2>
                    <p>{selectedArtwork.artist}, {selectedArtwork.year}</p>
                </div>
            </div>

            {/* Description panel (expandable) */}
            <div className="closeup-description" onClick={(e) => e.stopPropagation()}>
                <p>{selectedArtwork.description}</p>
            </div>

            {/* Click anywhere to exit hint */}
            <div className="closeup-hint">
                {isMobile ? '화면을 터치하여 돌아가기' : '스크롤로 확대/축소 · 클릭하여 돌아가기'}
            </div>
        </div>
    );
}
