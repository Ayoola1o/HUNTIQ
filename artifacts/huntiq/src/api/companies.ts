import { apiClient } from './client';
import type { CompanyItem } from '../types/company';

export async function fetchCompanies(query?: string, industry?: string): Promise<CompanyItem[]> {
  try {
    const list = await apiClient.get<CompanyItem[]>('/api/companies', {
      params: { q: query, industry }
    });
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('[HUNTIQ] Error fetching companies:', err);
    throw err;
  }
}

export async function fetchCompanyById(id: string): Promise<CompanyItem | null> {
  try {
    return await apiClient.get<CompanyItem>(`/api/companies/${id}`);
  } catch (err) {
    console.error(`[HUNTIQ] Error fetching company ${id}:`, err);
    return null;
  }
}

export async function saveCompany(companyId: string, isSaved: boolean): Promise<CompanyItem> {
  return await apiClient.post<CompanyItem>(`/api/companies/${companyId}/save`, { isSaved });
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
