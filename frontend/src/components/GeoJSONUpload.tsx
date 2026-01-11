import { useState, useRef } from 'react';
import { Language } from '../types';
import { t } from '../translations';
import './GeoJSONUpload.css';

interface GeoJSONUploadProps {
  onClose: () => void;
  onUpload: (file: File) => void;
  language: Language;
}

export default function GeoJSONUpload({ onClose, onUpload, language }: GeoJSONUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
      onUpload(file);
    } else {
      alert(language === 'de' ? 'Bitte nur .geojson oder .json Dateien hochladen' : 'Please upload only .geojson or .json files');
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-panel">
        <div className="modal-header">
          <h2>{t('uploadGeoJSONTitle', language)}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="upload-content">
          <div
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".geojson,.json"
              onChange={handleChange}
              style={{ display: 'none' }}
            />

            <div className="upload-icon">📁</div>
            <p className="upload-text">{t('dragDropText', language)}</p>
            <p className="upload-subtext">{t('fileType', language)}</p>
          </div>

          <div className="upload-tips">
            <h3>{t('uploadTips', language)}</h3>
            <ul>
              <li>{t('tip1', language)}</li>
              <li>{t('tip2', language)}</li>
              <li>{t('tip3', language)}</li>
            </ul>
          </div>

          <div className="example-geojson">
            <h4>Example GeoJSON:</h4>
            <pre>{`{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[10.018, 53.484], ...]]
      },
      "properties": {
        "name": "Kirchdorfer Straße",
        "type": "paid",
        "price": "1.50€/h",
        "hours": "Mo-Sa 8:00-20:00"
      }
    }
  ]
}`}</pre>
          </div>
        </div>
      </div>
    </>
  );
}
