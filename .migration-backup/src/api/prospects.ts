import { apiClient } from './client';
import type { CompanyItem } from '../types/company';
import type { ProspectSearchParams } from '../engine/types';
import type { GeoScrapedBusiness } from '../engine/geoScraperEngine';
import { prospectorEngine } from '../engine/prospectorEngine';
import { geoScraperEngine } from '../engine/geoScraperEngine';

export async function searchProspects(params: ProspectSearchParams): Promise<CompanyItem[]> {
  try {
    return await apiClient.post<CompanyItem[]>('/api/prospects/search', params);
  } catch (_err) {
    return prospectorEngine.searchProspects(params);
  }
}

export async function scrapeGeoArea(
  zoneId: string,
  district?: string,
  radiusKm: number = 10,
  categoryFilter?: string
): Promise<GeoScrapedBusiness[]> {
  try {
    return await apiClient.post<GeoScrapedBusiness[]>('/api/prospects/scrape-geo', {
      zoneId,
      district,
      radiusKm,
      categoryFilter
    });
  } catch (_err) {
    return geoScraperEngine.scrapeZone(zoneId, district, radiusKm, categoryFilter);
  }
}
