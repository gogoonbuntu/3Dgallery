import { Suspense, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { ArtworkInfoPanel } from './components/ui/ArtworkInfoPanel';
import { GuestbookForm } from './components/ui/GuestbookForm';
import { TouchGuide } from './components/ui/TouchGuide';
import { BottomNavigation } from './components/ui/BottomNavigation';
import { CloseUpView } from './components/ui/CloseUpView';
import { MusicPlayer } from './components/ui/MusicPlayer';
import { AdminAuth } from './components/admin/AdminAuth';
import { AdminPanel } from './components/admin/AdminPanel';
import { useGalleryStore } from './store/galleryStore';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import './App.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>갤러리 로딩 중...</p>
    </div>
  );
}

function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="loading-screen">
      <p>WebGL 컨텍스트 손실</p>
      <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>GPU 리소스가 부족합니다. 다른 탭을 닫아보세요.</p>
      <button onClick={onRetry} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
        다시 시도
      </button>
    </div>
  );
}

function App() {
  const { isCloseUpMode, exitCloseUpMode, isAdmin, isAdminPanelOpen } = useGalleryStore();
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  // Initialize Firebase sync
  useFirebaseSync();

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

  const handleRetry = useCallback(() => {
    setContextLost(false);
    setCanvasKey(prev => prev + 1);
  }, []);

  return (
    <div className="app">
      <div className="canvas-container">
        {contextLost ? (
          <ErrorScreen onRetry={handleRetry} />
        ) : (
          <Suspense fallback={<LoadingScreen />}>
            <Canvas
              key={canvasKey}
              camera={{ position: [0, 1.6, 5], fov: 60 }}
              shadows
              gl={{ antialias: true, alpha: false }}
              dpr={[1, 2]}
              onCreated={({ gl }) => {
                gl.setClearColor('#1a1a1a');

                // Handle WebGL context loss
                const canvas = gl.domElement;
                canvas.addEventListener('webglcontextlost', (e) => {
                  e.preventDefault();
                  console.warn('WebGL context lost, displaying error screen');
                  setContextLost(true);
                });
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

export default App;
