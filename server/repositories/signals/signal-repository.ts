export interface SignalRecord {
  id: string;
  workspaceId: string;
  companyId: string;
  type: string;
  title: string;
  summary?: string;
  strength: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detectedAt: Date;
  observedFrom?: Date;
  observedTo?: Date;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SignalRepository {
  create(signal: Omit<SignalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SignalRecord>;
  findByCompanyId(companyId: string): Promise<SignalRecord[]>;
  findByType(type: string): Promise<SignalRecord[]>;
  list(limit?: number, offset?: number): Promise<SignalRecord[]>;
  deleteByCompanyId(companyId: string): Promise<number>;
}
