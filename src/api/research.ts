import { apiClient } from './client';
import type { ResearchDossier } from '../engine/types';
import { researchEngine } from '../engine/researchEngine';

export async function generateResearchDossier(companyName: string): Promise<ResearchDossier> {
  try {
    return await apiClient.post<ResearchDossier>('/api/research/generate', { companyName });
  } catch (_err) {
    return researchEngine.generateDossier(companyName);
  }
}
