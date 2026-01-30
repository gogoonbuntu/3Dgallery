import { useEffect, useRef } from 'react';
import { useMultiplayerStore, type Player } from '../store/multiplayerStore';
import {
    updatePlayerPosition,
    removePlayer,
    subscribeToPlayers,
} from '../lib/firebase';

// Debug helper
const debugLog = (phase: string, message: string, data?: unknown) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    console.log(`[${timestamp}] [Multiplayer-${phase}] ${message}`, data ?? '');
};

// 플레이어 ID 생성
function generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 비활성 플레이어 제거 시간 (ms) - 2분으로 연장
const INACTIVE_TIMEOUT = 120000;

// Heartbeat 간격 (ms) - 30초마다 위치 갱신
const HEARTBEAT_INTERVAL = 30000;

// 멀티플레이어 연결 관리 훅 - App 레벨에서 한 번만 호출
// enabled: When false, the hook will not initialize multiplayer connection
export function useMultiplayerSync(enabled: boolean = true) {
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
    const initStartTime = useRef(Date.now());

    useEffect(() => {
        // Skip if not enabled yet
        if (!enabled) {
            debugLog('SKIP', 'Multiplayer sync not enabled yet, waiting...');
            return;
        }

        // 이미 초기화됐으면 스킵
        if (initialized.current) {
            debugLog('SKIP', 'Already initialized, skipping');
            return;
        }
        initialized.current = true;
        initStartTime.current = Date.now();

        debugLog('INIT', 'Starting multiplayer initialization', { elapsed: 0 });

        const playerId = generatePlayerId();
        playerIdRef.current = playerId;
        setMyPlayerId(playerId);
        setConnected(true);

        debugLog('CONNECT', `Player ID generated: ${playerId}`, {
            elapsed: Date.now() - initStartTime.current
        });

        // 초기 위치를 즉시 Firestore에 등록 (기본 카메라 위치)
        const initialPosition = { x: 0, y: 1.6, z: 5 };
        debugLog('POSITION', 'Registering initial position to Firestore', {
            position: initialPosition,
            elapsed: Date.now() - initStartTime.current
        });
        updatePlayerPosition({
            id: playerId,
            nickname: myNickname,
            position: initialPosition,
            rotation: 0,
            color: myColor,
            lastUpdate: Date.now(),
        }).then(() => {
            debugLog('POSITION', 'Initial position registered successfully', {
                elapsed: Date.now() - initStartTime.current
            });
        }).catch((err) => {
            debugLog('ERROR', 'Failed to register initial position', err);
        });

        // Firestore에 다른 플레이어들 구독
        debugLog('SUB', 'Subscribing to other players', {
            elapsed: Date.now() - initStartTime.current
        });
        const unsubscribe = subscribeToPlayers((players) => {
            const now = Date.now();
            debugLog('DATA', `Players data received`, {
                totalPlayers: players.length,
                elapsed: Date.now() - initStartTime.current
            });

            // 비활성 플레이어 필터링 & 타입 변환
            const activePlayers = (players as Player[]).filter(
                (p) => now - p.lastUpdate < INACTIVE_TIMEOUT
            );

            debugLog('DATA', `Active players filtered`, {
                activeCount: activePlayers.length,
                elapsed: Date.now() - initStartTime.current
            });

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
    }, [enabled, myNickname, myColor, setMyPlayerId, setPlayers, setConnected]);

    // 위치 업데이트 시 ref도 갱신하도록 함수 반환
    const updatePositionRef = (position: { x: number; y: number; z: number }, rotation: number) => {
        lastPositionRef.current = position;
        lastRotationRef.current = rotation;
    };

    return { updatePositionRef };
}
