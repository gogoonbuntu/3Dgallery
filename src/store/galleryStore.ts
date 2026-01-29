import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FrameStyle =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'ornate'
  | 'thin'
  | 'thick'
  | 'shadow'
  | 'glass'
  | 'wood'
  | 'metal'
  | 'none';

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  description: string;
  year: string;
  imageUrl: string;
  wall: 'A' | 'B' | 'C';
  position: { x: number; y: number };
  frameStyle?: FrameStyle;
  frameColor?: string;
}

export interface GuestMessage {
  id: string;
  nickname: string;
  content: string;
  createdAt: Date;
  likes: number;
}

export interface GallerySettings {
  wallColor: string;
  wallPattern: 'none' | 'brick' | 'stripes' | 'grid' | 'dots' | 'chevron' | 'noise';
  floorTexture: 'wood' | 'marble' | 'concrete' | 'stone' | 'herringbone' | 'carpet';
  frameStyle: FrameStyle;
  artworksPerWall: number;
  // Lighting settings
  lightingBrightness: number;  // 0-100, overall brightness
  lightingIntensity: number;   // 0-100, light intensity/strength
  lightingColorTemp: number;   // 0-100, 0=cool(blue), 50=neutral, 100=warm(orange)
  ambientIntensity: number;    // 0-100, ambient light level
}

export type PlayerDesign = 'speaker' | 'lp';

export interface MusicSettings {
  isPlaying: boolean;
  volume: number;
  currentTrackIndex: number;
  playerDesign: PlayerDesign;
  youtubeUrl: string;
}

// Advertisement slot
export interface AdSlot {
  id: string;
  imageUrl: string;
  linkUrl: string;
  title: string;
  wall: 'A' | 'B' | 'C' | 'D';  // D = entrance wall
  position: { x: number; y: number };
  size: { width: number; height: number };
  isActive: boolean;
}

// Analytics for individual artwork
export interface ArtworkAnalytics {
  artworkId: string;
  clicks: number;
  totalViewTimeMs: number;
  lastViewed: string;
}

// Exhibition visitor statistics
export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  averageSessionMs: number;
  lastUpdated: string;
}
interface GalleryState {
  // Exhibition
  currentExhibitionCode: string;

  // Artworks
  artworks: Artwork[];
  selectedArtwork: Artwork | null;
  isCloseUpMode: boolean;

  // Guestbook
  guestMessages: GuestMessage[];
  isGuestbookOpen: boolean;

  // Ads
  adSlots: AdSlot[];

  // Analytics
  artworkAnalytics: ArtworkAnalytics[];
  visitorStats: VisitorStats;

  // UI
  showTouchGuide: boolean;
  showArtworkPanel: boolean;

  // Admin
  isAdmin: boolean;
  isAdminPanelOpen: boolean;
  gallerySettings: GallerySettings;
  musicSettings: MusicSettings;

  // Settings History (for undo)
  settingsHistory: Array<{ gallery: GallerySettings; music: MusicSettings }>;
  settingsHistoryIndex: number;

  // Exhibition Actions
  setExhibitionCode: (code: string) => void;

  // Actions
  selectArtwork: (artwork: Artwork | null) => void;
  enterCloseUpMode: () => void;
  exitCloseUpMode: () => void;
  addGuestMessage: (nickname: string, content: string) => void;
  removeGuestMessage: (id: string) => void;
  likeGuestMessage: (id: string) => void;
  toggleGuestbook: () => void;
  dismissTouchGuide: () => void;

  // Admin Actions
  setAdminMode: (isAdmin: boolean) => void;
  toggleAdminPanel: () => void;
  updateGallerySettings: (settings: Partial<GallerySettings>) => void;
  addArtwork: (artwork: Omit<Artwork, 'id'>) => void;
  removeArtwork: (id: string) => void;
  updateArtwork: (id: string, updates: Partial<Artwork>) => void;

  // Ad Actions
  addAdSlot: (ad: Omit<AdSlot, 'id'>) => void;
  removeAdSlot: (id: string) => void;
  updateAdSlot: (id: string, updates: Partial<AdSlot>) => void;

  // Analytics Actions
  trackArtworkClick: (artworkId: string) => void;
  trackArtworkView: (artworkId: string, durationMs: number) => void;
  incrementVisitorCount: () => void;

  // Music Actions
  toggleMusic: () => void;
  setVolume: (volume: number) => void;
  setTrack: (index: number) => void;
  setPlayerDesign: (design: PlayerDesign) => void;
  setYoutubeUrl: (url: string) => void;

