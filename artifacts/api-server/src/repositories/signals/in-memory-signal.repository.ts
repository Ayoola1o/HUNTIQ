import type { SignalRecord, SignalRepository } from './signal-repository';

export class InMemorySignalRepository implements SignalRepository {
  private signals: SignalRecord[] = [];

  async create(signal: Omit<SignalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SignalRecord> {
    const record: SignalRecord = {
      ...signal,
      id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.signals.push(record);
    return record;
  }

  async findByCompanyId(companyId: string, workspaceId?: string): Promise<SignalRecord[]> {
    return this.signals.filter(s => s.companyId === companyId && (!workspaceId || s.workspaceId === workspaceId));
  }

  async findByType(type: string, workspaceId?: string): Promise<SignalRecord[]> {
    return this.signals.filter(s => s.type === type && (!workspaceId || s.workspaceId === workspaceId));
  }

  async list(limit = 50, offset = 0, workspaceId?: string): Promise<SignalRecord[]> {
    const filtered = workspaceId ? this.signals.filter(s => s.workspaceId === workspaceId) : this.signals;
    return filtered.slice(offset, offset + limit);
  }

  async deleteByCompanyId(companyId: string, workspaceId?: string): Promise<number> {
    const initial = this.signals.length;
    this.signals = this.signals.filter(s => !(s.companyId === companyId && (!workspaceId || s.workspaceId === workspaceId)));
    return initial - this.signals.length;
  }
}
