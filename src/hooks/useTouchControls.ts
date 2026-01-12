import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGalleryStore } from '../store/galleryStore';

interface InputState {
    // Touch state
    isTouching: boolean;
    touchCount: number;
    lastTouchX: number;
    lastTouchY: number;
    lastPinchDistance: number;
    lastTwoFingerCenter: { x: number; y: number };
    // Mouse state
    isMouseDown: boolean;
    lastMouseX: number;
    lastMouseY: number;
    // Keyboard state
    keys: Set<string>;
}

export function useControls() {
    const { camera, gl } = useThree();
    const { isCloseUpMode } = useGalleryStore();
    const [isMobile] = useState(() => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    const inputState = useRef<InputState>({
        isTouching: false,
        touchCount: 0,
        lastTouchX: 0,
        lastTouchY: 0,
        lastPinchDistance: 0,
        lastTwoFingerCenter: { x: 0, y: 0 },
        isMouseDown: false,
        lastMouseX: 0,
        lastMouseY: 0,
        keys: new Set(),
    });

    const velocity = useRef({ x: 0, z: 0 });
    const targetRotation = useRef({ y: 0, x: 0 });
    const wasInCloseUpMode = useRef(false);

    // Room boundaries
    const ROOM_BOUNDS = {
        minX: -7,
        maxX: 7,
        minZ: -7,
        maxZ: 7,
    };

    useEffect(() => {
        const canvas = gl.domElement;

        // ===== TOUCH CONTROLS (Mobile) =====
        const getTouchDistance = (touch1: Touch, touch2: Touch) => {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const getTwoFingerCenter = (touch1: Touch, touch2: Touch) => ({
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
        });

        const handleTouchStart = (e: TouchEvent) => {
            if (isCloseUpMode) return; // Disable during close-up
            e.preventDefault();
            const state = inputState.current;
            state.isTouching = true;
            state.touchCount = e.touches.length;

            if (e.touches.length === 1) {
                state.lastTouchX = e.touches[0].clientX;
                state.lastTouchY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                state.lastPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
                state.lastTwoFingerCenter = getTwoFingerCenter(e.touches[0], e.touches[1]);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isCloseUpMode) return; // Disable during close-up
            e.preventDefault();
            const state = inputState.current;

            if (e.touches.length === 1 && state.touchCount === 1) {
                const deltaX = e.touches[0].clientX - state.lastTouchX;
                const deltaY = e.touches[0].clientY - state.lastTouchY;

                targetRotation.current.y -= deltaX * 0.005;
                targetRotation.current.x -= deltaY * 0.003;
                targetRotation.current.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotation.current.x));

                state.lastTouchX = e.touches[0].clientX;
                state.lastTouchY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
                const currentCenter = getTwoFingerCenter(e.touches[0], e.touches[1]);

                const pinchDelta = currentDistance - state.lastPinchDistance;
                if (Math.abs(pinchDelta) > 2) {
                    velocity.current.z -= pinchDelta * 0.02;
                }

                const dragDeltaX = currentCenter.x - state.lastTwoFingerCenter.x;
                const dragDeltaY = currentCenter.y - state.lastTwoFingerCenter.y;

                velocity.current.x -= dragDeltaX * 0.01;
                velocity.current.z += dragDeltaY * 0.01;

                state.lastPinchDistance = currentDistance;
                state.lastTwoFingerCenter = currentCenter;
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const state = inputState.current;
            state.touchCount = e.touches.length;
            if (e.touches.length === 0) {
                state.isTouching = false;
            } else if (e.touches.length === 1) {
                state.lastTouchX = e.touches[0].clientX;
                state.lastTouchY = e.touches[0].clientY;
            }
        };

        // ===== MOUSE CONTROLS (Desktop) =====
        const handleMouseDown = (e: MouseEvent) => {
            if (isCloseUpMode) return; // Disable during close-up
            const state = inputState.current;
            state.isMouseDown = true;
            state.lastMouseX = e.clientX;
            state.lastMouseY = e.clientY;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isCloseUpMode) return; // Disable during close-up
            const state = inputState.current;
            if (!state.isMouseDown) return;

            const deltaX = e.clientX - state.lastMouseX;
            const deltaY = e.clientY - state.lastMouseY;

            targetRotation.current.y -= deltaX * 0.003;
            targetRotation.current.x -= deltaY * 0.002;
            targetRotation.current.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotation.current.x));

            state.lastMouseX = e.clientX;
            state.lastMouseY = e.clientY;
        };

        const handleMouseUp = () => {
            inputState.current.isMouseDown = false;
        };

        const handleWheel = (e: WheelEvent) => {
            if (isCloseUpMode) return; // Disable during close-up
            e.preventDefault();
            velocity.current.z += e.deltaY * 0.002;
        };

        // ===== KEYBOARD CONTROLS (Desktop) =====
        const handleKeyDown = (e: KeyboardEvent) => {
            inputState.current.keys.add(e.key.toLowerCase());
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            inputState.current.keys.delete(e.key.toLowerCase());
        };

        // Add event listeners
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('touchcancel', handleTouchEnd);

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('touchcancel', handleTouchEnd);

            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);

            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gl, isCloseUpMode]);

    useFrame(() => {
        // Skip all camera controls during close-up mode
        if (isCloseUpMode) {
            wasInCloseUpMode.current = true;
            return;
        }

        // When exiting close-up mode, sync targetRotation with current camera rotation
        if (wasInCloseUpMode.current) {
            wasInCloseUpMode.current = false;

            // Extract current camera euler angles and update targetRotation
            const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            targetRotation.current.y = euler.y;
            targetRotation.current.x = euler.x;
        }

        const state = inputState.current;
        const MOVE_SPEED = 0.15;

        // Keyboard movement
        if (state.keys.has('w') || state.keys.has('arrowup')) velocity.current.z -= MOVE_SPEED;
        if (state.keys.has('s') || state.keys.has('arrowdown')) velocity.current.z += MOVE_SPEED;
        if (state.keys.has('a') || state.keys.has('arrowleft')) velocity.current.x += MOVE_SPEED;
        if (state.keys.has('d') || state.keys.has('arrowright')) velocity.current.x -= MOVE_SPEED;

        // Apply rotation
        const euler = new THREE.Euler(targetRotation.current.x, targetRotation.current.y, 0, 'YXZ');
        camera.quaternion.setFromEuler(euler);

        // Apply velocity-based movement
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(camera.up, direction).normalize();

        camera.position.addScaledVector(direction, -velocity.current.z);
        camera.position.addScaledVector(right, velocity.current.x);

        // Clamp to room bounds
        camera.position.x = Math.max(ROOM_BOUNDS.minX, Math.min(ROOM_BOUNDS.maxX, camera.position.x));
        camera.position.z = Math.max(ROOM_BOUNDS.minZ, Math.min(ROOM_BOUNDS.maxZ, camera.position.z));

        // Apply friction
        velocity.current.x *= 0.85;
        velocity.current.z *= 0.85;
    });

    return { isMobile };
}

// For backward compatibility
export const useTouchControls = useControls;
