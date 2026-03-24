// Firebase Storage image upload utilities
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from './firebase';

const storage = getStorage(app);

// Maximum image dimensions
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.85;

/**
 * Resize and convert image to WebP format using Canvas
 */
async function processImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;

            // Calculate new dimensions maintaining aspect ratio
            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Try WebP first, fallback to JPEG
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        // Fallback to JPEG if WebP not supported
                        canvas.toBlob(
                            (jpegBlob) => {
                                if (jpegBlob) resolve(jpegBlob);
                                else reject(new Error('Image conversion failed'));
                            },
                            'image/jpeg',
                            QUALITY
                        );
                    }
                },
                'image/webp',
                QUALITY
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

/**
 * Upload an artwork image to Firebase Storage
 * Returns the download URL
 */
export async function uploadArtworkImage(
    exhibitionCode: string,
    file: File,
    onProgress?: (percent: number) => void
): Promise<string> {
    // Process image (resize + convert)
    onProgress?.(10);
    const processedBlob = await processImage(file);
    onProgress?.(40);

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = processedBlob.type === 'image/webp' ? '.webp' : '.jpg';
    const path = `exhibitions/${exhibitionCode}/artworks/${timestamp}_${safeName}${ext}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, path);
    onProgress?.(50);

    await uploadBytes(storageRef, processedBlob, {
        contentType: processedBlob.type,
        cacheControl: 'public, max-age=31536000', // 1 year cache
    });
    onProgress?.(80);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    onProgress?.(100);

    return downloadURL;
}

/**
 * Delete an artwork image from Firebase Storage
 * Only works for images hosted on Firebase Storage
 */
export async function deleteArtworkImage(imageUrl: string): Promise<void> {
    try {
        // Only delete if it's a Firebase Storage URL
        if (!imageUrl.includes('firebasestorage.googleapis.com') &&
            !imageUrl.includes('storage.googleapis.com')) {
            return;
        }

        const storageRef = ref(storage, imageUrl);
        await deleteObject(storageRef);
    } catch (error) {
        console.warn('Failed to delete image from storage:', error);
        // Non-critical error, don't throw
    }
}
