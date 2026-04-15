import { useState, useEffect } from 'react';
import './ExhibitionHeader.css';

interface ExhibitionInfo {
  title: string;
  subtitle: string;
  artists: string[];
  period: string;
  gallery: string;
}

// Default exhibition info for demo
const defaultExhibition: ExhibitionInfo = {
  title: '빛과 그림자의 경계',
  subtitle: 'Where Light Meets Shadow',
  artists: ['김서윤', '이한결', '박지안', '최예린'],
  period: '2024.03.15 — 06.30',
  gallery: '온전 갤러리 | Onliex Gallery',
};

export function ExhibitionHeader() {
  const [visible, setVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);

  // Auto-minimize after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimized(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    if (minimized) {
      setMinimized(false);
      // Auto-minimize again after 4 seconds
      setTimeout(() => setMinimized(true), 4000);
    }
  };

  if (!visible) return null;

  const info = defaultExhibition;

  return (
    <div
      className={`exhibition-header ${minimized ? 'minimized' : ''}`}
      onClick={handleToggle}
    >
      {minimized ? (
        <div className="exhibition-header-mini">
          <span className="mini-title">{info.title}</span>
          <span className="mini-expand">ⓘ</span>
        </div>
      ) : (
        <div className="exhibition-header-full">
          <div className="exhibition-header-top">
            <div className="exhibition-dates">{info.period}</div>
            <button
              className="exhibition-close-btn"
              onClick={(e) => { e.stopPropagation(); setVisible(false); }}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          <h1 className="exhibition-title">{info.title}</h1>
          <p className="exhibition-subtitle">{info.subtitle}</p>
          <div className="exhibition-meta">
            <div className="exhibition-artists">
              {info.artists.map((a, i) => (
                <span key={i} className="artist-tag">{a}</span>
              ))}
            </div>
            <div className="exhibition-gallery">{info.gallery}</div>
          </div>
        </div>
      )}
    </div>
  );
}
