import { create } from 'zustand';

export interface Player {
    id: string;
    nickname: string;
    position: { x: number; y: number; z: number };
    rotation: number;  // Y축 회전
    color: string;     // 아바타 색상
    lastUpdate: number; // 타임스탬프
}

interface MultiplayerState {
    // State
    myPlayerId: string | null;
    myNickname: string;
    myColor: string;
    players: Record<string, Player>;
    isConnected: boolean;

    // Actions
    setMyPlayerId: (id: string) => void;
    setMyNickname: (nickname: string) => void;
    updatePlayer: (player: Player) => void;
    removePlayer: (id: string) => void;
    setPlayers: (players: Player[]) => void;
    setConnected: (connected: boolean) => void;
}

// 랜덤 닉네임 생성
const nicknames = [
    '관람객', '여행자', '화가', '조각가', '예술가',
    '탐험가', '수집가', '감상자', '비평가', '학생'
];

const getRandomNickname = () => {
    const nickname = nicknames[Math.floor(Math.random() * nicknames.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${nickname}${number}`;
};

// 랜덤 아바타 색상
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
};

export const useMultiplayerStore = create<MultiplayerState>()((set) => ({
    myPlayerId: null,
    myNickname: getRandomNickname(),
    myColor: getRandomColor(),
    players: {},
    isConnected: false,

    setMyPlayerId: (id) => set({ myPlayerId: id }),

    setMyNickname: (nickname) => set({ myNickname: nickname }),

    updatePlayer: (player) =>
        set((state) => ({
            players: { ...state.players, [player.id]: player },
        })),

    removePlayer: (id) =>
        set((state) => {
            const { [id]: _, ...rest } = state.players;
            return { players: rest };
        }),

    setPlayers: (players) =>
        set(() => ({
            players: players.reduce(
                (acc, player) => ({ ...acc, [player.id]: player }),
                {} as Record<string, Player>
            ),
        })),

    setConnected: (connected) => set({ isConnected: connected }),
}));
