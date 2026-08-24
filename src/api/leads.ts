import { apiClient } from './client';
import type { DbLead, DbCompany } from '../../server/db/types';

export interface OpportunityEvaluationResult {
  company: DbCompany;
  evaluation: {
    totalScore: number;
    tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
    velocityScore: number;
    icpFitScore: number;
    contactReachabilityScore: number;
    estimatedDealValue: number;
    conversionProbability: number;
    keyDrivers: string[];
    recommendedAction: string;
  };
  lead: DbLead | null;
}

export async function fetchLeads(status?: string): Promise<DbLead[]> {
  return await apiClient.get<DbLead[]>('/api/leads', {
    params: { status }
  });
}

export async function evaluateCompanyOpportunity(companyId: string): Promise<OpportunityEvaluationResult> {
  return await apiClient.post<OpportunityEvaluationResult>('/api/leads/evaluate', { companyId });
}
