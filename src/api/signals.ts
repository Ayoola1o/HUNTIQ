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
