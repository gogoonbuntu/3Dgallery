import { useState, useEffect } from 'react';

export function useDeviceDetect() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            const userAgent = navigator.userAgent || navigator.vendor;
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 768;

            setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen));
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return { isMobile, isDesktop: !isMobile };
}
