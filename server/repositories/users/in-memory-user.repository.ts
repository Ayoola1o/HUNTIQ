import type { UserRepository, UserEntity, CreateUserWithWorkspaceParams } from './user-repository';
import { hashPassword } from '../../services/auth.service';
import { persistentStore } from '../../db/persistentStore';

export class InMemoryUserRepository implements UserRepository {
  private static users: UserEntity[] = [];
  private static onboarding: Map<string, any> = new Map();

  constructor() {
    if (InMemoryUserRepository.users.length === 0) {
      InMemoryUserRepository.users = [
        {
          id: 'user-default-001',
          workspaceId: 'ws-default-001',
          email: 'demo@huntiq.io',
          passwordHash: hashPassword('password123'),
          fullName: 'Ayoola Ade',
          companyName: 'Acme Enterprise Ventures',
          avatarUrl: undefined,
          role: 'owner',
          defaultCurrency: 'USD',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const user = InMemoryUserRepository.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    return user || null;
  }

  public async findById(id: string): Promise<UserEntity | null> {
    const user = InMemoryUserRepository.users.find((u) => u.id === id);
    return user || null;
  }

  public async createWithWorkspace(params: CreateUserWithWorkspaceParams): Promise<{
    user: UserEntity;
    workspace: { id: string; name: string; slug: string };
  }> {
    const workspaceId = `ws-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const workspaceName = params.companyName?.trim() || `${params.fullName}'s Workspace`;
    const workspaceSlug = `${workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

    const newUser: UserEntity = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      email: params.email.toLowerCase().trim(),
      passwordHash: params.passwordHash,
      fullName: params.fullName,
      companyName: params.companyName,
      role: params.role || 'owner',
      defaultCurrency: params.defaultCurrency || 'USD',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    InMemoryUserRepository.users.push(newUser);

    return {
      user: newUser,
      workspace: {
        id: workspaceId,
        name: workspaceName,
        slug: workspaceSlug
      }
    };
  }

  public async updateProfile(userId: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const user = InMemoryUserRepository.users.find((u) => u.id === userId);
    if (!user) return null;
    if (updates.fullName !== undefined) user.fullName = updates.fullName;
    if (updates.companyName !== undefined) user.companyName = updates.companyName;
    if (updates.defaultCurrency !== undefined) user.defaultCurrency = updates.defaultCurrency;
    user.updatedAt = new Date().toISOString();
    return user;
  }

  public async updateAvatar(userId: string, avatarUrl: string): Promise<UserEntity | null> {
    const user = InMemoryUserRepository.users.find((u) => u.id === userId);
    if (!user) return null;
    user.avatarUrl = avatarUrl;
    user.updatedAt = new Date().toISOString();
    return user;
  }

  public async saveOnboarding(userId: string, workspaceId: string, data: any): Promise<boolean> {
    InMemoryUserRepository.onboarding.set(`${userId}:${workspaceId}`, data);
    try {
      persistentStore.saveWorkspaceOnboarding(userId, workspaceId, data);
    } catch {}
    if (data?.workspaceName) {
      const user = InMemoryUserRepository.users.find((u) => u.id === userId);
      if (user) {
        user.companyName = data.workspaceName;
        user.updatedAt = new Date().toISOString();
      }
    }
    return true;
  }

  public async getOnboarding(userId: string, workspaceId: string): Promise<any> {
    const memoryData = InMemoryUserRepository.onboarding.get(`${userId}:${workspaceId}`);
    if (memoryData) return memoryData;
    try {
      return persistentStore.getWorkspaceOnboarding(workspaceId) || null;
    } catch {
      return null;
    }
  }
}
