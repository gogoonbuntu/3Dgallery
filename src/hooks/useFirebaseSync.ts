import { useEffect, useRef } from 'react';
import { useGalleryStore } from '../store/galleryStore';
import type { Artwork, GuestMessage, GallerySettings, MusicSettings } from '../store/galleryStore';
import {
    subscribeToArtworks,
    subscribeToMessages,
    subscribeToSettings,
    saveArtwork,
    deleteArtwork as firebaseDeleteArtwork,
    saveGuestMessage,
    deleteGuestMessage as firebaseDeleteGuestMessage,
    saveSettings,
} from '../lib/firebase';

// Hook to sync gallery store with Firebase
export function useFirebaseSync() {
    const initialized = useRef(false);
    const {
        artworks,
        guestMessages,
        gallerySettings,
        musicSettings,
    } = useGalleryStore();

    // Store previous values to detect changes
    const prevArtworks = useRef<Artwork[]>([]);
    const prevMessages = useRef<GuestMessage[]>([]);
    const prevSettings = useRef<{ gallery: GallerySettings; music: MusicSettings } | null>(null);

    // Subscribe to Firebase updates on mount
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        console.log('Initializing Firebase sync...');

        // Subscribe to artworks
        const unsubArtworks = subscribeToArtworks((firebaseArtworks) => {
            const store = useGalleryStore.getState();
            // Only update if different from current (to avoid loops)
            const currentIds = store.artworks.map(a => a.id).sort().join(',');
            const firebaseIds = (firebaseArtworks as Artwork[]).map(a => a.id).sort().join(',');

            if (currentIds !== firebaseIds || firebaseArtworks.length === 0) {
                // Firebase has different data, update local if Firebase has data
                if ((firebaseArtworks as Artwork[]).length > 0) {
                    useGalleryStore.setState({ artworks: firebaseArtworks as Artwork[] });
                }
            }
        });

        // Subscribe to messages
        const unsubMessages = subscribeToMessages((firebaseMessages) => {
            const store = useGalleryStore.getState();
            const currentIds = store.guestMessages.map(m => m.id).sort().join(',');
            const firebaseIds = (firebaseMessages as GuestMessage[]).map(m => m.id).sort().join(',');

            if (currentIds !== firebaseIds && (firebaseMessages as GuestMessage[]).length > 0) {
                useGalleryStore.setState({
                    guestMessages: (firebaseMessages as GuestMessage[]).map(m => ({
                        ...m,
                        createdAt: m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt as unknown as string)
                    }))
                });
            }
        });

        // Subscribe to settings
        const unsubSettings = subscribeToSettings((firebaseSettings) => {
            if (firebaseSettings) {
                const settings = firebaseSettings as { gallery?: GallerySettings; music?: MusicSettings };
                if (settings.gallery) {
                    useGalleryStore.setState({ gallerySettings: settings.gallery });
                }
                if (settings.music) {
                    useGalleryStore.setState({ musicSettings: settings.music });
                }
            }
        });

        return () => {
            unsubArtworks();
            unsubMessages();
            unsubSettings();
        };
    }, []);

    // Sync local changes to Firebase
    useEffect(() => {
        // Skip initial render
        if (prevArtworks.current.length === 0 && artworks.length > 0) {
            prevArtworks.current = artworks;
            // Initial upload to Firebase if empty
            artworks.forEach(artwork => {
                saveArtwork({ ...artwork }).catch(console.error);
            });
            return;
        }

        // Detect added/updated artworks
        for (const artwork of artworks) {
            const prev = prevArtworks.current.find(a => a.id === artwork.id);
            if (!prev || JSON.stringify(prev) !== JSON.stringify(artwork)) {
                saveArtwork({ ...artwork }).catch(console.error);
            }
        }

        // Detect deleted artworks
        for (const prev of prevArtworks.current) {
            if (!artworks.find(a => a.id === prev.id)) {
                firebaseDeleteArtwork(prev.id).catch(console.error);
            }
        }

        prevArtworks.current = artworks;
    }, [artworks]);

    // Sync guest messages
    useEffect(() => {
        if (prevMessages.current.length === 0 && guestMessages.length > 0) {
            prevMessages.current = guestMessages;
            guestMessages.forEach(msg => {
                saveGuestMessage({
                    ...msg,
                    createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt
                }).catch(console.error);
            });
            return;
        }

        // Detect added messages
        for (const msg of guestMessages) {
            const prev = prevMessages.current.find(m => m.id === msg.id);
            if (!prev) {
                saveGuestMessage({
                    ...msg,
                    createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : msg.createdAt
                }).catch(console.error);
            }
        }

        // Detect deleted messages
        for (const prev of prevMessages.current) {
            if (!guestMessages.find(m => m.id === prev.id)) {
                firebaseDeleteGuestMessage(prev.id).catch(console.error);
            }
        }

        prevMessages.current = guestMessages;
    }, [guestMessages]);

    // Sync settings
    useEffect(() => {
        const currentSettings = { gallery: gallerySettings, music: musicSettings };

        if (!prevSettings.current) {
            prevSettings.current = currentSettings;
            saveSettings(currentSettings).catch(console.error);
            return;
        }

        if (JSON.stringify(prevSettings.current) !== JSON.stringify(currentSettings)) {
            saveSettings(currentSettings).catch(console.error);
            prevSettings.current = currentSettings;
        }
    }, [gallerySettings, musicSettings]);
}
