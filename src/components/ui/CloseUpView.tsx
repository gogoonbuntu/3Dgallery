import { useGalleryStore } from '../../store/galleryStore';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import './CloseUpView.css';

export function CloseUpView() {
    const { isCloseUpMode, selectedArtwork, exitCloseUpMode } = useGalleryStore();
    const { isMobile } = useDeviceDetect();

    if (!isCloseUpMode || !selectedArtwork) return null;

    return (
        <div className="closeup-view">
            {/* Minimal info at top */}
            <div className="closeup-header">
                <div className="closeup-info">
                    <h2>{selectedArtwork.title}</h2>
                    <p>{selectedArtwork.artist}, {selectedArtwork.year}</p>
                </div>
            </div>

            {/* Back button */}
            <button className="closeup-back-btn" onClick={exitCloseUpMode}>
                <span className="back-icon">←</span>
                <span className="back-text">{isMobile ? '뒤로' : 'ESC 또는 클릭'}</span>
            </button>

            {/* Description panel (expandable) */}
            <div className="closeup-description">
                <p>{selectedArtwork.description}</p>
            </div>

            {/* Click anywhere to exit hint */}
            <div className="closeup-hint">
                {isMobile ? '화면을 터치하여 돌아가기' : '클릭하여 돌아가기'}
            </div>
        </div>
    );
}
