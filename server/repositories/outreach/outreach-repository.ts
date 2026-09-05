import type { OutreachItem, OutreachChannel, OutreachStatus, OutreachMessage } from '../../../src/types/outreach';

export interface OutreachFilterOptions {
  status?: string;
  channel?: string;
  query?: string;
}

export interface OutreachRepository {
  list(workspaceId: string, filter?: OutreachFilterOptions): Promise<OutreachItem[]>;
  getById(id: string, workspaceId: string): Promise<OutreachItem | undefined>;
  create(outreach: Partial<OutreachItem>, workspaceId: string, userId?: string): Promise<OutreachItem>;
  update(id: string, partial: Partial<OutreachItem>, workspaceId: string): Promise<OutreachItem | undefined>;
  addMessage(id: string, message: Omit<OutreachMessage, 'id' | 'timestamp'>, workspaceId: string): Promise<OutreachItem | undefined>;
  delete(id: string, workspaceId: string): Promise<boolean>;
}
