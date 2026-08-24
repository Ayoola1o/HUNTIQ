import { db } from '../db/memoryStore';
import type { DbActivity } from '../db/types';

export class ActivityService {
  public async listActivities(workspaceId: string, limit: number = 20): Promise<DbActivity[]> {
    return db.activities
      .filter(a => a.workspaceId === workspaceId)
      .slice(0, limit);
  }

  public async logActivity(workspaceId: string, activity: Omit<DbActivity, 'id' | 'createdAt' | 'workspaceId'>): Promise<DbActivity> {
    return db.logActivity({
      ...activity,
      workspaceId
    });
  }
}

export const activityService = new ActivityService();
