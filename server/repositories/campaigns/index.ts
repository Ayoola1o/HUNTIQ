import { postgresPool } from '../../database/connection';
import type { CampaignRepository } from './campaign-repository';
import { PostgresCampaignRepository } from './postgres-campaign.repository';
import { InMemoryCampaignRepository } from './in-memory-campaign.repository';

export * from './campaign-repository';
export * from './postgres-campaign.repository';
export * from './in-memory-campaign.repository';

import { config } from '../../config/env';

export const createCampaignRepository = (): CampaignRepository => {
  if (postgresPool) {
    return new PostgresCampaignRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize CampaignRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryCampaignRepository();
};
