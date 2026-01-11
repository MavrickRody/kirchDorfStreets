import { User, Language } from '../types';
import { t } from '../translations';
import './Profile.css';

interface ProfileProps {
  user: User;
  onClose: () => void;
  language: Language;
}

export default function Profile({ user, onClose, language }: ProfileProps) {
  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-panel">
        <div className="modal-header">
          <h2>{t('profile', language)}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>

          <h2 className="profile-name">{user.username}</h2>

          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-value">{user.points}</div>
                <div className="stat-label">{t('points', language)}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <div className="stat-value">{user.level}</div>
                <div className="stat-label">{t('level', language)}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🚗</div>
              <div className="stat-info">
                <div className="stat-value">{user.parkingCount}</div>
                <div className="stat-label">{t('totalParkingSessions', language)}</div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>{t('currentlyParked', language)}</h3>
            <p className="parking-status">
              {user.currentParkingSpot ? (
                <span className="status-parked">✅ {t('currentlyParked', language)}</span>
              ) : (
                <span className="status-not-parked">❌ {t('notParked', language)}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
