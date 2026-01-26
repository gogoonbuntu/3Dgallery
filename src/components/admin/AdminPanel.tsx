import { useState } from 'react';
import { useGalleryStore } from '../../store/galleryStore';
import type { Artwork } from '../../store/galleryStore';
import './AdminPanel.css';

const WALL_COLORS = [
    { value: '#ffffff', label: '흰색' },
    { value: '#f5f5dc', label: '크림' },
    { value: '#e0e0e0', label: '밝은 회색' },
    { value: '#2c2c2c', label: '진한 회색' },
    { value: '#1a1a2e', label: '딥 네이비' },
];

const WALL_PATTERNS = [
    { value: 'none', label: '없음' },
    { value: 'brick', label: '🧱 벽돌' },
    { value: 'stripes', label: '💈 줄무늬' },
    { value: 'grid', label: '🟦 격자' },
    { value: 'dots', label: '🟢 도트' },
    { value: 'chevron', label: '📈 쉐브론' },
    { value: 'noise', label: '🌫️ 거친벽' },
];

const FLOOR_TEXTURES = [
    { value: 'wood', label: '🪵 나무' },
    { value: 'herringbone', label: '📐 헤링본' },
    { value: 'marble', label: '🪨 대리석' },
    { value: 'stone', label: '🧱 석재' },
    { value: 'concrete', label: '🏗️ 콘크리트' },
    { value: 'carpet', label: '🧶 카페트' },
];

const FRAME_STYLES = [
    { value: 'classic', label: '🏛️ 클래식' },
    { value: 'modern', label: '✨ 모던' },
    { value: 'minimal', label: '⬜ 미니멀' },
    { value: 'ornate', label: '⚜️ 화려함' },
    { value: 'thin', label: '➖ 슬림' },
    { value: 'thick', label: '⬛ 볼드' },
    { value: 'shadow', label: '🌌 섀도우' },
    { value: 'glass', label: '💎 글래스' },
    { value: 'wood', label: '🪵 우드' },
    { value: 'metal', label: '🛡️ 메탈' },
    { value: 'none', label: '❌ 없음' },
];

