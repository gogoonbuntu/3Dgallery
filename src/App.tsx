import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { ArtworkInfoPanel } from './components/ui/ArtworkInfoPanel';
import { GuestbookForm } from './components/ui/GuestbookForm';
import { TouchGuide } from './components/ui/TouchGuide';
import { BottomNavigation } from './components/ui/BottomNavigation';
import { CloseUpView } from './components/ui/CloseUpView';
import { useGalleryStore } from './store/galleryStore';
import './App.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>갤러리 로딩 중...</p>
    </div>
  );
}

function App() {
  const { isCloseUpMode, exitCloseUpMode } = useGalleryStore();

  // Handle ESC key to exit close-up mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCloseUpMode) {
        exitCloseUpMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCloseUpMode, exitCloseUpMode]);

  return (
    <div className="app">
      <div className="canvas-container">
        <Suspense fallback={<LoadingScreen />}>
          <Canvas
            camera={{ position: [0, 1.6, 5], fov: 60 }}
            shadows
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 2]}
            onCreated={({ gl }) => {
              gl.setClearColor('#1a1a1a');
            }}
          >
            <Scene />
          </Canvas>
        </Suspense>
      </div>

      {/* UI Overlays */}
      <TouchGuide />
      {!isCloseUpMode && <ArtworkInfoPanel />}
      {!isCloseUpMode && <GuestbookForm />}
      {!isCloseUpMode && <BottomNavigation />}
      <CloseUpView />
    </div>
  );
}

export default App;
