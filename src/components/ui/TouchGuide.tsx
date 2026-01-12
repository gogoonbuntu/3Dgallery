import { useGalleryStore } from '../../store/galleryStore';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import './TouchGuide.css';

export function TouchGuide() {
    const { showTouchGuide, dismissTouchGuide } = useGalleryStore();
    const { isMobile } = useDeviceDetect();

    if (!showTouchGuide) return null;

    return (
        <div className="touch-guide-overlay" onClick={dismissTouchGuide}>
            <div className="touch-guide-content">
                <h2>🎨 3D 갤러리에 오신 것을 환영합니다</h2>

                {isMobile ? (
                    // Mobile Controls Guide
                    <div className="guide-items">
                        <div className="guide-item">
                            <div className="guide-icon">👆</div>
                            <div className="guide-text">
                                <strong>한 손가락 드래그</strong>
                                <span>시점 회전</span>
                            </div>
                        </div>

                        <div className="guide-item">
                            <div className="guide-icon">✌️</div>
                            <div className="guide-text">
                                <strong>두 손가락 드래그</strong>
                                <span>공간 이동</span>
                            </div>
                        </div>

                        <div className="guide-item">
                            <div className="guide-icon">🤏</div>
                            <div className="guide-text">
                                <strong>핀치 인/아웃</strong>
                                <span>줌 인/아웃</span>
                            </div>
                        </div>

                        <div className="guide-item">
                            <div className="guide-icon">👆👆</div>
                            <div className="guide-text">
                                <strong>작품 더블탭</strong>
                                <span>자세히 보기</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Desktop Controls Guide
                    <div className="guide-items">
                        <div className="guide-item">
                            <div className="guide-icon">🖱️</div>
                            <div className="guide-text">
                                <strong>마우스 드래그</strong>
                                <span>시점 회전</span>
                            </div>
                        </div>

                        <div className="guide-item">
                            <div className="guide-icon">⌨️</div>
                            <div className="guide-text">
                                <strong>W A S D / 방향키</strong>
                                <span>공간 이동</span>
                            </div>
                        </div>

                        <div className="guide-item">
                            <div className="guide-icon">🖲️</div>
                            <div className="guide-text">
                                <strong>마우스 휠</strong>
                                <span>앞/뒤 이동</span>
                            </div>
                        </div>

                        <div className="guide-item">
                            <div className="guide-icon">🖱️</div>
                            <div className="guide-text">
                                <strong>작품 클릭/더블클릭</strong>
                                <span>정보 보기 / 자세히 보기</span>
                            </div>
                        </div>
                    </div>
                )}

                <p className="start-hint">
                    {isMobile ? '화면을 터치하여 시작' : '클릭하여 시작'}
                </p>
            </div>
        </div>
    );
}
