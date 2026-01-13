import { useState } from 'react';
import { useGalleryStore } from '../../store/galleryStore';
import './AdminAuth.css';

// Simple password - in production, use environment variable or proper auth
const ADMIN_PASSWORD = 'gallery2024';

export function AdminAuth() {
    const { isAdmin, setAdminMode, toggleAdminPanel } = useGalleryStore();
    const [showLogin, setShowLogin] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setAdminMode(true);
            setShowLogin(false);
            setPassword('');
            setError('');
            toggleAdminPanel();
        } else {
            setError('비밀번호가 올바르지 않습니다');
        }
    };

    const handleLogout = () => {
        setAdminMode(false);
        useGalleryStore.getState().isAdminPanelOpen && toggleAdminPanel();
    };

    if (isAdmin) {
        return (
            <div className="admin-controls">
                <button className="admin-btn settings" onClick={toggleAdminPanel}>
                    ⚙️ 설정
                </button>
                <button className="admin-btn logout" onClick={handleLogout}>
                    로그아웃
                </button>
            </div>
        );
    }

    return (
        <>
            <button className="admin-login-trigger" onClick={() => setShowLogin(true)}>
                🔐
            </button>

            {showLogin && (
                <div className="admin-login-overlay" onClick={() => setShowLogin(false)}>
                    <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>관리자 로그인</h2>
                        <form onSubmit={handleLogin}>
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                            />
                            {error && <p className="error">{error}</p>}
                            <div className="login-actions">
                                <button type="button" onClick={() => setShowLogin(false)}>
                                    취소
                                </button>
                                <button type="submit">로그인</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
