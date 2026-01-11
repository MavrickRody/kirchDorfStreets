import { useState } from 'react';
import { Language } from '../types';
import { t } from '../translations';
import './Login.css';

interface LoginProps {
  onLogin: (username: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Login({ onLogin, language, onLanguageChange }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="login-container">
      <button
        className="language-toggle"
        onClick={() => onLanguageChange(language === 'de' ? 'en' : 'de')}
      >
        🌐 {language.toUpperCase()}
      </button>

      <div className="login-box">
        <div className="login-header">
          <div className="logo">🚗</div>
          <h1>{t('loginTitle', language)}</h1>
          <p>{t('loginSubtitle', language)}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>{t('username', language)}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('username', language)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('password', language)}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password', language)}
              required
            />
          </div>

          <button type="submit" className="btn-primary login-button">
            {t('login', language)}
          </button>
        </form>

        <div className="login-info">
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '20px' }}>
            {language === 'de'
              ? 'Demo: Beliebigen Benutzernamen eingeben'
              : 'Demo: Enter any username'}
          </p>
        </div>
      </div>
    </div>
  );
}
