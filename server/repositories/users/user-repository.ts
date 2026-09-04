export interface UserEntity {
  id: string;
  workspaceId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  companyName?: string;
  avatarUrl?: string;
  role: string;
  defaultCurrency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserWithWorkspaceParams {
  email: string;
  passwordHash: string;
  fullName: string;
  companyName?: string;
  defaultCurrency?: string;
  role?: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  createWithWorkspace(params: CreateUserWithWorkspaceParams): Promise<{ user: UserEntity; workspace: { id: string; name: string; slug: string } }>;
  updateProfile(userId: string, updates: Partial<UserEntity>): Promise<UserEntity | null>;
  updateAvatar(userId: string, avatarUrl: string): Promise<UserEntity | null>;
  saveOnboarding(userId: string, workspaceId: string, data: any): Promise<boolean>;
  getOnboarding(userId: string, workspaceId: string): Promise<any>;
}
