import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './QRCodeShare.css';

export function QRCodeShare() {
    const [isOpen, setIsOpen] = useState(false);
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <>
            {/* QR Button */}
            <button
                className="qr-share-btn"
                onClick={() => setIsOpen(true)}
                title="QR 코드로 공유"
            >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 2h-2v2h2v2h2v-4h-2zm0-4h2v2h-2v-2zm-4 4h2v4h-2v-4zm0-4h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                </svg>
            </button>

            {/* QR Modal */}
            {isOpen && (
                <div className="qr-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="qr-close-btn" onClick={() => setIsOpen(false)}>×</button>

                        <h3>📱 QR 코드로 공유</h3>
                        <p className="qr-subtitle">스마트폰으로 스캔하세요</p>

                        <div className="qr-code-container">
                            <QRCodeSVG
                                value={currentUrl}
                                size={200}
                                level="H"
                                includeMargin={true}
                                bgColor="#ffffff"
                                fgColor="#1a1a2e"
                            />
                        </div>

                        <div className="qr-url">
                            <input type="text" value={currentUrl} readOnly />
                            <button onClick={() => {
                                navigator.clipboard.writeText(currentUrl);
                                alert('URL이 복사되었습니다!');
                            }}>
                                복사
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
