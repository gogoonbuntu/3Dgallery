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
            case 'stone': {
                const isStone = gallerySettings.floorTexture === 'stone';
                // Rich museum-quality marble/stone
                const baseR = isStone ? 68 : 210;
                const baseG = isStone ? 68 : 205;
                const baseB = isStone ? 68 : 195;
                ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
                ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

                // Subtle color variation patches
                for (let i = 0; i < 30; i++) {
                    const patchR = baseR + (Math.random() - 0.5) * 20;
                    const patchG = baseG + (Math.random() - 0.5) * 20;
                    const patchB = baseB + (Math.random() - 0.5) * 15;
                    ctx.fillStyle = `rgba(${patchR}, ${patchG}, ${patchB}, 0.3)`;
                    ctx.beginPath();
                    ctx.ellipse(
                        Math.random() * TEXTURE_SIZE, Math.random() * TEXTURE_SIZE,
                        20 + Math.random() * 40, 15 + Math.random() * 30,
                        Math.random() * Math.PI, 0, Math.PI * 2
                    );
                    ctx.fill();
                }

                // Marble veins — organic, flowing lines
                for (let i = 0; i < 15; i++) {
                    const veinAlpha = 0.08 + Math.random() * 0.12;
                    const veinShade = isStone ? 85 : 170;
                    ctx.strokeStyle = `rgba(${veinShade}, ${veinShade - 10}, ${veinShade - 5}, ${veinAlpha})`;
                    ctx.lineWidth = 0.5 + Math.random() * 1.5;
                    ctx.beginPath();
                    const startX = Math.random() * TEXTURE_SIZE;
                    const startY = Math.random() * TEXTURE_SIZE;
                    ctx.moveTo(startX, startY);
                    const segments = 3 + Math.floor(Math.random() * 4);
                    for (let s = 0; s < segments; s++) {
                        ctx.bezierCurveTo(
                            startX + (Math.random() - 0.5) * TEXTURE_SIZE * 0.8,
                            startY + (Math.random() - 0.5) * TEXTURE_SIZE * 0.8,
                            Math.random() * TEXTURE_SIZE,
                            Math.random() * TEXTURE_SIZE,
                            Math.random() * TEXTURE_SIZE,
                            Math.random() * TEXTURE_SIZE
                        );
                    }
                    ctx.stroke();
                }

                // Tile grid lines — subtle grout
                const tileSize = 64;
                ctx.strokeStyle = isStone ? 'rgba(40,40,40,0.4)' : 'rgba(180,175,165,0.5)';
                ctx.lineWidth = 1;
                for (let i = 0; i <= TEXTURE_SIZE / tileSize; i++) {
                    ctx.beginPath(); ctx.moveTo(i * tileSize, 0); ctx.lineTo(i * tileSize, TEXTURE_SIZE); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, i * tileSize); ctx.lineTo(TEXTURE_SIZE, i * tileSize); ctx.stroke();
                }
                break;
            }
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
            {/* Floor — glossy museum floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[roomSize.width, roomSize.depth]} />
                <meshStandardMaterial
                    map={floorTexture}
                    roughness={0.25}
                    metalness={0.05}
                />
            </mesh>

            {/* Ceiling — dark museum ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, roomSize.height, 0]}>
                <planeGeometry args={[roomSize.width, roomSize.depth]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
            </mesh>

            {/* Walls */}
            <Wall position={[0, roomSize.height / 2, -roomSize.depth / 2]} rotation={[0, 0, 0]} size={[roomSize.width, roomSize.height]} color={wallColor} texture={wallTexture} />
            <Wall position={[roomSize.width / 2, roomSize.height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} size={[roomSize.depth, roomSize.height]} color={wallColor} texture={wallTexture} />
            <Wall position={[0, roomSize.height / 2, roomSize.depth / 2]} rotation={[0, Math.PI, 0]} size={[roomSize.width, roomSize.height]} color={wallColor} texture={wallTexture} />
            <Wall position={[-roomSize.width / 2, roomSize.height / 2, 0]} rotation={[0, Math.PI / 2, 0]} size={[roomSize.depth, roomSize.height]} color={wallColor} texture={wallTexture} />

            {/* ═══ Museum Architectural Details ═══ */}

            {/* Baseboard molding — dark strip along wall-floor junction */}
            {/* Front wall */}
            <mesh position={[0, 0.08, -roomSize.depth / 2 + 0.01]}>
                <boxGeometry args={[roomSize.width, 0.16, 0.04]} />
                <meshStandardMaterial color="#0d0d15" roughness={0.7} />
            </mesh>
            {/* Back wall */}
            <mesh position={[0, 0.08, roomSize.depth / 2 - 0.01]}>
                <boxGeometry args={[roomSize.width, 0.16, 0.04]} />
                <meshStandardMaterial color="#0d0d15" roughness={0.7} />
            </mesh>
            {/* Right wall */}
            <mesh position={[roomSize.width / 2 - 0.01, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[roomSize.depth, 0.16, 0.04]} />
                <meshStandardMaterial color="#0d0d15" roughness={0.7} />
            </mesh>
            {/* Left wall */}
            <mesh position={[-roomSize.width / 2 + 0.01, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[roomSize.depth, 0.16, 0.04]} />
                <meshStandardMaterial color="#0d0d15" roughness={0.7} />
            </mesh>

            {/* Crown molding — subtle strip at wall-ceiling junction */}
            {/* Front wall crown */}
            <mesh position={[0, roomSize.height - 0.06, -roomSize.depth / 2 + 0.015]}>
                <boxGeometry args={[roomSize.width, 0.12, 0.03]} />
                <meshStandardMaterial color="#222230" roughness={0.6} metalness={0.1} />
            </mesh>
            {/* Right wall crown */}
            <mesh position={[roomSize.width / 2 - 0.015, roomSize.height - 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[roomSize.depth, 0.12, 0.03]} />
                <meshStandardMaterial color="#222230" roughness={0.6} metalness={0.1} />
            </mesh>
            {/* Back wall crown */}
            <mesh position={[0, roomSize.height - 0.06, roomSize.depth / 2 - 0.015]}>
                <boxGeometry args={[roomSize.width, 0.12, 0.03]} />
                <meshStandardMaterial color="#222230" roughness={0.6} metalness={0.1} />
            </mesh>
            {/* Left wall crown */}
            <mesh position={[-roomSize.width / 2 + 0.015, roomSize.height - 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[roomSize.depth, 0.12, 0.03]} />
                <meshStandardMaterial color="#222230" roughness={0.6} metalness={0.1} />
            </mesh>

            {/* ═══ Museum Bench (center) ═══ */}
            <group position={[0, 0, 0]}>
                {/* Bench seat */}
                <mesh position={[0, 0.45, 0]}>
                    <boxGeometry args={[2.4, 0.08, 0.7]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
                </mesh>
                {/* Bench legs */}
                <mesh position={[-1.0, 0.22, 0]}>
                    <boxGeometry args={[0.08, 0.44, 0.6]} />
                    <meshStandardMaterial color="#111" roughness={0.9} />
                </mesh>
                <mesh position={[1.0, 0.22, 0]}>
                    <boxGeometry args={[0.08, 0.44, 0.6]} />
                    <meshStandardMaterial color="#111" roughness={0.9} />
                </mesh>
            </group>

            {/* ═══ Crystal Chandelier (multi-tier ring) ═══ */}
            <group position={[0, roomSize.height, 0]}>
                {/* Ceiling rose */}
                <mesh position={[0, -0.04, 0]}>
                    <torusGeometry args={[0.12, 0.03, 12, 24]} />
                    <meshStandardMaterial color="#D4AF37" metalness={0.92} roughness={0.1} />
                </mesh>
                <mesh position={[0, -0.04, 0]}>
                    <cylinderGeometry args={[0.08, 0.12, 0.05, 16]} />
                    <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.12} />
                </mesh>
                {/* Chain links */}
                {[0.15, 0.28, 0.41].map((y, i) => (
                    <mesh key={`chain-${i}`} position={[0, -y, 0]} rotation={[Math.PI / 2, 0, (i % 2) * Math.PI / 2]}>
                        <torusGeometry args={[0.025, 0.006, 6, 12]} />
                        <meshStandardMaterial color="#D4AF37" metalness={0.88} roughness={0.15} />
                    </mesh>
                ))}
                {/* Crown hub */}
                <mesh position={[0, -0.55, 0]}>
                    <cylinderGeometry args={[0.06, 0.1, 0.1, 12]} />
                    <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.12} />
                </mesh>
                {/* Tier 1 ring (upper, smaller) */}
                <mesh position={[0, -0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.35, 0.015, 8, 32]} />
                    <meshStandardMaterial color="#D4AF37" metalness={0.92} roughness={0.08} />
                </mesh>
                {/* Tier 1 crystals */}
                {Array.from({ length: 8 }).map((_, i) => {
                    const a = (i / 8) * Math.PI * 2;
                    return (
                        <mesh key={`t1-${i}`} position={[Math.cos(a) * 0.35, -0.72, Math.sin(a) * 0.35]}>
                            <octahedronGeometry args={[0.02, 0]} />
                            <meshStandardMaterial color="#FFFDE7" emissive="#FFD700" emissiveIntensity={0.5} transparent opacity={0.85} metalness={0.3} roughness={0.05} />
                        </mesh>
                    );
                })}
                {/* Connecting rods */}
                {[0, 2, 4, 6].map((i) => {
                    const a = (i / 8) * Math.PI * 2;
                    return (
                        <mesh key={`rod-${i}`} position={[Math.cos(a) * 0.475, -0.78, Math.sin(a) * 0.475]} rotation={[0, -a, Math.PI / 12]}>
                            <cylinderGeometry args={[0.006, 0.006, 0.28, 4]} />
                            <meshStandardMaterial color="#B8860B" metalness={0.88} roughness={0.15} />
                        </mesh>
                    );
                })}
                {/* Tier 2 ring (lower, larger) */}
                <mesh position={[0, -0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.6, 0.018, 8, 40]} />
                    <meshStandardMaterial color="#D4AF37" metalness={0.92} roughness={0.08} />
                </mesh>
                {/* Tier 2 crystals + lights */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const a = (i / 12) * Math.PI * 2;
                    const cx = Math.cos(a) * 0.6;
                    const cz = Math.sin(a) * 0.6;
                    return (
                        <group key={`t2-${i}`}>
                            <mesh position={[cx, -0.92, cz]}>
                                <octahedronGeometry args={[0.025, 0]} />
                                <meshStandardMaterial color="#FFFDE7" emissive="#FFD54F" emissiveIntensity={0.6} transparent opacity={0.8} metalness={0.2} roughness={0.05} />
                            </mesh>
                            {i % 3 === 0 && (
                                <pointLight position={[cx, -0.95, cz]} intensity={6} color="#FFE4B5" distance={4} />
                            )}
                        </group>
                    );
                })}
                {/* Central finial */}
                <mesh position={[0, -0.95, 0]}>
                    <cylinderGeometry args={[0.015, 0.04, 0.08, 8]} />
                    <meshStandardMaterial color="#D4AF37" metalness={0.92} roughness={0.1} />
                </mesh>
                <mesh position={[0, -1.02, 0]}>
                    <octahedronGeometry args={[0.03, 0]} />
                    <meshStandardMaterial color="#FFF8E1" emissive="#FFD700" emissiveIntensity={0.7} transparent opacity={0.85} metalness={0.3} roughness={0.05} />
                </mesh>
            </group>

            {/* ═══ Marble Pedestals with Decorative Vases ═══ */}
            {/* Pedestal 1 — Front-left */}
            <group position={[-6.5, 0, -6]}>
                <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.5, 0.1, 0.5]} />
                    <meshStandardMaterial color="#d0ccc5" roughness={0.3} metalness={0.05} />
                </mesh>
                <mesh position={[0, 0.55, 0]}>
                    <cylinderGeometry args={[0.14, 0.18, 0.9, 16]} />
                    <meshStandardMaterial color="#e0dcd5" roughness={0.25} metalness={0.05} />
                </mesh>
                <mesh position={[0, 1.05, 0]}>
                    <boxGeometry args={[0.44, 0.06, 0.44]} />
                    <meshStandardMaterial color="#d5d0c8" roughness={0.3} metalness={0.05} />
                </mesh>
                {/* Gold vase */}
                <mesh position={[0, 1.3, 0]}>
                    <cylinderGeometry args={[0.06, 0.1, 0.12, 12]} />
                    <meshStandardMaterial color="#8B6914" metalness={0.85} roughness={0.15} />
                </mesh>
                <mesh position={[0, 1.42, 0]}>
                    <sphereGeometry args={[0.1, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
                    <meshStandardMaterial color="#B8860B" metalness={0.88} roughness={0.12} />
                </mesh>
                <mesh position={[0, 1.46, 0]}>
                    <torusGeometry args={[0.1, 0.012, 8, 16]} />
                    <meshStandardMaterial color="#D4AF37" metalness={0.92} roughness={0.1} />
                </mesh>
            </group>
            {/* Pedestal 2 — Right-back */}
            <group position={[6.5, 0, 6]}>
                <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[0.5, 0.1, 0.5]} />
                    <meshStandardMaterial color="#d0ccc5" roughness={0.3} metalness={0.05} />
                </mesh>
                <mesh position={[0, 0.55, 0]}>
                    <cylinderGeometry args={[0.14, 0.18, 0.9, 16]} />
                    <meshStandardMaterial color="#e0dcd5" roughness={0.25} metalness={0.05} />
                </mesh>
                <mesh position={[0, 1.05, 0]}>
                    <boxGeometry args={[0.44, 0.06, 0.44]} />
                    <meshStandardMaterial color="#d5d0c8" roughness={0.3} metalness={0.05} />
                </mesh>
                {/* Dark urn with gold bands */}
                <mesh position={[0, 1.28, 0]}>
                    <cylinderGeometry args={[0.05, 0.09, 0.1, 12]} />
                    <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.1} />
                </mesh>
                <mesh position={[0, 1.4, 0]}>
                    <sphereGeometry args={[0.09, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                    <meshStandardMaterial color="#1a1a2e" roughness={0.35} metalness={0.1} />
                </mesh>
                <mesh position={[0, 1.34, 0]}>
                    <torusGeometry args={[0.075, 0.008, 8, 16]} />
                    <meshStandardMaterial color="#D4AF37" metalness={0.92} roughness={0.1} />
                </mesh>
                <mesh position={[0, 1.44, 0]}>
                    <torusGeometry args={[0.09, 0.008, 8, 16]} />
                    <meshStandardMaterial color="#D4AF37" metalness={0.92} roughness={0.1} />
                </mesh>
            </group>

            {/* ═══ Lighting ═══ */}
            {(() => {
                const brightness = gallerySettings.lightingBrightness / 100;
                const intensity = gallerySettings.lightingIntensity / 100;
                const colorTemp = gallerySettings.lightingColorTemp / 100;
                const ambientLevel = gallerySettings.ambientIntensity / 100;

                const getLightColor = (temp: number) => {
                    if (temp < 0.5) {
                        const t = temp * 2;
                        return `rgb(${Math.round(200 + t * 55)}, ${Math.round(220 + t * 35)}, 255)`;
                    } else {
                        const t = (temp - 0.5) * 2;
                        return `rgb(255, ${Math.round(255 - t * 30)}, ${Math.round(255 - t * 80)})`;
                    }
                };

                const mainLightColor = getLightColor(colorTemp);
                const spotColor = getLightColor(Math.min(1, colorTemp + 0.05));
                const wallWashColor = getLightColor(Math.min(1, colorTemp + 0.08));
                const mainIntensity = 60 * brightness * intensity * 2;
                const spotIntensity = 50 * brightness * intensity * 2;
                const wallWashIntensity = 25 * brightness * intensity * 2;
                const ambientIntensity = 0.35 * ambientLevel;

                return (
                    <>
                        {/* Main ceiling light (dimmer for drama) */}
                        <pointLight
                            position={[0, 4.5, 0]}
                            intensity={mainIntensity}
                            color={mainLightColor}
                            castShadow
                        />

                        {/* ═══ Museum Spotlights — aimed at artwork walls ═══ */}
                        {/* Wall A (front) — 3 spots */}
                        <spotLight position={[-4.5, 4.8, -4]} target-position={[-4.5, 1.6, -8]} angle={0.4} penumbra={0.7} intensity={spotIntensity} color={spotColor} distance={12} />
                        <spotLight position={[0, 4.8, -4]} target-position={[0, 1.6, -8]} angle={0.4} penumbra={0.7} intensity={spotIntensity} color={spotColor} distance={12} />
                        <spotLight position={[4.5, 4.8, -4]} target-position={[4.5, 1.6, -8]} angle={0.4} penumbra={0.7} intensity={spotIntensity} color={spotColor} distance={12} />

                        {/* Wall B (right) — 3 spots */}
                        <spotLight position={[4, 4.8, -4]} target-position={[8, 1.6, -4]} angle={0.4} penumbra={0.7} intensity={spotIntensity} color={spotColor} distance={12} />
                        <spotLight position={[4, 4.8, 0]} target-position={[8, 1.6, 0]} angle={0.4} penumbra={0.7} intensity={spotIntensity} color={spotColor} distance={12} />
                        <spotLight position={[4, 4.8, 4]} target-position={[8, 1.6, 4]} angle={0.4} penumbra={0.7} intensity={spotIntensity} color={spotColor} distance={12} />

                        {/* Wall C (back) — 2 spots */}
                        <spotLight position={[-3, 4.8, 4]} target-position={[-3, 1.6, 8]} angle={0.4} penumbra={0.7} intensity={spotIntensity} color={spotColor} distance={12} />
                        <spotLight position={[3, 4.8, 4]} target-position={[3, 1.6, 8]} angle={0.4} penumbra={0.7} intensity={spotIntensity} color={spotColor} distance={12} />

                        {/* ═══ Wall-wash lights — softer, wider illumination near walls ═══ */}
                        {/* Front wall wash */}
                        <pointLight position={[-4.5, 2.5, -5.5]} intensity={wallWashIntensity} color={wallWashColor} distance={8} />
                        <pointLight position={[0, 2.5, -5.5]} intensity={wallWashIntensity} color={wallWashColor} distance={8} />
                        <pointLight position={[4.5, 2.5, -5.5]} intensity={wallWashIntensity} color={wallWashColor} distance={8} />
                        {/* Right wall wash */}
                        <pointLight position={[5.5, 2.5, -4]} intensity={wallWashIntensity} color={wallWashColor} distance={8} />
                        <pointLight position={[5.5, 2.5, 0]} intensity={wallWashIntensity} color={wallWashColor} distance={8} />
                        <pointLight position={[5.5, 2.5, 4]} intensity={wallWashIntensity} color={wallWashColor} distance={8} />
                        {/* Back wall wash */}
                        <pointLight position={[-3, 2.5, 5.5]} intensity={wallWashIntensity} color={wallWashColor} distance={8} />
                        <pointLight position={[3, 2.5, 5.5]} intensity={wallWashIntensity} color={wallWashColor} distance={8} />

                        {/* Slightly higher ambient for better overall visibility */}
                        <ambientLight intensity={ambientIntensity} />
                    </>
                );
            })()}
        </group>
    );
}

