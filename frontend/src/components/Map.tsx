import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ParkingSpot, Language, GeoJSONLayer } from '../types';
import { t } from '../translations';
import './Map.css';

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapProps {
  parkingSpots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSpotSelect: (spot: ParkingSpot) => void;
  language: Language;
  geoJSONLayers: GeoJSONLayer[];
  userLocation?: string;
}

export default function Map({
  parkingSpots,
  selectedSpot,
  onSpotSelect,
  language,
  geoJSONLayers,
  userLocation,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const geoJSONLayersRef = useRef<L.GeoJSON[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on Kirchdorf-Süd, Hamburg (1km radius)
    const map = L.map(mapContainerRef.current).setView([53.484574, 10.018416], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add location button
    const locationButton = L.Control.extend({
      onAdd: () => {
        const btn = L.DomUtil.create('button', 'location-button');
        btn.innerHTML = '📍';
        btn.title = t('findMyLocation', language);
        btn.onclick = () => {
          map.locate({ setView: true, maxZoom: 16 });
        };
        return btn;
      },
    });

    new locationButton({ position: 'bottomright' }).addTo(map);

    // Handle location found
    map.on('locationfound', (e) => {
      L.circle(e.latlng, {
        radius: 50,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
      }).addTo(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update parking spot markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    parkingSpots.forEach(spot => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-pin ${spot.available ? 'marker-available' : 'marker-occupied'} ${
          spot.id === selectedSpot?.id ? 'marker-selected' : ''
        }">
            <span class="marker-icon">${getMarkerIcon(spot.type)}</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker(spot.coordinates, { icon })
        .addTo(mapRef.current!)
        .on('click', () => onSpotSelect(spot));

      const popupContent = `
        <div class="map-popup">
          <h3>${spot.name}</h3>
          <p><strong>${t('type', language)}:</strong> ${t(spot.type, language)}</p>
          ${spot.price ? `<p><strong>${t('price', language)}:</strong> ${spot.price}</p>` : ''}
          <p><strong>${t('available', language)}:</strong> ${
        spot.available ? '✅ ' + t('available', language) : '❌ ' + t('occupied', language)
      }</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });
  }, [parkingSpots, selectedSpot, language]);

  // Update GeoJSON layers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing GeoJSON layers
    geoJSONLayersRef.current.forEach(layer => layer.remove());
    geoJSONLayersRef.current = [];

    // Add new GeoJSON layers
    geoJSONLayers.forEach(layerData => {
      if (!layerData.visible) return;

      const geoJSONLayer = L.geoJSON(layerData.data, {
        style: (feature) => {
          const type = feature?.properties?.type || feature?.properties?.parking_type || 'free';
          return getZoneStyle(type);
        },
        pointToLayer: (feature, latlng) => {
          const type = feature.properties?.type || 'free';
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div class="marker-pin marker-available">
                <span class="marker-icon">${getMarkerIcon(type)}</span>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          });
          return L.marker(latlng, { icon });
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties || {};
          const popupContent = `
            <div class="map-popup">
              <h3>${props.name || 'Parking Zone'}</h3>
              ${props.type ? `<p><strong>${t('type', language)}:</strong> ${t(props.type, language)}</p>` : ''}
              ${props.price ? `<p><strong>${t('price', language)}:</strong> ${props.price}</p>` : ''}
              ${props.hours ? `<p><strong>${t('hours', language)}:</strong> ${props.hours}</p>` : ''}
              ${props.capacity ? `<p><strong>${t('capacity', language)}:</strong> ${props.capacity}</p>` : ''}
            </div>
          `;
          layer.bindPopup(popupContent);
        },
      }).addTo(mapRef.current!);

      geoJSONLayersRef.current.push(geoJSONLayer);

      // Fit bounds to GeoJSON if it's the first layer
      if (geoJSONLayers.length === 1 && layerData.visible) {
        mapRef.current!.fitBounds(geoJSONLayer.getBounds());
      }
    });
  }, [geoJSONLayers, language]);

  // Zoom to selected spot
  useEffect(() => {
    if (selectedSpot && mapRef.current) {
      mapRef.current.setView(selectedSpot.coordinates, 17, { animate: true });
    }
  }, [selectedSpot]);

  return <div ref={mapContainerRef} className="map" />;
}

function getMarkerIcon(type: string): string {
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

function getZoneStyle(type: string) {
  switch (type) {
    case 'paid':
      return { fillColor: '#fbbf24', color: '#f59e0b', weight: 2, opacity: 1, fillOpacity: 0.3 };
    case 'resident':
      return { fillColor: '#3b82f6', color: '#2563eb', weight: 2, opacity: 1, fillOpacity: 0.3 };
    case 'disabled':
      return { fillColor: '#8b5cf6', color: '#7c3aed', weight: 2, opacity: 1, fillOpacity: 0.3 };
    case 'free':
    default:
      return { fillColor: '#10b981', color: '#059669', weight: 2, opacity: 1, fillOpacity: 0.3 };
  }
}
