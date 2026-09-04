export * from './pipeline-repository';
export * from './postgres-pipeline.repository';
export * from './in-memory-pipeline.repository';

import { postgresPool } from '../../database/postgres';
import type { PipelineRepository } from './pipeline-repository';
import { PostgresPipelineRepository } from './postgres-pipeline.repository';
import { InMemoryPipelineRepository } from './in-memory-pipeline.repository';

export const createPipelineRepository = (): PipelineRepository => {
  if (postgresPool) {
    return new PostgresPipelineRepository(postgresPool);
  }
  return new InMemoryPipelineRepository();
};
