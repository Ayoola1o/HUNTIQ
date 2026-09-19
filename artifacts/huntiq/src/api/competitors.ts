import { apiClient } from './client';
import type { CompetitorAnalysisResult, RunCompetitorAnalysisPayload } from '../types/competitorAnalysis';
import { competitorEngine } from '../engine/competitorEngine';

/**
 * Execute a competitor discovery & benchmark comparison.
 */
export async function analyzeCompetitors(payload: RunCompetitorAnalysisPayload): Promise<CompetitorAnalysisResult> {
  try {
    const result = await apiClient.post<CompetitorAnalysisResult>('/api/competitors/analyze', payload);
    return result;
  } catch (_err) {
    // Resilient offline fallback using local engine
    return competitorEngine.analyze(payload);
  }
}

/**
 * Fetch competitor analysis by prospectId or analysis ID.
 */
export async function getCompetitorAnalysis(id: string): Promise<CompetitorAnalysisResult> {
  try {
    return await apiClient.get<CompetitorAnalysisResult>(`/api/competitors/${id}`);
  } catch (_err) {
    return competitorEngine.analyze({
      prospectId: id,
      prospectName: 'Premier Smile & Dental Studio',
      location: 'Lekki, Lagos',
      niche: 'Dental Clinic'
    });
  }
}
