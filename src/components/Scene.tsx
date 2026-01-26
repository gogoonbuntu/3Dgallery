import { Suspense } from 'react';
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

function Controller() {
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
    return (
        <>
            <Controller />
            <CloseUpCamera />
            <ambientLight intensity={0.5} />
            <GalleryRoom />
            <Suspense fallback={<LoadingBox />}>
                <ArtworkCollection />
                <AdSlots />
            </Suspense>
            <GuestbookWall />
            <MusicPlayer3D />
            <OtherPlayers />
        </>
    );
}
