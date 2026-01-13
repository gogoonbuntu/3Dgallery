import { Html } from '@react-three/drei';
import { useMultiplayerStore, type Player } from '../store/multiplayerStore';
import './ui/OtherPlayers.css';

// 개별 플레이어 아바타
function PlayerAvatar({ player }: { player: Player }) {
    return (
        <group
            position={[player.position.x, player.position.y - 0.5, player.position.z]}
            rotation={[0, player.rotation, 0]}
        >
            {/* 몸체 - 캡슐 */}
            <mesh position={[0, 0.6, 0]}>
                <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
                <meshStandardMaterial color={player.color} />
            </mesh>

            {/* 머리 */}
            <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial color={player.color} />
            </mesh>

            {/* 눈 (방향 표시) */}
            <mesh position={[0.06, 1.22, 0.14]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.06, 1.22, 0.14]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.06, 1.22, 0.16]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color="#333333" />
            </mesh>
            <mesh position={[-0.06, 1.22, 0.16]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color="#333333" />
            </mesh>

            {/* 닉네임 라벨 */}
            <Html
                center
                position={[0, 1.6, 0]}
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
