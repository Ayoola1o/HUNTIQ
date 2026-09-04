import type { OpportunityScoringResult, CalculateOpportunityPayload } from '../../src/types/opportunityScoring';
import { opportunityScoringEngine } from '../../src/engine/opportunityScoringEngine';

export class OpportunityScoringService {
  private cache: Map<string, OpportunityScoringResult> = new Map();

  constructor() {
    // Seed initial benchmark score
    const initial = opportunityScoringEngine.calculate({
      prospectId: 'disc-loc-1',
      prospectName: 'Premier Smile & Dental Studio',
      location: 'Lekki, Lagos',
      niche: 'Dental Clinic'
    });
    this.cache.set(initial.id, initial);
    this.cache.set(initial.prospectId, initial);
  }

  /**
   * Calculate comprehensive SEO Opportunity Score & commercial breakdown.
   */
  public calculate(payload: CalculateOpportunityPayload): OpportunityScoringResult {
    const result = opportunityScoringEngine.calculate(payload);
    this.cache.set(result.id, result);
    if (result.prospectId) {
      this.cache.set(result.prospectId, result);
    }
    return result;
  }

  /**
   * Retrieve opportunity score dossier by prospectId or id.
   */
  public getById(id: string): OpportunityScoringResult | undefined {
    return this.cache.get(id);
  }
}

export const opportunityScoringService = new OpportunityScoringService();
