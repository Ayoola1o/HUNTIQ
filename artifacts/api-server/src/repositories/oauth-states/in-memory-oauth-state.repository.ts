import crypto from 'node:crypto';
import type {
  OAuthStateRepository,
  OAuthStateRecord,
  CreateOAuthStateParams
} from './oauth-state-repository';

export class InMemoryOAuthStateRepository implements OAuthStateRepository {
  private states = new Map<string, OAuthStateRecord>();

  public async create(params: CreateOAuthStateParams): Promise<OAuthStateRecord> {
    const ttlSeconds = params.ttlSeconds || 600; // 10 minutes default
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    const record: OAuthStateRecord = {
      id: crypto.randomUUID(),
      stateToken: params.stateToken,
      userId: params.userId,
      workspaceId: params.workspaceId,
      provider: params.provider,
      returnPath: params.returnPath || '/',
      expiresAt,
      usedAt: null,
      createdAt: now
    };

    this.states.set(record.stateToken, record);
    return record;
  }

  public async consume(stateToken: string, provider: string): Promise<OAuthStateRecord | null> {
    const record = this.states.get(stateToken);
    if (!record) return null;

    const now = new Date();
    // Validate provider, single-use (usedAt is null), and expiration
    if (record.provider !== provider || record.usedAt !== null || record.expiresAt.getTime() <= now.getTime()) {
      return null;
    }

    // Atomically mark used
    record.usedAt = now;
    this.states.set(stateToken, record);
    return record;
  }

  public async cleanExpired(): Promise<number> {
    const now = new Date().getTime();
    let count = 0;
    for (const [token, record] of this.states.entries()) {
      if (record.expiresAt.getTime() <= now || record.usedAt !== null) {
        this.states.delete(token);
        count++;
      }
    }
    return count;
  }
}
