import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { usePositionUpdater } from './usePositionUpdater';

// 위치 업데이트 간격 (ms)
const UPDATE_INTERVAL = 100;

export function usePlayerPositionSync() {
    const { camera } = useThree();
    const { updateMyPosition } = usePositionUpdater();
    const lastUpdateTime = useRef(0);

    useFrame(() => {
        const now = Date.now();

        // Throttle 업데이트
        if (now - lastUpdateTime.current < UPDATE_INTERVAL) {
            return;
        }

        lastUpdateTime.current = now;

        // 카메라 위치와 Y축 회전 추출
        const position = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
        };

        // Y축 회전만 추출 (Euler YXZ 순서)
        const rotationY = Math.atan2(
            -camera.matrixWorld.elements[8],
            camera.matrixWorld.elements[10]
        );

        updateMyPosition(position, rotationY);
    });
}
