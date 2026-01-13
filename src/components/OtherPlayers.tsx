import { Html } from '@react-three/drei';
import { useMultiplayerStore, type Player } from '../store/multiplayerStore';
import './ui/OtherPlayers.css';

// 피부색 (밝은 톤)
const SKIN_COLOR = '#FFE4C4';

// 귀여운 미니 캐릭터 아바타
function PlayerAvatar({ player }: { player: Player }) {
    // 밝은 버전의 플레이어 색상 (옷 색상)
    const clothColor = player.color;

    return (
        <group
            position={[player.position.x, player.position.y - 1.1, player.position.z]}
            rotation={[0, player.rotation, 0]}
            scale={0.8}
        >
            {/* === 머리 (큰 비율로 귀여움 강조) === */}
            <mesh position={[0, 0.95, 0]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color={SKIN_COLOR} />
            </mesh>

            {/* 볼터치 (핑크) */}
            <mesh position={[0.15, 0.9, 0.12]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-0.15, 0.9, 0.12]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
            </mesh>

            {/* 눈 (큰 반짝이는 눈) */}
            <mesh position={[0.07, 0.97, 0.17]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color="#333333" />
            </mesh>
            <mesh position={[-0.07, 0.97, 0.17]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color="#333333" />
            </mesh>

            {/* 눈 하이라이트 */}
            <mesh position={[0.08, 0.99, 0.21]}>
                <sphereGeometry args={[0.015, 6, 6]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.06, 0.99, 0.21]}>
                <sphereGeometry args={[0.015, 6, 6]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* 작은 미소 */}
            <mesh position={[0, 0.88, 0.19]} rotation={[0.3, 0, 0]}>
                <torusGeometry args={[0.04, 0.01, 8, 16, Math.PI]} />
                <meshBasicMaterial color="#E08080" />
            </mesh>

            {/* 머리카락 (상단) */}
            <mesh position={[0, 1.12, 0]}>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial color="#4A3728" />
            </mesh>
            <mesh position={[0.08, 1.1, 0.1]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#4A3728" />
            </mesh>
            <mesh position={[-0.08, 1.1, 0.1]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#4A3728" />
            </mesh>

            {/* === 몸통 (티셔츠) === */}
            <mesh position={[0, 0.55, 0]}>
                <capsuleGeometry args={[0.12, 0.2, 4, 8]} />
                <meshStandardMaterial color={clothColor} />
            </mesh>

            {/* 티셔츠 칼라/목 */}
            <mesh position={[0, 0.72, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 0.05, 8]} />
                <meshStandardMaterial color={clothColor} />
            </mesh>

            {/* === 팔 === */}
            {/* 왼팔 */}
            <mesh position={[-0.18, 0.55, 0]} rotation={[0, 0, 0.3]}>
                <capsuleGeometry args={[0.04, 0.15, 4, 8]} />
                <meshStandardMaterial color={clothColor} />
            </mesh>
            <mesh position={[-0.24, 0.42, 0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color={SKIN_COLOR} />
            </mesh>

            {/* 오른팔 */}
            <mesh position={[0.18, 0.55, 0]} rotation={[0, 0, -0.3]}>
                <capsuleGeometry args={[0.04, 0.15, 4, 8]} />
                <meshStandardMaterial color={clothColor} />
            </mesh>
            <mesh position={[0.24, 0.42, 0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color={SKIN_COLOR} />
            </mesh>

            {/* === 다리 (바지) === */}
            {/* 왼다리 */}
            <mesh position={[-0.07, 0.25, 0]}>
                <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
                <meshStandardMaterial color="#4A5568" />
            </mesh>
            <mesh position={[-0.07, 0.08, 0]}>
                <boxGeometry args={[0.08, 0.06, 0.1]} />
                <meshStandardMaterial color="#2D3748" />
            </mesh>

            {/* 오른다리 */}
            <mesh position={[0.07, 0.25, 0]}>
                <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
                <meshStandardMaterial color="#4A5568" />
            </mesh>
            <mesh position={[0.07, 0.08, 0]}>
                <boxGeometry args={[0.08, 0.06, 0.1]} />
                <meshStandardMaterial color="#2D3748" />
            </mesh>

            {/* 닉네임 라벨 */}
            <Html
                center
                position={[0, 1.4, 0]}
                style={{ pointerEvents: 'none' }}
                distanceFactor={8}
            >
                <div className="player-name-label">
                    {player.nickname}
                </div>
            </Html>
        </group>
    );
}

// 모든 다른 플레이어 렌더링
export function OtherPlayers() {
    const { players, myPlayerId } = useMultiplayerStore();

    const otherPlayers = Object.values(players).filter(
        (p) => p.id !== myPlayerId
    );

    return (
        <>
            {otherPlayers.map((player) => (
                <PlayerAvatar key={player.id} player={player} />
            ))}
        </>
    );
}
