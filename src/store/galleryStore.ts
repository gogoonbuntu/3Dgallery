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
  partyTheme: 'none' | 'elegant' | 'fun';
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

// Sample artworks — themed exhibition: "빛과 그림자의 경계"
const sampleArtworks: Artwork[] = [
  // Wall A — Front wall (3 artworks)
  {
    id: '1',
    title: '새벽의 여백',
    artist: '김서윤',
    description: '동이 트기 직전, 하늘과 바다의 경계가 사라지는 찰나를 담았습니다. 빛이 아직 닿지 않은 여백 속에서 고요한 서사가 시작됩니다.',
    year: '2024',
    imageUrl: 'https://picsum.photos/id/1039/800/600',
    wall: 'A',
    position: { x: -4.5, y: 1.6 },
    frameStyle: 'ornate',
  },
  {
    id: '2',
    title: '도시의 잔상',
    artist: '이한결',
    description: '네온사인이 꺼진 새벽 도시, 유리창에 남은 빛의 잔상을 추상적으로 표현한 작품입니다. 현대 도시인의 고독과 아름다움이 공존합니다.',
    year: '2024',
    imageUrl: 'https://picsum.photos/id/1040/600/800',
    wall: 'A',
    position: { x: 0, y: 1.6 },
    frameStyle: 'modern',
  },
  {
    id: '3',
    title: '고요한 파동',
    artist: '박지안',
    description: '호수 위에 떨어진 한 방울의 물이 만들어내는 동심원. 미세한 파동이 세상을 변화시키는 순간을 포착했습니다.',
    year: '2023',
    imageUrl: 'https://picsum.photos/id/1018/800/500',
    wall: 'A',
    position: { x: 4.5, y: 1.6 },
    frameStyle: 'glass',
  },
  // Wall B — Right wall (3 artworks)
  {
    id: '4',
    title: '별헤는 밤',
    artist: '김서윤',
    description: '도시를 벗어나 처음으로 올려다 본 밤하늘. 수만 개의 별 사이에서 자신의 존재를 되묻는 시간을 그렸습니다.',
    year: '2024',
    imageUrl: 'https://picsum.photos/id/1015/800/600',
    wall: 'B',
    position: { x: -4, y: 1.6 },
    frameStyle: 'shadow',
  },
  {
    id: '5',
    title: '숲의 기억',
    artist: '최예린',
    description: '어린 시절 뛰놀던 숲의 기억을 현재의 시선으로 재구성했습니다. 초록빛 사이로 스며드는 오후의 햇살이 따뜻한 향수를 불러일으킵니다.',
    year: '2023',
    imageUrl: 'https://picsum.photos/id/1029/700/800',
    wall: 'B',
    position: { x: 0, y: 1.6 },
    frameStyle: 'wood',
  },
  {
    id: '6',
    title: '시간의 결',
    artist: '이한결',
    description: '오래된 나무의 나이테처럼, 시간이 쌓여 만들어낸 결을 추상적으로 표현했습니다. 각 층위는 서로 다른 시간대의 감정을 품고 있습니다.',
    year: '2024',
    imageUrl: 'https://picsum.photos/id/1047/800/600',
    wall: 'B',
    position: { x: 4, y: 1.6 },
    frameStyle: 'metal',
  },
  // Wall C — Back wall (2 artworks)
  {
    id: '7',
    title: '빛의 무게',
    artist: '박지안',
    description: '빛에도 무게가 있다면, 그것은 우리가 감당해야 할 희망의 무게일 것입니다. 강렬한 색채로 빛의 물성을 탐구합니다.',
    year: '2024',
    imageUrl: 'https://picsum.photos/id/1059/800/700',
    wall: 'C',
    position: { x: -3, y: 1.6 },
    frameStyle: 'ornate',
  },
  {
    id: '8',
    title: '그림자 정원',
    artist: '최예린',
    description: '빛이 닿지 않는 곳에서도 생명은 자라납니다. 그림자 속에 숨겨진 정원의 아름다움을 섬세한 붓터치로 완성했습니다.',
    year: '2024',
    imageUrl: 'https://picsum.photos/id/1036/700/800',
    wall: 'C',
    position: { x: 3, y: 1.6 },
    frameStyle: 'classic',
  },
];

// Sample guest messages
const sampleMessages: GuestMessage[] = [
  {
    id: '1',
    nickname: '별빛산책',
    content: '"별헤는 밤" 앞에서 한참을 서 있었어요. 도시에서 잊고 살았던 밤하늘이 떠올라 눈물이 났습니다.',
    createdAt: new Date('2024-04-12'),
    likes: 24,
  },
  {
    id: '2',
    nickname: '미술과 커피',
    content: '3D 온라인 갤러리라서 기대 안 했는데... 와, 실제 갤러리에 온 것 같은 몰입감이에요. "새벽의 여백" 색감이 정말 압권입니다.',
    createdAt: new Date('2024-04-10'),
    likes: 18,
  },
  {
    id: '3',
    nickname: '대학원생A',
    content: '이한결 작가님 팬입니다. "도시의 잔상"에서 느껴지는 그 쓸쓸한 아름다움... 석사 논문 주제가 여기서 나올 것 같습니다.',
    createdAt: new Date('2024-04-08'),
    likes: 15,
  },
  {
    id: '4',
    nickname: '주말관람객',
    content: '아이와 함께 봤는데, 아이가 "숲의 기억" 보고 나무랑 놀고 싶다고 하네요 ☺️ 가족 관람에도 좋은 전시입니다.',
    createdAt: new Date('2024-04-05'),
    likes: 31,
  },
  {
    id: '5',
    nickname: '갤러리스트 K',
    content: '빛과 그림자라는 보편적 주제를 이렇게 다양한 매체와 시각으로 풀어낸 기획이 인상적입니다. 큐레이션이 훌륭해요.',
    createdAt: new Date('2024-04-03'),
    likes: 22,
  },
  {
    id: '6',
    nickname: '해외교포',
    content: '해외에서 한국 전시를 이렇게 편하게 볼 수 있다니 감동이에요. "그림자 정원"의 섬세한 붓터치가 화면으로도 느껴져요.',
    createdAt: new Date('2024-04-01'),
    likes: 27,
  },
];

const defaultSettings: GallerySettings = {
  wallColor: '#1a1a2e',
  wallPattern: 'none',
  floorTexture: 'marble',
  frameStyle: 'ornate',
  artworksPerWall: 3,
  // Default lighting settings (premium gallery)
  lightingBrightness: 65,
  lightingIntensity: 70,
  lightingColorTemp: 60,  // Warm, museum-like
  ambientIntensity: 30,
  partyTheme: 'none',
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
