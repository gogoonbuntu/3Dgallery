import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    auth,
    isSuperAdmin,
    createExhibition,
    getAllExhibitions,
    deleteExhibition,
    type ExhibitionMeta
} from '../../lib/firebase';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth';
import './SuperAdminPanel.css';

export function SuperAdminPanel() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [exhibitions, setExhibitions] = useState<ExhibitionMeta[]>([]);

    // Login form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);

    // Create exhibition form
    const [newTitle, setNewTitle] = useState('');
    const [newHostEmail, setNewHostEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [creating, setCreating] = useState(false);
    const [createdCode, setCreatedCode] = useState<string | null>(null);
    const [createdPassword, setCreatedPassword] = useState<string | null>(null);
    const [createdInviteToken, setCreatedInviteToken] = useState<string | null>(null);

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user && user.email) {
                try {
                    const authorized = await isSuperAdmin(user.email);
                    setIsAuthorized(authorized);
                    if (authorized) {
                        loadExhibitions();
                    }
                } catch (error) {
                    console.error('Failed to check super admin status:', error);
                    setIsAuthorized(false);
                }
            } else {
                setIsAuthorized(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loadExhibitions = async () => {
        try {
            const list = await getAllExhibitions();
            setExhibitions(list.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (error) {
            console.error('Failed to load exhibitions:', error);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: unknown) {
            setLoginError('로그인 실패: 이메일 또는 비밀번호를 확인하세요');
        }
    };

    const handleGoogleLogin = async () => {
        setLoginError('');
        setGoogleLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: unknown) {
            const firebaseError = error as { code?: string };
            if (firebaseError.code === 'auth/popup-closed-by-user') {
                // User closed popup, no error
            } else if (firebaseError.code === 'auth/unauthorized-domain') {
                setLoginError('이 도메인은 Firebase에서 승인되지 않았습니다. Firebase Console → Authentication → Settings → Authorized domains에서 도메인을 추가하세요.');
            } else {
                setLoginError('Google 로그인 실패. 다시 시도해주세요.');
                console.error('Google login error:', error);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setIsAuthorized(false);
    };

    const handleCreateExhibition = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newHostEmail.trim() || !newAdminPassword.trim()) {
            alert('전시회 제목, 호스트 이메일, 관리자 비밀번호를 모두 입력해주세요.');
            return;
        }

        if (newAdminPassword.length < 4) {
            alert('관리자 비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }

        setCreating(true);
        try {
            const code = await createExhibition(newTitle.trim(), newHostEmail.trim(), newAdminPassword);

            // Get the invite token from the created exhibition
            const { getExhibitionMeta } = await import('../../lib/firebase');
            const meta = await getExhibitionMeta(code);

            setCreatedCode(code);
            setCreatedPassword(newAdminPassword);
            setCreatedInviteToken(meta?.inviteToken || null);
            setNewTitle('');
            setNewHostEmail('');
            setNewAdminPassword('');
            loadExhibitions();
        } catch (error) {
            console.error('Failed to create exhibition:', error);
            alert('전시회 생성 실패');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteExhibition = async (code: string) => {
        if (!confirm(`정말 "${code}" 전시회를 삭제하시겠습니까?`)) return;

        try {
            await deleteExhibition(code);
            loadExhibitions();
        } catch (error) {
            console.error('Failed to delete exhibition:', error);
            alert('전시회 삭제 실패');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('클립보드에 복사되었습니다!');
    };

    if (loading) {
        return (
            <div className="super-admin-page">
                <div className="super-admin-loading">로딩 중...</div>
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return (
            <div className="super-admin-page">
                <div className="super-admin-container">
                    <div className="super-admin-header">
                        <h1>🔐 서비스 관리자</h1>
                        <p>Super Admin 계정으로 로그인하세요</p>
                    </div>

                    <form onSubmit={handleLogin} className="super-admin-login-form">
                        <input
                            type="email"
                            placeholder="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {loginError && <p className="error-message">{loginError}</p>}
                        <button type="submit">로그인</button>
                    </form>

                    <div className="login-divider">
                        <span>또는</span>
                    </div>

                    <button
                        className="google-login-btn"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {googleLoading ? '로그인 중...' : 'Google로 로그인'}
                    </button>
                </div>
            </div>
        );
    }

    // Logged in but not authorized
    if (!isAuthorized) {
        return (
            <div className="super-admin-page">
                <div className="super-admin-container">
                    <div className="super-admin-header">
                        <h1>⛔ 접근 권한 없음</h1>
                        <p>Super Admin 권한이 없는 계정입니다.</p>
                        <p className="email-display">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">로그아웃</button>
                </div>
            </div>
        );
    }

    // Authorized Super Admin
    return (
        <div className="super-admin-page">
            <div className="super-admin-container wide">
                <div className="super-admin-header">
                    <div className="header-left">
                        <h1>🏛️ 전시회 관리</h1>
                        <p className="email-display">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">로그아웃</button>
                </div>

                {/* Create Exhibition */}
                <section className="create-section">
                    <h2>➕ 새 전시회 생성</h2>
                    <form onSubmit={handleCreateExhibition} className="create-form">
                        <input
                            type="text"
                            placeholder="전시회 제목"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="호스트 이메일"
                            value={newHostEmail}
                            onChange={(e) => setNewHostEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="관리자 비밀번호 (4자 이상)"
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            required
                            minLength={4}
                        />
                        <button type="submit" disabled={creating}>
                            {creating ? '생성 중...' : '전시회 생성'}
                        </button>
                    </form>

                    {createdCode && (
                        <div className="created-success">
                            <p>✅ 전시회가 생성되었습니다!</p>
                            <div className="code-display">
                                <span className="code">{createdCode}</span>
                                <button onClick={() => copyToClipboard(createdCode)}>복사</button>
                            </div>
                            <p className="url-hint">
                                방문자 URL: <code>{window.location.origin}/{createdCode}</code>
                            </p>
                            {createdInviteToken && (
                                <div className="invite-section">
                                    <p className="invite-hint">
                                        🔗 <strong>관리자 초대 링크</strong> (7일간 유효, 1회용):
                                    </p>
                                    <div className="invite-url-box">
                                        <code>{window.location.origin}/{createdCode}?invite={createdInviteToken}</code>
                                        <button onClick={() => copyToClipboard(`${window.location.origin}/${createdCode}?invite=${createdInviteToken}`)}>
                                            복사
                                        </button>
                                    </div>
                                    <p className="invite-note">
                                        ⚠️ 이 링크를 호스트에게 전달해주세요. 호스트가 링크를 클릭하면<br />
                                        초기 설정 마법사가 시작되고 관리자 권한이 부여됩니다.
                                    </p>
                                </div>
                            )}
                            {createdPassword && (
                                <p className="password-hint">
                                    🔐 관리자 비밀번호: <code>{createdPassword}</code>
                                </p>
                            )}
                            <div className="created-actions">
                                <button
                                    className="visit-btn"
                                    onClick={() => navigate(`/${createdCode}`)}
                                >
                                    전시회 방문 →
                                </button>
                                {createdInviteToken && (
                                    <button
                                        className="setup-btn"
                                        onClick={() => navigate(`/${createdCode}?invite=${createdInviteToken}`)}
                                    >
                                        ⚙️ 전시회 설정하러 가기
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Exhibitions List */}
                <section className="exhibitions-section">
                    <h2>📋 전시회 목록 ({exhibitions.length}개)</h2>
                    {exhibitions.length === 0 ? (
                        <p className="empty-message">등록된 전시회가 없습니다.</p>
                    ) : (
                        <div className="exhibitions-list">
                            {exhibitions.map((ex) => (
                                <div key={ex.code} className="exhibition-card">
                                    <div className="exhibition-info">
                                        <h3>{ex.title}</h3>
                                        <div className="exhibition-meta">
                                            <span className="code-badge">{ex.code}</span>
                                            <span className="host-email">{ex.hostEmail}</span>
                                        </div>
                                        <span className="created-date">
                                            {new Date(ex.createdAt).toLocaleDateString('ko-KR')}
                                        </span>
                                    </div>
                                    <div className="exhibition-actions">
                                        <button
                                            className="visit-btn"
                                            onClick={() => navigate(`/${ex.code}`)}
                                        >
                                            방문
                                        </button>
                                        <button
                                            className="copy-btn"
                                            onClick={() => copyToClipboard(`${window.location.origin}/${ex.code}`)}
                                        >
                                            URL 복사
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteExhibition(ex.code)}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
