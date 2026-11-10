import { loadGoogleMaps } from '../../services/googleMaps';
import React, { useEffect, useRef, useState } from 'react';
import type { GeoScrapedBusiness } from '../../engine/geoScraperEngine';

interface GoogleProspectingMapProps {
  apiKey?: string;
  zoom?: number;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onMapClick?: (point: { lat: number; lng: number }) => void;
  center: { lat: number; lng: number };
  radiusKm: number;
  businesses: GeoScrapedBusiness[];
  selectedBusinessId: string | null;
  onSelectBusiness: (business: GeoScrapedBusiness) => void;
}

// Sleek modern dark mode map styles
const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#131e2b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1f293d' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#162030' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#312e81' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e1b4b' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e0e7ff' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }]
  }
];

export const GoogleProspectingMap: React.FC<GoogleProspectingMapProps> = ({
  apiKey,
  center,
  radiusKm,
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  zoom,
  onBoundsChange,
  onMapClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(() => Boolean(typeof window !== 'undefined' && (window as any).google?.maps));
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeApiKey = apiKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const effectiveError = !activeApiKey
    ? 'No Google Maps API Key provided. Enter key above or set VITE_GOOGLE_MAPS_API_KEY.'
    : loadError;

  // 1. Dynamic Google Maps Script Loader
  useEffect(() => {
    if (!activeApiKey) return;
    let mounted = true;
    loadGoogleMaps(activeApiKey).then(() => {
      if (mounted) { setIsLoaded(true); setLoadError(null); }
    }).catch(err => {
      if (mounted) setLoadError(err.message);
    });
    return () => { mounted = false; };
  }, [activeApiKey]);

  // 2. Initialize Map Instance
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !(window as any).google?.maps) return;

    try {
      const google = (window as any).google;
      const map = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom: zoom ?? (radiusKm <= 10 ? 13 : radiusKm <= 25 ? 12 : 11),
        styles: DARK_MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
      });

      mapInstanceRef.current = map;

      // Draw Radius Circle
      const circle = new google.maps.Circle({
        strokeColor: '#6366f1',
        strokeOpacity: 0.8,
        strokeWeight: 1.5,
        fillColor: '#4f46e5',
        fillOpacity: 0.12,
        map,
        center,
        radius: radiusKm * 1000
      });
      circleRef.current = circle;
    } catch (err) {
      console.error('Error initializing Google Map:', err);
    }
  }, [isLoaded, center, radiusKm, zoom]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const idle = map.addListener('idle', () => {
      const bounds = map.getBounds();
      if (bounds) onBoundsChange?.(bounds.toJSON());
    });
    const click = map.addListener('click', (event: any) => {
      if (event.latLng) onMapClick?.(event.latLng.toJSON());
    });
    return () => { idle.remove(); click.remove(); };
  }, [isLoaded, center, radiusKm, zoom, onBoundsChange, onMapClick]);

  // 3. Update Radius Circle
  useEffect(() => {
    if (circleRef.current && (window as any).google?.maps) {
      circleRef.current.setRadius(radiusKm * 1000);
      circleRef.current.setCenter(center);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(center);
    }
  }, [center, radiusKm]);

  // 4. Render Advanced Markers for Businesses
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !(window as any).google?.maps) return;

    const google = (window as any).google;

    // Clear existing markers
    markersRef.current.forEach(m => {
      if (m.setMap) m.setMap(null);
      if (m.map) m.map = null;
    });
    markersRef.current = [];

    businesses.forEach((biz) => {
      const marker = new google.maps.Marker({
        map: mapInstanceRef.current,
        position: { lat: biz.lat, lng: biz.lng },
        title: biz.name,
        zIndex: biz.id === selectedBusinessId ? 2 : 1
      });
      marker.addListener('click', () => onSelectBusiness(biz));
      markersRef.current.push(marker);
    });
  }, [isLoaded, businesses, selectedBusinessId, onSelectBusiness]);

  if (effectiveError) {
    return (
      <div style={{
        height: '100%',
        minHeight: '400px',
        backgroundColor: '#090d16',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px'
        }}>
          🗺️
        </div>
        <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 6px 0' }}>
          Google Maps Key Required
        </h4>
        <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '360px', margin: 0 }}>
          {effectiveError}
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px', borderRadius: '12px', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />

      {/* Attribution Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(6px)',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '10px',
        color: '#94a3b8',
        fontWeight: 600,
        zIndex: 5
      }}>
        Google Maps Platform + HUNTIQ Audit Intelligence
      </div>
    </div>
  );
};
