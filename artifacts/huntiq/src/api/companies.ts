import { apiClient } from './client';
import type { CompanyItem } from '../types/company';
import { prospectorEngine } from '../engine/prospectorEngine';

export async function fetchCompanies(query?: string, industry?: string): Promise<CompanyItem[]> {
  try {
    return await apiClient.get<CompanyItem[]>('/api/companies', {
      params: { q: query, industry }
    });
  } catch (_err) {
    // Engine Fallback
    return prospectorEngine.searchProspects({
      query,
      industries: industry && industry !== 'All' ? [industry] : undefined
    });
  }
}

export async function fetchCompanyById(id: string): Promise<CompanyItem | null> {
  try {
    return await apiClient.get<CompanyItem>(`/api/companies/${id}`);
  } catch (_err) {
    return prospectorEngine.getCompanyById(id) || null;
  }
}

export async function resolveCompany(params: {
  name?: string;
  domain?: string;
  website?: string;
  sourceUrl?: string;
  boardToken?: string;
  industry?: string;
  city?: string;
  country?: string;
}): Promise<any> {
  return await apiClient.post('/api/companies/resolve', params);
}

export async function mergeCompanies(sourceCompanyId: string, targetCompanyId: string): Promise<any> {
  return await apiClient.post('/api/companies/merge', { sourceCompanyId, targetCompanyId });
}

