import { useEffect, useRef } from 'react';
import { useMultiplayerStore, type Player } from '../store/multiplayerStore';
import {
    updatePlayerPosition,
    removePlayer,
    subscribeToPlayers,
} from '../lib/firebase';

// 플레이어 ID 생성
function generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 비활성 플레이어 제거 시간 (ms) - 2분으로 연장
const INACTIVE_TIMEOUT = 120000;

// Heartbeat 간격 (ms) - 30초마다 위치 갱신
const HEARTBEAT_INTERVAL = 30000;

// 멀티플레이어 연결 관리 훅 - App 레벨에서 한 번만 호출
export function useMultiplayerSync() {
    const {
        myNickname,
        myColor,
        setMyPlayerId,
        setPlayers,
        setConnected,
    } = useMultiplayerStore();

    const initialized = useRef(false);
    const playerIdRef = useRef<string | null>(null);
    const lastPositionRef = useRef({ x: 0, y: 1.6, z: 5 });
    const lastRotationRef = useRef(0);

    useEffect(() => {
        // 이미 초기화됐으면 스킵
        if (initialized.current) return;
        initialized.current = true;

        const playerId = generatePlayerId();
        playerIdRef.current = playerId;
        setMyPlayerId(playerId);
        setConnected(true);

        console.log('Multiplayer connected:', playerId);

        // 초기 위치를 즉시 Firestore에 등록 (기본 카메라 위치)
        const initialPosition = { x: 0, y: 1.6, z: 5 };
        updatePlayerPosition({
            id: playerId,
            nickname: myNickname,
            position: initialPosition,
            rotation: 0,
            color: myColor,
            lastUpdate: Date.now(),
        }).catch(console.error);

        // Firestore에 다른 플레이어들 구독
        const unsubscribe = subscribeToPlayers((players) => {
            const now = Date.now();

            // 비활성 플레이어 필터링 & 타입 변환
            const activePlayers = (players as Player[]).filter(
                (p) => now - p.lastUpdate < INACTIVE_TIMEOUT
            );

            setPlayers(activePlayers);
        });

        // Heartbeat: 주기적으로 lastUpdate 갱신 (움직이지 않아도 활성 상태 유지)
        const heartbeatInterval = setInterval(() => {
            if (playerIdRef.current) {
                updatePlayerPosition({
                    id: playerIdRef.current,
                    nickname: useMultiplayerStore.getState().myNickname,
                    position: lastPositionRef.current,
                    rotation: lastRotationRef.current,
                    color: useMultiplayerStore.getState().myColor,
                    lastUpdate: Date.now(),
                }).catch(console.error);
            }
        }, HEARTBEAT_INTERVAL);

        // 퇴장 시 정리
        const handleBeforeUnload = () => {
            removePlayer(playerId).catch(console.error);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(heartbeatInterval);
            unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            removePlayer(playerId).catch(console.error);
            setConnected(false);
        };
    }, [myNickname, myColor, setMyPlayerId, setPlayers, setConnected]);

    // 위치 업데이트 시 ref도 갱신하도록 함수 반환
    const updatePositionRef = (position: { x: number; y: number; z: number }, rotation: number) => {
        lastPositionRef.current = position;
        lastRotationRef.current = rotation;
    };

    return { updatePositionRef };
}
