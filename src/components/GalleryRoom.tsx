import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGalleryStore } from '../store/galleryStore';

// Smaller texture size for better performance
const TEXTURE_SIZE = 256;

interface WallProps {
    position: [number, number, number];
    rotation: [number, number, number];
    size: [number, number];
    color: string;
    texture?: THREE.Texture | null;
}

function Wall({ position, rotation, size, color, texture }: WallProps) {
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    // Update material when props change
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.needsUpdate = true;
        }
    }, [color, texture]);

    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={size} />
            <meshStandardMaterial
                ref={materialRef}
                color={texture ? '#ffffff' : color}
                map={texture || null}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

// Utility to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        }
        : { r: 100, g: 100, b: 100 };
}

export function GalleryRoom() {
    const { gallerySettings } = useGalleryStore();
    const roomSize = { width: 16, height: 5, depth: 16 };

    // Generate Floor Texture (optimized)
    const floorTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = TEXTURE_SIZE;
        canvas.height = TEXTURE_SIZE;
        const ctx = canvas.getContext('2d')!;

        const drawWoodPlanks = (pattern: 'straight' | 'herringbone') => {
            ctx.fillStyle = '#3d2817';
            ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

            const plankWidth = 32;
            const plankHeight = 8;

            if (pattern === 'straight') {
                for (let row = 0; row < TEXTURE_SIZE / plankHeight; row++) {
                    for (let col = 0; col < TEXTURE_SIZE / plankWidth + 1; col++) {
                        const offset = (row % 2) * (plankWidth / 2);
                        const x = col * plankWidth + offset;
                        const y = row * plankHeight;
                        const shade = 0.8 + Math.random() * 0.4;
                        ctx.fillStyle = `rgb(${Math.floor(61 * shade)}, ${Math.floor(40 * shade)}, ${Math.floor(23 * shade)})`;
                        ctx.fillRect(x, y, plankWidth - 1, plankHeight - 1);
                    }
                }
            } else {
                // Simplified herringbone
                for (let i = 0; i < 10; i++) {
                    for (let j = 0; j < 10; j++) {
                        const shade = 0.8 + Math.random() * 0.4;
                        ctx.fillStyle = `rgb(${Math.floor(61 * shade)}, ${Math.floor(40 * shade)}, ${Math.floor(23 * shade)})`;
                        ctx.save();
                        ctx.translate(i * 25, j * 25);
                        ctx.rotate(i % 2 === 0 ? Math.PI / 4 : -Math.PI / 4);
                        ctx.fillRect(0, 0, 30, 8);
                        ctx.restore();
                    }
                }
            }
        };

        switch (gallerySettings.floorTexture) {
            case 'wood':
                drawWoodPlanks('straight');
                break;
            case 'herringbone':
                drawWoodPlanks('herringbone');
                break;
            case 'marble':
            case 'stone':
                const isStone = gallerySettings.floorTexture === 'stone';
                ctx.fillStyle = isStone ? '#444' : '#e8e8e8';
                ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
                ctx.strokeStyle = isStone ? '#555' : '#d0d0d0';
                ctx.lineWidth = 1;
                // Reduced veins
                for (let i = 0; i < 10; i++) {
                    ctx.beginPath();
                    ctx.moveTo(Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE);
                    ctx.bezierCurveTo(
                        Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE,
                        Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE,
                        Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE
                    );
                    ctx.stroke();
                }
                // Grid lines
                ctx.strokeStyle = isStone ? '#333' : '#ccc';
                for (let i = 0; i <= 4; i++) {
                    ctx.beginPath(); ctx.moveTo(i * 64, 0); ctx.lineTo(i * 64, TEXTURE_SIZE); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, i * 64); ctx.lineTo(TEXTURE_SIZE, i * 64); ctx.stroke();
                }
                break;
            case 'concrete':
                ctx.fillStyle = '#888';
                ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
                // Reduced speckles
                for (let i = 0; i < 1500; i++) {
                    const shade = 110 + Math.random() * 50;
                    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
                    ctx.fillRect(Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE, 1, 1);
                }
                break;
            case 'carpet':
                ctx.fillStyle = '#556677';
                ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
                // Greatly reduced fiber simulation
                for (let i = 0; i < 5000; i++) {
                    ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.08})`;
                    ctx.fillRect(Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE, 1, 1);
                }
                break;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }, [gallerySettings.floorTexture]);

    // Generate Wall Texture with baked color (fixed)
    const wallTexture = useMemo(() => {
        if (gallerySettings.wallPattern === 'none') return null;

        const canvas = document.createElement('canvas');
        canvas.width = TEXTURE_SIZE;
        canvas.height = TEXTURE_SIZE;
        const ctx = canvas.getContext('2d')!;

        // Bake wall color into the texture background
        const bgColor = hexToRgb(gallerySettings.wallColor);
        ctx.fillStyle = gallerySettings.wallColor;
        ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

        // Pattern overlay color (darker version of wall color)
        const patternColor = `rgba(${Math.max(0, bgColor.r - 40)}, ${Math.max(0, bgColor.g - 40)}, ${Math.max(0, bgColor.b - 40)}, 0.3)`;
        ctx.strokeStyle = patternColor;
        ctx.fillStyle = patternColor;
        ctx.lineWidth = 2;

        switch (gallerySettings.wallPattern) {
            case 'brick':
                for (let y = 0; y < TEXTURE_SIZE; y += 16) {
                    const offset = (y / 16 % 2) * 16;
                    for (let x = 0; x < TEXTURE_SIZE; x += 32) {
                        ctx.strokeRect(x - offset, y, 32, 16);
                    }
                }
                break;
            case 'stripes':
                for (let x = 0; x < TEXTURE_SIZE; x += 16) {
                    ctx.fillRect(x, 0, 8, TEXTURE_SIZE);
                }
                break;
            case 'grid':
                for (let i = 0; i < TEXTURE_SIZE; i += 32) {
                    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, TEXTURE_SIZE); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(TEXTURE_SIZE, i); ctx.stroke();
                }
                break;
            case 'dots':
                for (let y = 8; y < TEXTURE_SIZE; y += 32) {
                    for (let x = 8; x < TEXTURE_SIZE; x += 32) {
                        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
                    }
                }
                break;
            case 'chevron':
                ctx.lineWidth = 3;
                for (let y = 0; y < TEXTURE_SIZE; y += 32) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    for (let x = 0; x < TEXTURE_SIZE; x += 32) {
                        ctx.lineTo(x + 16, y + 16);
                        ctx.lineTo(x + 32, y);
                    }
                    ctx.stroke();
                }
                break;
            case 'noise':
                // Greatly reduced noise
                for (let i = 0; i < 2000; i++) {
                    ctx.fillStyle = `rgba(${Math.max(0, bgColor.r - 30)}, ${Math.max(0, bgColor.g - 30)}, ${Math.max(0, bgColor.b - 30)}, ${Math.random() * 0.15})`;
                    ctx.fillRect(Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE, 1, 1);
                }
                break;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }, [gallerySettings.wallPattern, gallerySettings.wallColor]);

    const wallColor = gallerySettings.wallColor;

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

            {/* Walls */}
            <Wall position={[0, roomSize.height / 2, -roomSize.depth / 2]} rotation={[0, 0, 0]} size={[roomSize.width, roomSize.height]} color={wallColor} texture={wallTexture} />
            <Wall position={[roomSize.width / 2, roomSize.height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} size={[roomSize.depth, roomSize.height]} color={wallColor} texture={wallTexture} />
            <Wall position={[0, roomSize.height / 2, roomSize.depth / 2]} rotation={[0, Math.PI, 0]} size={[roomSize.width, roomSize.height]} color={wallColor} texture={wallTexture} />
            <Wall position={[-roomSize.width / 2, roomSize.height / 2, 0]} rotation={[0, Math.PI / 2, 0]} size={[roomSize.depth, roomSize.height]} color={wallColor} texture={wallTexture} />

            {/* Dynamic Lighting based on gallery settings */}
            {(() => {
                // Calculate lighting values from settings (0-100 scale to actual values)
                const brightness = gallerySettings.lightingBrightness / 100;
                const intensity = gallerySettings.lightingIntensity / 100;
                const colorTemp = gallerySettings.lightingColorTemp / 100;
                const ambientLevel = gallerySettings.ambientIntensity / 100;

                // Color temperature: 0 = cool blue, 0.5 = neutral white, 1 = warm orange
                const getLightColor = (temp: number) => {
                    if (temp < 0.5) {
                        // Cool (blue tinted)
                        const t = temp * 2; // 0-1
                        const r = Math.round(200 + t * 55);
                        const g = Math.round(220 + t * 35);
                        const b = 255;
                        return `rgb(${r}, ${g}, ${b})`;
                    } else {
                        // Warm (orange/yellow tinted)
                        const t = (temp - 0.5) * 2; // 0-1
                        const r = 255;
                        const g = Math.round(255 - t * 30);
                        const b = Math.round(255 - t * 80);
                        return `rgb(${r}, ${g}, ${b})`;
                    }
                };

                const mainLightColor = getLightColor(colorTemp);
                const accentLightColor = getLightColor(Math.min(1, colorTemp + 0.1));

                // Main ceiling light - intensity affected by brightness and intensity
                const mainIntensity = 80 * brightness * intensity * 2;
                const sideIntensity = 40 * brightness * intensity * 2;
                const ambientIntensity = 0.6 * ambientLevel;

                return (
                    <>
                        {/* Main ceiling light */}
                        <pointLight
                            position={[0, 4.5, 0]}
                            intensity={mainIntensity}
                            color={mainLightColor}
                            castShadow
                        />
                        {/* Side accent lights */}
                        <pointLight
                            position={[-4, 4, 0]}
                            intensity={sideIntensity}
                            color={accentLightColor}
                        />
                        <pointLight
                            position={[4, 4, 0]}
                            intensity={sideIntensity}
                            color={accentLightColor}
                        />
                        {/* Ambient fill light */}
                        <ambientLight intensity={ambientIntensity} />
                    </>
                );
            })()}
        </group>
    );
}

