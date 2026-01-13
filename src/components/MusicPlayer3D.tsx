import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGalleryStore } from '../store/galleryStore';

// Sample music tracks (royalty-free music URLs)
const MUSIC_TRACKS = [
    { id: 1, name: '평화로운 갤러리', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
    { id: 2, name: '클래식 피아노', url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b0939c6.mp3' },
    { id: 3, name: '잔잔한 기타', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_942f6a2a44.mp3' },
    { id: 4, name: '앰비언트 사운드', url: 'https://cdn.pixabay.com/download/audio/2024/11/04/audio_4956b92a8f.mp3' },
];

// Improved 3D Speaker Component - Modern Modern Hi-Fi Tower Speaker
function Speaker3D({ isPlaying }: { isPlaying: boolean }) {
    const wooferRef = useRef<THREE.Mesh>(null);
    const tweeterRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (isPlaying) {
            const pulse = Math.sin(state.clock.elapsedTime * 15) * 0.03;
            if (wooferRef.current) wooferRef.current.scale.setScalar(1 + pulse);
            if (tweeterRef.current) tweeterRef.current.scale.setScalar(1 + pulse * 0.5);
        }
    });

    return (
        <group>
            {/* Speaker Cabinet - Modern Dark Grey / Slate */}
            <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.4, 1.2, 0.3]} />
                <meshStandardMaterial color="#2a2a2e" metalness={0.2} roughness={0.4} />
            </mesh>

            {/* Front Panel - Matte Black with slim profile */}
            <mesh position={[0, 0.6, 0.151]}>
                <boxGeometry args={[0.38, 1.18, 0.01]} />
                <meshStandardMaterial color="#121212" roughness={0.8} />
            </mesh>

            {/* Drivers setup - Minimalist Modern Look */}
            {/* Top Tweeter - Recessed */}
            <group position={[0, 0.95, 0.16]}>
                <mesh>
                    <cylinderGeometry args={[0.04, 0.045, 0.01, 32]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh ref={tweeterRef} position={[0, 0.005, 0]}>
                    <sphereGeometry args={[0.025, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
                </mesh>
            </group>

            {/* Mid Drivers (Two identical ones for symmetrical look) */}
            {[0.7, 0.45].map((y, i) => (
                <group key={i} position={[0, y, 0.16]}>
                    <mesh>
                        <cylinderGeometry args={[0.09, 0.095, 0.01, 32]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.08, 0.08, 0.005, 32]} />
                        <meshStandardMaterial color="#333" roughness={0.5} />
                    </mesh>
                </group>
            ))}

            {/* Large Woofer at the bottom */}
            <group position={[0, 0.18, 0.16]}>
                <mesh ref={wooferRef}>
                    <cylinderGeometry args={[0.13, 0.13, 0.01, 32]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.005, 32]} />
                    <meshStandardMaterial color="#222" metalness={0.1} roughness={0.8} />
                </mesh>
            </group>

            {/* Modern Accent Line - Vertical LED-like line */}
            <mesh position={[0, 0.6, 0.161]}>
                <boxGeometry args={[0.005, 1.0, 0.005]} />
                <meshStandardMaterial
                    color={isPlaying ? "#00e5ff" : "#333"}
                    emissive={isPlaying ? "#00e5ff" : "#000"}
                    emissiveIntensity={isPlaying ? 1 : 0}
                />
            </mesh>

            {/* Base/Plinth - Floating look */}
            <mesh position={[0, 0.01, 0]}>
                <boxGeometry args={[0.45, 0.02, 0.4]} />
                <meshStandardMaterial color="#111" metalness={0.5} />
            </mesh>
        </group>
    );
}

