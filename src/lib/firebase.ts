// Firebase configuration for 3D Gallery - Multi-Exhibition Support
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// ============================================
// Exhibition-specific collections
// ============================================

// Get exhibition document reference
export function getExhibitionRef(exhibitionCode: string) {
    return doc(db, 'exhibitions', exhibitionCode);
}

// Get exhibition meta document
export function getExhibitionMetaRef(exhibitionCode: string) {
    return doc(db, 'exhibitions', exhibitionCode, 'data', 'meta');
}

// Get exhibition settings document
export function getExhibitionSettingsRef(exhibitionCode: string) {
    return doc(db, 'exhibitions', exhibitionCode, 'data', 'settings');
}

// Get exhibition artworks collection
export function getExhibitionArtworksCollection(exhibitionCode: string) {
    return collection(db, 'exhibitions', exhibitionCode, 'artworks');
}

// Get exhibition guestbook collection  
export function getExhibitionGuestbookCollection(exhibitionCode: string) {
    return collection(db, 'exhibitions', exhibitionCode, 'guestbook');
}

// Get exhibition players collection (multiplayer)
export function getExhibitionPlayersCollection(exhibitionCode: string) {
    return collection(db, 'exhibitions', exhibitionCode, 'players');
}

// ============================================
// Exhibition Meta Functions
// ============================================

export interface ExhibitionMeta {
    code: string;
    title: string;
    hostEmail: string;
    createdAt: string;
    isActive: boolean;
}

// Generate unique 6-character code
export function generateExhibitionCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Create new exhibition
export async function createExhibition(title: string, hostEmail: string): Promise<string> {
    let code = generateExhibitionCode();

    // Ensure unique code
    let exists = true;
    while (exists) {
        const docRef = getExhibitionRef(code);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            exists = false;
        } else {
            code = generateExhibitionCode();
        }
    }

    const meta: ExhibitionMeta = {
        code,
        title,
        hostEmail,
        createdAt: new Date().toISOString(),
        isActive: true,
    };

    // Create exhibition document with meta
    await setDoc(getExhibitionRef(code), { code });
    await setDoc(getExhibitionMetaRef(code), meta);

    // Initialize default settings
    const defaultSettings = {
        gallery: {
            wallColor: '#f5f5f5',
            wallPattern: 'none',
            floorTexture: 'wood',
            frameStyle: 'classic',
            artworksPerWall: 2,
            lightingBrightness: 70,
            lightingIntensity: 60,
            lightingColorTemp: 55,
            ambientIntensity: 40,
        },
        music: {
            isPlaying: false,
            volume: 0.5,
            currentTrackIndex: 0,
            playerDesign: 'speaker',
            youtubeUrl: '',
        }
    };
    await setDoc(getExhibitionSettingsRef(code), defaultSettings);

    return code;
}

// Get exhibition meta
export async function getExhibitionMeta(exhibitionCode: string): Promise<ExhibitionMeta | null> {
    const docSnap = await getDoc(getExhibitionMetaRef(exhibitionCode));
    if (docSnap.exists()) {
        return docSnap.data() as ExhibitionMeta;
    }
    return null;
}

// Check if exhibition exists
export async function exhibitionExists(exhibitionCode: string): Promise<boolean> {
    const docSnap = await getDoc(getExhibitionRef(exhibitionCode));
    return docSnap.exists();
}

// Get all exhibitions (for super admin)
export async function getAllExhibitions(): Promise<ExhibitionMeta[]> {
    const exhibitions: ExhibitionMeta[] = [];
    const snapshot = await getDocs(collection(db, 'exhibitions'));

    for (const docRef of snapshot.docs) {
        const metaSnap = await getDoc(getExhibitionMetaRef(docRef.id));
        if (metaSnap.exists()) {
            exhibitions.push(metaSnap.data() as ExhibitionMeta);
        }
    }

    return exhibitions;
}

// Delete exhibition
export async function deleteExhibition(exhibitionCode: string): Promise<void> {
    // Note: This only deletes the main document. 
    // Subcollections need to be deleted separately or via Cloud Functions
    await deleteDoc(getExhibitionRef(exhibitionCode));
}

// ============================================
// Super Admin Functions
// ============================================

export const superAdminsCollection = collection(db, 'superAdmins');

export async function isSuperAdmin(email: string): Promise<boolean> {
    const q = query(superAdminsCollection, where('email', '==', email));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
}

export async function addSuperAdmin(email: string): Promise<void> {
    const docRef = doc(superAdminsCollection, email.replace(/[.@]/g, '_'));
    await setDoc(docRef, { email, createdAt: new Date().toISOString() });
}

// ============================================
// Exhibition-specific CRUD Functions
// ============================================

