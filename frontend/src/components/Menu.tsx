import { Language } from '../types';
import { t } from '../translations';
import './Menu.css';

interface MenuProps {
  onClose: () => void;
  onProfile: () => void;
  onLayers: () => void;
  onLogout: () => void;
  language: Language;
}

export default function Menu({ onClose, onProfile, onLayers, onLogout, language }: MenuProps) {
  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="menu-panel">
        <div className="menu-header">
          <h2>{t('menuTitle', language)}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="menu-items">
          <button className="menu-item" onClick={onProfile}>
            <span className="menu-icon">👤</span>
            <span>{t('myProfile', language)}</span>
          </button>

          <button className="menu-item" onClick={onLayers}>
            <span className="menu-icon">📁</span>
            <span>{t('layersOption', language)}</span>
          </button>

          <button className="menu-item" onClick={onLogout}>
            <span className="menu-icon">🚪</span>
            <span>{t('logout', language)}</span>
          </button>
        </div>
      </div>
    </>
  );
}
