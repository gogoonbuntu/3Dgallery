import { useState } from 'react';
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

export function GuestbookForm() {
    const { isGuestbookOpen, toggleGuestbook, addGuestMessage, guestMessages } = useGalleryStore();
    const [nickname, setNickname] = useState('');
    const [content, setContent] = useState('');

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

    return (
        <div className="guestbook-overlay">
            <div className="guestbook-modal">
                <button className="close-btn" onClick={toggleGuestbook}>
                    ×
                </button>
                <h2>방명록</h2>

                <div className="messages-list">
                    {guestMessages.length === 0 ? (
                        <p className="empty-message">아직 남겨진 소감이 없습니다.</p>
                    ) : (
                        guestMessages.slice().reverse().map((msg) => (
                            <div key={msg.id} className="message-item">
                                <p className="message-content">"{msg.content}"</p>
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
