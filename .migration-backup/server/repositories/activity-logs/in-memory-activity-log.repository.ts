import type { ActivityLogRepository, ActivityLogItem } from './activity-log-repository';

export class InMemoryActivityLogRepository implements ActivityLogRepository {
  private static logs: ActivityLogItem[] = [];

  public async listByUser(userId: string, limit = 20): Promise<ActivityLogItem[]> {
    return InMemoryActivityLogRepository.logs
      .filter((l) => l.userId === userId)
      .slice(0, limit);
  }

  public async log(params: {
    userId: string;
    workspaceId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: string;
    metadata?: any;
  }): Promise<ActivityLogItem> {
    const item: ActivityLogItem = {
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      workspaceId: params.workspaceId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
      metadata: params.metadata || {},
      createdAt: new Date().toISOString()
    };
    InMemoryActivityLogRepository.logs.unshift(item);
    return item;
  }
}
