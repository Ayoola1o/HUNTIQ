import type { MeetingItem } from '../../../src/types/meetings';

export interface MeetingFilterOptions {
  status?: string;
  meetingType?: string;
  query?: string;
}

export interface MeetingRepository {
  list(workspaceId: string, filter?: MeetingFilterOptions): Promise<MeetingItem[]>;
  getById(id: string, workspaceId: string): Promise<MeetingItem | undefined>;
  create(meeting: Partial<MeetingItem>, workspaceId: string, userId?: string): Promise<MeetingItem>;
  update(id: string, partial: Partial<MeetingItem>, workspaceId: string): Promise<MeetingItem | undefined>;
  delete(id: string, workspaceId: string): Promise<boolean>;
}
