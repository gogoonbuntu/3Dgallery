import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { ArtworkInfoPanel } from './components/ui/ArtworkInfoPanel';
import { GuestbookForm } from './components/ui/GuestbookForm';
import { TouchGuide } from './components/ui/TouchGuide';
import { BottomNavigation } from './components/ui/BottomNavigation';
import { CloseUpView } from './components/ui/CloseUpView';
import { MusicPlayer } from './components/ui/MusicPlayer';
import { PlayerCount } from './components/ui/PlayerCount';
import { AdminAuth } from './components/admin/AdminAuth';
import { AdminPanel } from './components/admin/AdminPanel';
import { SuperAdminPanel } from './components/admin/SuperAdminPanel';
import { useGalleryStore } from './store/galleryStore';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { useMultiplayerSync } from './hooks/useMultiplayerSync';
import './App.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>갤러리 로딩 중...</p>
    </div>
  );
}

function ErrorScreen({ onRetry, autoRetrying }: { onRetry: () => void; autoRetrying?: boolean }) {
  return (
    <div className="loading-screen">
      <p>WebGL 컨텍스트 손실</p>
      <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>GPU 리소스가 부족합니다. 다른 탭을 닫아보세요.</p>
      {autoRetrying ? (
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>자동 재시도 중...</p>
      ) : (
        <button onClick={onRetry} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
          다시 시도
        </button>
      )}
    </div>
  );
}

// Exhibition page component
function ExhibitionPage() {
  const { code } = useParams<{ code: string }>();
  const { setExhibitionCode, isCloseUpMode, exitCloseUpMode, isAdmin, isAdminPanelOpen } = useGalleryStore();
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [autoRetrying, setAutoRetrying] = useState(false);
  const retryCount = useRef(0);
  const maxAutoRetries = 2;

  // Set exhibition code from URL
  useEffect(() => {
    if (code) {
      setExhibitionCode(code);
    }
  }, [code, setExhibitionCode]);

  // Initialize Firebase sync
  useFirebaseSync();

  // Initialize multiplayer connection
  useMultiplayerSync();

  // Delay Canvas initialization to let the page settle
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle ESC key to exit close-up mode or close admin panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAdminPanelOpen) {
          useGalleryStore.getState().toggleAdminPanel();
        } else if (isCloseUpMode) {
          exitCloseUpMode();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCloseUpMode, exitCloseUpMode, isAdminPanelOpen]);

  // Auto-retry logic when context is lost
  useEffect(() => {
    if (contextLost && retryCount.current < maxAutoRetries) {
      setAutoRetrying(true);
      const timer = setTimeout(() => {
        retryCount.current += 1;
        setContextLost(false);
        setCanvasKey(prev => prev + 1);
        setAutoRetrying(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [contextLost]);

  const handleRetry = useCallback(() => {
    retryCount.current = 0;
    setContextLost(false);
    setCanvasKey(prev => prev + 1);
  }, []);

  const handleContextLost = useCallback((e: Event) => {
    e.preventDefault();
    console.warn('WebGL context lost, attempting recovery...');
    setContextLost(true);
  }, []);

  return (
    <div className="app">
      <div className="canvas-container">
        {!isReady ? (
          <LoadingScreen />
        ) : contextLost ? (
          <ErrorScreen onRetry={handleRetry} autoRetrying={autoRetrying} />
        ) : (
          <Suspense fallback={<LoadingScreen />}>
            <Canvas
              key={canvasKey}
              camera={{ position: [0, 1.6, 5], fov: 60 }}
              shadows
              gl={{
                antialias: window.devicePixelRatio < 2,
                alpha: false,
                powerPreference: 'default',
                failIfMajorPerformanceCaveat: false,
                preserveDrawingBuffer: false,
              }}
              dpr={Math.min(window.devicePixelRatio, 1.5)}
              onCreated={({ gl }) => {
                gl.setClearColor('#1a1a1a');
                const canvas = gl.domElement;
                canvas.addEventListener('webglcontextlost', handleContextLost);
                canvas.addEventListener('webglcontextrestored', () => {
                  console.log('WebGL context restored');
                  setContextLost(false);
                });
              }}
            >
              <Scene />
            </Canvas>
          </Suspense>
        )}
      </div>

      {/* UI Overlays */}
      <TouchGuide />
      <PlayerCount />
      {!isCloseUpMode && <ArtworkInfoPanel />}
      {!isCloseUpMode && <GuestbookForm />}
      {!isCloseUpMode && <BottomNavigation />}
      <MusicPlayer />
      <CloseUpView />

      {/* Admin UI */}
      <AdminAuth />
      {isAdmin && <AdminPanel />}
    </div>
  );
}

// Main App with routing
function App() {
  return (
    <Routes>
      {/* Super Admin page */}
      <Route path="/super-admin" element={<SuperAdminPanel />} />

      {/* Exhibition page with code */}
      <Route path="/:code" element={<ExhibitionPage />} />

      {/* Default redirect to default exhibition */}
      <Route path="/" element={<Navigate to="/default" replace />} />
    </Routes>
  );
}

export default App;
