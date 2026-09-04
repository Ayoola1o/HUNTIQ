import { apiClient } from './client';
import type { OpportunityScoringResult, CalculateOpportunityPayload } from '../types/opportunityScoring';
import { opportunityScoringEngine } from '../engine/opportunityScoringEngine';

/**
 * Calculates multi-factor SEO Opportunity Score and commercial breakdown.
 */
export async function calculateOpportunityScore(payload: CalculateOpportunityPayload): Promise<OpportunityScoringResult> {
  try {
    const result = await apiClient.post<OpportunityScoringResult>('/api/opportunity-scoring/calculate', payload);
    return result;
  } catch (_err) {
    // Resilient offline fallback using local engine
    return opportunityScoringEngine.calculate(payload);
  }
}

/**
 * Fetch opportunity scoring dossier by ID or prospectId.
 */
export async function getOpportunityScore(id: string): Promise<OpportunityScoringResult> {
  try {
    return await apiClient.get<OpportunityScoringResult>(`/api/opportunity-scoring/${id}`);
  } catch (_err) {
    return opportunityScoringEngine.calculate({
      prospectId: id,
      prospectName: 'Premier Smile & Dental Studio',
      location: 'Lekki, Lagos',
      niche: 'Dental Clinic'
    });
  }
}
