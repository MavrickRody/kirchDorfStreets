export const translations = {
  de: {
    // Login
    loginTitle: 'Hamburg ParkFinder',
    loginSubtitle: 'Kirchdorf-Süd',
    username: 'Benutzername',
    password: 'Passwort',
    login: 'Anmelden',

    // Header
    menu: 'Menü',
    profile: 'Profil',
    uploadGeoJSON: 'GeoJSON',

    // Profile
    points: 'Punkte',
    level: 'Level',
    totalParkingSessions: 'Parkplätze genutzt',
    currentlyParked: 'Aktuell geparkt',
    notParked: 'Nicht geparkt',

    // Map
    mapPlaceholder: 'Karte wird geladen...',
    findMyLocation: 'Mein Standort',

    // Parking spots
    availableSpots: 'Verfügbare Parkplätze',
    parkingSpots: 'Parkplätze',
    available: 'Verfügbar',
    occupied: 'Belegt',
    parkHere: 'Hier parken',
    leave: 'Verlassen',
    reportFree: 'Als frei melden',
    reportOccupied: 'Als belegt melden',

    // Parking types
    free: 'Kostenlos',
    paid: 'Kostenpflichtig',
    resident: 'Bewohnerparken',
    disabled: 'Behindertenparkplatz',

    // Spot details
    spotDetails: 'Parkplatz Details',
    address: 'Adresse',
    type: 'Typ',
    price: 'Preis',
    hours: 'Öffnungszeiten',
    capacity: 'Kapazität',
    rating: 'Bewertung',
    lastUpdated: 'Zuletzt aktualisiert',

    // Actions
    close: 'Schließen',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    upload: 'Hochladen',
    remove: 'Entfernen',
    logout: 'Abmelden',

    // Notifications
    parkedSuccess: 'Erfolgreich eingeparkt! +5 Punkte',
    leftSuccess: 'Parkplatz verlassen! +10 Punkte',
    reportedSuccess: 'Status gemeldet! +3 Punkte',
    uploadSuccess: 'GeoJSON erfolgreich hochgeladen',
    error: 'Ein Fehler ist aufgetreten',

    // GeoJSON Upload
    uploadGeoJSONTitle: 'GeoJSON Hochladen',
    dragDropText: 'Datei hierher ziehen oder klicken zum Auswählen',
    fileType: 'Nur .geojson oder .json Dateien',
    uploadTips: 'Tipps:',
    tip1: 'GeoJSON sollte Parkplatzdaten enthalten',
    tip2: 'Unterstützt Polygone (Zonen) und Punkte (einzelne Plätze)',
    tip3: 'Eigenschaften: type, name, price, hours, capacity',

    // Layer Management
    layers: 'Ebenen',
    layerManagement: 'Ebenen-Verwaltung',
    noLayers: 'Keine Ebenen hochgeladen',
    features: 'Merkmale',
    toggleVisibility: 'Sichtbarkeit umschalten',
    removeLayer: 'Ebene entfernen',

    // Menu
    menuTitle: 'Menü',
    myProfile: 'Mein Profil',
    layersOption: 'Ebenen verwalten',
    settings: 'Einstellungen',
    help: 'Hilfe',
    about: 'Über',

    // Time
    justNow: 'Gerade eben',
    minutesAgo: 'vor {0} Min.',
    hoursAgo: 'vor {0} Std.',
    daysAgo: 'vor {0} Tagen',
  },
  en: {
    // Login
    loginTitle: 'Hamburg ParkFinder',
    loginSubtitle: 'Kirchdorf-Süd',
    username: 'Username',
    password: 'Password',
    login: 'Sign In',

    // Header
    menu: 'Menu',
    profile: 'Profile',
    uploadGeoJSON: 'GeoJSON',

    // Profile
    points: 'Points',
    level: 'Level',
    totalParkingSessions: 'Parking Sessions',
    currentlyParked: 'Currently Parked',
    notParked: 'Not Parked',

    // Map
    mapPlaceholder: 'Loading map...',
    findMyLocation: 'My Location',

    // Parking spots
    availableSpots: 'Available Parking',
    parkingSpots: 'Parking Spots',
    available: 'Available',
    occupied: 'Occupied',
    parkHere: 'Park Here',
    leave: 'Leave',
    reportFree: 'Report as Free',
    reportOccupied: 'Report as Occupied',

    // Parking types
    free: 'Free',
    paid: 'Paid',
    resident: 'Resident Only',
    disabled: 'Disabled Parking',

    // Spot details
    spotDetails: 'Parking Spot Details',
    address: 'Address',
    type: 'Type',
    price: 'Price',
    hours: 'Hours',
    capacity: 'Capacity',
    rating: 'Rating',
    lastUpdated: 'Last Updated',

    // Actions
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    upload: 'Upload',
    remove: 'Remove',
    logout: 'Logout',

    // Notifications
    parkedSuccess: 'Successfully parked! +5 Points',
    leftSuccess: 'Left parking spot! +10 Points',
    reportedSuccess: 'Status reported! +3 Points',
    uploadSuccess: 'GeoJSON uploaded successfully',
    error: 'An error occurred',

    // GeoJSON Upload
    uploadGeoJSONTitle: 'Upload GeoJSON',
    dragDropText: 'Drag & drop file here or click to select',
    fileType: 'Only .geojson or .json files',
    uploadTips: 'Tips:',
    tip1: 'GeoJSON should contain parking data',
    tip2: 'Supports Polygons (zones) and Points (individual spots)',
    tip3: 'Properties: type, name, price, hours, capacity',

    // Layer Management
    layers: 'Layers',
    layerManagement: 'Layer Management',
    noLayers: 'No layers uploaded',
    features: 'features',
    toggleVisibility: 'Toggle visibility',
    removeLayer: 'Remove layer',

    // Menu
    menuTitle: 'Menu',
    myProfile: 'My Profile',
    layersOption: 'Manage Layers',
    settings: 'Settings',
    help: 'Help',
    about: 'About',

    // Time
    justNow: 'Just now',
    minutesAgo: '{0} minutes ago',
    hoursAgo: '{0} hours ago',
    daysAgo: '{0} days ago',
  }
};

export function t(key: string, lang: 'de' | 'en', ...args: any[]): string {
  let text = translations[lang][key as keyof typeof translations.de] || key;
  args.forEach((arg, i) => {
    text = text.replace(`{${i}}`, arg);
  });
  return text;
}
