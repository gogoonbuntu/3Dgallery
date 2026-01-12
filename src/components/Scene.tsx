import { Suspense } from 'react';
import { GalleryRoom } from './GalleryRoom';
import { ArtworkCollection } from './Artwork';
import { GuestbookWall } from './GuestbookWall';
import { CloseUpCamera } from './CloseUpCamera';
import { useControls } from '../hooks/useTouchControls';
import { useGalleryStore } from '../store/galleryStore';

function Controller() {
    const { isCloseUpMode } = useGalleryStore();

    // Only enable controls when not in close-up mode
    useControls();

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
            </Suspense>
            <GuestbookWall />
        </>
    );
}
