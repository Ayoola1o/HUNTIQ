export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface ApiKeyRepository {
  listByUser(userId: string): Promise<ApiKeyItem[]>;
  create(params: {
    userId: string;
    workspaceId: string;
    name: string;
    keyPrefix: string;
    keyHash: string;
  }): Promise<ApiKeyItem>;
  findByHash(keyHash: string): Promise<{ id: string; userId: string; workspaceId: string } | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