// Artworks
export async function loadExhibitionArtworks(exhibitionCode: string) {
    const snapshot = await getDocs(getExhibitionArtworksCollection(exhibitionCode));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveExhibitionArtwork(exhibitionCode: string, artwork: { id: string;[key: string]: unknown }) {
    await setDoc(doc(getExhibitionArtworksCollection(exhibitionCode), artwork.id), artwork);
}

export async function deleteExhibitionArtwork(exhibitionCode: string, id: string) {
    await deleteDoc(doc(getExhibitionArtworksCollection(exhibitionCode), id));
}

// Guestbook
export async function loadExhibitionGuestbook(exhibitionCode: string) {
    const snapshot = await getDocs(getExhibitionGuestbookCollection(exhibitionCode));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveExhibitionGuestMessage(exhibitionCode: string, message: { id: string;[key: string]: unknown }) {
    await setDoc(doc(getExhibitionGuestbookCollection(exhibitionCode), message.id), message);
}

export async function deleteExhibitionGuestMessage(exhibitionCode: string, id: string) {
    await deleteDoc(doc(getExhibitionGuestbookCollection(exhibitionCode), id));
}

// Settings
export async function loadExhibitionSettings(exhibitionCode: string) {
    const docSnap = await getDoc(getExhibitionSettingsRef(exhibitionCode));
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

export async function saveExhibitionSettings(exhibitionCode: string, settings: Record<string, unknown>) {
    await setDoc(getExhibitionSettingsRef(exhibitionCode), settings);
}

// ============================================
// Real-time Listeners (Exhibition-specific)
// ============================================

export function subscribeToExhibitionArtworks(exhibitionCode: string, callback: (artworks: unknown[]) => void) {
    return onSnapshot(getExhibitionArtworksCollection(exhibitionCode), (snapshot) => {
        const artworks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(artworks);
    });
}

export function subscribeToExhibitionGuestbook(exhibitionCode: string, callback: (messages: unknown[]) => void) {
    return onSnapshot(getExhibitionGuestbookCollection(exhibitionCode), (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(messages);
    });
}

export function subscribeToExhibitionSettings(exhibitionCode: string, callback: (settings: unknown) => void) {
    return onSnapshot(getExhibitionSettingsRef(exhibitionCode), (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data());
        }
    });
}

// Players (multiplayer)
export async function updateExhibitionPlayer(exhibitionCode: string, player: {
    id: string;
    nickname: string;
    position: { x: number; y: number; z: number };
    rotation: number;
    color: string;
    lastUpdate: number;
}) {
    await setDoc(doc(getExhibitionPlayersCollection(exhibitionCode), player.id), player);
}

export async function removeExhibitionPlayer(exhibitionCode: string, id: string) {
    await deleteDoc(doc(getExhibitionPlayersCollection(exhibitionCode), id));
}

export function subscribeToExhibitionPlayers(exhibitionCode: string, callback: (players: unknown[]) => void) {
    return onSnapshot(getExhibitionPlayersCollection(exhibitionCode), (snapshot) => {
        const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(players);
    });
}

// ============================================
// Legacy exports for backward compatibility
// (These use a default exhibition code)
// ============================================

const DEFAULT_EXHIBITION = 'default';

export const artworksCollection = getExhibitionArtworksCollection(DEFAULT_EXHIBITION);
export const messagesCollection = getExhibitionGuestbookCollection(DEFAULT_EXHIBITION);
export const settingsDoc = getExhibitionSettingsRef(DEFAULT_EXHIBITION);
export const playersCollection = getExhibitionPlayersCollection(DEFAULT_EXHIBITION);

// Legacy functions - delegate to exhibition-specific versions
export async function loadArtworks() {
    return loadExhibitionArtworks(DEFAULT_EXHIBITION);
}

export async function saveArtwork(artwork: { id: string;[key: string]: unknown }) {
    return saveExhibitionArtwork(DEFAULT_EXHIBITION, artwork);
}

export async function deleteArtwork(id: string) {
    return deleteExhibitionArtwork(DEFAULT_EXHIBITION, id);
}

export async function loadGuestMessages() {
    return loadExhibitionGuestbook(DEFAULT_EXHIBITION);
}

export async function saveGuestMessage(message: { id: string;[key: string]: unknown }) {
    return saveExhibitionGuestMessage(DEFAULT_EXHIBITION, message);
}

export async function deleteGuestMessage(id: string) {
    return deleteExhibitionGuestMessage(DEFAULT_EXHIBITION, id);
}

export async function loadSettings() {
    return loadExhibitionSettings(DEFAULT_EXHIBITION);
}

export async function saveSettings(settings: Record<string, unknown>) {
    return saveExhibitionSettings(DEFAULT_EXHIBITION, settings);
}

export function subscribeToArtworks(callback: (artworks: unknown[]) => void) {
    return subscribeToExhibitionArtworks(DEFAULT_EXHIBITION, callback);
}

export function subscribeToMessages(callback: (messages: unknown[]) => void) {
    return subscribeToExhibitionGuestbook(DEFAULT_EXHIBITION, callback);
}

export function subscribeToSettings(callback: (settings: unknown) => void) {
    return subscribeToExhibitionSettings(DEFAULT_EXHIBITION, callback);
}

export async function updatePlayerPosition(player: {
    id: string;
    nickname: string;
    position: { x: number; y: number; z: number };
    rotation: number;
    color: string;
    lastUpdate: number;
}) {
    return updateExhibitionPlayer(DEFAULT_EXHIBITION, player);
}

export async function removePlayer(id: string) {
    return removeExhibitionPlayer(DEFAULT_EXHIBITION, id);
}

export function subscribeToPlayers(callback: (players: unknown[]) => void) {
    return subscribeToExhibitionPlayers(DEFAULT_EXHIBITION, callback);
}

export default app;
