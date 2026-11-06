import { apiClient } from './client';
import type { CompanyResearchReport, ResearchKpiSummary } from '../types/research';
import type { ResearchDossier } from '../engine/types';
import { researchEngine } from '../engine/researchEngine';

export interface FetchResearchReportsResult {
  reports: CompanyResearchReport[];
  kpiSummary: ResearchKpiSummary;
}

// Local Fallback Store
let localReports: CompanyResearchReport[] = [];

function calculateResearchKpi(list: CompanyResearchReport[]): ResearchKpiSummary {
  return {
    totalReports: list.length,
    inProgress: list.filter(r => r.status === 'researching').length,
    updatedThisWeek: list.length,
    highOpportunity: list.filter(r => r.opportunityScore >= 90).length
  };
}

/**
 * Fetch list of all company research reports with status/search filtering and KPI summaries.
 */
export async function fetchResearchReports(params?: {
  status?: string;
  query?: string;
}): Promise<FetchResearchReportsResult> {
  try {
    const result = await apiClient.get<FetchResearchReportsResult | CompanyResearchReport[]>('/api/research/reports', {
      params: {
        status: params?.status,
        q: params?.query
      }
    });

    if (Array.isArray(result)) {
      return { reports: result, kpiSummary: calculateResearchKpi(result) };
    }
    return result;
  } catch (_err) {
    // Offline Engine Fallback
    let list = [...localReports];
    if (params?.status && params.status !== 'all') {
      list = list.filter(r => r.status === params.status);
    }
    if (params?.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(r =>
        r.companyName.toLowerCase().includes(q) ||
        (r.domain ? r.domain.toLowerCase().includes(q) : false) ||
        r.industry.toLowerCase().includes(q)
      );
    }
    return { reports: list, kpiSummary: calculateResearchKpi(localReports) };
  }
}

/**
 * Get full research report by ID.
 */
export async function getResearchReportById(id: string): Promise<CompanyResearchReport> {
  try {
    return await apiClient.get<CompanyResearchReport>(`/api/research/reports/${id}`);
  } catch (_err) {
    const found = localReports.find(r => r.id === id);
    if (!found) throw new Error(`Report ${id} not found`);
    return found;
  }
}

/**
 * Create/generate a new deep company research report.
 */
export async function createResearchReport(payload: {
  companyName: string;
  domain?: string;
  industry?: string;
}): Promise<CompanyResearchReport> {
  return apiClient.post<CompanyResearchReport>('/api/research/reports', payload);
}

/**
 * Re-scan and refresh an existing research report.
 */
export async function refreshResearchReport(id: string): Promise<CompanyResearchReport> {
  try {
    const refreshed = await apiClient.post<CompanyResearchReport>(`/api/research/reports/${id}/refresh`);
    const idx = localReports.findIndex(r => r.id === id);
    if (idx !== -1) localReports[idx] = refreshed;
    return refreshed;
  } catch (_err) {
    const idx = localReports.findIndex(r => r.id === id);
    if (idx !== -1) {
      localReports[idx] = {
        ...localReports[idx],
        lastUpdated: 'Just now',
        opportunityScore: Math.min(99, localReports[idx].opportunityScore + 1)
      };
      return localReports[idx];
    }
    throw new Error('Report not found');
  }
}

/**
 * Update report status or notes.
 */
export async function updateResearchReport(
  id: string, 
  updates: Partial<CompanyResearchReport>
): Promise<CompanyResearchReport> {
  try {
    const updated = await apiClient.patch<CompanyResearchReport>(`/api/research/reports/${id}`, updates);
    const idx = localReports.findIndex(r => r.id === id);
    if (idx !== -1) localReports[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localReports.findIndex(r => r.id === id);
    if (idx !== -1) {
      localReports[idx] = { ...localReports[idx], ...updates, lastUpdated: 'Just now' };
      return localReports[idx];
    }
    throw new Error('Report not found');
  }
}

/**
 * Delete a research report.
 */
export async function deleteResearchReport(id: string): Promise<{ id: string; deleted: boolean }> {
  try {
    return await apiClient.delete<{ id: string; deleted: boolean }>(`/api/research/reports/${id}`);
  } catch (_err) {
    localReports = localReports.filter(r => r.id !== id);
    return { id, deleted: true };
  }
}

/**
 * Generate a quick brief research dossier.
 */
export async function generateResearchDossier(companyName: string): Promise<ResearchDossier> {
  try {
    return await apiClient.post<ResearchDossier>('/api/research/generate', { companyName });
  } catch (_err) {
    return researchEngine.generateDossier(companyName);
  }
}
