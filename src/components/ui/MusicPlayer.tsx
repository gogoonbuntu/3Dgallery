import { useGalleryStore } from '../../store/galleryStore';
import './MusicPlayer.css';

// Sample music tracks
const MUSIC_TRACKS = [
    { id: 1, name: '평화로운 갤러리' },
    { id: 2, name: '클래식 피아노' },
    { id: 3, name: '잔잔한 기타' },
    { id: 4, name: '앰비언트 사운드' },
];

export function MusicPlayer() {
    const {
        musicSettings,
        toggleMusic,
        setVolume,
        setTrack,
        setPlayerDesign,
        isCloseUpMode
    } = useGalleryStore();

    const { isPlaying, volume, currentTrackIndex, playerDesign } = musicSettings;

    // Hide during close-up mode
    if (isCloseUpMode) return null;

    const currentTrack = MUSIC_TRACKS[currentTrackIndex];

    const handlePrevTrack = () => {
        const prevIndex = (currentTrackIndex - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
        setTrack(prevIndex);
    };

    const handleNextTrack = () => {
        const nextIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length;
        setTrack(nextIndex);
    };

    return (
        <div className="music-player compact">
            {/* Design Toggle */}
            <div className="design-toggle">
                <button
                    className={playerDesign === 'speaker' ? 'active' : ''}
                    onClick={() => setPlayerDesign('speaker')}
                    title="스피커"
                >
                    🔊
                </button>
                <button
                    className={playerDesign === 'lp' ? 'active' : ''}
                    onClick={() => setPlayerDesign('lp')}
                    title="LP 플레이어"
                >
                    💿
                </button>
            </div>

            {/* Track Info */}
            <div className="track-info">
                <span className="track-name">{currentTrack.name}</span>
            </div>

            {/* Controls */}
            <div className="player-controls">
                <button onClick={handlePrevTrack} title="이전 트랙">⏮</button>
                <button onClick={toggleMusic} className="play-btn" title={isPlaying ? '일시정지' : '재생'}>
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={handleNextTrack} title="다음 트랙">⏭</button>
            </div>

            {/* Volume Slider */}
            <div className="volume-control">
                <span>🔈</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
                <span>🔊</span>
            </div>

            <div className="player-hint">
                🎵 코너의 {playerDesign === 'speaker' ? '스피커' : 'LP 테이블'}를 클릭하세요
            </div>
        </div>
    );
}
