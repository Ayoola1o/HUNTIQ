export interface ActivityLogItem {
  id: string;
  userId: string;
  workspaceId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  metadata?: any;
  createdAt: string;
}

export interface ActivityLogRepository {
  listByUser(userId: string, limit?: number): Promise<ActivityLogItem[]>;
  log(params: {
    userId: string;
    workspaceId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: string;
    metadata?: any;
  }): Promise<ActivityLogItem>;
}
