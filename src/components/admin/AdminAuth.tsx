import { useState } from 'react';
import { useGalleryStore } from '../../store/galleryStore';
import { verifyExhibitionPassword } from '../../lib/firebase';
import './AdminAuth.css';

export function AdminAuth() {
    const { isAdmin, setAdminMode, toggleAdminPanel, currentExhibitionCode } = useGalleryStore();
    const [showLogin, setShowLogin] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const isValid = await verifyExhibitionPassword(currentExhibitionCode, password);
            if (isValid) {
                setAdminMode(true);
                setShowLogin(false);
                setPassword('');
                setError('');
                toggleAdminPanel();
            } else {
                setError('비밀번호가 올바르지 않습니다');
            }
        } catch (err) {
            console.error('Password verification error:', err);
            setError('인증 중 오류가 발생했습니다');
        } finally {
            setIsLoading(false);
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
                                disabled={isLoading}
                            />
                            {error && <p className="error">{error}</p>}
                            <div className="login-actions">
                                <button type="button" onClick={() => setShowLogin(false)} disabled={isLoading}>
                                    취소
                                </button>
                                <button type="submit" disabled={isLoading}>
                                    {isLoading ? '확인 중...' : '로그인'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

