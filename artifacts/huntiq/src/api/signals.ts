import { apiClient } from './client';
import type { SignalItem } from '../types/signal';

export async function fetchSignals(type?: string, company?: string): Promise<SignalItem[]> {
  try {
    const list = await apiClient.get<SignalItem[]>('/api/signals', {
      params: { type, company }
    });
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('[HUNTIQ] Error fetching signals from API:', err);
    throw err;
  }
}

export async function generateCompanySignals(companyId: string): Promise<any> {
  return await apiClient.post('/api/signals/generate', { companyId });
}

export async function fetchSignalsWithEvidence(companyId: string): Promise<any[]> {
  return await apiClient.get(`/api/signals/${companyId}`);
}
