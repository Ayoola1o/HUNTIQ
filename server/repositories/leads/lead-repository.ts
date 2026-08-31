export interface LeadRecord {
  id: string;
  workspaceId: string;
  companyId: string;
  contactId?: string;
  signalId?: string;
  title: string;
  score: number;
  tier: 'HOT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST' | 'DISQUALIFIED';
  reason: string;
  summary?: string;
  dealValue: number;
  conversionProbability: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeadRepository {
  create(lead: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadRecord>;
  upsert(lead: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadRecord>;
  findByCompanyId(companyId: string): Promise<LeadRecord[]>;
  findById(id: string): Promise<LeadRecord | null>;
  list(limit?: number, offset?: number): Promise<LeadRecord[]>;
  updateStatus(id: string, status: LeadRecord['status']): Promise<LeadRecord | null>;
}
