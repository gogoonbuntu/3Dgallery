import { useRef, useCallback, useEffect } from 'react';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { updatePlayerPosition } from '../lib/firebase';

// 위치 업데이트 throttle 시간 (ms)
const POSITION_UPDATE_INTERVAL = 100;

// 플레이어 위치 업데이트 함수를 반환하는 훅
export function usePositionUpdater() {
    const {
        myPlayerId,
        myNickname,
        myColor,
    } = useMultiplayerStore();

    const lastUpdateTime = useRef<number>(0);
    const lastPosition = useRef<{ x: number; y: number; z: number } | null>(null);
    const lastRotation = useRef<number>(0);
    const initialUpdateDone = useRef(false);

    // 첫 위치 업데이트를 즉시 수행
    useEffect(() => {
        if (myPlayerId && !initialUpdateDone.current) {
            initialUpdateDone.current = true;
            // 초기 위치 (카메라 기본 위치)
            const initialPos = { x: 0, y: 1.6, z: 5 };
            updatePlayerPosition({
                id: myPlayerId,
                nickname: myNickname,
                position: initialPos,
                rotation: 0,
                color: myColor,
                lastUpdate: Date.now(),
            }).catch(console.error);
        }
    }, [myPlayerId, myNickname, myColor]);

    const updateMyPosition = useCallback(
        (position: { x: number; y: number; z: number }, rotation: number) => {
            if (!myPlayerId) return;

            const now = Date.now();

            // Throttle 체크
            if (now - lastUpdateTime.current < POSITION_UPDATE_INTERVAL) {
                return;
            }

            // 위치 변경 체크 (움직임이 없으면 업데이트 안함)
            const posChanged =
                !lastPosition.current ||
                Math.abs(lastPosition.current.x - position.x) > 0.01 ||
                Math.abs(lastPosition.current.y - position.y) > 0.01 ||
                Math.abs(lastPosition.current.z - position.z) > 0.01;

            const rotChanged = Math.abs(lastRotation.current - rotation) > 0.01;

            if (!posChanged && !rotChanged) {
                return;
            }

            lastUpdateTime.current = now;
            lastPosition.current = position;
            lastRotation.current = rotation;

            // Firestore에 위치 업데이트
            updatePlayerPosition({
                id: myPlayerId,
                nickname: myNickname,
                position,
                rotation,
                color: myColor,
                lastUpdate: now,
            }).catch(console.error);
        },
        [myPlayerId, myNickname, myColor]
    );

    return { updateMyPosition };
}
