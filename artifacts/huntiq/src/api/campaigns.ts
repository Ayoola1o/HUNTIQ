import { apiClient } from './client';
import type { CampaignItem, CampaignKpiSummary, CreateCampaignDraft } from '../types/campaign';

export interface FetchCampaignsResult {
  campaigns: CampaignItem[];
  kpiSummary: CampaignKpiSummary;
}

export function fetchCampaigns(params?: { status?: string; channel?: string; query?: string }) {
  return apiClient.get<FetchCampaignsResult>('/api/campaigns', {
    params: { status: params?.status, channel: params?.channel, q: params?.query }
  });
}

export function getCampaignById(id: string) {
  return apiClient.get<CampaignItem>(`/api/campaigns/${id}`);
}

export function createCampaign(payload: CreateCampaignDraft) {
  return apiClient.post<CampaignItem>('/api/campaigns', payload);
}

export function setCampaignStatus(id: string, status: 'active' | 'paused') {
  return apiClient.patch<CampaignItem>(`/api/campaigns/${id}/status`, { status });
}

export function deleteCampaign(id: string) {
  return apiClient.delete<{ id: string; deleted: boolean }>(`/api/campaigns/${id}`);
}
