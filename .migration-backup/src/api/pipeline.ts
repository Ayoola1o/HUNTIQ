import { apiClient } from './client';
import type { PipelineDealItem } from '../types/pipeline';

export async function fetchPipelineDeals(): Promise<PipelineDealItem[]> {
  try {
    return await apiClient.get<PipelineDealItem[]>('/api/pipeline/deals');
  } catch (_err) {
    return [];
  }
}

export async function createPipelineDeal(deal: Partial<PipelineDealItem>): Promise<PipelineDealItem> {
  return await apiClient.post<PipelineDealItem>('/api/pipeline/deals', deal);
}

export async function updatePipelineDeal(id: string, updates: Partial<PipelineDealItem>): Promise<PipelineDealItem> {
  return await apiClient.patch<PipelineDealItem>(`/api/pipeline/deals/${id}`, updates);
}
