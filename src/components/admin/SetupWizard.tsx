import { useState } from 'react';
import { useGalleryStore } from '../../store/galleryStore';
import { markSetupComplete, updateExhibitionDescription } from '../../lib/firebase';
import { WALL_COLORS, FLOOR_TEXTURES, LIGHTING_PRESETS } from '../../constants/galleryOptions';
import './SetupWizard.css';


interface SetupWizardProps {
    onComplete: () => void;
    exhibitionCode: string;
}

export function SetupWizard({ onComplete, exhibitionCode }: SetupWizardProps) {
    const {
        gallerySettings,
        updateGallerySettings,
        addArtwork,
    } = useGalleryStore();

    const [step, setStep] = useState(1);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sample artwork for first artwork step
    const [firstArtwork, setFirstArtwork] = useState({
        title: '',
        artist: '',
        imageUrl: '',
    });

    const totalSteps = 5;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handlePrev = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            // Save description
            if (description.trim()) {
                await updateExhibitionDescription(exhibitionCode, description.trim());
            }

            // Add first artwork if provided
            if (firstArtwork.title && firstArtwork.imageUrl) {
                addArtwork({
                    title: firstArtwork.title,
                    artist: firstArtwork.artist || '작가 미상',
                    description: '',
                    year: new Date().getFullYear().toString(),
                    imageUrl: firstArtwork.imageUrl,
                    wall: 'A',
                    position: { x: 0, y: 1.5 },
                });
            }

            // Mark setup as complete
            await markSetupComplete(exhibitionCode);

            onComplete();
        } catch (error) {
            console.error('Error completing setup:', error);
            alert('설정 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkipToEnd = async () => {
        setIsSubmitting(true);
        try {
            await markSetupComplete(exhibitionCode);
            onComplete();
        } catch (error) {
            console.error('Error skipping setup:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="setup-wizard-overlay">
            <div className="setup-wizard">
                {/* Progress indicator */}
                <div className="wizard-progress">
                    {Array.from({ length: totalSteps }, (_, i) => (
                        <div
                            key={i}
                            className={`progress-dot ${i + 1 <= step ? 'active' : ''} ${i + 1 < step ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                <div className="wizard-content">
                    {/* Step 1: Welcome & Description */}
                    {step === 1 && (
                        <div className="wizard-step">
                            <div className="step-icon">🎉</div>
                            <h2>전시회에 오신 것을 환영합니다!</h2>
                            <p className="step-description">
                                몇 가지 간단한 설정으로 나만의 3D 갤러리를 완성해보세요.
                            </p>

                            <div className="input-group">
                                <label>전시회 소개</label>
                                <textarea
                                    placeholder="방문자에게 보여줄 전시회 소개글을 작성해주세요."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Gallery Theme */}
                    {step === 2 && (
                        <div className="wizard-step">
                            <div className="step-icon">🎨</div>
                            <h2>갤러리 테마 선택</h2>
                            <p className="step-description">벽과 바닥 스타일을 선택해주세요.</p>

                            <div className="theme-section">
                                <h4>벽 색상</h4>
                                <div className="color-grid">
                                    {WALL_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            className={`color-option ${gallerySettings.wallColor === color.value ? 'selected' : ''}`}
                                            onClick={() => updateGallerySettings({ wallColor: color.value })}
                                        >
                                            <span
                                                className="color-swatch"
                                                style={{ backgroundColor: color.value }}
                                            />
                                            <span className="color-label">{color.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="theme-section">
                                <h4>바닥 재질</h4>
                                <div className="floor-grid">
                                    {FLOOR_TEXTURES.map((floor) => (
                                        <button
                                            key={floor.value}
                                            className={`floor-option ${gallerySettings.floorTexture === floor.value ? 'selected' : ''}`}
                                            onClick={() => updateGallerySettings({ floorTexture: floor.value as any })}
                                        >
                                            {floor.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Lighting */}
                    {step === 3 && (
                        <div className="wizard-step">
                            <div className="step-icon">💡</div>
                            <h2>조명 설정</h2>
                            <p className="step-description">전시 분위기에 맞는 조명을 선택해주세요.</p>

                            <div className="lighting-presets-grid">
                                {LIGHTING_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        className="lighting-preset-btn"
                                        onClick={() => updateGallerySettings(preset.settings)}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>

                            <p className="step-hint">
                                💡 나중에 관리자 패널에서 더 세부적으로 조정할 수 있어요.
                            </p>
                        </div>
                    )}

                    {/* Step 4: First Artwork */}
                    {step === 4 && (
                        <div className="wizard-step">
                            <div className="step-icon">🖼️</div>
                            <h2>첫 번째 작품 등록</h2>
                            <p className="step-description">
                                첫 작품을 등록해보세요. 건너뛰셔도 됩니다.
                            </p>

                            <div className="artwork-form">
                                <div className="input-group">
                                    <label>이미지 URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={firstArtwork.imageUrl}
                                        onChange={(e) => setFirstArtwork({ ...firstArtwork, imageUrl: e.target.value })}
                                    />
                                </div>
                                <div className="input-row">
                                    <div className="input-group">
                                        <label>작품 제목</label>
                                        <input
                                            type="text"
                                            placeholder="작품 제목"
                                            value={firstArtwork.title}
                                            onChange={(e) => setFirstArtwork({ ...firstArtwork, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>작가명</label>
                                        <input
                                            type="text"
                                            placeholder="작가명 (선택)"
                                            value={firstArtwork.artist}
                                            onChange={(e) => setFirstArtwork({ ...firstArtwork, artist: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {firstArtwork.imageUrl && (
                                <div className="artwork-preview">
                                    <img
                                        src={firstArtwork.imageUrl}
                                        alt="Preview"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Complete */}
                    {step === 5 && (
                        <div className="wizard-step">
                            <div className="step-icon">🚀</div>
                            <h2>설정 완료!</h2>
                            <p className="step-description">
                                기본 설정이 완료되었습니다.<br />
                                이제 전시회를 시작할 준비가 되었어요!
                            </p>

                            <div className="completion-info">
                                <div className="info-card">
                                    <span className="info-icon">🔗</span>
                                    <div className="info-text">
                                        <strong>전시회 URL</strong>
                                        <code>{window.location.origin}/{exhibitionCode}</code>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <span className="info-icon">⚙️</span>
                                    <div className="info-text">
                                        <strong>관리자 패널</strong>
                                        <span>화면 하단의 🔐 버튼으로 접근</span>
                                    </div>
                                </div>
                            </div>

                            <p className="step-hint">
                                작품 추가, 광고 설정, 방명록 관리 등은<br />
                                관리자 패널에서 할 수 있어요.
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigation buttons */}
                <div className="wizard-navigation">
                    {step > 1 && (
                        <button className="nav-btn prev" onClick={handlePrev} disabled={isSubmitting}>
                            ← 이전
                        </button>
                    )}

                    {step === 1 && (
                        <button className="nav-btn skip" onClick={handleSkipToEnd} disabled={isSubmitting}>
                            건너뛰기
                        </button>
                    )}

                    <div className="nav-spacer" />

                    {step < totalSteps ? (
                        <button className="nav-btn next" onClick={handleNext} disabled={isSubmitting}>
                            다음 →
                        </button>
                    ) : (
                        <button
                            className="nav-btn complete"
                            onClick={handleComplete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '저장 중...' : '전시회 시작하기 🎉'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
