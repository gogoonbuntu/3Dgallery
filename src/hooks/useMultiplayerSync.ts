import { useEffect, useRef } from 'react';
import { useMultiplayerStore, type Player } from '../store/multiplayerStore';
import {
    removePlayer,
    subscribeToPlayers,
} from '../lib/firebase';

// 플레이어 ID 생성
function generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 비활성 플레이어 제거 시간 (ms)
const INACTIVE_TIMEOUT = 30000;

// 멀티플레이어 연결 관리 훅 - App 레벨에서 한 번만 호출
export function useMultiplayerSync() {
    const {
        setMyPlayerId,
        setPlayers,
        setConnected,
    } = useMultiplayerStore();

    const initialized = useRef(false);

    useEffect(() => {
        // 이미 초기화됐으면 스킵
        if (initialized.current) return;
        initialized.current = true;

        const playerId = generatePlayerId();
        setMyPlayerId(playerId);
        setConnected(true);

        console.log('Multiplayer connected:', playerId);

        // Firestore에 다른 플레이어들 구독
        const unsubscribe = subscribeToPlayers((players) => {
            const now = Date.now();

            // 비활성 플레이어 필터링 & 타입 변환
            const activePlayers = (players as Player[]).filter(
                (p) => now - p.lastUpdate < INACTIVE_TIMEOUT
            );

            setPlayers(activePlayers);
        });

        // 퇴장 시 정리
        const handleBeforeUnload = () => {
            removePlayer(playerId).catch(console.error);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            removePlayer(playerId).catch(console.error);
            setConnected(false);
        };
    }, [setMyPlayerId, setPlayers, setConnected]);
}
