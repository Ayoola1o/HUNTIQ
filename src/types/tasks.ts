export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskRelatedType = 'company' | 'contact' | 'deal' | 'meeting' | 'signal';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  dueCategory: 'today' | 'overdue' | 'upcoming' | 'completed';
  relatedType: TaskRelatedType;
  relatedName: string;
  relatedId?: string;
  ownerName: string;
  ownerAvatarBg: string;
  ownerAvatarColor: string;
  completedAt?: string;
}

export interface TasksKpiSummary {
  dueToday: number;
  overdue: number;
  upcoming: number;
  completedCount: number;
}
