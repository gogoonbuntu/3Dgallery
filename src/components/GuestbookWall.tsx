import * as THREE from 'three';
import { Text } from '@react-three/drei';
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

            {/* Content preview */}
            <Text
                position={[0, 0.1, 0.01]}
                fontSize={0.12}
                color="#333333"
                maxWidth={2.2}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
            >
                {message.content.length > 60 ? `${message.content.substring(0, 57)}...` : message.content}
            </Text>

            {/* Nickname */}
            <Text
                position={[0, -0.25, 0.01]}
                fontSize={0.08}
                color="#666666"
                anchorX="center"
                anchorY="middle"
            >
                - {message.nickname || '익명'}
            </Text>
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
            <Text
                position={[0, 1.2, 0.01]}
                fontSize={0.25}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
            >
                GUESTBOOK
            </Text>

            {/* Display message cards */}
            {guestMessages.slice(-6).map((message, index) => (
                <MessageCard
                    key={message.id}
                    message={message}
                    position={[(index % 2) * 3 - 1.5, -Math.floor(index / 2) * 1.1 + 0.3, 0]}
                />
            ))}
        </group>
    );
}

