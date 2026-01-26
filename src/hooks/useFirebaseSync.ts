import { useEffect, useRef } from 'react';
import { useGalleryStore } from '../store/galleryStore';
import type { Artwork, GuestMessage, GallerySettings, MusicSettings } from '../store/galleryStore';
import {
    subscribeToExhibitionArtworks,
    subscribeToExhibitionGuestbook,
    subscribeToExhibitionSettings,
    saveExhibitionArtwork,
    deleteExhibitionArtwork,
    saveExhibitionGuestMessage,
    deleteExhibitionGuestMessage,
    saveExhibitionSettings,
} from '../lib/firebase';

// Global flag to prevent sync loops
let isReceivingFromFirebase = false;

// Hook to sync gallery store with Firebase for current exhibition
export function useFirebaseSync() {
    const initialized = useRef(false);
    const currentCodeRef = useRef<string>('');
    const unsubscribersRef = useRef<(() => void)[]>([]);

    const {
        currentExhibitionCode,
        artworks,
        guestMessages,
        gallerySettings,
        musicSettings,
    } = useGalleryStore();

    // Store previous values to detect changes
    const prevArtworks = useRef<Artwork[]>([]);
    const prevMessages = useRef<GuestMessage[]>([]);
    const prevSettings = useRef<{ gallery: GallerySettings; music: MusicSettings } | null>(null);

    // Subscribe to Firebase updates when exhibition code changes
    useEffect(() => {
        if (!currentExhibitionCode) return;

        // If code changed, unsubscribe from previous
        if (currentCodeRef.current !== currentExhibitionCode) {
            unsubscribersRef.current.forEach(unsub => unsub());
            unsubscribersRef.current = [];
            prevArtworks.current = [];
            prevMessages.current = [];
            prevSettings.current = null;
            initialized.current = false;
        }

        currentCodeRef.current = currentExhibitionCode;

        if (initialized.current) return;
        initialized.current = true;

        console.log(`Initializing Firebase sync for exhibition: ${currentExhibitionCode}`);

        // Subscribe to artworks
        const unsubArtworks = subscribeToExhibitionArtworks(currentExhibitionCode, (firebaseArtworks) => {
            const store = useGalleryStore.getState();
            const typedArtworks = firebaseArtworks as Artwork[];

            const currentData = JSON.stringify(store.artworks.map(a => ({ ...a })).sort((x, y) => x.id.localeCompare(y.id)));
            const firebaseData = JSON.stringify(typedArtworks.map(a => ({ ...a })).sort((x, y) => x.id.localeCompare(y.id)));

            if (currentData !== firebaseData && typedArtworks.length > 0) {
                isReceivingFromFirebase = true;
                useGalleryStore.setState({ artworks: typedArtworks });
                prevArtworks.current = typedArtworks;
                // Reset flag after state update is processed
                setTimeout(() => { isReceivingFromFirebase = false; }, 100);
            }
        });

        // Subscribe to messages
        const unsubMessages = subscribeToExhibitionGuestbook(currentExhibitionCode, (firebaseMessages) => {
            const store = useGalleryStore.getState();
            const typedMessages = (firebaseMessages as GuestMessage[]).map(m => ({
                ...m,
                createdAt: m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt as unknown as string),
                likes: m.likes || 0,
            }));

            const currentData = JSON.stringify(store.guestMessages.map(m => ({ id: m.id, nickname: m.nickname, content: m.content, likes: m.likes })).sort((x, y) => x.id.localeCompare(y.id)));
            const firebaseData = JSON.stringify(typedMessages.map(m => ({ id: m.id, nickname: m.nickname, content: m.content, likes: m.likes })).sort((x, y) => x.id.localeCompare(y.id)));

            if (currentData !== firebaseData && typedMessages.length > 0) {
                isReceivingFromFirebase = true;
                useGalleryStore.setState({ guestMessages: typedMessages });
                prevMessages.current = typedMessages;
                setTimeout(() => { isReceivingFromFirebase = false; }, 100);
            }
        });

        // Subscribe to settings
        const unsubSettings = subscribeToExhibitionSettings(currentExhibitionCode, (firebaseSettings) => {
            if (firebaseSettings) {
                const store = useGalleryStore.getState();
                const settings = firebaseSettings as { gallery?: GallerySettings; music?: MusicSettings };

                let updated = false;
                const newState: Partial<{ gallerySettings: GallerySettings; musicSettings: MusicSettings }> = {};

                if (settings.gallery) {
                    const currentGallery = JSON.stringify(store.gallerySettings);
                    const newGallery = JSON.stringify(settings.gallery);
                    if (currentGallery !== newGallery) {
                        newState.gallerySettings = settings.gallery;
                        updated = true;
                    }
                }
                if (settings.music) {
                    const currentMusic = JSON.stringify(store.musicSettings);
                    const newMusic = JSON.stringify(settings.music);
                    if (currentMusic !== newMusic) {
                        newState.musicSettings = settings.music;
                        updated = true;
                    }
                }

                if (updated) {
                    isReceivingFromFirebase = true;
                    useGalleryStore.setState(newState);
                    prevSettings.current = {
                        gallery: settings.gallery || store.gallerySettings,
                        music: settings.music || store.musicSettings
                    };
                    setTimeout(() => { isReceivingFromFirebase = false; }, 100);
                }
            }
        });

        unsubscribersRef.current = [unsubArtworks, unsubMessages, unsubSettings];

        return () => {
            unsubscribersRef.current.forEach(unsub => unsub());
            unsubscribersRef.current = [];
        };
    }, [currentExhibitionCode]);

    // Sync local changes to Firebase (only when NOT receiving from Firebase)
    useEffect(() => {
        if (!currentExhibitionCode || isReceivingFromFirebase) return;

        // Skip initial render
        if (prevArtworks.current.length === 0 && artworks.length > 0) {
            prevArtworks.current = artworks;
            return;
        }

        // Detect added/updated artworks
        for (const artwork of artworks) {
            const prev = prevArtworks.current.find(a => a.id === artwork.id);
            if (!prev || JSON.stringify(prev) !== JSON.stringify(artwork)) {
                saveExhibitionArtwork(currentExhibitionCode, { ...artwork }).catch(console.error);
            }
        }

        // Detect deleted artworks
        for (const prev of prevArtworks.current) {
            if (!artworks.find(a => a.id === prev.id)) {
                deleteExhibitionArtwork(currentExhibitionCode, prev.id).catch(console.error);
            }
        }

        prevArtworks.current = artworks;
    }, [artworks, currentExhibitionCode]);

    // Sync guest messages (only when NOT receiving from Firebase)
    useEffect(() => {
        if (!currentExhibitionCode || isReceivingFromFirebase) return;

        if (prevMessages.current.length === 0 && guestMessages.length > 0) {
            prevMessages.current = guestMessages;
            return;
        }

        // Detect added/updated messages (includes likes)
        for (const msg of guestMessages) {
            const prev = prevMessages.current.find(m => m.id === msg.id);
            if (!prev || JSON.stringify(prev) !== JSON.stringify(msg)) {
                saveExhibitionGuestMessage(currentExhibitionCode, {
                    ...msg,
                    createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt
                }).catch(console.error);
            }
        }

        // Detect deleted messages
        for (const prev of prevMessages.current) {
            if (!guestMessages.find(m => m.id === prev.id)) {
                deleteExhibitionGuestMessage(currentExhibitionCode, prev.id).catch(console.error);
            }
        }

        prevMessages.current = guestMessages;
    }, [guestMessages, currentExhibitionCode]);

    // Sync settings (only when NOT receiving from Firebase)
    useEffect(() => {
        if (!currentExhibitionCode || isReceivingFromFirebase) return;

        const currentSettings = { gallery: gallerySettings, music: musicSettings };

        if (!prevSettings.current) {
            prevSettings.current = currentSettings;
            return;
        }

        if (JSON.stringify(prevSettings.current) !== JSON.stringify(currentSettings)) {
            saveExhibitionSettings(currentExhibitionCode, currentSettings).catch(console.error);
            prevSettings.current = currentSettings;
        }
    }, [gallerySettings, musicSettings, currentExhibitionCode]);
}
