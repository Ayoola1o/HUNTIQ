import type { TaskItem } from '../../../src/types/tasks';

export interface TaskFilterOptions {
  status?: string;
  priority?: string;
  dueCategory?: string;
  query?: string;
}

export interface TaskRepository {
  list(workspaceId: string, filter?: TaskFilterOptions): Promise<TaskItem[]>;
  getById(id: string, workspaceId: string): Promise<TaskItem | undefined>;
  create(task: Partial<TaskItem>, workspaceId: string, userId?: string): Promise<TaskItem>;
  update(id: string, partial: Partial<TaskItem>, workspaceId: string): Promise<TaskItem | undefined>;
  delete(id: string, workspaceId: string): Promise<boolean>;
}
