import { Suspense, useEffect, useRef } from 'react';
import { GalleryRoom } from './GalleryRoom';
import { ArtworkCollection } from './Artwork';
import { GuestbookWall } from './GuestbookWall';
import { CloseUpCamera } from './CloseUpCamera';
import { MusicPlayer3D } from './MusicPlayer3D';
import { OtherPlayers } from './OtherPlayers';
import { AdSlots } from './AdSlots';
import { useControls } from '../hooks/useTouchControls';
import { usePlayerPositionSync } from '../hooks/usePlayerPositionSync';
import { useGalleryStore } from '../store/galleryStore';

// Debug helper
const debugLog = (phase: string, message: string, data?: unknown) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    console.log(`[${timestamp}] [Scene-${phase}] ${message}`, data ?? '');
};

function Controller() {
    const initTime = useRef(Date.now());

    useEffect(() => {
        debugLog('Controller', 'Controller component mounted', { elapsed: Date.now() - initTime.current });
        return () => debugLog('Controller', 'Controller unmounting');
    }, []);

    useGalleryStore();

    // Only enable controls when not in close-up mode
    useControls();

    // Sync player position for multiplayer
    usePlayerPositionSync();

    return null;
}

function LoadingBox() {
    return (
        <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#667eea" />
        </mesh>
    );
}

export function Scene() {
    const sceneInitTime = useRef(Date.now());
    const isCloseUpMode = useGalleryStore((state) => state.isCloseUpMode);

    useEffect(() => {
        debugLog('MOUNT', 'Scene component mounted', { elapsed: 0 });
        return () => debugLog('UNMOUNT', 'Scene component unmounting');
    }, []);

    return (
        <>
            {/* Phase 1: Controller (input handling) */}
            <Controller />

            {/* Phase 2: Camera */}
            <SceneLogger name="CloseUpCamera" initTime={sceneInitTime.current}>
                <CloseUpCamera />
            </SceneLogger>

            {/* Phase 3: Lighting */}
            <SceneLogger name="AmbientLight" initTime={sceneInitTime.current}>
                <ambientLight intensity={0.5} />
            </SceneLogger>

            {/* Phase 4: Room geometry */}
            <SceneLogger name="GalleryRoom" initTime={sceneInitTime.current}>
                <GalleryRoom />
            </SceneLogger>

            {/* Phase 5: Artworks (async with textures) */}
            <Suspense fallback={<LoadingBox />}>
                <SceneLogger name="ArtworkCollection" initTime={sceneInitTime.current}>
                    <ArtworkCollection />
                </SceneLogger>
                <SceneLogger name="AdSlots" initTime={sceneInitTime.current}>
                    <AdSlots />
                </SceneLogger>
            </Suspense>

            {/* Phase 6: Other elements */}
            <SceneLogger name="GuestbookWall" initTime={sceneInitTime.current}>
                <GuestbookWall />
            </SceneLogger>
            <SceneLogger name="MusicPlayer3D" initTime={sceneInitTime.current}>
                <MusicPlayer3D />
            </SceneLogger>
            {/* Hide other players when viewing artwork up close */}
            {!isCloseUpMode && (
                <SceneLogger name="OtherPlayers" initTime={sceneInitTime.current}>
                    <OtherPlayers />
                </SceneLogger>
            )}
        </>
    );
}

// Helper component to log when each child mounts
function SceneLogger({ name, initTime, children }: { name: string; initTime: number; children: React.ReactNode }) {
    useEffect(() => {
        const elapsed = Date.now() - initTime;
        debugLog('LOAD', `${name} mounted`, { elapsed });
        return () => debugLog('UNLOAD', `${name} unmounting`);
    }, [name, initTime]);

    return <>{children}</>;
}
