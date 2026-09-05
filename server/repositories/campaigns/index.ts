import { postgresPool } from '../../database/connection';
import type { CampaignRepository } from './campaign-repository';
import { PostgresCampaignRepository } from './postgres-campaign.repository';
import { InMemoryCampaignRepository } from './in-memory-campaign.repository';

export * from './campaign-repository';
export * from './postgres-campaign.repository';
export * from './in-memory-campaign.repository';

export const createCampaignRepository = (): CampaignRepository => {
  if (postgresPool) {
    return new PostgresCampaignRepository(postgresPool);
  }
  return new InMemoryCampaignRepository();
};
