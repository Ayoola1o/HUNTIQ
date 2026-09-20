export interface OAuthStateRecord {
  id: string;
  stateToken: string;
  userId: string;
  workspaceId: string;
  provider: string;
  returnPath: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface CreateOAuthStateParams {
  stateToken: string;
  userId: string;
  workspaceId: string;
  provider: string;
  returnPath?: string;
  ttlSeconds?: number;
}

export interface OAuthStateRepository {
  create(params: CreateOAuthStateParams): Promise<OAuthStateRecord>;
  consume(stateToken: string, provider: string): Promise<OAuthStateRecord | null>;
  cleanExpired(): Promise<number>;
}
