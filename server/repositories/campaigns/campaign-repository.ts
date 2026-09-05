import type { CampaignItem, CampaignStatus, CampaignChannel } from '../../../src/types/campaign';

export interface CampaignFilterOptions {
  status?: string;
  channel?: string;
  query?: string;
}

export interface CampaignRepository {
  list(workspaceId: string, filter?: CampaignFilterOptions): Promise<CampaignItem[]>;
  getById(id: string, workspaceId: string): Promise<CampaignItem | undefined>;
  create(campaign: Partial<CampaignItem>, workspaceId: string, userId?: string): Promise<CampaignItem>;
  update(id: string, partial: Partial<CampaignItem>, workspaceId: string): Promise<CampaignItem | undefined>;
  delete(id: string, workspaceId: string): Promise<boolean>;
}
