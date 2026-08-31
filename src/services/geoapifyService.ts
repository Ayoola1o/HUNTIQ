import { GEO_LOCATION_PRESETS, MOCK_GEO_BUSINESSES } from '../data/mockGeoBusinesses';
import type { GeoScrapedBusiness } from '../engine/geoScraperEngine';

export interface GeocodedLocation {
  name: string;
  lat: number;
  lng: number;
  country?: string;
  zoom: number;
}

export class GeoapifyService {
  private getApiKey(): string {
    return (import.meta as any).env?.VITE_GEOAPIFY_API_KEY || '';
  }

  public isLiveApiAvailable(): boolean {
    return !!this.getApiKey();
  }

  // 1. Geocode Location Query (City, Address, Postcode)
  public async geocodeLocation(query: string): Promise<GeocodedLocation> {
    const cleanQuery = query.trim().toLowerCase();
    const apiKey = this.getApiKey();

    // Check presets first
    const preset = GEO_LOCATION_PRESETS.find(
      p => p.id.toLowerCase().includes(cleanQuery) || 
           p.name.toLowerCase().includes(cleanQuery) || 
           cleanQuery.includes(p.name.toLowerCase()) ||
           p.districts.some(d => d.toLowerCase().includes(cleanQuery))
    );

    if (preset) {
      return {
        name: preset.name,
        lat: preset.lat,
        lng: preset.lng,
        country: preset.country,
        zoom: preset.zoom
      };
    }

    if (!apiKey) {
      // Default to Lagos preset if no API key and no preset match
      return {
        name: query || 'Lagos Metropolitan Area',
        lat: 6.4541,
        lng: 3.4246,
        country: 'Nigeria',
        zoom: 12
      };
    }

    try {
      const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${apiKey}&limit=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Geocoding failed: ${res.statusText}`);
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.geometry.coordinates;
        return {
          name: feature.properties.formatted || feature.properties.name || query,
          lat,
          lng,
          country: feature.properties.country,
          zoom: 13
        };
      }
    } catch (err) {
      console.warn('Geoapify Geocoding API failed, using fallback:', err);
    }

    return {
      name: query,
      lat: 6.4541,
      lng: 3.4246,
      zoom: 12
    };
  }

  // 2. Discover Places in Viewport Bounds or Radius
  public async discoverPlacesInBounds(
    bounds: { west: number; south: number; east: number; north: number } | null,
    _center: { lat: number; lng: number },
    _radiusKm: number,
    category: string = 'All Industries',
    mode: 'ALL' | 'ENTERPRISE' | 'DIGITAL_GAP' = 'ALL'
  ): Promise<GeoScrapedBusiness[]> {
    // In prototype / demo mode, return matching businesses from MOCK_GEO_BUSINESSES
    let results = MOCK_GEO_BUSINESSES;

    // Filter by bounds if provided
    if (bounds) {
      const inBounds = results.filter(
        b => b.lng >= bounds.west && b.lng <= bounds.east && b.lat >= bounds.south && b.lat <= bounds.north
      );
      if (inBounds.length > 0) {
        results = inBounds;
      }
    }

    // Filter by Category
    if (category && category !== 'All Industries') {
      const filtered = results.filter(b => b.category.toLowerCase().includes(category.toLowerCase()));
      if (filtered.length > 0) results = filtered;
    }

    // Filter by Mode
    if (mode === 'ENTERPRISE') {
      results = results.filter(b => b.targetType === 'ENTERPRISE');
    } else if (mode === 'DIGITAL_GAP') {
      results = results.filter(b => b.digitalAudit.gapScore >= 50 || b.targetType === 'LOCAL_COMMERCIAL');
    }

    return results;
  }
}

export const geoapifyService = new GeoapifyService();
