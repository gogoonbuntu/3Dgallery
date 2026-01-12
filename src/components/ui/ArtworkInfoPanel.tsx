import { useGalleryStore } from '../../store/galleryStore';
import './ArtworkInfoPanel.css';

export function ArtworkInfoPanel() {
    const { selectedArtwork, showArtworkPanel, selectArtwork, enterCloseUpMode } = useGalleryStore();

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
