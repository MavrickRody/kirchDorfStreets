import { ParkingSpot, Language } from '../types';
import { t } from '../translations';
import './ParkingList.css';

interface ParkingListProps {
  parkingSpots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSpotSelect: (spot: ParkingSpot) => void;
  onParkHere: (spotId: string) => void;
  onLeave: (spotId: string) => void;
  onReport: (spotId: string, isFree: boolean) => void;
  language: Language;
  currentUserId?: string;
  currentParkingSpot?: string;
}

export default function ParkingList({
  parkingSpots,
  selectedSpot,
  onSpotSelect,
  onParkHere,
  onLeave,
  onReport,
  language,
  currentUserId,
  currentParkingSpot,
}: ParkingListProps) {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return t('justNow', language);
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t('minutesAgo', language, minutes);
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('hoursAgo', language, hours);
    const days = Math.floor(hours / 24);
    return t('daysAgo', language, days);
  };

  const availableSpots = parkingSpots.filter(spot => spot.available);

  return (
    <div className="parking-list">
      <div className="parking-list-header">
        <h2>{t('parkingSpots', language)}</h2>
        <div className="stats">
          <span className="stat-badge stat-available">
            {availableSpots.length} {t('available', language)}
          </span>
          <span className="stat-badge stat-total">{parkingSpots.length} Total</span>
        </div>
      </div>

      <div className="spots-container">
        {parkingSpots.map(spot => (
          <div
            key={spot.id}
            className={`spot-card ${selectedSpot?.id === spot.id ? 'selected' : ''} ${
              !spot.available ? 'unavailable' : ''
            }`}
            onClick={() => onSpotSelect(spot)}
          >
            <div className="spot-icon">{getTypeIcon(spot.type)}</div>

            <div className="spot-info">
              <h3>{spot.name}</h3>
              <p className="spot-address">{spot.address}</p>

              <div className="spot-details">
                <span className={`status-badge ${spot.available ? 'status-available' : 'status-occupied'}`}>
                  {spot.available ? t('available', language) : t('occupied', language)}
                </span>
                <span className="type-badge">{t(spot.type, language)}</span>
                {spot.price && <span className="price-badge">{spot.price}</span>}
              </div>

              <p className="last-updated">{getTimeAgo(spot.lastUpdated)}</p>
            </div>

            {selectedSpot?.id === spot.id && (
              <div className="spot-actions">
                {currentParkingSpot === spot.id ? (
                  <button className="btn-danger" onClick={(e) => {
                    e.stopPropagation();
                    onLeave(spot.id);
                  }}>
                    {t('leave', language)}
                  </button>
                ) : spot.available && !currentParkingSpot ? (
                  <button className="btn-primary" onClick={(e) => {
                    e.stopPropagation();
                    onParkHere(spot.id);
                  }}>
                    {t('parkHere', language)}
                  </button>
                ) : null}

                {currentParkingSpot !== spot.id && (
                  <div className="report-buttons">
                    <button
                      className="btn-report"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReport(spot.id, true);
                      }}
                    >
                      {t('reportFree', language)}
                    </button>
                    <button
                      className="btn-report"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReport(spot.id, false);
                      }}
                    >
                      {t('reportOccupied', language)}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'paid':
      return '💰';
    case 'disabled':
      return '♿';
    case 'resident':
      return '🏠';
    case 'free':
    default:
      return '🅿️';
  }
}
