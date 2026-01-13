import { useMultiplayerStore } from '../../store/multiplayerStore';
import './PlayerCount.css';

export function PlayerCount() {
    const { players, isConnected } = useMultiplayerStore();

    const playerCount = Object.keys(players).length;

    if (!isConnected) return null;

    return (
        <div className="player-count">
            <span className="player-count-icon">👥</span>
            <span className="player-count-text">
                {playerCount}명 접속 중
            </span>
            <span className="player-count-dot"></span>
        </div>
    );
}