// Improved 3D LP Table Component - Taller Console Style (Kept as is but can refine colors)
function LPTable3D({ isPlaying }: { isPlaying: boolean }) {
    const vinylRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (vinylRef.current && isPlaying) {
            vinylRef.current.rotation.y += 0.015;
        }
    });

    return (
        <group>
            {/* Console Cabinet - Walnut Wood (User likes the design) */}
            <mesh position={[0, 0.45, 0]}>
                <boxGeometry args={[0.9, 0.9, 0.5]} />
                <meshStandardMaterial color="#5d4037" roughness={0.7} />
            </mesh>

            {/* Cabinet Top */}
            <mesh position={[0, 0.91, 0]}>
                <boxGeometry args={[0.92, 0.02, 0.52]} />
                <meshStandardMaterial color="#3e2723" roughness={0.6} />
            </mesh>

            {/* Turntable Platform */}
            <mesh position={[0, 0.94, 0.05]}>
                <boxGeometry args={[0.75, 0.03, 0.45]} />
                <meshStandardMaterial color="#9e9e9e" metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Platter Base */}
            <mesh position={[0, 0.97, 0.05]}>
                <cylinderGeometry args={[0.2, 0.2, 0.02, 48]} />
                <meshStandardMaterial color="#212121" metalness={0.4} />
            </mesh>

            {/* Rubber Mat */}
            <mesh position={[0, 0.985, 0.05]}>
                <cylinderGeometry args={[0.18, 0.18, 0.005, 48]} />
                <meshStandardMaterial color="#424242" roughness={0.9} />
            </mesh>

            {/* Vinyl Record */}
            <group ref={vinylRef} position={[0, 1.0, 0.05]}>
                <mesh>
                    <cylinderGeometry args={[0.15, 0.15, 0.003, 48]} />
                    <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.1} />
                </mesh>
                <mesh position={[0, 0.002, 0]}>
                    <cylinderGeometry args={[0.14, 0.14, 0.001, 48]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.003, 0]}>
                    <cylinderGeometry args={[0.045, 0.045, 0.002, 24]} />
                    <meshStandardMaterial color="#c62828" roughness={0.5} />
                </mesh>
                <mesh position={[0, 0.005, 0]}>
                    <cylinderGeometry args={[0.005, 0.005, 0.01, 12]} />
                    <meshStandardMaterial color="#616161" metalness={0.8} />
                </mesh>
            </group>

            {/* Tonearm Pivot */}
            <mesh position={[0.28, 0.98, 0.18]}>
                <cylinderGeometry args={[0.025, 0.025, 0.05, 16]} />
                <meshStandardMaterial color="#757575" metalness={0.7} />
            </mesh>

            {/* Tonearm */}
            <group position={[0.28, 1.01, 0.18]} rotation={[0, isPlaying ? -0.6 : 0.4, 0]}>
                <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.006, 0.006, 0.24, 12]} />
                    <meshStandardMaterial color="#9e9e9e" metalness={0.7} />
                </mesh>
                <mesh position={[-0.24, 0, 0]}>
                    <boxGeometry args={[0.04, 0.015, 0.025]} />
                    <meshStandardMaterial color="#616161" metalness={0.5} />
                </mesh>
                <mesh position={[-0.26, -0.01, 0]}>
                    <boxGeometry args={[0.02, 0.012, 0.012]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>

            {/* Control Knobs */}
            {[-0.25, 0.25].map((x, i) => (
                <group key={i} position={[x, 0.92, -0.2]}>
                    <mesh>
                        <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
                        <meshStandardMaterial color="#424242" metalness={0.4} />
                    </mesh>
                    <mesh position={[0, 0.01, 0]}>
                        <cylinderGeometry args={[0.015, 0.02, 0.01, 16]} />
                        <meshStandardMaterial color="#c0c0c0" metalness={0.7} />
                    </mesh>
                </group>
            ))}

            {/* Cabinet Legs */}
            {[[-0.38, -0.22], [0.38, -0.22], [-0.38, 0.18], [0.38, 0.18]].map((pos, i) => (
                <mesh key={i} position={[pos[0], -0.08, pos[1]]}>
                    <cylinderGeometry args={[0.025, 0.035, 0.16, 12]} />
                    <meshStandardMaterial color="#3e2723" roughness={0.8} />
                </mesh>
            ))}
        </group>
    );
}

// Main Music Player 3D Component
export function MusicPlayer3D() {
    const { musicSettings, toggleMusic, setTrack } = useGalleryStore();

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioReady, setAudioReady] = useState(false);
    const { isPlaying, volume, currentTrackIndex, playerDesign } = musicSettings;

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.loop = false;
        audioRef.current.volume = volume;

        audioRef.current.addEventListener('ended', () => {
            const nextIndex = (currentTrackIndex + 1) % MUSIC_TRACKS.length;
            setTrack(nextIndex);
        });

        setAudioReady(true);

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (audioRef.current && audioReady) {
            audioRef.current.src = MUSIC_TRACKS[currentTrackIndex].url;
            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            }
        }
    }, [currentTrackIndex, audioReady]);

    useEffect(() => {
        if (audioRef.current && audioReady) {
            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, audioReady]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handleClick = () => {
        toggleMusic();
    };

    // Position in back-left corner (Front-Left in room coordinates)
    // Move almost to the limit (walls are at -8 and 8)
    const position: [number, number, number] = [-7.85, 0, 7.85];
    // Rotate 90 degrees (PI/2) to align the back strictly against the left wall
    // This makes it "stick" to the wall as requested.
    const rotation: [number, number, number] = [0, Math.PI / 2, 0];

    return (
        <group position={position} rotation={rotation} onClick={handleClick}>
            {playerDesign === 'speaker' ? (
                <Speaker3D isPlaying={isPlaying} />
            ) : (
                <LPTable3D isPlaying={isPlaying} />
            )}

            {/* Invisible Clickable Area */}
            <mesh position={[0, 0.6, 0]} visible={false}>
                <boxGeometry args={[1.0, 1.4, 0.8]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Spotlight */}
            <spotLight
                position={[0.5, 2.5, 1]}
                angle={0.5}
                penumbra={0.6}
                intensity={isPlaying ? 80 : 40}
                color="#fff5e0"
            />

            {/* Ambient fill light */}
            <pointLight
                position={[0, 1, 0.5]}
                intensity={isPlaying ? 15 : 8}
                color="#ffe4c4"
                distance={3}
            />
        </group>
    );
}