  // Undo/Redo Actions
  undoSettings: () => void;
  redoSettings: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// Sample artworks
const sampleArtworks: Artwork[] = [
  {
    id: '1',
    title: '별이 빛나는 밤',
    artist: '김예술',
    description: '깊은 밤하늘의 별들이 반짝이는 순간을 담은 작품입니다.',
    year: '2024',
    imageUrl: 'https://picsum.photos/seed/art1/800/600',
    wall: 'A',
    position: { x: -3, y: 1.5 },
  },
  {
    id: '2',
    title: '도시의 황혼',
    artist: '이창작',
    description: '현대 도시의 일몰을 표현한 추상화입니다.',
    year: '2023',
    imageUrl: 'https://picsum.photos/seed/art2/600/800',
    wall: 'A',
    position: { x: 3, y: 1.5 },
  },
  {
    id: '3',
    title: '바다의 속삭임',
    artist: '박미술',
    description: '파도가 해변에 닿는 순간의 고요함을 담았습니다.',
    year: '2024',
    imageUrl: 'https://picsum.photos/seed/art3/800/500',
    wall: 'B',
    position: { x: -2, y: 1.5 },
  },
  {
    id: '4',
    title: '숲의 노래',
    artist: '최화가',
    description: '깊은 숲 속에서 들려오는 자연의 소리를 시각화했습니다.',
    year: '2023',
    imageUrl: 'https://picsum.photos/seed/art4/700/700',
    wall: 'B',
    position: { x: 2, y: 1.5 },
  },
  {
    id: '5',
    title: '시간의 흐름',
    artist: '정작가',
    description: '시간이 흐르는 것을 추상적으로 표현한 작품입니다.',
    year: '2024',
    imageUrl: 'https://picsum.photos/seed/art5/800/600',
    wall: 'C',
    position: { x: 0, y: 1.5 },
  },
];

// Sample guest messages
const sampleMessages: GuestMessage[] = [
  {
    id: '1',
    nickname: '관람객1',
    content: '정말 아름다운 전시였습니다!',
    createdAt: new Date('2024-01-10'),
    likes: 12,
  },
  {
    id: '2',
    nickname: '미술애호가',
    content: '작가님의 색감 사용이 인상적이네요.',
    createdAt: new Date('2024-01-11'),
    likes: 8,
  },
];

const defaultSettings: GallerySettings = {
  wallColor: '#f5f5f5',
  wallPattern: 'none',
  floorTexture: 'wood',
  frameStyle: 'classic',
  artworksPerWall: 2,
  // Default lighting settings (gallery standard)
  lightingBrightness: 70,
  lightingIntensity: 60,
  lightingColorTemp: 55,  // Slightly warm
  ambientIntensity: 40,
};

const defaultMusicSettings: MusicSettings = {
  isPlaying: false,
  volume: 0.5,
  currentTrackIndex: 0,
  playerDesign: 'speaker',
  youtubeUrl: '',
};

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set) => ({
      currentExhibitionCode: 'default',
      artworks: sampleArtworks,
      selectedArtwork: null,
      isCloseUpMode: false,
      guestMessages: sampleMessages,
      isGuestbookOpen: false,
      showTouchGuide: true,
      showArtworkPanel: false,
      isAdmin: false,
      isAdminPanelOpen: false,
      gallerySettings: defaultSettings,
      musicSettings: defaultMusicSettings,

      // Settings History (for undo - max 30 entries)
      settingsHistory: [],
      settingsHistoryIndex: -1,

      // Ads & Analytics initial state
      adSlots: [],
      artworkAnalytics: [],
      visitorStats: {
        totalVisits: 0,
        uniqueVisitors: 0,
        todayVisits: 0,
        averageSessionMs: 0,
        lastUpdated: new Date().toISOString(),
      },

      setExhibitionCode: (code) => set({ currentExhibitionCode: code }),

      selectArtwork: (artwork) =>
        set({ selectedArtwork: artwork, showArtworkPanel: artwork !== null }),

      enterCloseUpMode: () => set({ isCloseUpMode: true, showArtworkPanel: false }),

      exitCloseUpMode: () => set({ isCloseUpMode: false }),

      addGuestMessage: (nickname, content) =>
        set((state) => ({
          guestMessages: [
            ...state.guestMessages,
            {
              id: Date.now().toString(),
              nickname: nickname || '익명',
              content,
              createdAt: new Date(),
              likes: 0,
            },
          ],
        })),

      likeGuestMessage: (id) =>
        set((state) => ({
          guestMessages: state.guestMessages.map((m) =>
            m.id === id ? { ...m, likes: (m.likes || 0) + 1 } : m
          ),
        })),

      removeGuestMessage: (id) =>
        set((state) => ({
          guestMessages: state.guestMessages.filter((m) => m.id !== id),
        })),

      toggleGuestbook: () => set((state) => ({ isGuestbookOpen: !state.isGuestbookOpen })),

      dismissTouchGuide: () => set({ showTouchGuide: false }),

      // Admin Actions
      setAdminMode: (isAdmin) => set({ isAdmin }),

      toggleAdminPanel: () => set((state) => ({ isAdminPanelOpen: !state.isAdminPanelOpen })),

      updateGallerySettings: (settings) =>
        set((state) => {
          // Save current settings to history before updating (max 30 entries)
          const currentSnapshot = { gallery: state.gallerySettings, music: state.musicSettings };
          const newHistory = [
            ...state.settingsHistory.slice(0, state.settingsHistoryIndex + 1),
            currentSnapshot,
          ].slice(-30); // Keep only last 30 entries

          return {
            gallerySettings: { ...state.gallerySettings, ...settings },
            settingsHistory: newHistory,
            settingsHistoryIndex: newHistory.length - 1,
          };
        }),

      addArtwork: (artwork) =>
        set((state) => ({
          artworks: [
            ...state.artworks,
            { ...artwork, id: Date.now().toString() },
          ],
        })),

      removeArtwork: (id) =>
        set((state) => ({
          artworks: state.artworks.filter((a) => a.id !== id),
        })),

      updateArtwork: (id, updates) =>
        set((state) => ({
          artworks: state.artworks.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      // Ad Actions
      addAdSlot: (ad) =>
        set((state) => ({
          adSlots: [
            ...state.adSlots,
            { ...ad, id: Date.now().toString() },
          ],
        })),

      removeAdSlot: (id) =>
        set((state) => ({
          adSlots: state.adSlots.filter((a) => a.id !== id),
        })),

      updateAdSlot: (id, updates) =>
        set((state) => ({
          adSlots: state.adSlots.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      // Analytics Actions
      trackArtworkClick: (artworkId) =>
        set((state) => {
          const existing = state.artworkAnalytics.find(a => a.artworkId === artworkId);
          if (existing) {
            return {
              artworkAnalytics: state.artworkAnalytics.map(a =>
                a.artworkId === artworkId
                  ? { ...a, clicks: a.clicks + 1, lastViewed: new Date().toISOString() }
                  : a
              ),
            };
          }
          return {
            artworkAnalytics: [
              ...state.artworkAnalytics,
              { artworkId, clicks: 1, totalViewTimeMs: 0, lastViewed: new Date().toISOString() },
            ],
          };
        }),

      trackArtworkView: (artworkId, durationMs) =>
        set((state) => {
          const existing = state.artworkAnalytics.find(a => a.artworkId === artworkId);
          if (existing) {
            return {
              artworkAnalytics: state.artworkAnalytics.map(a =>
                a.artworkId === artworkId
                  ? { ...a, totalViewTimeMs: a.totalViewTimeMs + durationMs, lastViewed: new Date().toISOString() }
                  : a
              ),
            };
          }
          return {
            artworkAnalytics: [
              ...state.artworkAnalytics,
              { artworkId, clicks: 0, totalViewTimeMs: durationMs, lastViewed: new Date().toISOString() },
            ],
          };
        }),

      incrementVisitorCount: () =>
        set((state) => ({
          visitorStats: {
            ...state.visitorStats,
            totalVisits: state.visitorStats.totalVisits + 1,
            todayVisits: state.visitorStats.todayVisits + 1,
            lastUpdated: new Date().toISOString(),
          },
        })),

      // Music Actions
      toggleMusic: () =>
        set((state) => ({
          musicSettings: { ...state.musicSettings, isPlaying: !state.musicSettings.isPlaying },
        })),

      setVolume: (volume) =>
        set((state) => ({
          musicSettings: { ...state.musicSettings, volume },
        })),

      setTrack: (index) =>
        set((state) => ({
          musicSettings: { ...state.musicSettings, currentTrackIndex: index },
        })),

      setPlayerDesign: (design) =>
        set((state) => ({
          musicSettings: { ...state.musicSettings, playerDesign: design },
        })),

      setYoutubeUrl: (url) =>
        set((state) => ({
          musicSettings: { ...state.musicSettings, youtubeUrl: url },
        })),

      // Undo/Redo Actions
      undoSettings: () =>
        set((state) => {
          if (state.settingsHistoryIndex <= 0) return state;
          const newIndex = state.settingsHistoryIndex - 1;
          const prevSettings = state.settingsHistory[newIndex];
          return {
            settingsHistoryIndex: newIndex,
            gallerySettings: prevSettings.gallery,
            musicSettings: prevSettings.music,
          };
        }),

      redoSettings: () =>
        set((state) => {
          if (state.settingsHistoryIndex >= state.settingsHistory.length - 1) return state;
          const newIndex = state.settingsHistoryIndex + 1;
          const nextSettings = state.settingsHistory[newIndex];
          return {
            settingsHistoryIndex: newIndex,
            gallerySettings: nextSettings.gallery,
            musicSettings: nextSettings.music,
          };
        }),

      canUndo: (): boolean => {
        return useGalleryStore.getState().settingsHistoryIndex > 0;
      },

      canRedo: (): boolean => {
        const s = useGalleryStore.getState();
        return s.settingsHistoryIndex < s.settingsHistory.length - 1;
      },
    }),
    {
      name: 'gallery-storage',
      // Only persist minimal data that doesn't conflict with Firebase
      // Settings are managed by Firebase per exhibition, not localStorage
      partialize: (state) => ({
        showTouchGuide: state.showTouchGuide,
      }),
    }
  )
);
