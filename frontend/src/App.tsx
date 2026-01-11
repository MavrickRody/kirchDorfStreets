import { useState, useEffect } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import Map from './components/Map';
import ParkingList from './components/ParkingList';
import Menu from './components/Menu';
import Profile from './components/Profile';
import GeoJSONUpload from './components/GeoJSONUpload';
import LayerManagement from './components/LayerManagement';
import Notifications from './components/Notifications';
import { User, ParkingSpot, GeoJSONLayer, Language, Notification } from './types';
import './App.css';

// Sample parking spots for Kirchdorf-Süd area (1km radius around 53.484574, 10.018416)
const initialParkingSpots: ParkingSpot[] = [
  {
    id: '1',
    name: 'Kirchdorfer Straße 45',
    address: 'Kirchdorfer Straße 45, 21109 Hamburg',
    coordinates: [53.4851, 10.0189],
    type: 'free',
    available: true,
    lastUpdated: new Date(),
  },
  {
    id: '2',
    name: 'Höpenstraße Parkplatz',
    address: 'Höpenstraße 20, 21109 Hamburg',
    coordinates: [53.4838, 10.0170],
    type: 'paid',
    price: '1.50€/h',
    hours: 'Mo-Sa 8:00-20:00',
    available: true,
    lastUpdated: new Date(),
  },
  {
    id: '3',
    name: 'Am Neuengammer Stichkanal',
    address: 'Am Neuengammer Stichkanal, 21109 Hamburg',
    coordinates: [53.4829, 10.0195],
    type: 'free',
    available: false,
    lastUpdated: new Date(),
  },
  {
    id: '4',
    name: 'Kirchdorfer Damm 12',
    address: 'Kirchdorfer Damm 12, 21109 Hamburg',
    coordinates: [53.4863, 10.0175],
    type: 'resident',
    available: true,
    lastUpdated: new Date(),
  },
  {
    id: '5',
    name: 'Behindertenparkplatz Mengestraße',
    address: 'Mengestraße 15, 21109 Hamburg',
    coordinates: [53.4842, 10.0203],
    type: 'disabled',
    available: true,
    lastUpdated: new Date(),
  },
  {
    id: '6',
    name: 'Rotenhäuser Damm Parkplatz',
    address: 'Rotenhäuser Damm 30, 21109 Hamburg',
    coordinates: [53.4825, 10.0167],
    type: 'paid',
    price: '2.00€/h',
    hours: 'Mo-So 0:00-24:00',
    available: true,
    lastUpdated: new Date(),
  },
  {
    id: '7',
    name: 'Veringstraße 22',
    address: 'Veringstraße 22, 21109 Hamburg',
    coordinates: [53.4855, 10.0210],
    type: 'free',
    available: true,
    lastUpdated: new Date(),
  },
  {
    id: '8',
    name: 'Dratelnstraße Parkplatz',
    address: 'Dratelnstraße 8, 21109 Hamburg',
    coordinates: [53.4870, 10.0192],
    type: 'free',
    available: false,
    lastUpdated: new Date(),
  },
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('de');
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>(initialParkingSpots);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [geoJSONLayers, setGeoJSONLayers] = useState<GeoJSONLayer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleLogin = (username: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      points: 120,
      level: 'Community Helper',
      parkingCount: 45,
    };
    setUser(newUser);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setShowMenu(false);
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  };

  const handleParkHere = (spotId: string) => {
    if (!user) return;

    const spot = parkingSpots.find(s => s.id === spotId);
    if (!spot || !spot.available) return;

    setParkingSpots(prev =>
      prev.map(s =>
        s.id === spotId
          ? { ...s, available: false, occupiedBy: user.id, lastUpdated: new Date() }
          : s
      )
    );

    setUser(prev => prev ? {
      ...prev,
      points: prev.points + 5,
      parkingCount: prev.parkingCount + 1,
      currentParkingSpot: spotId,
    } : null);

    addNotification(language === 'de' ? 'Erfolgreich eingeparkt! +5 Punkte' : 'Successfully parked! +5 Points');
    setSelectedSpot(null);
  };

  const handleLeave = (spotId: string) => {
    if (!user) return;

    setParkingSpots(prev =>
      prev.map(s =>
        s.id === spotId
          ? { ...s, available: true, occupiedBy: undefined, lastUpdated: new Date() }
          : s
      )
    );

    setUser(prev => prev ? {
      ...prev,
      points: prev.points + 10,
      currentParkingSpot: undefined,
    } : null);

    addNotification(language === 'de' ? 'Parkplatz verlassen! +10 Punkte' : 'Left parking spot! +10 Points');
    setSelectedSpot(null);
  };

  const handleReport = (spotId: string, isFree: boolean) => {
    if (!user) return;

    setParkingSpots(prev =>
      prev.map(s =>
        s.id === spotId
          ? { ...s, available: isFree, lastUpdated: new Date() }
          : s
      )
    );

    setUser(prev => prev ? { ...prev, points: prev.points + 3 } : null);
    addNotification(language === 'de' ? 'Status gemeldet! +3 Punkte' : 'Status reported! +3 Points');
  };

  const handleUploadGeoJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geoJSON = JSON.parse(e.target?.result as string);
        const layer: GeoJSONLayer = {
          id: Date.now().toString(),
          name: file.name,
          data: geoJSON,
          visible: true,
          featureCount: geoJSON.features?.length || 0,
        };
        setGeoJSONLayers(prev => [...prev, layer]);
        addNotification(language === 'de' ? 'GeoJSON erfolgreich hochgeladen' : 'GeoJSON uploaded successfully');
        setShowUpload(false);
      } catch (error) {
        addNotification(language === 'de' ? 'Fehler beim Laden der Datei' : 'Error loading file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const toggleLayerVisibility = (layerId: string) => {
    setGeoJSONLayers(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const removeLayer = (layerId: string) => {
    setGeoJSONLayers(prev => prev.filter(layer => layer.id !== layerId));
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} language={language} onLanguageChange={setLanguage} />;
  }

  return (
    <div className="app">
      <Header
        user={user!}
        language={language}
        onLanguageChange={setLanguage}
        onMenuClick={() => setShowMenu(true)}
        onProfileClick={() => setShowProfile(true)}
        onUploadClick={() => setShowUpload(true)}
      />

      <div className="main-content">
        <div className="map-container">
          <Map
            parkingSpots={parkingSpots}
            selectedSpot={selectedSpot}
            onSpotSelect={setSelectedSpot}
            language={language}
            geoJSONLayers={geoJSONLayers}
            userLocation={user?.currentParkingSpot}
          />
        </div>

        <ParkingList
          parkingSpots={parkingSpots}
          selectedSpot={selectedSpot}
          onSpotSelect={setSelectedSpot}
          onParkHere={handleParkHere}
          onLeave={handleLeave}
          onReport={handleReport}
          language={language}
          currentUserId={user?.id}
          currentParkingSpot={user?.currentParkingSpot}
        />
      </div>

      {showMenu && (
        <Menu
          onClose={() => setShowMenu(false)}
          onProfile={() => {
            setShowMenu(false);
            setShowProfile(true);
          }}
          onLayers={() => {
            setShowMenu(false);
            setShowLayers(true);
          }}
          onLogout={handleLogout}
          language={language}
        />
      )}

      {showProfile && user && (
        <Profile
          user={user}
          onClose={() => setShowProfile(false)}
          language={language}
        />
      )}

      {showUpload && (
        <GeoJSONUpload
          onClose={() => setShowUpload(false)}
          onUpload={handleUploadGeoJSON}
          language={language}
        />
      )}

      {showLayers && (
        <LayerManagement
          layers={geoJSONLayers}
          onClose={() => setShowLayers(false)}
          onToggleVisibility={toggleLayerVisibility}
          onRemove={removeLayer}
          language={language}
        />
      )}

      <Notifications notifications={notifications} />
    </div>
  );
}

export default App;
