import type { CompetitorAnalysisResult, RunCompetitorAnalysisPayload } from '../../src/types/competitorAnalysis';
import { competitorEngine } from '../../src/engine/competitorEngine';

export class CompetitorService {
  private cache: Map<string, CompetitorAnalysisResult> = new Map();

  constructor() {
    // Seed initial benchmark analysis
    const initial = competitorEngine.analyze({
      prospectId: 'disc-loc-1',
      prospectName: 'Premier Smile & Dental Studio',
      location: 'Lekki, Lagos',
      niche: 'Dental Clinic'
    });
    this.cache.set(initial.id, initial);
    this.cache.set(initial.prospectId, initial);
  }

  /**
   * Run full competitor analysis against market leaders.
   */
  public analyze(payload: RunCompetitorAnalysisPayload): CompetitorAnalysisResult {
    const result = competitorEngine.analyze(payload);
    this.cache.set(result.id, result);
    if (result.prospectId) {
      this.cache.set(result.prospectId, result);
    }
    return result;
  }

  /**
   * Retrieve competitor analysis by prospectId or analysis id.
   */
  public getById(id: string): CompetitorAnalysisResult | undefined {
    return this.cache.get(id);
  }
}

export const competitorService = new CompetitorService();
