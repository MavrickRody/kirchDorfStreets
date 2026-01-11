import { User, Language } from '../types';
import { t } from '../translations';
import './Header.css';

interface HeaderProps {
  user: User;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onMenuClick: () => void;
  onProfileClick: () => void;
  onUploadClick: () => void;
}

export default function Header({
  user,
  language,
  onLanguageChange,
  onMenuClick,
  onProfileClick,
  onUploadClick,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <button onClick={onMenuClick} className="icon-button">
          ☰
        </button>
        <div className="header-title">
          <span className="logo-icon">🚗</span>
          <h1>Hamburg ParkFinder</h1>
        </div>
      </div>

      <div className="header-right">
        <button
          className="icon-button upload-button"
          onClick={onUploadClick}
          title={t('uploadGeoJSON', language)}
        >
          📁 {t('uploadGeoJSON', language)}
        </button>

        <button
          className="icon-button"
          onClick={() => onLanguageChange(language === 'de' ? 'en' : 'de')}
        >
          🌐 {language.toUpperCase()}
        </button>

        <button onClick={onProfileClick} className="profile-button">
          <div className="profile-info">
            <span className="username">{user.username}</span>
            <span className="points">⭐ {user.points}</span>
          </div>
        </button>
      </div>
    </header>
  );
}
