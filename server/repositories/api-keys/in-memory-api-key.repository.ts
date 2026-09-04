import type { ApiKeyRepository, ApiKeyItem } from './api-key-repository';

interface StoredKey {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  createdAt: string;
  lastUsedAt?: string;
}

export class InMemoryApiKeyRepository implements ApiKeyRepository {
  private static keys: StoredKey[] = [];

  public async listByUser(userId: string): Promise<ApiKeyItem[]> {
    return InMemoryApiKeyRepository.keys
      .filter((k) => k.userId === userId)
      .map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt
      }));
  }

  public async create(params: {
    userId: string;
    workspaceId: string;
    name: string;
    keyPrefix: string;
    keyHash: string;
  }): Promise<ApiKeyItem> {
    const newKey: StoredKey = {
      id: `key-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      workspaceId: params.workspaceId,
      name: params.name,
      keyPrefix: params.keyPrefix,
      keyHash: params.keyHash,
      createdAt: new Date().toISOString()
    };
    InMemoryApiKeyRepository.keys.push(newKey);
    return {
      id: newKey.id,
      name: newKey.name,
      keyPrefix: newKey.keyPrefix,
      createdAt: newKey.createdAt
    };
  }

  public async findByHash(keyHash: string): Promise<{ id: string; userId: string; workspaceId: string } | null> {
    const key = InMemoryApiKeyRepository.keys.find((k) => k.keyHash === keyHash);
    if (!key) return null;
    key.lastUsedAt = new Date().toISOString();
    return {
      id: key.id,
      userId: key.userId,
      workspaceId: key.workspaceId
    };
  }

  public async delete(id: string, userId: string): Promise<boolean> {
    const prevLen = InMemoryApiKeyRepository.keys.length;
    InMemoryApiKeyRepository.keys = InMemoryApiKeyRepository.keys.filter(
      (k) => !(k.id === id && k.userId === userId)
    );
    return InMemoryApiKeyRepository.keys.length < prevLen;
  }
}
