import { GeoJSONLayer, Language } from '../types';
import { t } from '../translations';
import './LayerManagement.css';

interface LayerManagementProps {
  layers: GeoJSONLayer[];
  onClose: () => void;
  onToggleVisibility: (layerId: string) => void;
  onRemove: (layerId: string) => void;
  language: Language;
}

export default function LayerManagement({
  layers,
  onClose,
  onToggleVisibility,
  onRemove,
  language,
}: LayerManagementProps) {
  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-panel">
        <div className="modal-header">
          <h2>{t('layerManagement', language)}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="layers-content">
          {layers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <p>{t('noLayers', language)}</p>
            </div>
          ) : (
            <div className="layers-list">
              {layers.map(layer => (
                <div key={layer.id} className="layer-card">
                  <div className="layer-info">
                    <h3>{layer.name}</h3>
                    <p>
                      {layer.featureCount} {t('features', language)}
                    </p>
                  </div>

                  <div className="layer-actions">
                    <button
                      className={`icon-button ${layer.visible ? 'active' : ''}`}
                      onClick={() => onToggleVisibility(layer.id)}
                      title={t('toggleVisibility', language)}
                    >
                      {layer.visible ? '👁️' : '👁️‍🗨️'}
                    </button>

                    <button
                      className="icon-button danger"
                      onClick={() => onRemove(layer.id)}
                      title={t('removeLayer', language)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
