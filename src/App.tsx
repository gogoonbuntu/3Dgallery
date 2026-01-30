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
import { QRCodeShare } from './components/ui/QRCodeShare';
import { BrandWatermark } from './components/ui/BrandWatermark';
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

// Debug helper with timestamp
const debugLog = (phase: string, message: string, data?: unknown) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  console.log(`[${timestamp}] [${phase}] ${message}`, data ?? '');
};

// Exhibition page component
function ExhibitionPage() {
  const { code } = useParams<{ code: string }>();
  const { setExhibitionCode, isCloseUpMode, exitCloseUpMode, isAdmin, isAdminPanelOpen } = useGalleryStore();
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [autoRetrying, setAutoRetrying] = useState(false);
  const [initPhase, setInitPhase] = useState('starting');
  const retryCount = useRef(0);
  const maxAutoRetries = 2;
  const initStartTime = useRef(Date.now());

  // Log component mount and phase changes
  useEffect(() => {
    debugLog('MOUNT', 'ExhibitionPage component mounted', { code, initPhase, elapsed: 0 });
    return () => debugLog('UNMOUNT', 'ExhibitionPage component unmounting');
  }, []);

  // Log phase changes
  useEffect(() => {
    debugLog('PHASE', `Current init phase: ${initPhase}`, { elapsed: Date.now() - initStartTime.current });
  }, [initPhase]);

  // Phase 1: Set exhibition code from URL
  useEffect(() => {
    if (code) {
      const elapsed = Date.now() - initStartTime.current;
      debugLog('PHASE-1', `Setting exhibition code: ${code}`, { elapsed });
      setInitPhase('exhibition-code');
      setExhibitionCode(code);
      debugLog('PHASE-1', 'Exhibition code set complete', { elapsed: Date.now() - initStartTime.current });
    }
  }, [code, setExhibitionCode]);

  // Phase 2: Initialize Firebase sync (with delay)
  const [firebaseReady, setFirebaseReady] = useState(false);
  useEffect(() => {
    if (!code) return;
    const elapsed = Date.now() - initStartTime.current;
    debugLog('PHASE-2', 'Waiting before Firebase sync init...', { elapsed });
    setInitPhase('firebase-wait');

    const timer = setTimeout(() => {
      debugLog('PHASE-2', 'Starting Firebase sync', { elapsed: Date.now() - initStartTime.current });
      setFirebaseReady(true);
      setInitPhase('firebase-init');
    }, 200); // 200ms delay before Firebase

    return () => clearTimeout(timer);
  }, [code]);

  // Only run Firebase sync after firebaseReady is true
  useFirebaseSync(firebaseReady);

  // Phase 3: Initialize multiplayer connection (with delay)
  const [multiplayerReady, setMultiplayerReady] = useState(false);
  useEffect(() => {
    if (!firebaseReady) return;
    const elapsed = Date.now() - initStartTime.current;
    debugLog('PHASE-3', 'Waiting before Multiplayer sync init...', { elapsed });
    setInitPhase('multiplayer-wait');

    const timer = setTimeout(() => {
      debugLog('PHASE-3', 'Starting Multiplayer sync', { elapsed: Date.now() - initStartTime.current });
      setMultiplayerReady(true);
      setInitPhase('multiplayer-init');
    }, 400); // 400ms delay before Multiplayer (Firebase에서 데이터 로드할 시간 확보)

    return () => clearTimeout(timer);
  }, [firebaseReady]);

  // Only run Multiplayer sync after multiplayerReady is true
  useMultiplayerSync(multiplayerReady);

  // Phase 4: Delay Canvas initialization to let everything settle
  useEffect(() => {
    if (!multiplayerReady) return;
    const elapsed = Date.now() - initStartTime.current;
    debugLog('PHASE-4', 'Waiting before Canvas init...', { elapsed });
    setInitPhase('canvas-wait');

    const timer = setTimeout(() => {
      debugLog('PHASE-4', 'Canvas/WebGL ready', { elapsed: Date.now() - initStartTime.current });
      setIsReady(true);
      setInitPhase('canvas-ready');
    }, 800); // 800ms delay to let StrictMode double-mount complete

    return () => clearTimeout(timer);
  }, [multiplayerReady]);

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

  // Auto-retry logic when context is lost - wait longer to let GPU recover
  useEffect(() => {
    if (contextLost && retryCount.current < maxAutoRetries) {
      debugLog('RECOVERY', `Auto-retry ${retryCount.current + 1}/${maxAutoRetries} in 1.5s...`);
      setAutoRetrying(true);
      const timer = setTimeout(() => {
        retryCount.current += 1;
        setContextLost(false);
        // Only recreate Canvas on last retry attempt
        if (retryCount.current >= maxAutoRetries) {
          debugLog('RECOVERY', 'All retries exhausted, recreating Canvas');
          setCanvasKey(prev => prev + 1);
        }
        setAutoRetrying(false);
      }, 1500); // Increased from 500ms to give GPU more time
      return () => clearTimeout(timer);
    }
  }, [contextLost]);

  const handleRetry = useCallback(() => {
    debugLog('RECOVERY', 'Manual retry requested, recreating Canvas');
    retryCount.current = 0;
    setContextLost(false);
    setCanvasKey(prev => prev + 1);
  }, []);

  // Debounced context lost handler
  const contextLostTimeoutRef = useRef<number | null>(null);
  const handleContextLost = useCallback((e: Event) => {
    e.preventDefault();
    // Debounce rapid context lost events
    if (contextLostTimeoutRef.current) return;
    debugLog('WEBGL', 'WebGL context LOST!', { elapsed: Date.now() - initStartTime.current });
    console.warn('WebGL context lost, attempting recovery...');
    contextLostTimeoutRef.current = window.setTimeout(() => {
      contextLostTimeoutRef.current = null;
    }, 2000);
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
                stencil: false, // Reduce GPU memory usage
                depth: true,
                powerPreference: 'low-power', // Reduce GPU pressure to prevent context loss
                failIfMajorPerformanceCaveat: false,
                preserveDrawingBuffer: true, // Help with context recovery
              }}
              dpr={Math.min(window.devicePixelRatio, 1.5)}
              // Use 'always' for continuous rendering (needed for animations)
              frameloop="always"
              onCreated={({ gl }) => {
                const elapsed = Date.now() - initStartTime.current;
                debugLog('WEBGL', 'Canvas created, WebGL context obtained', { elapsed });
                gl.setClearColor('#1a1a1a');
                const canvas = gl.domElement;
                canvas.addEventListener('webglcontextlost', (e) => {
                  debugLog('WEBGL', 'WebGL context LOST!', { elapsed: Date.now() - initStartTime.current });
                  handleContextLost(e);
                });
                canvas.addEventListener('webglcontextrestored', () => {
                  debugLog('WEBGL', 'WebGL context RESTORED', { elapsed: Date.now() - initStartTime.current });
                  setContextLost(false);
                });
                debugLog('WEBGL', 'Event listeners attached', { elapsed: Date.now() - initStartTime.current });
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
      <QRCodeShare />
      <BrandWatermark />

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
