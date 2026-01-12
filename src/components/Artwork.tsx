import { useRef, useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGalleryStore } from '../store/galleryStore';
import type { Artwork as ArtworkType } from '../store/galleryStore';

interface ArtworkProps {
    artwork: ArtworkType;
}

export function Artwork({ artwork }: ArtworkProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
    const { selectArtwork, enterCloseUpMode, selectedArtwork } = useGalleryStore();

    // Load texture
    const texture = useLoader(THREE.TextureLoader, artwork.imageUrl);

    useEffect(() => {
        if (texture.image) {
            const aspect = texture.image.width / texture.image.height;
            const maxSize = 2;
            if (aspect > 1) {
                setImageSize({ width: maxSize, height: maxSize / aspect });
            } else {
                setImageSize({ width: maxSize * aspect, height: maxSize });
            }
        }
    }, [texture]);

    // Calculate position based on wall
    const getPosition = (): [number, number, number] => {
        const y = artwork.position.y;
        switch (artwork.wall) {
            case 'A': // Front wall (negative Z)
                return [artwork.position.x, y, -7.9];
            case 'B': // Right wall (positive X)
                return [7.9, y, artwork.position.x];
            case 'C': // Back wall (positive Z)
                return [artwork.position.x, y, 7.9];
            default:
                return [0, y, 0];
        }
    };

    const getRotation = (): [number, number, number] => {
        switch (artwork.wall) {
            case 'A':
                return [0, 0, 0];
            case 'B':
                return [0, -Math.PI / 2, 0];
            case 'C':
                return [0, Math.PI, 0];
            default:
                return [0, 0, 0];
        }
    };

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        selectArtwork(artwork);
    };

    const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        selectArtwork(artwork);
        enterCloseUpMode();
    };

    const isSelected = selectedArtwork?.id === artwork.id;

    return (
        <group position={getPosition()} rotation={getRotation()}>
            {/* Frame */}
            <mesh position={[0, 0, -0.02]}>
                <boxGeometry args={[imageSize.width + 0.15, imageSize.height + 0.15, 0.05]} />
                <meshStandardMaterial color={isSelected ? '#d4af37' : '#2c2c2c'} />
            </mesh>

            {/* Artwork */}
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <planeGeometry args={[imageSize.width, imageSize.height]} />
                <meshStandardMaterial
                    map={texture}
                    emissive={hovered ? '#222' : '#000'}
                    emissiveIntensity={hovered ? 0.1 : 0}
                />
            </mesh>

            {/* Spotlight for artwork */}
            <spotLight
                position={[0, 1.5, 1]}
                angle={0.4}
                penumbra={0.5}
                intensity={isSelected ? 30 : 15}
                color="#fff5e0"
                target={meshRef.current || undefined}
            />
        </group>
    );
}

export function ArtworkCollection() {
    const { artworks } = useGalleryStore();

    return (
        <group>
            {artworks.map((artwork) => (
                <Artwork key={artwork.id} artwork={artwork} />
            ))}
        </group>
    );
}
