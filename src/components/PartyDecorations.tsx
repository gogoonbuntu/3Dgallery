import { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGalleryStore } from '../store/galleryStore';

// ─── Color Palettes ────────────────────────────────────────
const ELEGANT_COLORS = ['#d4af37', '#ffffff', '#1a1a1a', '#b76e79', '#c0c0c0'];
const FUN_COLORS = ['#ff4757', '#ff6348', '#ffa502', '#2ed573', '#1e90ff', '#a855f7', '#ff69b4'];

// ─── Balloon ───────────────────────────────────────────────
const Balloon = memo(function Balloon({ position, color, metallic }: {
    position: [number, number, number];
    color: string;
    metallic?: boolean;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const offset = useMemo(() => Math.random() * Math.PI * 2, []);
    const speed = useMemo(() => 0.3 + Math.random() * 0.4, []);

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.elapsedTime;
            groupRef.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.15;
            groupRef.current.rotation.z = Math.sin(t * 0.5 + offset) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Balloon body */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    metalness={metallic ? 0.8 : 0.1}
                    roughness={metallic ? 0.2 : 0.4}
                />
            </mesh>
            {/* Balloon knot */}
            <mesh position={[0, -0.28, 0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* String */}
            <mesh position={[0, -0.8, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 1, 4]} />
                <meshStandardMaterial color="#999" />
            </mesh>
        </group>
    );
});

// ─── Confetti Particle System ──────────────────────────────
function ConfettiSystem({ colors, count }: { colors: string[]; count: number }) {
    const groupRef = useRef<THREE.Group>(null);

    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 14,
            y: Math.random() * 5,
            z: (Math.random() - 0.5) * 14,
            speed: 0.2 + Math.random() * 0.5,
            rotSpeed: Math.random() * 3,
            phase: Math.random() * Math.PI * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            scale: 0.03 + Math.random() * 0.02,
        }));
    }, [count, colors]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        const children = groupRef.current.children;

        particles.forEach((p, i) => {
            if (!children[i]) return;
            const y = ((p.y - t * p.speed * 0.3) % 5 + 5) % 5;
            children[i].position.set(
                p.x + Math.sin(t * 0.5 + p.phase) * 0.3,
                y,
                p.z + Math.cos(t * 0.5 + p.phase) * 0.3
            );
            children[i].rotation.set(t * p.rotSpeed, t * p.rotSpeed * 0.7, 0);
        });
    });

    return (
        <group ref={groupRef}>
            {particles.map((p, i) => (
                <mesh key={i} scale={p.scale}>
                    <planeGeometry args={[1, 1]} />
                    <meshStandardMaterial color={p.color} side={THREE.DoubleSide} transparent opacity={0.9} />
                </mesh>
            ))}
        </group>
    );
}