export function AdminPanel() {
    const {
        isAdminPanelOpen,
        toggleAdminPanel,
        gallerySettings,
        updateGallerySettings,
        artworks,
        addArtwork,
        removeArtwork,
        updateArtwork,
        guestMessages,
        removeGuestMessage,
        // Ads & Analytics
        adSlots,
        addAdSlot,
        removeAdSlot,
        artworkAnalytics,
        visitorStats,
    } = useGalleryStore();

    const [activeTab, setActiveTab] = useState<'settings' | 'artworks' | 'messages' | 'stats' | 'ads'>('settings');
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [editingArtworkId, setEditingArtworkId] = useState<string | null>(null);
    const [isAddingArtwork, setIsAddingArtwork] = useState(false);
    const [isDraggingLighting, setIsDraggingLighting] = useState(false);

    // Initial state for new artwork
    const [newArtwork, setNewArtwork] = useState<Omit<Artwork, 'id'>>({
        title: '',
        artist: '',
        description: '',
        year: new Date().getFullYear().toString(),
        imageUrl: '',
        wall: 'A',
        position: { x: 0, y: 1.5 },
        frameStyle: undefined,
        frameColor: undefined,
    });

    if (!isAdminPanelOpen) return null;

    const handleAddArtwork = () => {
        if (!newArtwork.title || !newArtwork.imageUrl) return alert('제목과 이미지 URL은 필수입니다.');
        addArtwork(newArtwork);
        setIsAddingArtwork(false);
        setNewArtwork({
            title: '',
            artist: '',
            description: '',
            year: new Date().getFullYear().toString(),
            imageUrl: '',
            wall: 'A',
            position: { x: 0, y: 1.5 },
            frameStyle: undefined,
            frameColor: undefined,
        });
    };

    return (
        <div className={`admin-panel-overlay ${isDraggingLighting ? 'preview-mode' : ''}`} onClick={toggleAdminPanel}>
            <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
                <div className="admin-panel-header">
                    <h2>⚙️ 관리자 모드</h2>
                    <button className="close-btn" onClick={toggleAdminPanel}>×</button>
                </div>

                <div className="admin-tabs">
                    <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>통계</button>
                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>설정</button>
                    <button className={activeTab === 'artworks' ? 'active' : ''} onClick={() => setActiveTab('artworks')}>작품</button>
                    <button className={activeTab === 'ads' ? 'active' : ''} onClick={() => setActiveTab('ads')}>광고</button>
                    <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>방명록</button>
                </div>

                <div className="admin-panel-content">
                    {activeTab === 'settings' && (
                        <>
                            <section className="setting-section">
                                <h3>🖼️ 벽지 색상</h3>
                                <div className="color-options">
                                    {WALL_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            className={`color-btn ${gallerySettings.wallColor === color.value ? 'active' : ''}`}
                                            style={{ backgroundColor: color.value }}
                                            onClick={() => updateGallerySettings({ wallColor: color.value })}
                                            title={color.label}
                                        />
                                    ))}
                                    <div className="custom-color">
                                        <input
                                            type="color"
                                            value={gallerySettings.wallColor}
                                            onChange={(e) => updateGallerySettings({ wallColor: e.target.value })}
                                        />
                                        <span>커스텀</span>
                                    </div>
                                </div>
                            </section>

                            <section className="setting-section">
                                <h3>🎨 벽지 패턴</h3>
                                <div className="option-buttons scrollable">
                                    {WALL_PATTERNS.map((pattern) => (
                                        <button
                                            key={pattern.value}
                                            className={`option-btn small ${gallerySettings.wallPattern === pattern.value ? 'active' : ''}`}
                                            onClick={() => updateGallerySettings({ wallPattern: pattern.value as any })}
                                        >
                                            {pattern.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="setting-section">
                                <h3>🏠 바닥 재질</h3>
                                <div className="option-buttons scrollable">
                                    {FLOOR_TEXTURES.map((floor) => (
                                        <button
                                            key={floor.value}
                                            className={`option-btn small ${gallerySettings.floorTexture === floor.value ? 'active' : ''}`}
                                            onClick={() => updateGallerySettings({ floorTexture: floor.value as any })}
                                        >
                                            {floor.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="setting-section">
                                <h3>🖼️ 기본 액자 스타일 (전체 적용)</h3>
                                <div className="option-buttons grid">
                                    {FRAME_STYLES.map((frame) => (
                                        <button
                                            key={frame.value}
                                            className={`option-btn small ${gallerySettings.frameStyle === frame.value ? 'active' : ''}`}
                                            onClick={() => updateGallerySettings({ frameStyle: frame.value as any })}
                                        >
                                            {frame.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="setting-section">
                                <h3>📐 벽당 권장 작품 수</h3>
                                <div className="slider-container">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={gallerySettings.artworksPerWall}
                                        onChange={(e) => updateGallerySettings({ artworksPerWall: parseInt(e.target.value) })}
                                    />
                                    <span className="slider-value">{gallerySettings.artworksPerWall}개</span>
                                </div>
                            </section>

                            <section className="setting-section lighting-section">
                                <h3>💡 조명 컨트롤</h3>

                                <div className="lighting-control">
                                    <label>
                                        <span className="control-label">🔆 전체 밝기</span>
                                        <span className="control-value">{gallerySettings.lightingBrightness}%</span>
                                    </label>
                                    <div className="slider-with-labels">
                                        <span className="label-left">어둡게</span>
                                        <input
                                            type="range"
                                            min="10"
                                            max="100"
                                            value={gallerySettings.lightingBrightness}
                                            onChange={(e) => updateGallerySettings({ lightingBrightness: parseInt(e.target.value) })}
                                            onMouseDown={() => setIsDraggingLighting(true)}
                                            onMouseUp={() => setIsDraggingLighting(false)}
                                            onTouchStart={() => setIsDraggingLighting(true)}
                                            onTouchEnd={() => setIsDraggingLighting(false)}
                                        />
                                        <span className="label-right">밝게</span>
                                    </div>
                                </div>

                                <div className="lighting-control">
                                    <label>
                                        <span className="control-label">⚡ 조명 강도</span>
                                        <span className="control-value">{gallerySettings.lightingIntensity}%</span>
                                    </label>
                                    <div className="slider-with-labels">
                                        <span className="label-left">부드럽게</span>
                                        <input
                                            type="range"
                                            min="10"
                                            max="100"
                                            value={gallerySettings.lightingIntensity}
                                            onChange={(e) => updateGallerySettings({ lightingIntensity: parseInt(e.target.value) })}
                                            onMouseDown={() => setIsDraggingLighting(true)}
                                            onMouseUp={() => setIsDraggingLighting(false)}
                                            onTouchStart={() => setIsDraggingLighting(true)}
                                            onTouchEnd={() => setIsDraggingLighting(false)}
                                        />
                                        <span className="label-right">강하게</span>
                                    </div>
                                </div>

                                <div className="lighting-control">
                                    <label>
                                        <span className="control-label">🌡️ 색온도</span>
                                        <span className="control-value">
                                            {gallerySettings.lightingColorTemp < 40 ? '차가움' :
                                                gallerySettings.lightingColorTemp > 60 ? '따뜻함' : '중간'}
                                        </span>
                                    </label>
                                    <div className="slider-with-labels color-temp">
                                        <span className="label-left">🔵 차갑게</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={gallerySettings.lightingColorTemp}
                                            onChange={(e) => updateGallerySettings({ lightingColorTemp: parseInt(e.target.value) })}
                                            onMouseDown={() => setIsDraggingLighting(true)}
                                            onMouseUp={() => setIsDraggingLighting(false)}
                                            onTouchStart={() => setIsDraggingLighting(true)}
                                            onTouchEnd={() => setIsDraggingLighting(false)}
                                            className="color-temp-slider"
                                        />
                                        <span className="label-right">🔴 따뜻하게</span>
                                    </div>
                                </div>

                                <div className="lighting-control">
                                    <label>
                                        <span className="control-label">🌫️ 주변광 (앰비언트)</span>
                                        <span className="control-value">{gallerySettings.ambientIntensity}%</span>
                                    </label>
                                    <div className="slider-with-labels">
                                        <span className="label-left">그림자</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={gallerySettings.ambientIntensity}
                                            onChange={(e) => updateGallerySettings({ ambientIntensity: parseInt(e.target.value) })}
                                            onMouseDown={() => setIsDraggingLighting(true)}
                                            onMouseUp={() => setIsDraggingLighting(false)}
                                            onTouchStart={() => setIsDraggingLighting(true)}
                                            onTouchEnd={() => setIsDraggingLighting(false)}
                                        />
                                        <span className="label-right">균일</span>
                                    </div>
                                </div>

                                <div className="lighting-presets">
                                    <span className="presets-label">프리셋:</span>
                                    <button
                                        className="preset-btn"
                                        onClick={() => updateGallerySettings({
                                            lightingBrightness: 85,
                                            lightingIntensity: 70,
                                            lightingColorTemp: 50,
                                            ambientIntensity: 50
                                        })}
                                    >
                                        ☀️ 주간
                                    </button>
                                    <button
                                        className="preset-btn"
                                        onClick={() => updateGallerySettings({
                                            lightingBrightness: 45,
                                            lightingIntensity: 50,
                                            lightingColorTemp: 70,
                                            ambientIntensity: 25
                                        })}
                                    >
                                        🌙 야간
                                    </button>
                                    <button
                                        className="preset-btn"
                                        onClick={() => updateGallerySettings({
                                            lightingBrightness: 70,
                                            lightingIntensity: 60,
                                            lightingColorTemp: 55,
                                            ambientIntensity: 40
                                        })}
                                    >
                                        🏛️ 갤러리
                                    </button>
                                    <button
                                        className="preset-btn"
                                        onClick={() => updateGallerySettings({
                                            lightingBrightness: 60,
                                            lightingIntensity: 80,
                                            lightingColorTemp: 35,
                                            ambientIntensity: 20
                                        })}
                                    >
                                        🎭 극적
                                    </button>
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === 'artworks' && (
                        <div className="artworks-management">
                            {!isAddingArtwork ? (
                                <button className="add-artwork-trigger" onClick={() => setIsAddingArtwork(true)}>+ 새 작품 추가</button>
                            ) : (
                                <div className="artwork-form edit-card">
                                    <h4>새 작품 정보</h4>
                                    <div className="input-group">
                                        <label>이미지 URL</label>
                                        <input type="text" value={newArtwork.imageUrl} onChange={e => setNewArtwork({ ...newArtwork, imageUrl: e.target.value })} placeholder="https://..." />
                                    </div>
                                    <div className="input-row">
                                        <div className="input-group">
                                            <label>제목</label>
                                            <input type="text" value={newArtwork.title} onChange={e => setNewArtwork({ ...newArtwork, title: e.target.value })} />
                                        </div>
                                        <div className="input-group">
                                            <label>작가</label>
                                            <input type="text" value={newArtwork.artist} onChange={e => setNewArtwork({ ...newArtwork, artist: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="input-row">
                                        <div className="input-group">
                                            <label>위치 (벽)</label>
                                            <select value={newArtwork.wall} onChange={e => setNewArtwork({ ...newArtwork, wall: e.target.value as any })}>
                                                <option value="A">벽 A (정면)</option>
                                                <option value="B">벽 B (오른쪽)</option>
                                                <option value="C">벽 C (뒷면)</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>X 좌표</label>
                                            <input type="number" step="0.5" value={newArtwork.position.x} onChange={e => setNewArtwork({ ...newArtwork, position: { ...newArtwork.position, x: parseFloat(e.target.value) } })} />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button className="confirm-btn add" onClick={handleAddArtwork}>저장</button>
                                        <button className="confirm-btn cancel" onClick={() => setIsAddingArtwork(false)}>취소</button>
                                    </div>
                                </div>
                            )}

                            <div className="artworks-list">
                                {artworks.map(artwork => (
                                    <div key={artwork.id} className="artwork-item-container">
                                        {editingArtworkId === artwork.id ? (
                                            <div className="artwork-form edit-card">
                                                <div className="input-group">
                                                    <label>제목</label>
                                                    <input type="text" value={artwork.title} onChange={e => updateArtwork(artwork.id, { title: e.target.value })} />
                                                </div>
                                                <div className="input-row">
                                                    <div className="input-group">
                                                        <label>벽</label>
                                                        <select value={artwork.wall} onChange={e => updateArtwork(artwork.id, { wall: e.target.value as any })}>
                                                            <option value="A">A</option>
                                                            <option value="B">B</option>
                                                            <option value="C">C</option>
                                                        </select>
                                                    </div>
                                                    <div className="input-group">
                                                        <label>액자 스타일</label>
                                                        <select value={artwork.frameStyle || ''} onChange={e => updateArtwork(artwork.id, { frameStyle: (e.target.value || undefined) as any })}>
                                                            <option value="">전체 설정 따름</option>
                                                            {FRAME_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <button className="confirm-btn small" onClick={() => setEditingArtworkId(null)}>닫기</button>
                                            </div>
                                        ) : (
                                            <div className="artwork-item">
                                                <div className="artwork-preview">
                                                    <img src={artwork.imageUrl} alt={artwork.title} />
                                                    <div className="artwork-brief">
                                                        <span className="title">{artwork.title}</span>
                                                        <span className="details">{artwork.wall}벽 | {artwork.frameStyle || '기본'} 액자</span>
                                                    </div>
                                                </div>
                                                <div className="item-actions">
                                                    <button onClick={() => setEditingArtworkId(artwork.id)}>편집</button>
                                                    <button className="delete-btn" onClick={() => removeArtwork(artwork.id)}>삭제</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="admin-messages-list">
                            {guestMessages.length === 0 ? (
                                <p className="empty-note">남겨진 소감이 없습니다.</p>
                            ) : (
                                guestMessages.slice().reverse().map((msg) => (
                                    <div key={msg.id} className="admin-message-item">
                                        <div className="message-info">
                                            <span className="msg-nickname">{msg.nickname}</span>
                                            <p className="msg-content">{msg.content}</p>
                                        </div>
                                        {confirmingId === msg.id ? (
                                            <div className="confirm-buttons">
                                                <button
                                                    className="confirm-btn delete"
                                                    onClick={() => {
                                                        removeGuestMessage(msg.id);
                                                        setConfirmingId(null);
                                                    }}
                                                >
                                                    삭제
                                                </button>
                                                <button
                                                    className="confirm-btn cancel"
                                                    onClick={() => setConfirmingId(null)}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="delete-msg-btn"
                                                onClick={() => setConfirmingId(msg.id)}
                                                title="삭제"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 'stats' && (
                        <div className="stats-dashboard">
                            <section className="stats-overview">
                                <h3>📈 방문 통계</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <span className="stat-value">{visitorStats.totalVisits}</span>
                                        <span className="stat-label">총 방문</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{visitorStats.todayVisits}</span>
                                        <span className="stat-label">오늘 방문</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{visitorStats.uniqueVisitors}</span>
                                        <span className="stat-label">고유 방문자</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">
                                            {Math.round(visitorStats.averageSessionMs / 60000)}분
                                        </span>
                                        <span className="stat-label">평균 체류</span>
                                    </div>
                                </div>
                            </section>

                            <section className="stats-artworks">
                                <h3>🖼️ 작품별 통계</h3>
                                {artworkAnalytics.length === 0 ? (
                                    <p className="empty-note">아직 수집된 데이터가 없습니다.</p>
                                ) : (
                                    <div className="artwork-stats-list">
                                        {artworkAnalytics
                                            .sort((a, b) => b.clicks - a.clicks)
                                            .map((stat) => {
                                                const artwork = artworks.find(a => a.id === stat.artworkId);
                                                return (
                                                    <div key={stat.artworkId} className="artwork-stat-item">
                                                        <div className="artwork-stat-info">
                                                            <span className="artwork-title">
                                                                {artwork?.title || '알 수 없는 작품'}
                                                            </span>
                                                            <span className="artwork-artist">{artwork?.artist}</span>
                                                        </div>
                                                        <div className="artwork-stat-metrics">
                                                            <div className="metric">
                                                                <span className="metric-value">{stat.clicks}</span>
                                                                <span className="metric-label">클릭</span>
                                                            </div>
                                                            <div className="metric">
                                                                <span className="metric-value">
                                                                    {Math.round(stat.totalViewTimeMs / 1000)}초
                                                                </span>
                                                                <span className="metric-label">조회시간</span>
                                                            </div>
                                                        </div>
                                                        <div className="click-bar">
                                                            <div
                                                                className="click-bar-fill"
                                                                style={{
                                                                    width: `${Math.min(100, (stat.clicks / Math.max(...artworkAnalytics.map(a => a.clicks))) * 100)}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {/* Ads Management Tab */}
                    {activeTab === 'ads' && (
                        <div className="ads-management">
                            <section className="add-ad-section">
                                <h3>➕ 새 광고 추가</h3>
                                <div className="add-ad-form">
                                    <input
                                        type="text"
                                        placeholder="광고 제목"
                                        id="ad-title"
                                    />
                                    <input
                                        type="url"
                                        placeholder="이미지 URL"
                                        id="ad-image"
                                    />
                                    <input
                                        type="url"
                                        placeholder="클릭 시 이동할 링크"
                                        id="ad-link"
                                    />
                                    <div className="ad-position-row">
                                        <select id="ad-wall" defaultValue="D">
                                            <option value="A">벽 A</option>
                                            <option value="B">벽 B</option>
                                            <option value="C">벽 C</option>
                                            <option value="D">입구 벽</option>
                                        </select>
                                        <input type="number" placeholder="X 위치" id="ad-x" defaultValue="0" />
                                        <input type="number" placeholder="Y 위치" id="ad-y" defaultValue="2" />
                                    </div>
                                    <button
                                        className="add-ad-btn"
                                        onClick={() => {
                                            const title = (document.getElementById('ad-title') as HTMLInputElement).value;
                                            const imageUrl = (document.getElementById('ad-image') as HTMLInputElement).value;
                                            const linkUrl = (document.getElementById('ad-link') as HTMLInputElement).value;
                                            const wall = (document.getElementById('ad-wall') as HTMLSelectElement).value as 'A' | 'B' | 'C' | 'D';
                                            const x = parseFloat((document.getElementById('ad-x') as HTMLInputElement).value) || 0;
                                            const y = parseFloat((document.getElementById('ad-y') as HTMLInputElement).value) || 2;

                                            if (!title || !imageUrl) {
                                                alert('제목과 이미지 URL은 필수입니다.');
                                                return;
                                            }

                                            addAdSlot({
                                                title,
                                                imageUrl,
                                                linkUrl,
                                                wall,
                                                position: { x, y },
                                                size: { width: 2, height: 1.5 },
                                                isActive: true,
                                            });

                                            // Clear form
                                            (document.getElementById('ad-title') as HTMLInputElement).value = '';
                                            (document.getElementById('ad-image') as HTMLInputElement).value = '';
                                            (document.getElementById('ad-link') as HTMLInputElement).value = '';
                                        }}
                                    >
                                        광고 추가
                                    </button>
                                </div>
                            </section>

                            <section className="ads-list-section">
                                <h3>📋 광고 목록 ({adSlots.length}개)</h3>
                                {adSlots.length === 0 ? (
                                    <p className="empty-note">등록된 광고가 없습니다.</p>
                                ) : (
                                    <div className="ads-list">
                                        {adSlots.map((ad) => (
                                            <div key={ad.id} className="ad-item">
                                                <div className="ad-preview">
                                                    <img src={ad.imageUrl} alt={ad.title} />
                                                </div>
                                                <div className="ad-info">
                                                    <span className="ad-title">{ad.title}</span>
                                                    <span className="ad-position">
                                                        벽 {ad.wall} ({ad.position.x}, {ad.position.y})
                                                    </span>
                                                </div>
                                                <button
                                                    className="remove-ad-btn"
                                                    onClick={() => removeAdSlot(ad.id)}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>

                <div className="admin-panel-footer">
                    <p className="save-note">✓ 모든 변경사항이 자동 저장됩니다</p>
                </div>
            </div>
        </div>
    );
}

