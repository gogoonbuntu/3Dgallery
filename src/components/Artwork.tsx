import { useRef, useState, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGalleryStore } from '../store/galleryStore';
import type { Artwork as ArtworkType, FrameStyle } from '../store/galleryStore';

interface ArtworkProps {
    artwork: ArtworkType;
}

const FRAME_COLORS: Record<string, string> = {
    classic: '#3d2b1f', // Dark wood
    modern: '#1a1a1a',  // Black
    minimal: '#f0f0f0', // Off-white
    ornate: '#d4af37',  // Gold
    thin: '#2c2c2c',    // Dark grey
    thick: '#000000',   // Pure black
    shadow: '#333333',  // Grey
    glass: '#ffffff',   // White base
    wood: '#5d4037',    // Medium wood
    metal: '#78909c',   // Steel blue/grey
    none: 'transparent',
};

export function Artwork({ artwork }: ArtworkProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const { selectArtwork, enterCloseUpMode, selectedArtwork, gallerySettings } = useGalleryStore();

    // Determine current frame style and color (individual override or global setting)
    const currentFrameStyle = (artwork.frameStyle || gallerySettings.frameStyle) as FrameStyle;
    const isSelected = selectedArtwork?.id === artwork.id;
    const baseFrameColor = artwork.frameColor || FRAME_COLORS[currentFrameStyle] || '#2c2c2c';
    const frameColor = isSelected ? '#d4af37' : baseFrameColor;

    // Load texture
    const texture = useLoader(THREE.TextureLoader, artwork.imageUrl);

    // Calculate image size using useMemo for stable rendering
    const imageSize = useMemo(() => {
        if (texture.image) {
            const aspect = texture.image.width / texture.image.height;
            const maxSize = 2;
            if (aspect > 1) {
                return { width: maxSize, height: maxSize / aspect };
            } else {
                return { width: maxSize * aspect, height: maxSize };
            }
        }
        return { width: 1, height: 1 };
    }, [texture.image?.width, texture.image?.height]);

    // Calculate position based on wall
    const getPosition = (): [number, number, number] => {
        const y = artwork.position.y;
        const padding = 0.05; // Slightly away from wall to avoid z-fighting
        switch (artwork.wall) {
            case 'A': // Front wall (negative Z)
                return [artwork.position.x, y, -7.9 + padding];
            case 'B': // Right wall (positive X)
                return [7.9 - padding, y, artwork.position.x];
            case 'C': // Back wall (positive Z)
                return [artwork.position.x, y, 7.9 - padding];
            default:
                return [0, y, 0];
        }
    };

    const getRotation = (): [number, number, number] => {
        switch (artwork.wall) {
            case 'A': return [0, 0, 0];
            case 'B': return [0, -Math.PI / 2, 0];
            case 'C': return [0, Math.PI, 0];
            default: return [0, 0, 0];
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

    // Render Different Frame Types
    const Frame = useMemo(() => {
        if (currentFrameStyle === 'none') return null;

        const w = imageSize.width;
        const h = imageSize.height;

        switch (currentFrameStyle) {
            case 'classic': // Beveled thick frame
                return (
                    <group position={[0, 0, -0.04]}>
                        <mesh>
                            <boxGeometry args={[w + 0.3, h + 0.3, 0.08]} />
                            <meshStandardMaterial color={frameColor} roughness={0.8} />
                        </mesh>
                        <mesh position={[0, 0, 0.03]}>
                            <boxGeometry args={[w + 0.1, h + 0.1, 0.02]} />
                            <meshStandardMaterial color={frameColor} />
                        </mesh>
                    </group>
                );
            case 'modern': // Sleek clean frame
                return (
                    <mesh position={[0, 0, -0.025]}>
                        <boxGeometry args={[w + 0.15, h + 0.15, 0.05]} />
                        <meshStandardMaterial color={frameColor} metalness={0.2} roughness={0.2} />
                    </mesh>
                );
            case 'minimal': // Floating look with thin backing
                return (
                    <mesh position={[0, 0, -0.05]}>
                        <boxGeometry args={[w, h, 0.02]} />
                        <meshStandardMaterial color={frameColor} />
                    </mesh>
                );
            case 'ornate': // Double-layered gold-ish
                return (
                    <group position={[0, 0, -0.08]}>
                        <mesh>
                            <boxGeometry args={[w + 0.4, h + 0.4, 0.06]} />
                            <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
                        </mesh>
                        <mesh position={[0, 0, 0.04]}>
                            <boxGeometry args={[w + 0.2, h + 0.2, 0.03]} />
                            <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.1} />
                        </mesh>
                    </group>
                );
            case 'thin': // Super thin border
                return (
                    <mesh position={[0, 0, -0.01]}>
                        <boxGeometry args={[w + 0.04, h + 0.04, 0.03]} />
                        <meshStandardMaterial color={frameColor} />
                    </mesh>
                );
            case 'thick': // Bold, Very deep
                return (
                    <mesh position={[0, 0, -0.1]}>
                        <boxGeometry args={[w + 0.2, h + 0.2, 0.2]} />
                        <meshStandardMaterial color={frameColor} />
                    </mesh>
                );
            case 'shadow': // Recessed look
                return (
                    <group position={[0, 0, -0.05]}>
                        <mesh position={[0, 0, -0.02]}>
                            <boxGeometry args={[w + 0.4, h + 0.4, 0.02]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                        <mesh>
                            <boxGeometry args={[w + 0.1, h + 0.1, 0.1]} />
                            <meshStandardMaterial color={frameColor} />
                        </mesh>
                    </group>
                );
            case 'glass': // Glassy overlay
                return (
                    <group>
                        <mesh position={[0, 0, -0.02]}>
                            <boxGeometry args={[w + 0.1, h + 0.1, 0.04]} />
                            <meshStandardMaterial color={frameColor} />
                        </mesh>
                        <mesh position={[0, 0, 0.015]}>
                            <planeGeometry args={[w, h]} />
                            <meshPhysicalMaterial
                                transparent
                                opacity={0.3}
                                transmission={0.9}
                                thickness={0.5}
                                roughness={0}
                                color="#ffffff"
                            />
                        </mesh>
                    </group>
                );
            case 'wood': // Natural wood with texture
                return (
                    <mesh position={[0, 0, -0.03]}>
                        <boxGeometry args={[w + 0.2, h + 0.2, 0.06]} />
                        <meshStandardMaterial color={frameColor} roughness={0.9} />
                    </mesh>
                );
            case 'metal': // Brushed metal
                return (
                    <mesh position={[0, 0, -0.02]}>
                        <boxGeometry args={[w + 0.1, h + 0.1, 0.04]} />
                        <meshStandardMaterial color={frameColor} metalness={0.9} roughness={0.3} />
                    </mesh>
                );
            default:
                return null;
        }
    }, [currentFrameStyle, frameColor, imageSize]);

    return (
        <group position={getPosition()} rotation={getRotation()}>
            {/* Frame */}
            {Frame}

            {/* Artwork */}
            <mesh
                ref={meshRef}
                position={[0, 0, 0.01]}
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
                position={[0, 1.5, 1.5]}
                angle={0.4}
                penumbra={0.5}
                intensity={isSelected ? 40 : 20}
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

