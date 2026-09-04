import { db } from '../db/memoryStore';
import type { DbSignal } from '../db/types';

export class SignalService {
  public async listSignals(workspaceId: string, type?: string, companyId?: string): Promise<DbSignal[]> {
    let list = db.signals.filter(s => s.workspaceId === workspaceId);

    if (type && type !== 'all') {
      list = list.filter(s => s.type.toLowerCase() === type.toLowerCase());
    }

    if (companyId) {
      list = list.filter(s => s.companyId === companyId);
    }

    return list;
  }

  public async getSignalById(id: string, workspaceId: string): Promise<DbSignal | undefined> {
    return db.signals.find(s => s.id === id && s.workspaceId === workspaceId);
  }
}

export const signalService = new SignalService();
