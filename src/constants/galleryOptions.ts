// Shared constants for gallery settings
// Types are defined in store/galleryStore.ts


export const WALL_COLORS = [
    { value: '#ffffff', label: '흰색' },
    { value: '#f5f5dc', label: '크림' },
    { value: '#e0e0e0', label: '밝은 회색' },
    { value: '#2c2c2c', label: '진한 회색' },
    { value: '#1a1a2e', label: '딥 네이비' },
];

export const WALL_PATTERNS = [
    { value: 'none', label: '없음' },
    { value: 'brick', label: '🧱 벽돌' },
    { value: 'stripes', label: '💈 줄무늬' },
    { value: 'grid', label: '🟦 격자' },
    { value: 'dots', label: '🟢 도트' },
    { value: 'chevron', label: '📈 쉐브론' },
    { value: 'noise', label: '🌫️ 거친벽' },
];

export const FLOOR_TEXTURES = [
    { value: 'wood', label: '🪵 나무' },
    { value: 'herringbone', label: '📐 헤링본' },
    { value: 'marble', label: '🪨 대리석' },
    { value: 'stone', label: '🧱 석재' },
    { value: 'concrete', label: '🏗️ 콘크리트' },
    { value: 'carpet', label: '🧶 카페트' },
];

export const FRAME_STYLES = [
    { value: 'classic', label: '🏛️ 클래식' },
    { value: 'modern', label: '✨ 모던' },
    { value: 'minimal', label: '⬜ 미니멀' },
    { value: 'ornate', label: '⚜️ 화려함' },
    { value: 'thin', label: '➖ 슬림' },
    { value: 'thick', label: '⬛ 볼드' },
    { value: 'shadow', label: '🌌 섀도우' },
    { value: 'glass', label: '💎 글래스' },
    { value: 'wood', label: '🪵 우드' },
    { value: 'metal', label: '🛡️ 메탈' },
    { value: 'none', label: '❌ 없음' },
];

export const LIGHTING_PRESETS = [
    {
        name: '☀️ 주간',
        settings: { lightingBrightness: 85, lightingIntensity: 70, lightingColorTemp: 50, ambientIntensity: 50 }
    },
    {
        name: '🌙 야간',
        settings: { lightingBrightness: 45, lightingIntensity: 50, lightingColorTemp: 70, ambientIntensity: 25 }
    },
    {
        name: '🏛️ 갤러리',
        settings: { lightingBrightness: 70, lightingIntensity: 60, lightingColorTemp: 55, ambientIntensity: 40 }
    },
    {
        name: '🎭 극적',
        settings: { lightingBrightness: 60, lightingIntensity: 80, lightingColorTemp: 35, ambientIntensity: 20 }
    },
];

export const PARTY_THEMES = [
    { value: 'none', label: '❌ 없음' },
    { value: 'elegant', label: '🥂 고급 파티' },
    { value: 'fun', label: '🎈 신나는 파티' },
];
