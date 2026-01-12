import { useGalleryStore } from '../../store/galleryStore';
import './BottomNavigation.css';

export function BottomNavigation() {
    const { toggleGuestbook, isCloseUpMode, exitCloseUpMode, selectedArtwork, selectArtwork } = useGalleryStore();

    return (
        <nav className="bottom-navigation">
            {isCloseUpMode ? (
                <button className="nav-btn back-btn" onClick={exitCloseUpMode}>
                    <span className="nav-icon">←</span>
                    <span className="nav-label">뒤로</span>
                </button>
            ) : (
                <>
                    {selectedArtwork && (
                        <button className="nav-btn" onClick={() => selectArtwork(null)}>
                            <span className="nav-icon">✕</span>
                            <span className="nav-label">닫기</span>
                        </button>
                    )}
                    <button className="nav-btn guestbook-btn" onClick={toggleGuestbook}>
                        <span className="nav-icon">📝</span>
                        <span className="nav-label">방명록</span>
                    </button>
                </>
            )}
        </nav>
    );
}
