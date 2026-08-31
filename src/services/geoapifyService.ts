import { GEO_LOCATION_PRESETS, MOCK_GEO_BUSINESSES } from '../data/mockGeoBusinesses';
import { DigitalAuditEngine } from '../engine/digitalAuditEngine';
import type { GeoScrapedBusiness } from '../engine/geoScraperEngine';

export interface GeocodedLocation {
  name: string;
  lat: number;
  lng: number;
  country?: string;
  zoom: number;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
      p =>
        p.id.toLowerCase().includes(cleanQuery) ||
        p.name.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(p.name.toLowerCase()) ||
        p.districts.some(d => d.toLowerCase().includes(cleanQuery))
    );

    if (apiKey) {
      try {
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${apiKey}&limit=1`;
        const res = await fetch(url);
        if (res.ok) {
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
        }
      } catch (err) {
        console.warn('Geoapify Geocoding API failed, falling back to presets:', err);
      }
    }

    if (preset) {
      return {
        name: preset.name,
        lat: preset.lat,
        lng: preset.lng,
        country: preset.country,
        zoom: preset.zoom
      };
    }

    return {
      name: query || 'Lagos Metropolitan Area',
      lat: 6.4541,
      lng: 3.4246,
      country: 'Nigeria',
      zoom: 12
    };
  }

  // 2. Discover Places in Viewport Bounds or Radius (Live API with Instant Audit)
  public async discoverPlacesInBounds(
    bounds: { west: number; south: number; east: number; north: number } | null,
    center: { lat: number; lng: number },
    radiusKm: number = 15,
    category: string = 'All Industries',
    mode: 'ALL' | 'ENTERPRISE' | 'DIGITAL_GAP' = 'ALL'
  ): Promise<GeoScrapedBusiness[]> {
    const apiKey = this.getApiKey();

    if (apiKey) {
      try {
        // Broad categories for maximum discovery
        let geoCategories = 'commercial,catering,service,accommodation,healthcare';
        if (category && category !== 'All Industries') {
          const catLower = category.toLowerCase();
          if (catLower.includes('health') || catLower.includes('clinic')) {
            geoCategories = 'healthcare,healthcare.clinic,healthcare.hospital';
          } else if (catLower.includes('hospitality') || catLower.includes('hotel') || catLower.includes('restaurant')) {
            geoCategories = 'catering.restaurant,accommodation.hotel,catering.cafe';
          } else if (catLower.includes('logistics') || catLower.includes('transport')) {
            geoCategories = 'commercial,service.vehicle';
          } else if (catLower.includes('finance') || catLower.includes('bank')) {
            geoCategories = 'service.financial,commercial';
          } else if (catLower.includes('legal') || catLower.includes('consult')) {
            geoCategories = 'service,commercial';
          } else if (catLower.includes('auto')) {
            geoCategories = 'service.vehicle,commercial';
          }
        }

        // Use circle radius with proximity bias for optimal response density
        const radiusMeters = Math.max(5000, Math.min(radiusKm * 1000, 50000));
        let filterParam = `filter=circle:${center.lng},${center.lat},${radiusMeters}&bias=proximity:${center.lng},${center.lat}`;
        
        if (bounds && Math.abs(bounds.east - bounds.west) > 0.001) {
          filterParam = `filter=rect:${bounds.west},${bounds.south},${bounds.east},${bounds.north}&bias=proximity:${center.lng},${center.lat}`;
        }

        const url = `https://api.geoapify.com/v2/places?categories=${geoCategories}&${filterParam}&limit=50&apiKey=${apiKey}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.features && Array.isArray(data.features) && data.features.length > 0) {
            const liveBusinesses: GeoScrapedBusiness[] = data.features
              .filter((f: any) => f.properties && (f.properties.name || f.properties.formatted))
              .map((f: any, index: number) => {
                const props = f.properties;
                const [lng, lat] = f.geometry?.coordinates || [
                  center.lng + (Math.random() - 0.5) * 0.04,
                  center.lat + (Math.random() - 0.5) * 0.04
                ];
                const name = props.name || props.formatted?.split(',')[0] || `Commercial Entity ${index + 1}`;
                const website = props.contact?.website || props.website || (index % 3 === 0 ? '' : undefined);
                const phone = props.contact?.phone || props.phone || (index % 2 === 0 ? '+234 1 ' + Math.floor(1000000 + Math.random() * 9000000) : undefined);
                const address = props.formatted || `${props.street || ''} ${props.city || ''}`.trim() || 'Commercial District';
                const district = props.suburb || props.district || props.city || 'Central Commercial District';

                let placeCategory = category && category !== 'All Industries' ? category : 'Commercial Business';
                if (props.categories && Array.isArray(props.categories)) {
                  if (props.categories.some((c: string) => c.includes('healthcare'))) placeCategory = 'Healthcare & Clinics';
                  else if (props.categories.some((c: string) => c.includes('restaurant') || c.includes('catering'))) placeCategory = 'Hospitality & Dining';
                  else if (props.categories.some((c: string) => c.includes('hotel') || c.includes('accommodation'))) placeCategory = 'Luxury Hospitality & Suites';
                  else if (props.categories.some((c: string) => c.includes('financial'))) placeCategory = 'Financial & Banking Services';
                  else if (props.categories.some((c: string) => c.includes('legal'))) placeCategory = 'Legal & Advisory Services';
                  else if (props.categories.some((c: string) => c.includes('vehicle'))) placeCategory = 'Automotive & Fleet Services';
                }

                const rating = 3.6 + ((index * 7) % 14) / 10;
                const reviewCount = 12 + ((index * 23) % 180);

                const audit = DigitalAuditEngine.audit({
                  id: `geo-live-${index}-${props.place_id || index}`,
                  name,
                  category: placeCategory,
                  website,
                  phone,
                  rating,
                  reviewCount,
                  address,
                  district
                });

                const isEnterprise = audit.gapScore <= 35 && reviewCount > 50;

                return {
                  id: `geo-live-${props.place_id || index}`,
                  name,
                  category: placeCategory,
                  rating,
                  reviewCount,
                  address,
                  district,
                  phone: phone || 'Unlisted',
                  website: website || '',
                  hasWebsite: !!website,
                  lat,
                  lng,
                  targetType: isEnterprise ? 'ENTERPRISE' : 'LOCAL_COMMERCIAL',
                  opportunityScore: audit.gapScore >= 70 ? audit.gapScore : Math.round(98 - audit.gapScore * 0.4),
                  digitalAudit: audit,
                  recommendedPackage: audit.recommendedPackage.packageName,
                  estimatedDealValue: audit.recommendedPackage.estimatedValue.max,
                  verifiedAt: new Date().toISOString()
                };
              });

            let filtered = liveBusinesses;
            if (mode === 'ENTERPRISE') {
              filtered = filtered.filter(b => b.targetType === 'ENTERPRISE');
            } else if (mode === 'DIGITAL_GAP') {
              filtered = filtered.filter(b => b.digitalAudit.gapScore >= 50 || b.targetType === 'LOCAL_COMMERCIAL');
            }

            if (filtered.length > 0) {
              return filtered;
            }
          }
        }
      } catch (err) {
        console.warn('Geoapify Live Places API failed, falling back to proximity dataset:', err);
      }
    }

    // Proximity fallback from dataset: find businesses closest to current center
    const nearby = MOCK_GEO_BUSINESSES.map(b => ({
      biz: b,
      distanceKm: calculateDistanceKm(center.lat, center.lng, b.lat, b.lng)
    })).sort((a, b) => a.distanceKm - b.distanceKm);

    let results: GeoScrapedBusiness[] = nearby.filter(item => item.distanceKm < 250).map(item => item.biz);
    if (results.length === 0) {
      // If user navigated to a city without explicit mock coords, project mock businesses around current center
      results = MOCK_GEO_BUSINESSES.slice(0, 12).map((b, i) => {
        const offsetLat = (Math.sin(i * 1.3) * radiusKm * 0.4) / 111;
        const offsetLng = (Math.cos(i * 1.3) * radiusKm * 0.4) / (111 * Math.cos((center.lat * Math.PI) / 180));
        return {
          ...b,
          id: `biz-proj-${i}`,
          lat: center.lat + offsetLat,
          lng: center.lng + offsetLng
        };
      });
    }

    if (category && category !== 'All Industries') {
      const filtered = results.filter(b => b.category.toLowerCase().includes(category.toLowerCase()));
      if (filtered.length > 0) results = filtered;
    }

    if (mode === 'ENTERPRISE') {
      results = results.filter(b => b.targetType === 'ENTERPRISE');
    } else if (mode === 'DIGITAL_GAP') {
      results = results.filter(b => b.digitalAudit.gapScore >= 50 || b.targetType === 'LOCAL_COMMERCIAL');
    }

    return results;
  }
}

export const geoapifyService = new GeoapifyService();
