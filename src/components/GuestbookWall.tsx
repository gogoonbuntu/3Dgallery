import * as THREE from 'three';
import { useGalleryStore } from '../store/galleryStore';

function MessageCard({ message, position }: { message: { id: string; nickname: string; content: string }; position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Card background */}
            <mesh>
                <planeGeometry args={[2.5, 0.8]} />
                <meshStandardMaterial color="#fffef5" side={THREE.DoubleSide} />
            </mesh>
            {/* Border */}
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[2.6, 0.9]} />
                <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

export function GuestbookWall() {
    const { guestMessages } = useGalleryStore();

    return (
        <group position={[-7.8, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
            {/* Title card */}
            <mesh position={[0, 1.2, 0]}>
                <planeGeometry args={[3, 0.6]} />
                <meshStandardMaterial color="#2d5a3d" />
            </mesh>

            {/* Display message cards */}
            {guestMessages.slice(-6).map((message, index) => (
                <MessageCard
                    key={message.id}
                    message={message}
                    position={[(index % 2) * 3 - 1.5, -index * 0.5, 0]}
                />
            ))}
        </group>
    );
}
