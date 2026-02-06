import { useEffect, useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGalleryStore } from '../store/galleryStore';
import type { Artwork } from '../store/galleryStore';

export function CloseUpCamera() {
    const { camera, gl } = useThree();
    const { isCloseUpMode, selectedArtwork } = useGalleryStore();

    const originalPosition = useRef(new THREE.Vector3());
    const targetPosition = useRef(new THREE.Vector3());
    const targetLookAt = useRef(new THREE.Vector3());
    const transitionProgress = useRef(0);
    const isTransitioning = useRef(false);
    const isEntering = useRef(false); // true = entering close-up, false = exiting
    const savedPosition = useRef<THREE.Vector3 | null>(null);
    const savedQuaternion = useRef<THREE.Quaternion | null>(null);

    // Zoom state
    const zoomLevel = useRef(1); // 1 = default, < 1 = zoomed in, > 1 = zoomed out
    const baseDistance = useRef(3.5);
    const currentZoomDistance = useRef(3.5);

    // Calculate target position based on artwork wall
    const getTargetPositionForArtwork = useCallback((artwork: Artwork, distance: number = 3.5) => {
        const { wall, position } = artwork;
        const viewDistance = distance;
        const viewHeight = position.y;

        const pos = new THREE.Vector3();
        const lookAt = new THREE.Vector3();

        switch (wall) {
            case 'A': // Front wall (negative Z)
                pos.set(position.x, viewHeight, -7.9 + viewDistance);
                lookAt.set(position.x, position.y, -7.9);
                break;
            case 'B': // Right wall (positive X)
                pos.set(7.9 - viewDistance, viewHeight, position.x);
                lookAt.set(7.9, position.y, position.x);
                break;
            case 'C': // Back wall (positive Z)
                pos.set(position.x, viewHeight, 7.9 - viewDistance);
                lookAt.set(position.x, position.y, 7.9);
                break;
        }

        return { pos, lookAt };
    }, []);

    // Handle zoom with mouse wheel
    useEffect(() => {
        if (!isCloseUpMode) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            // Adjust zoom level
            const zoomDelta = e.deltaY * 0.001;
            zoomLevel.current = Math.max(0.4, Math.min(1.5, zoomLevel.current + zoomDelta));

            // Update current zoom distance
            currentZoomDistance.current = baseDistance.current * zoomLevel.current;
        };

        const canvas = gl.domElement;
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [isCloseUpMode, gl]);

    // Handle entering close-up mode
    useEffect(() => {
        if (isCloseUpMode && selectedArtwork) {
            // Reset zoom level
            zoomLevel.current = 1;
            currentZoomDistance.current = baseDistance.current;

            // Save current camera state for returning later
            savedPosition.current = camera.position.clone();
            savedQuaternion.current = camera.quaternion.clone();

            // Set starting point for animation
            originalPosition.current.copy(camera.position);

            // Calculate target
            const target = getTargetPositionForArtwork(selectedArtwork);
            targetPosition.current.copy(target.pos);
            targetLookAt.current.copy(target.lookAt);

            transitionProgress.current = 0;
            isTransitioning.current = true;
            isEntering.current = true;
        }
    }, [isCloseUpMode, selectedArtwork, camera, getTargetPositionForArtwork]);

    // Handle exiting close-up mode
    useEffect(() => {
        if (!isCloseUpMode && savedPosition.current && savedQuaternion.current) {
            // Return to saved position
            originalPosition.current.copy(camera.position);
            targetPosition.current.copy(savedPosition.current);

            transitionProgress.current = 0;
            isTransitioning.current = true;
            isEntering.current = false;
        }
    }, [isCloseUpMode, camera]);

    useFrame((_, delta) => {
        // Handle zoom while in close-up mode (not transitioning)
        if (isCloseUpMode && !isTransitioning.current && selectedArtwork) {
            const target = getTargetPositionForArtwork(selectedArtwork, currentZoomDistance.current);
            camera.position.lerp(target.pos, 0.1);
            camera.lookAt(target.lookAt);
            return;
        }

        if (!isTransitioning.current) return;

        // Smooth transition
        transitionProgress.current += delta * 1.5;
        const t = Math.min(transitionProgress.current, 1);
        const easeT = 1 - Math.pow(1 - t, 3); // Ease out cubic

        // Interpolate position
        camera.position.lerpVectors(originalPosition.current, targetPosition.current, easeT);

        // When entering close-up mode: always look at the artwork during animation
        // This ensures the camera faces the artwork directly, regardless of original angle
        if (isEntering.current) {
            camera.lookAt(targetLookAt.current);
        } else {
            // When exiting: interpolate back to saved rotation
            if (savedQuaternion.current) {
                // Calculate current lookAt quaternion as a reference
                const currentLookAtPos = targetLookAt.current.clone();
                camera.lookAt(currentLookAtPos);
                const exitStartQuat = camera.quaternion.clone();

                // Slerp from current to saved
                camera.quaternion.slerpQuaternions(exitStartQuat, savedQuaternion.current, easeT);
            }
        }

        if (t >= 1) {
            isTransitioning.current = false;

            // Ensure final state
            camera.position.copy(targetPosition.current);

            if (isEntering.current) {
                // Final lookAt for close-up - always face the artwork directly
                camera.lookAt(targetLookAt.current);
            } else if (savedQuaternion.current) {
                // Restore exact saved rotation when exiting
                camera.quaternion.copy(savedQuaternion.current);
            }
        }
    });

    return null;
}

