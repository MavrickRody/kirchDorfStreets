export interface User {
  id: string;
  username: string;
  email?: string;
  points: number;
  level: string;
  parkingCount: number;
  currentParkingSpot?: string;
}

export interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  type: 'free' | 'paid' | 'resident' | 'disabled';
  price?: string;
  hours?: string;
  available: boolean;
  lastUpdated: Date;
  occupiedBy?: string;
  rating?: number;
  capacity?: number;
}

export interface GeoJSONLayer {
  id: string;
  name: string;
  data: any;
  visible: boolean;
  featureCount: number;
}

export type Language = 'de' | 'en';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
}
