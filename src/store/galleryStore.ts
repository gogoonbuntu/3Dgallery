import { create } from 'zustand';

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  description: string;
  year: string;
  imageUrl: string;
  wall: 'A' | 'B' | 'C';
  position: { x: number; y: number };
}

export interface GuestMessage {
  id: string;
  nickname: string;
  content: string;
  createdAt: Date;
}

interface GalleryState {
  // Artworks
  artworks: Artwork[];
  selectedArtwork: Artwork | null;
  isCloseUpMode: boolean;
  
  // Guestbook
  guestMessages: GuestMessage[];
  isGuestbookOpen: boolean;
  
  // UI
  showTouchGuide: boolean;
  showArtworkPanel: boolean;
  
  // Actions
  selectArtwork: (artwork: Artwork | null) => void;
  enterCloseUpMode: () => void;
  exitCloseUpMode: () => void;
  addGuestMessage: (nickname: string, content: string) => void;
  toggleGuestbook: () => void;
  dismissTouchGuide: () => void;
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
  },
  {
    id: '2',
    nickname: '미술애호가',
    content: '작가님의 색감 사용이 인상적이네요.',
    createdAt: new Date('2024-01-11'),
  },
];

export const useGalleryStore = create<GalleryState>((set) => ({
  artworks: sampleArtworks,
  selectedArtwork: null,
  isCloseUpMode: false,
  guestMessages: sampleMessages,
  isGuestbookOpen: false,
  showTouchGuide: true,
  showArtworkPanel: false,

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
        },
      ],
    })),

  toggleGuestbook: () => set((state) => ({ isGuestbookOpen: !state.isGuestbookOpen })),

  dismissTouchGuide: () => set({ showTouchGuide: false }),
}));
