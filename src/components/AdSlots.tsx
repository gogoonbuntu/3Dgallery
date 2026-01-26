import { useRef } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { useGalleryStore, type AdSlot } from '../store/galleryStore';

interface AdDisplayProps {
    ad: AdSlot;
}

function AdDisplay({ ad }: AdDisplayProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Load texture
    const texture = useLoader(THREE.TextureLoader, ad.imageUrl);

    // Calculate position based on wall
    const getPosition = (): [number, number, number] => {
        const y = ad.position.y;
        const padding = 0.05;
        switch (ad.wall) {
            case 'A': // Front wall
                return [ad.position.x, y, -7.9 + padding];
            case 'B': // Right wall
                return [7.9 - padding, y, ad.position.x];
            case 'C': // Back wall
                return [ad.position.x, y, 7.9 - padding];
            case 'D': // Entrance wall (same as back but different location)
                return [ad.position.x, y, -7.9 + padding];
            default:
                return [0, y, 0];
        }
    };

    const getRotation = (): [number, number, number] => {
        switch (ad.wall) {
            case 'A': return [0, 0, 0];
            case 'B': return [0, -Math.PI / 2, 0];
            case 'C': return [0, Math.PI, 0];
            case 'D': return [0, 0, 0];
            default: return [0, 0, 0];
        }
    };

    const handleClick = () => {
        if (ad.linkUrl) {
            window.open(ad.linkUrl, '_blank');
        }
    };

    if (!ad.isActive) return null;

    return (
        <group position={getPosition()} rotation={getRotation()}>
            {/* Ad image */}
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <planeGeometry args={[ad.size.width, ad.size.height]} />
                <meshStandardMaterial
                    map={texture}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* "AD" label */}
            <mesh position={[ad.size.width / 2 - 0.15, ad.size.height / 2 - 0.1, 0.01]}>
                <planeGeometry args={[0.25, 0.15]} />
                <meshBasicMaterial color="#ffcc00" />
            </mesh>
        </group>
    );
}

// Container component that renders all ads
export function AdSlots() {
    const adSlots = useGalleryStore((state) => state.adSlots);

    return (
        <>
            {adSlots.map((ad) => (
                <AdDisplay key={ad.id} ad={ad} />
            ))}
        </>
    );
}
