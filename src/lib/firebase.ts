// Firebase configuration for 3D Gallery
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
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

// Collection references
export const artworksCollection = collection(db, 'artworks');
export const messagesCollection = collection(db, 'guestMessages');
export const settingsDoc = doc(db, 'settings', 'gallery');

// Players collection for multiplayer
export const playersCollection = collection(db, 'players');

// Player utility functions
export async function updatePlayerPosition(player: {
    id: string;
    nickname: string;
    position: { x: number; y: number; z: number };
    rotation: number;
    color: string;
    lastUpdate: number;
}) {
    await setDoc(doc(playersCollection, player.id), player);
}

export async function removePlayer(id: string) {
    await deleteDoc(doc(playersCollection, id));
}

export function subscribeToPlayers(callback: (players: unknown[]) => void) {
    return onSnapshot(playersCollection, (snapshot) => {
        const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(players);
    });
}

// Firebase utility functions
export async function loadArtworks() {
    const snapshot = await getDocs(artworksCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveArtwork(artwork: { id: string;[key: string]: unknown }) {
    await setDoc(doc(artworksCollection, artwork.id), artwork);
}

export async function deleteArtwork(id: string) {
    await deleteDoc(doc(artworksCollection, id));
}

export async function loadGuestMessages() {
    const snapshot = await getDocs(messagesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveGuestMessage(message: { id: string;[key: string]: unknown }) {
    await setDoc(doc(messagesCollection, message.id), message);
}

export async function deleteGuestMessage(id: string) {
    await deleteDoc(doc(messagesCollection, id));
}

export async function loadSettings() {
    const snapshot = await getDocs(collection(db, 'settings'));
    if (snapshot.docs.length > 0) {
        return snapshot.docs[0].data();
    }
    return null;
}

export async function saveSettings(settings: Record<string, unknown>) {
    await setDoc(settingsDoc, settings);
}

// Real-time listeners
export function subscribeToArtworks(callback: (artworks: unknown[]) => void) {
    return onSnapshot(artworksCollection, (snapshot) => {
        const artworks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(artworks);
    });
}

export function subscribeToMessages(callback: (messages: unknown[]) => void) {
    return onSnapshot(messagesCollection, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(messages);
    });
}

export function subscribeToSettings(callback: (settings: unknown) => void) {
    return onSnapshot(settingsDoc, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data());
        }
    });
}

export default app;
