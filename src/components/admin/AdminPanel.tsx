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
        removeGuestMessage
    } = useGalleryStore();

    const [activeTab, setActiveTab] = useState<'settings' | 'artworks' | 'messages'>('settings');
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [editingArtworkId, setEditingArtworkId] = useState<string | null>(null);
    const [isAddingArtwork, setIsAddingArtwork] = useState(false);

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
        <div className="admin-panel-overlay" onClick={toggleAdminPanel}>
            <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
                <div className="admin-panel-header">
                    <h2>⚙️ 관리자 모드</h2>
                    <button className="close-btn" onClick={toggleAdminPanel}>×</button>
                </div>

                <div className="admin-tabs">
                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>전체 설정</button>
                    <button className={activeTab === 'artworks' ? 'active' : ''} onClick={() => setActiveTab('artworks')}>작품 관리</button>
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
                </div>

                <div className="admin-panel-footer">
                    <p className="save-note">✓ 모든 변경사항이 자동 저장됩니다</p>
                </div>
            </div>
        </div>
    );
}

