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

    // Create exhibition form
    const [newTitle, setNewTitle] = useState('');
    const [newHostEmail, setNewHostEmail] = useState('');
    const [creating, setCreating] = useState(false);
    const [createdCode, setCreatedCode] = useState<string | null>(null);

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user && user.email) {
                const authorized = await isSuperAdmin(user.email);
                setIsAuthorized(authorized);
                if (authorized) {
                    loadExhibitions();
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

    const handleLogout = async () => {
        await signOut(auth);
        setIsAuthorized(false);
    };

    const handleCreateExhibition = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newHostEmail.trim()) {
            alert('전시회 제목과 호스트 이메일을 입력해주세요.');
            return;
        }

        setCreating(true);
        try {
            const code = await createExhibition(newTitle.trim(), newHostEmail.trim());
            setCreatedCode(code);
            setNewTitle('');
            setNewHostEmail('');
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
                                접속 URL: <code>{window.location.origin}/{createdCode}</code>
                            </p>
                            <button
                                className="visit-btn"
                                onClick={() => navigate(`/${createdCode}`)}
                            >
                                전시회 방문 →
                            </button>
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
