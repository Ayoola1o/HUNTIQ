import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { GeoScrapedBusiness } from '../../engine/geoScraperEngine';

interface MapLibreProspectingMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  radiusKm: number;
  businesses: GeoScrapedBusiness[];
  selectedBusinessId: string | null;
  selectedBusinessIds?: Set<string>;
  onSelectBusiness: (business: GeoScrapedBusiness) => void;
  onBoundsChange?: (bounds: { west: number; south: number; east: number; north: number }) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
}

export const MapLibreProspectingMap: React.FC<MapLibreProspectingMapProps> = ({
  center,
  zoom = 12,
  businesses,
  selectedBusinessId,
  selectedBusinessIds = new Set(),
  onSelectBusiness,
  onBoundsChange,
  onMapClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // 1. Initialize MapLibre GL Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Ultra-reliable, high-contrast Dark Matter basemap tiles via CartoDB / OpenStreetMap
    const cartoDarkStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://d.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
        }
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: cartoDarkStyle,
      center: [center.lng, center.lat],
      zoom,
      attributionControl: false
    });

    // Suppress individual tile network timeout glitches
    map.on('error', (e) => {
      if (e && (e as any).error?.status === 0) return;
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      map.resize();
      emitBounds();
    });

    const emitBounds = () => {
      if (!onBoundsChange) return;
      const b = map.getBounds();
      onBoundsChange({
        west: b.getWest(),
        south: b.getSouth(),
        east: b.getEast(),
        north: b.getNorth()
      });
    };

    map.on('moveend', emitBounds);
    map.on('zoomend', emitBounds);
    map.on('click', (e) => {
      onMapClick?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Pan to Center when props change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom: zoom || 12,
      essential: true
    });
  }, [center.lat, center.lng, zoom]);

  // 3. Render Custom HTML MapLibre Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    businesses.forEach((biz) => {
      const isSelected = biz.id === selectedBusinessId;
      const isChecked = selectedBusinessIds.has(biz.id);
      const gap = biz.digitalAudit?.gapScore || 50;

      // Determine Pin Color
      let pinColor = '#8b5cf6'; // Violet: Enterprise
      if (biz.targetType === 'LOCAL_COMMERCIAL') {
        if (gap >= 81) pinColor = '#e11d48'; // Red: Critical
        else if (gap >= 61) pinColor = '#ea580c'; // Orange: High
        else if (gap >= 41) pinColor = '#eab308'; // Yellow: Moderate
        else pinColor = '#10b981'; // Green: Optimized
      }

      // Marker Container
      const el = document.createElement('div');
      el.className = 'huntiq-map-marker';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
      el.style.transition = 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.zIndex = isSelected ? '999' : isChecked ? '500' : '10';

      // Badge Circle
      const badge = document.createElement('div');
      badge.style.width = isSelected ? '38px' : '30px';
      badge.style.height = isSelected ? '38px' : '30px';
      badge.style.borderRadius = '50%';
      badge.style.backgroundColor = isSelected ? pinColor : '#090d16';
      badge.style.border = `2.5px solid ${pinColor}`;
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.color = '#ffffff';
      badge.style.fontSize = '10.5px';
      badge.style.fontWeight = '900';
      badge.style.boxShadow = isSelected 
        ? `0 0 20px ${pinColor}, 0 4px 12px rgba(0,0,0,0.8)` 
        : gap >= 81 
        ? `0 0 12px ${pinColor}` 
        : '0 2px 8px rgba(0,0,0,0.6)';
      badge.innerText = `${biz.opportunityScore}`;

      // Label Tag
      const label = document.createElement('div');
      label.style.marginTop = '3px';
      label.style.backgroundColor = 'rgba(9, 13, 22, 0.92)';
      label.style.color = '#ffffff';
      label.style.fontSize = '9.5px';
      label.style.fontWeight = '700';
      label.style.padding = '2px 6px';
      label.style.borderRadius = '4px';
      label.style.border = isChecked ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.15)';
      label.style.whiteSpace = 'nowrap';
      label.style.boxShadow = '0 2px 4px rgba(0,0,0,0.4)';
      label.innerText = (isChecked ? '✓ ' : '') + (biz.name.split(' ')[0] || biz.name);

      el.appendChild(badge);
      el.appendChild(label);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectBusiness(biz);
        map.flyTo({ center: [biz.lng, biz.lat], zoom: 13, essential: true });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([biz.lng, biz.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [businesses, selectedBusinessId, selectedBusinessIds]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '420px', borderRadius: '12px', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '420px' }} />

      {/* Map Attribution & Tech Badge */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        backgroundColor: 'rgba(9, 13, 22, 0.88)',
        backdropFilter: 'blur(6px)',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '10px',
        color: '#94a3b8',
        fontWeight: 600,
        zIndex: 5,
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        MapLibre GL JS + OpenStreetMap / Geoapify Data
      </div>
    </div>
  );
};
