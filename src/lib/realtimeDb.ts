// Firebase Realtime Database for Multiplayer
// Uses RTDB instead of Firestore for cost optimization (bandwidth-based pricing)

import { getDatabase, ref, set, remove, onValue, onDisconnect, off } from 'firebase/database';
import app from './firebase';

// Initialize Realtime Database
const database = getDatabase(app);

// Default exhibition code (for backward compatibility)
const DEFAULT_EXHIBITION = 'default';

// Player data interface
interface PlayerData {
    id: string;
    nickname: string;
    position: { x: number; y: number; z: number };
    rotation: number;
    color: string;
    lastUpdate: number;
}

// Get player reference
function getPlayerRef(exhibitionCode: string, playerId: string) {
    return ref(database, `players/${exhibitionCode}/${playerId}`);
}

// Get all players reference for an exhibition
function getPlayersRef(exhibitionCode: string) {
    return ref(database, `players/${exhibitionCode}`);
}

// Update player position in RTDB
export async function updatePlayerPositionRTDB(
    exhibitionCode: string,
    player: PlayerData
): Promise<void> {
    const playerRef = getPlayerRef(exhibitionCode, player.id);
    await set(playerRef, player);
}

// Remove player from RTDB
export async function removePlayerRTDB(
    exhibitionCode: string,
    playerId: string
): Promise<void> {
    const playerRef = getPlayerRef(exhibitionCode, playerId);
    await remove(playerRef);
}

// Subscribe to players in RTDB
export function subscribeToPlayersRTDB(
    exhibitionCode: string,
    callback: (players: PlayerData[]) => void
): () => void {
    const playersRef = getPlayersRef(exhibitionCode);

    const listener = onValue(playersRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            callback([]);
            return;
        }

        // Convert object to array
        const players: PlayerData[] = Object.values(data);
        callback(players);
    });

    // Return unsubscribe function
    return () => off(playersRef, 'value', listener);
}

// Setup onDisconnect handler - automatically removes player when connection is lost
export function setupOnDisconnect(
    exhibitionCode: string,
    playerId: string
): void {
    const playerRef = getPlayerRef(exhibitionCode, playerId);
    onDisconnect(playerRef).remove();
}

// Cancel onDisconnect handler
export function cancelOnDisconnect(
    exhibitionCode: string,
    playerId: string
): void {
    const playerRef = getPlayerRef(exhibitionCode, playerId);
    onDisconnect(playerRef).cancel();
}

// ============================================
// Wrapper functions for backward compatibility
// ============================================

export async function updatePlayerPosition(player: PlayerData): Promise<void> {
    return updatePlayerPositionRTDB(DEFAULT_EXHIBITION, player);
}

export async function removePlayer(playerId: string): Promise<void> {
    return removePlayerRTDB(DEFAULT_EXHIBITION, playerId);
}

export function subscribeToPlayers(callback: (players: PlayerData[]) => void): () => void {
    return subscribeToPlayersRTDB(DEFAULT_EXHIBITION, callback);
}

export function setupPlayerOnDisconnect(playerId: string): void {
    return setupOnDisconnect(DEFAULT_EXHIBITION, playerId);
}

export { database };
