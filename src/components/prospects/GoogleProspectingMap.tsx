import React, { useEffect, useRef, useState } from 'react';
import type { GeoScrapedBusiness } from '../../engine/geoScraperEngine';

interface GoogleProspectingMapProps {
  apiKey?: string;
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
  onSelectBusiness
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
    if (!activeApiKey) {
      return;
    }

    if ((window as any).google?.maps) {
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.onload = () => setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${activeApiKey}&libraries=places,marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      setLoadError(null);
    };
    script.onerror = () => {
      setLoadError('Failed to load Google Maps Platform API. Please verify the API key.');
    };

    document.head.appendChild(script);
  }, [activeApiKey]);

  // 2. Initialize Map Instance
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !(window as any).google?.maps) return;

    try {
      const google = (window as any).google;
      const map = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom: radiusKm <= 10 ? 13 : radiusKm <= 25 ? 12 : 11,
        styles: DARK_MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        mapId: 'HUNTIQ_RADAR_MAP_ID'
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
  }, [isLoaded, center, radiusKm]);

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
      const isSelected = biz.id === selectedBusinessId;
      const gap = biz.digitalAudit?.gapScore || 50;

      // Determine Pin Color
      let pinColor = '#8b5cf6'; // Violet: Enterprise
      if (biz.targetType === 'LOCAL_COMMERCIAL') {
        if (gap >= 81) pinColor = '#e11d48'; // Red: Critical
        else if (gap >= 61) pinColor = '#ea580c'; // Orange: High
        else if (gap >= 41) pinColor = '#eab308'; // Yellow: Moderate
        else pinColor = '#10b981'; // Green: Optimized
      }

      // Create Custom HTML Marker Element
      const pinContainer = document.createElement('div');
      pinContainer.style.cursor = 'pointer';
      pinContainer.style.display = 'flex';
      pinContainer.style.flexDirection = 'column';
      pinContainer.style.alignItems = 'center';
      pinContainer.style.transition = 'all 0.2s ease';
      pinContainer.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
      pinContainer.style.zIndex = isSelected ? '999' : '10';

      const badge = document.createElement('div');
      badge.style.width = isSelected ? '38px' : '28px';
      badge.style.height = isSelected ? '38px' : '28px';
      badge.style.borderRadius = '50%';
      badge.style.backgroundColor = isSelected ? pinColor : '#0f172a';
      badge.style.border = `2px solid ${pinColor}`;
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.color = '#ffffff';
      badge.style.fontSize = '10.5px';
      badge.style.fontWeight = '900';
      badge.style.boxShadow = isSelected ? `0 0 16px ${pinColor}` : '0 2px 6px rgba(0,0,0,0.6)';
      badge.innerText = `${biz.opportunityScore}`;

      const label = document.createElement('div');
      label.style.marginTop = '3px';
      label.style.backgroundColor = 'rgba(9, 13, 22, 0.9)';
      label.style.color = '#ffffff';
      label.style.fontSize = '9.5px';
      label.style.fontWeight = '700';
      label.style.padding = '2px 5px';
      label.style.borderRadius = '4px';
      label.style.border = '1px solid rgba(255, 255, 255, 0.15)';
      label.style.whiteSpace = 'nowrap';
      label.innerText = biz.name.split(' ')[0] || biz.name;

      pinContainer.appendChild(badge);
      pinContainer.appendChild(label);

      pinContainer.addEventListener('click', () => {
        onSelectBusiness(biz);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat: biz.lat, lng: biz.lng });
        }
      });

      // Use AdvancedMarkerElement if available, else classic Marker
      if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: { lat: biz.lat, lng: biz.lng },
          title: biz.name,
          content: pinContainer
        });
        markersRef.current.push(marker);
      } else {
        // Fallback classic Marker
        const marker = new google.maps.Marker({
          map: mapInstanceRef.current,
          position: { lat: biz.lat, lng: biz.lng },
          title: biz.name
        });
        marker.addListener('click', () => onSelectBusiness(biz));
        markersRef.current.push(marker);
      }
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