// ─── Birthday Cake ─────────────────────────────────────────
const BirthdayCake = memo(function BirthdayCake({ position, elegant }: {
    position: [number, number, number];
    elegant?: boolean;
}) {
    const candleRef = useRef<THREE.PointLight>(null);

    useFrame((state) => {
        if (candleRef.current) {
            candleRef.current.intensity = 8 + Math.sin(state.clock.elapsedTime * 8) * 3;
        }
    });

    const baseColor = elegant ? '#f5e6d3' : '#ff69b4';
    const frostingColor = elegant ? '#d4af37' : '#ffffff';
    const creamColor = elegant ? '#b76e79' : '#ff4757';

    return (
        <group position={position}>
            {/* Bottom tier */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.3, 24]} />
                <meshStandardMaterial color={baseColor} roughness={0.6} />
            </mesh>
            {/* Bottom frosting ring */}
            <mesh position={[0, 0.3, 0]}>
                <torusGeometry args={[0.38, 0.03, 8, 24]} />
                <meshStandardMaterial color={frostingColor} metalness={elegant ? 0.6 : 0} />
            </mesh>
            {/* Top tier */}
            <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.28, 0.28, 0.3, 24]} />
                <meshStandardMaterial color={baseColor} roughness={0.6} />
            </mesh>
            {/* Top frosting */}
            <mesh position={[0, 0.6, 0]}>
                <torusGeometry args={[0.26, 0.03, 8, 24]} />
                <meshStandardMaterial color={creamColor} />
            </mesh>
            {/* Cream top */}
            <mesh position={[0, 0.62, 0]}>
                <cylinderGeometry args={[0.26, 0.26, 0.02, 24]} />
                <meshStandardMaterial color={frostingColor} metalness={elegant ? 0.5 : 0} />
            </mesh>
            {/* Candles */}
            {[0, 0.12, -0.12].map((xOff, i) => (
                <group key={i}>
                    <mesh position={[xOff, 0.72, 0]}>
                        <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
                        <meshStandardMaterial color={elegant ? '#d4af37' : FUN_COLORS[i]} />
                    </mesh>
                    {/* Flame */}
                    <mesh position={[xOff, 0.82, 0]}>
                        <sphereGeometry args={[0.02, 8, 8]} />
                        <meshStandardMaterial
                            color="#ffaa00"
                            emissive="#ffaa00"
                            emissiveIntensity={2}
                        />
                    </mesh>
                </group>
            ))}
            {/* Candle light */}
            <pointLight ref={candleRef} position={[0, 0.9, 0]} color="#ffcc44" intensity={8} distance={3} />
        </group>
    );
});

// ─── Gift Box ──────────────────────────────────────────────
const GiftBox = memo(function GiftBox({ position, color, ribbonColor, size }: {
    position: [number, number, number];
    color: string;
    ribbonColor: string;
    size?: number;
}) {
    const s = size || 0.35;
    return (
        <group position={position}>
            {/* Box */}
            <mesh position={[0, s / 2, 0]}>
                <boxGeometry args={[s, s, s]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            {/* Ribbon horizontal */}
            <mesh position={[0, s / 2, 0]}>
                <boxGeometry args={[s + 0.01, 0.04, s + 0.01]} />
                <meshStandardMaterial color={ribbonColor} metalness={0.3} />
            </mesh>
            {/* Ribbon vertical */}
            <mesh position={[0, s / 2, 0]}>
                <boxGeometry args={[0.04, s + 0.01, s + 0.01]} />
                <meshStandardMaterial color={ribbonColor} metalness={0.3} />
            </mesh>
            {/* Bow loop 1 */}
            <mesh position={[0.06, s + 0.04, 0]} rotation={[0, 0, 0.3]}>
                <torusGeometry args={[0.04, 0.015, 8, 12]} />
                <meshStandardMaterial color={ribbonColor} metalness={0.3} />
            </mesh>
            {/* Bow loop 2 */}
            <mesh position={[-0.06, s + 0.04, 0]} rotation={[0, 0, -0.3]}>
                <torusGeometry args={[0.04, 0.015, 8, 12]} />
                <meshStandardMaterial color={ribbonColor} metalness={0.3} />
            </mesh>
        </group>
    );
});

// ─── Birthday Banner (Canvas Texture) ──────────────────────
const BirthdayBanner = memo(function BirthdayBanner({ elegant }: { elegant?: boolean }) {
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;

        // Background
        ctx.fillStyle = elegant ? 'rgba(0,0,0,0.6)' : 'rgba(255,69,87,0.85)';
        ctx.beginPath();
        ctx.roundRect(0, 0, 1024, 256, 20);
        ctx.fill();

        // Border
        ctx.strokeStyle = elegant ? '#d4af37' : '#ffa502';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(8, 8, 1008, 240, 16);
        ctx.stroke();

        // Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (elegant) {
            ctx.font = 'bold 64px serif';
            ctx.fillStyle = '#d4af37';
            ctx.fillText('✨ Happy Birthday ✨', 512, 128);
        } else {
            ctx.font = 'bold 72px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('🎉 HAPPY BIRTHDAY 🎉', 512, 128);
        }

        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }, [elegant]);

    return (
        <mesh position={[0, 4.2, -7.85]}>
            <planeGeometry args={[5, 1.25]} />
            <meshStandardMaterial
                map={texture}
                transparent
                emissive="#ffffff"
                emissiveIntensity={elegant ? 0.1 : 0.2}
            />
        </mesh>
    );
});

