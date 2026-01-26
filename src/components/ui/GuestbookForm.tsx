import { useState, useEffect } from 'react';
import { useGalleryStore } from '../../store/galleryStore';
import './GuestbookForm.css';

// Simple profanity filter
const badWords = ['욕설1', '욕설2', '비속어'];
const filterProfanity = (text: string) => {
    let filtered = text;
    badWords.forEach((word) => {
        filtered = filtered.replace(new RegExp(word, 'gi'), '***');
    });
    return filtered;
};

// Local storage key for like cooldowns
const LIKE_COOLDOWN_KEY = 'guestbook_like_cooldowns';
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export function GuestbookForm() {
    const { isGuestbookOpen, toggleGuestbook, addGuestMessage, guestMessages, likeGuestMessage } = useGalleryStore();
    const [nickname, setNickname] = useState('');
    const [content, setContent] = useState('');
    const [likeCooldowns, setLikeCooldowns] = useState<Record<string, number>>({});

    // Load cooldowns from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(LIKE_COOLDOWN_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Clean up expired cooldowns
            const now = Date.now();
            const cleaned: Record<string, number> = {};
            Object.entries(parsed).forEach(([id, time]) => {
                if ((time as number) > now) {
                    cleaned[id] = time as number;
                }
            });
            setLikeCooldowns(cleaned);
            localStorage.setItem(LIKE_COOLDOWN_KEY, JSON.stringify(cleaned));
        }
    }, []);

    if (!isGuestbookOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim().length === 0) return;
        if (content.length > 200) {
            alert('소감은 200자 이내로 작성해주세요.');
            return;
        }

        addGuestMessage(nickname.trim(), filterProfanity(content.trim()));
        setNickname('');
        setContent('');
    };

    const handleLike = (id: string) => {
        const now = Date.now();
        const cooldownEnd = likeCooldowns[id];

        if (cooldownEnd && cooldownEnd > now) {
            const remainingMs = cooldownEnd - now;
            const remainingMin = Math.ceil(remainingMs / 60000);
            alert(`${remainingMin}분 후에 다시 좋아요할 수 있습니다.`);
            return;
        }

        likeGuestMessage(id);

        // Set cooldown
        const newCooldowns = { ...likeCooldowns, [id]: now + COOLDOWN_MS };
        setLikeCooldowns(newCooldowns);
        localStorage.setItem(LIKE_COOLDOWN_KEY, JSON.stringify(newCooldowns));
    };

    const isOnCooldown = (id: string): boolean => {
        const cooldownEnd = likeCooldowns[id];
        return Boolean(cooldownEnd && cooldownEnd > Date.now());
    };

    // Sort messages: top 4 by likes, rest by date
    const sortedByLikes = [...guestMessages].sort((a, b) => b.likes - a.likes);
    const topMessages = sortedByLikes.slice(0, 4).filter(m => m.likes > 0);
    const topMessageIds = new Set(topMessages.map(m => m.id));
    const recentMessages = [...guestMessages]
        .filter(m => !topMessageIds.has(m.id))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);

    return (
        <div className="guestbook-overlay">
            <div className="guestbook-modal">
                <button className="close-btn" onClick={toggleGuestbook}>
                    ×
                </button>
                <h2>방명록</h2>

                {/* Top Liked Messages */}
                {topMessages.length > 0 && (
                    <div className="top-messages-section">
                        <h3 className="section-title">🏆 인기 소감</h3>
                        <div className="top-messages-grid">
                            {topMessages.map((msg) => (
                                <div key={msg.id} className="top-message-card">
                                    <p className="message-content">"{msg.content}"</p>
                                    <div className="message-footer">
                                        <span className="message-nickname">{msg.nickname}</span>
                                        <button
                                            className={`like-btn ${isOnCooldown(msg.id) ? 'cooldown' : ''}`}
                                            onClick={() => handleLike(msg.id)}
                                            disabled={isOnCooldown(msg.id)}
                                        >
                                            ❤️ {msg.likes}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Messages */}
                <div className="recent-messages-section">
                    <h3 className="section-title">📝 최근 소감</h3>
                    <div className="messages-list">
                        {recentMessages.length === 0 && topMessages.length === 0 ? (
                            <p className="empty-message">아직 남겨진 소감이 없습니다.</p>
                        ) : recentMessages.length === 0 ? (
                            <p className="empty-message">모든 소감이 인기 섹션에 있습니다.</p>
                        ) : (
                            recentMessages.map((msg) => (
                                <div key={msg.id} className="message-item">
                                    <div className="message-main">
                                        <p className="message-content-small">"{msg.content}"</p>
                                        <button
                                            className={`like-btn-small ${isOnCooldown(msg.id) ? 'cooldown' : ''}`}
                                            onClick={() => handleLike(msg.id)}
                                            disabled={isOnCooldown(msg.id)}
                                        >
                                            ❤️ {msg.likes}
                                        </button>
                                    </div>
                                    <div className="message-meta">
                                        <span className="message-nickname">{msg.nickname}</span>
                                        <span className="message-date">
                                            {new Date(msg.createdAt).toLocaleDateString('ko-KR')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="guestbook-form">
                    <input
                        type="text"
                        placeholder="닉네임 (선택)"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        maxLength={20}
                    />
                    <textarea
                        placeholder="소감을 남겨주세요..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={200}
                        required
                    />
                    <div className="char-count">{content.length}/200</div>
                    <button type="submit">남기기</button>
                </form>
            </div>
        </div>
    );
}
