import { apiClient } from './client';
import type { SignalItem } from '../types/signal';
import { signalEngine } from '../engine/signalEngine';

export async function fetchSignals(type?: string, company?: string): Promise<SignalItem[]> {
  try {
    return await apiClient.get<SignalItem[]>('/api/signals', {
      params: { type, company }
    });
  } catch (_err) {
    let list = signalEngine.getAllSignals();
    if (type && type !== 'all') {
      list = list.filter(s => s.type.toLowerCase() === type.toLowerCase());
    }
    if (company) {
      list = list.filter(s => s.companyName.toLowerCase().includes(company.toLowerCase()));
    }
    return list;
  }
}

export async function generateCompanySignals(companyId: string): Promise<any> {
  return await apiClient.post('/api/signals/generate', { companyId });
}

export async function fetchSignalsWithEvidence(companyId: string): Promise<any[]> {
  return await apiClient.get(`/api/signals/${companyId}`);
}