// ─── Party Lights (for fun theme) ──────────────────────────
function PartyLights() {
    const lightRefs = useRef<THREE.PointLight[]>([]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        lightRefs.current.forEach((light, i) => {
            if (light) {
                const hue = ((t * 0.1 + i * 0.15) % 1);
                light.color.setHSL(hue, 1, 0.5);
                light.intensity = 15 + Math.sin(t * 2 + i) * 8;
            }
        });
    });

    const positions: [number, number, number][] = [
        [-5, 4.5, -5], [5, 4.5, -5], [-5, 4.5, 5], [5, 4.5, 5],
    ];

    return (
        <>
            {positions.map((pos, i) => (
                <pointLight
                    key={i}
                    ref={(el) => { if (el) lightRefs.current[i] = el; }}
                    position={pos}
                    intensity={15}
                    distance={12}
                    color="#ff0000"
                />
            ))}
        </>
    );
}

// ─── Main PartyDecorations Component ───────────────────────
export const PartyDecorations = memo(function PartyDecorations() {
    const partyTheme = useGalleryStore((s) => s.gallerySettings.partyTheme);
    if (partyTheme === 'none') return null;

    const isElegant = partyTheme === 'elegant';
    const colors = isElegant ? ELEGANT_COLORS : FUN_COLORS;

    // Generate balloon positions
    const balloons = useMemo(() => {
        const count = isElegant ? 12 : 20;
        return Array.from({ length: count }, (_, i) => ({
            x: (Math.random() - 0.5) * 12,
            y: 3.5 + Math.random() * 1.2,
            z: (Math.random() - 0.5) * 12,
            color: colors[i % colors.length],
        }));
    }, [isElegant, colors]);

    return (
        <group>
            {/* Banner on wall A */}
            <BirthdayBanner elegant={isElegant} />

            {/* Balloons */}
            {balloons.map((b, i) => (
                <Balloon
                    key={`balloon-${i}`}
                    position={[b.x, b.y, b.z]}
                    color={b.color}
                    metallic={isElegant}
                />
            ))}

            {/* Confetti */}
            <ConfettiSystem colors={colors} count={isElegant ? 60 : 120} />

            {/* Cake - center front */}
            <BirthdayCake position={[0, 0, -6]} elegant={isElegant} />

            {/* Gift boxes - corners */}
            <GiftBox
                position={[-6, 0, -6]}
                color={isElegant ? '#1a1a1a' : '#ff4757'}
                ribbonColor={isElegant ? '#d4af37' : '#ffa502'}
                size={0.4}
            />
            <GiftBox
                position={[6, 0, -6]}
                color={isElegant ? '#b76e79' : '#2ed573'}
                ribbonColor={isElegant ? '#ffffff' : '#ff69b4'}
                size={0.3}
            />
            <GiftBox
                position={[-5.5, 0, 6]}
                color={isElegant ? '#d4af37' : '#1e90ff'}
                ribbonColor={isElegant ? '#1a1a1a' : '#ffffff'}
                size={0.35}
            />

            {/* Fun theme: party lights */}
            {!isElegant && <PartyLights />}

            {/* Elegant theme: warm spotlights on cake */}
            {isElegant && (
                <>
                    <spotLight
                        position={[0, 4, -5]}
                        angle={0.5}
                        penumbra={0.8}
                        intensity={30}
                        color="#ffcc88"
                        target-position={[0, 0, -6]}
                    />
                </>
            )}
        </group>
    );
});
