import { useMemo } from 'react';
import * as THREE from 'three';

interface WallProps {
    position: [number, number, number];
    rotation: [number, number, number];
    size: [number, number];
    color?: string;
}

function Wall({ position, rotation, size, color = '#f5f5f5' }: WallProps) {
    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={size} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
    );
}

export function GalleryRoom() {
    const roomSize = { width: 16, height: 5, depth: 16 };

    const floorTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        // Create parquet floor pattern
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(0, 0, 512, 512);

        const plankWidth = 64;
        const plankHeight = 16;

        for (let row = 0; row < 512 / plankHeight; row++) {
            for (let col = 0; col < 512 / plankWidth; col++) {
                const offset = (row % 2) * (plankWidth / 2);
                const x = col * plankWidth + offset;
                const y = row * plankHeight;

                const shade = 0.8 + Math.random() * 0.4;
                ctx.fillStyle = `rgb(${Math.floor(61 * shade)}, ${Math.floor(40 * shade)}, ${Math.floor(23 * shade)})`;
                ctx.fillRect(x, y, plankWidth - 1, plankHeight - 1);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }, []);

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[roomSize.width, roomSize.depth]} />
                <meshStandardMaterial map={floorTexture} />
            </mesh>

            {/* Ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, roomSize.height, 0]}>
                <planeGeometry args={[roomSize.width, roomSize.depth]} />
                <meshStandardMaterial color="#fafafa" />
            </mesh>

            {/* Wall A - Front (negative Z) */}
            <Wall
                position={[0, roomSize.height / 2, -roomSize.depth / 2]}
                rotation={[0, 0, 0]}
                size={[roomSize.width, roomSize.height]}
                color="#f8f8f8"
            />

            {/* Wall B - Right (positive X) */}
            <Wall
                position={[roomSize.width / 2, roomSize.height / 2, 0]}
                rotation={[0, -Math.PI / 2, 0]}
                size={[roomSize.depth, roomSize.height]}
                color="#f8f8f8"
            />

            {/* Wall C - Back (positive Z) */}
            <Wall
                position={[0, roomSize.height / 2, roomSize.depth / 2]}
                rotation={[0, Math.PI, 0]}
                size={[roomSize.width, roomSize.height]}
                color="#f8f8f8"
            />

            {/* Wall D - Left (negative X) - Guestbook Wall */}
            <Wall
                position={[-roomSize.width / 2, roomSize.height / 2, 0]}
                rotation={[0, Math.PI / 2, 0]}
                size={[roomSize.depth, roomSize.height]}
                color="#e8f4e8"
            />

            {/* Gallery spotlights */}
            <pointLight position={[0, 4.5, 0]} intensity={100} color="#ffffff" castShadow />
            <pointLight position={[-5, 4, -5]} intensity={50} color="#fff5e6" />
            <pointLight position={[5, 4, -5]} intensity={50} color="#fff5e6" />
            <pointLight position={[-5, 4, 5]} intensity={50} color="#fff5e6" />
            <pointLight position={[5, 4, 5]} intensity={50} color="#fff5e6" />

            {/* Ambient light for soft shadows */}
            <ambientLight intensity={0.3} />
        </group>
    );
}
