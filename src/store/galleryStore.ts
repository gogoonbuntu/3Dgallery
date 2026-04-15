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

// Sample artworks — "거장들의 빛 — Light of the Masters"
// All images: Art Institute of Chicago — CC0 Public Domain via IIIF CDN
const AIC_IIIF = 'https://www.artic.edu/iiif/2';
const sampleArtworks: Artwork[] = [
  // Wall A — Front wall (3 artworks)
  {
    id: '1',
    title: '그랑드자트 섬의 일요일 오후',
    artist: 'Georges Seurat',
    description: '1884-1886년 작. 점묘법의 창시자 쇠라의 대표작. 수천 개의 점으로 이루어진 이 기념비적 작품은 빛의 과학적 분석을 예술로 승화시켰습니다. 시카고 미술관 소장.',
    year: '1884',
    imageUrl: `${AIC_IIIF}/2d484387-2509-5e8e-2c43-22f9981972eb/full/843,/0/default.jpg`,
    wall: 'A',
    position: { x: -4.5, y: 1.6 },
    frameStyle: 'ornate',
  },
  {
    id: '2',
    title: '아메리칸 고딕',
    artist: 'Grant Wood',
    description: '1930년 작. 미국 중서부 농촌의 근면한 정신을 상징하는 20세기 미국 미술의 아이콘. 삼지창을 든 농부와 딸의 초상은 미국 문화의 상징이 되었습니다. 시카고 미술관 소장.',
    year: '1930',
    imageUrl: `${AIC_IIIF}/b272df73-a965-ac37-4172-be4e99483637/full/843,/0/default.jpg`,
    wall: 'A',
    position: { x: 0, y: 1.6 },
    frameStyle: 'ornate',
  },
  {
    id: '3',
    title: '밤의 카페 (나이트호크)',
    artist: 'Edward Hopper',
    description: '1942년 작. 한밤중 도시 카페의 고독한 풍경. 형광등 아래 고립된 인물들은 현대 도시인의 소외와 고독을 상징합니다. 미국 리얼리즘의 걸작. 시카고 미술관 소장.',
    year: '1942',
    imageUrl: `${AIC_IIIF}/831a05de-d3f6-f4fa-a460-23008dd58dda/full/843,/0/default.jpg`,
    wall: 'A',
    position: { x: 4.5, y: 1.6 },
    frameStyle: 'ornate',
  },
  // Wall B — Right wall (3 artworks)
  {
    id: '4',
    title: '가나가와 해변의 높은 파도 아래',
    artist: '가쓰시카 호쿠사이',
    description: '1831년 작. 일본 우키요에 판화의 최고 걸작. 역동적인 파도와 후지산의 대비가 동서양 미술에 깊은 영향을 끼쳤습니다. 시카고 미술관 소장.',
    year: '1831',
    imageUrl: `${AIC_IIIF}/b3974542-b9b4-7568-fc4b-966738f61d78/full/843,/0/default.jpg`,
    wall: 'B',
    position: { x: -4, y: 1.6 },
    frameStyle: 'ornate',
  },
  {
    id: '5',
    title: '수련 (Water Lilies)',
    artist: 'Claude Monet',
    description: '1906년 작. 모네의 지베르니 정원 연못을 그린 연작 중 하나. 물 위에 떠다니는 수련과 반영되는 하늘이 빛과 색의 인상주의적 교향곡을 이룹니다. 시카고 미술관 소장.',
    year: '1906',
    imageUrl: `${AIC_IIIF}/3c27b499-af56-f0d5-93b5-a7f2f1ad5813/full/843,/0/default.jpg`,
    wall: 'B',
    position: { x: 0, y: 1.6 },
    frameStyle: 'ornate',
  },
  {
    id: '6',
    title: '금 사슬을 한 노인',
    artist: 'Rembrandt van Rijn',
    description: '1631년경 작. 바로크 시대 초상화의 정수. 극적인 명암 대비(키아로스쿠로)와 세밀한 텍스처 표현이 렘브란트의 천재성을 보여줍니다. 시카고 미술관 소장.',
    year: '1631',
    imageUrl: `${AIC_IIIF}/3eaab3a3-2b47-9fdd-121c-050f6b8d9ccb/full/843,/0/default.jpg`,
    wall: 'B',
    position: { x: 4, y: 1.6 },
    frameStyle: 'ornate',
  },
  // Wall C — Back wall (2 artworks)
  {
    id: '7',
    title: '반 고흐의 침실',
    artist: 'Vincent van Gogh',
    description: '1889년 작. 아를의 노란 집에 있는 자신의 침실을 그린 작품. 강렬한 색채와 왜곡된 원근법이 작가의 내면 세계를 반영합니다. 시카고 미술관 소장.',
    year: '1889',
    imageUrl: `${AIC_IIIF}/6644829f-f292-c5c4-a73c-0356a6fdbf0d/full/843,/0/default.jpg`,
    wall: 'C',
    position: { x: -3, y: 1.6 },
    frameStyle: 'ornate',
  },
  {
    id: '8',
    title: '반 고흐 자화상',
    artist: 'Vincent van Gogh',
    description: '1887년 작. 파리 시절의 자화상. 인상주의와 점묘법의 영향이 보이는 과도기적 작품으로, 후기 인상주의로 향하는 반 고흐의 예술적 여정을 보여줍니다. 시카고 미술관 소장.',
    year: '1887',
    imageUrl: `${AIC_IIIF}/47c5bcb8-62ef-e5d7-55e7-f5121f409a30/full/843,/0/default.jpg`,
    wall: 'C',
    position: { x: 3, y: 1.6 },
    frameStyle: 'ornate',
  },
];

// Sample guest messages
const sampleMessages: GuestMessage[] = [
  {
    id: '1',
    nickname: '별빛산책',
    content: '별이 빛나는 밤 앞에서 한참을 서 있었어요. 반 고흐가 병원에서 이 밤하늘을 바라보며 무슨 생각을 했을까... 가슴이 먹먹합니다.',
    createdAt: new Date('2024-04-12'),
    likes: 24,
  },
  {
    id: '2',
    nickname: '미술과 커피',
    content: '3D 온라인 갤러리에서 모나리자를 볼 줄이야! 실제 루브르 가기 전 예습으로 딱이에요. 액자 디테일까지 재현된 게 놀랍습니다.',
    createdAt: new Date('2024-04-10'),
    likes: 18,
  },
  {
    id: '3',
    nickname: '대학원생A',
    content: '호쿠사이의 파도와 모네의 인상을 나란히 볼 수 있는 큐레이션이 인상적이에요. 동서양의 빛에 대한 해석 차이가 한눈에 보입니다.',
    createdAt: new Date('2024-04-08'),
    likes: 15,
  },
  {
    id: '4',
    nickname: '주말관람객',
    content: '아이와 함께 봤는데, 비너스의 탄생 보고 "엄마 이 언니 왜 조개에서 나와?" 라고 물어봐서 그리스 신화 수업이 됐어요 😊',
    createdAt: new Date('2024-04-05'),
    likes: 31,
  },
  {
    id: '5',
    nickname: '갤러리스트 K',
    content: '르네상스에서 인상주의까지 500년 미술사를 한 공간에서 경험할 수 있는 큐레이션이 훌륭합니다. 렘브란트 야경의 스케일이 압도적.',
    createdAt: new Date('2024-04-03'),
    likes: 22,
  },
  {
    id: '6',
    nickname: '해외교포',
    content: '해외에서 이런 수준의 명화들을 편하게 감상할 수 있다니 감동이에요. 진주 귀걸이 소녀의 눈빛이 화면을 통해서도 전해집니다.',
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
