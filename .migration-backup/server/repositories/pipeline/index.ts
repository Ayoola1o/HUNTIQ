export * from './pipeline-repository';
export * from './postgres-pipeline.repository';
export * from './in-memory-pipeline.repository';

import { postgresPool } from '../../database/postgres';
import type { PipelineRepository } from './pipeline-repository';
import { PostgresPipelineRepository } from './postgres-pipeline.repository';
import { InMemoryPipelineRepository } from './in-memory-pipeline.repository';

import { config } from '../../config/env';

export const createPipelineRepository = (): PipelineRepository => {
  if (postgresPool) {
    return new PostgresPipelineRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize PipelineRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryPipelineRepository();
};
