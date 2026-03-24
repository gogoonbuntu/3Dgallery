// Firebase configuration for 3D Gallery - Multi-Exhibition Support
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// ============================================
// Memory Cache System - Reduces Firestore reads
// ============================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class MemoryCache {
    private cache = new Map<string, CacheEntry<unknown>>();

    set<T>(key: string, data: T, ttlMs: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMs
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    invalidate(key: string): void {
        this.cache.delete(key);
    }

    invalidatePrefix(prefix: string): void {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }
}

// Global cache instance
const cache = new MemoryCache();

// Cache TTL constants
const CACHE_TTL = {
    EXHIBITION_META: 5 * 60 * 1000,    // 5 minutes
    EXHIBITION_EXISTS: 10 * 60 * 1000, // 10 minutes  
    SETTINGS: 60 * 1000,               // 1 minute
    PASSWORD_VERIFIED: 30 * 60 * 1000, // 30 minutes (once verified, cache it)
};

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
    adminPassword: string;  // Exhibition-specific admin password
    createdAt: string;
    isActive: boolean;
    // New fields for improved UX
    isSetupComplete?: boolean;  // Whether initial setup wizard was completed
    inviteToken?: string;       // One-time invite token for first admin access
    inviteTokenExpiry?: string; // Expiry date for invite token
    description?: string;       // Exhibition description
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

// Generate secure invite token (32 characters)
export function generateInviteToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}



// Create new exhibition
export async function createExhibition(title: string, hostEmail: string, adminPassword: string): Promise<string> {
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

    // Generate invite token for first-time admin access
    const inviteToken = generateInviteToken();
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const meta: ExhibitionMeta = {
        code,
        title,
        hostEmail,
        adminPassword,  // Store the admin password
        createdAt: new Date().toISOString(),
        isActive: true,
        isSetupComplete: false,
        inviteToken,
        inviteTokenExpiry,
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

// Verify invite token and return true if valid
export async function verifyInviteToken(exhibitionCode: string, token: string): Promise<boolean> {
    const meta = await getExhibitionMeta(exhibitionCode);
    if (!meta) return false;

    // Check if token matches
    if (meta.inviteToken !== token) return false;

    // Check if token is expired
    if (meta.inviteTokenExpiry) {
        const expiry = new Date(meta.inviteTokenExpiry);
        if (new Date() > expiry) return false;
    }

    return true;
}

// Consume invite token (invalidate after first use)
export async function consumeInviteToken(exhibitionCode: string): Promise<void> {
    const metaRef = getExhibitionMetaRef(exhibitionCode);
    const docSnap = await getDoc(metaRef);
    if (docSnap.exists()) {
        const meta = docSnap.data() as ExhibitionMeta;
        await setDoc(metaRef, {
            ...meta,
            inviteToken: null,
            inviteTokenExpiry: null,
        });
        // Invalidate cache
        cache.invalidate(`exhibition_meta:${exhibitionCode}`);
    }
}

// Mark exhibition setup as complete
export async function markSetupComplete(exhibitionCode: string): Promise<void> {
    const metaRef = getExhibitionMetaRef(exhibitionCode);
    const docSnap = await getDoc(metaRef);
    if (docSnap.exists()) {
        const meta = docSnap.data() as ExhibitionMeta;
        await setDoc(metaRef, {
            ...meta,
            isSetupComplete: true,
        });
        // Invalidate cache
        cache.invalidate(`exhibition_meta:${exhibitionCode}`);
    }
}

// Update exhibition description
export async function updateExhibitionDescription(exhibitionCode: string, description: string): Promise<void> {
    const metaRef = getExhibitionMetaRef(exhibitionCode);
    const docSnap = await getDoc(metaRef);
    if (docSnap.exists()) {
        const meta = docSnap.data() as ExhibitionMeta;
        await setDoc(metaRef, {
            ...meta,
            description,
        });
        // Invalidate cache
        cache.invalidate(`exhibition_meta:${exhibitionCode}`);
    }
}

// Check if exhibition needs setup
export async function needsSetup(exhibitionCode: string): Promise<boolean> {
    const meta = await getExhibitionMeta(exhibitionCode);
    if (!meta) return false;
    return !meta.isSetupComplete;
}


// Verify exhibition admin password (with caching)
export async function verifyExhibitionPassword(exhibitionCode: string, password: string): Promise<boolean> {
    // Check if this password was already verified and cached
    const cacheKey = `password_verified:${exhibitionCode}:${password}`;
    const cachedResult = cache.get<boolean>(cacheKey);
    if (cachedResult !== null) {
        return cachedResult;
    }

    const meta = await getExhibitionMeta(exhibitionCode);
    if (!meta) {
        // Fallback for legacy exhibitions without password
        const result = password === 'gallery2024';
        if (result) cache.set(cacheKey, result, CACHE_TTL.PASSWORD_VERIFIED);
        return result;
    }
    if (!meta.adminPassword) {
        // Fallback for legacy exhibitions without password
        const result = password === 'gallery2024';
        if (result) cache.set(cacheKey, result, CACHE_TTL.PASSWORD_VERIFIED);
        return result;
    }
    const result = meta.adminPassword === password;
    if (result) cache.set(cacheKey, result, CACHE_TTL.PASSWORD_VERIFIED);
    return result;
}

// Get exhibition meta (with caching)
export async function getExhibitionMeta(exhibitionCode: string): Promise<ExhibitionMeta | null> {
    const cacheKey = `exhibition_meta:${exhibitionCode}`;

    // Check cache first
    const cachedMeta = cache.get<ExhibitionMeta>(cacheKey);
    if (cachedMeta) {
        return cachedMeta;
    }

    // Fetch from Firestore
    const docSnap = await getDoc(getExhibitionMetaRef(exhibitionCode));
    if (docSnap.exists()) {
        const meta = docSnap.data() as ExhibitionMeta;
        cache.set(cacheKey, meta, CACHE_TTL.EXHIBITION_META);
        return meta;
    }
    return null;
}

// Check if exhibition exists (with caching)
export async function exhibitionExists(exhibitionCode: string): Promise<boolean> {
    const cacheKey = `exhibition_exists:${exhibitionCode}`;

    // Check cache first
    const cachedResult = cache.get<boolean>(cacheKey);
    if (cachedResult !== null) {
        return cachedResult;
    }

    // Fetch from Firestore
    const docSnap = await getDoc(getExhibitionRef(exhibitionCode));
    const exists = docSnap.exists();
    cache.set(cacheKey, exists, CACHE_TTL.EXHIBITION_EXISTS);
    return exists;
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
    try {
        // Use direct document access (same ID pattern as addSuperAdmin)
        const docId = email.replace(/[.@]/g, '_');
        const docRef = doc(db, 'superAdmins', docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() && docSnap.data()?.email === email;
    } catch (error) {
        console.error('isSuperAdmin check failed:', error);
        return false;
    }
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
