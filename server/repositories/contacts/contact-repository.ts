import type { ContactItem } from '../../../src/types/contact';

export interface ContactRepository {
  listByUser(userId: string, workspaceId: string): Promise<ContactItem[]>;
  getById(id: string, userId: string, workspaceId: string): Promise<ContactItem | null>;
  create(userId: string, workspaceId: string, contact: Partial<ContactItem>): Promise<ContactItem>;
  update(id: string, userId: string, workspaceId: string, updates: Partial<ContactItem>): Promise<ContactItem | null>;
  delete(id: string, userId: string, workspaceId: string): Promise<boolean>;
}
