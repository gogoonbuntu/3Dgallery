import { useState } from 'react';
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
        setYoutubeUrl,
        isCloseUpMode
    } = useGalleryStore();

    const { isPlaying, volume, currentTrackIndex, playerDesign, youtubeUrl } = musicSettings;
    const [inputUrl, setInputUrl] = useState(youtubeUrl || '');
    const [isYoutubeMode, setIsYoutubeMode] = useState(!!youtubeUrl);

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

    const handleYoutubeSubmit = () => {
        if (inputUrl.trim()) {
            setYoutubeUrl(inputUrl.trim());
            setIsYoutubeMode(true);
        }
    };

    const handleClearYoutube = () => {
        setInputUrl('');
        setYoutubeUrl('');
        setIsYoutubeMode(false);
    };

    const handleModeToggle = (mode: 'track' | 'youtube') => {
        if (mode === 'youtube') {
            setIsYoutubeMode(true);
        } else {
            setIsYoutubeMode(false);
            setYoutubeUrl('');
        }
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

            {/* Source Mode Toggle */}
            <div className="source-toggle">
                <button
                    className={!isYoutubeMode ? 'active' : ''}
                    onClick={() => handleModeToggle('track')}
                    title="기본 트랙"
                >
                    🎵 트랙
                </button>
                <button
                    className={isYoutubeMode ? 'active' : ''}
                    onClick={() => handleModeToggle('youtube')}
                    title="YouTube"
                >
                    ▶️ YouTube
                </button>
            </div>

            {isYoutubeMode ? (
                /* YouTube Mode */
                <div className="youtube-input-section">
                    <div className="youtube-input-wrapper">
                        <input
                            type="text"
                            placeholder="YouTube 링크 붙여넣기..."
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleYoutubeSubmit()}
                            className="youtube-input"
                        />
                        {youtubeUrl ? (
                            <button onClick={handleClearYoutube} className="youtube-clear-btn" title="지우기">
                                ✕
                            </button>
                        ) : (
                            <button onClick={handleYoutubeSubmit} className="youtube-submit-btn" title="적용">
                                ✓
                            </button>
                        )}
                    </div>
                    {youtubeUrl && (
                        <div className="youtube-status">
                            ✅ YouTube 재생 준비됨
                        </div>
                    )}
                </div>
            ) : (
                /* Track Mode */
                <>
                    <div className="track-info">
                        <span className="track-name">{currentTrack.name}</span>
                    </div>
                    <div className="player-controls">
                        <button onClick={handlePrevTrack} title="이전 트랙">⏮</button>
                        <button onClick={toggleMusic} className="play-btn" title={isPlaying ? '일시정지' : '재생'}>
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                        <button onClick={handleNextTrack} title="다음 트랙">⏭</button>
                    </div>
                </>
            )}

            {/* Common Controls */}
            {isYoutubeMode && youtubeUrl && (
                <div className="player-controls">
                    <button onClick={toggleMusic} className="play-btn" title={isPlaying ? '일시정지' : '재생'}>
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                </div>
            )}

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

