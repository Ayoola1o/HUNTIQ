import type { PipelineDealItem } from '../../../src/types/pipeline';

export interface PipelineRepository {
  listByUser(userId: string, workspaceId: string): Promise<PipelineDealItem[]>;
  getById(id: string, userId: string, workspaceId: string): Promise<PipelineDealItem | null>;
  create(userId: string, workspaceId: string, deal: Partial<PipelineDealItem>): Promise<PipelineDealItem>;
  update(id: string, userId: string, workspaceId: string, updates: Partial<PipelineDealItem>): Promise<PipelineDealItem | null>;
  delete(id: string, userId: string, workspaceId: string): Promise<boolean>;
}
