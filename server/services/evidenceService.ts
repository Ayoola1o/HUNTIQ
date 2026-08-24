import { db } from '../db/memoryStore';
import type { DbEvidence } from '../db/types';

export class EvidenceService {
  public async getEvidenceForSignal(signalId: string, workspaceId: string): Promise<DbEvidence[]> {
    return db.getEvidenceBySignal(signalId, workspaceId);
  }

  public async getEvidenceForCompany(companyId: string, workspaceId: string): Promise<DbEvidence[]> {
    return db.evidence.filter(e => e.companyId === companyId && e.workspaceId === workspaceId);
  }
}

export const evidenceService = new EvidenceService();
