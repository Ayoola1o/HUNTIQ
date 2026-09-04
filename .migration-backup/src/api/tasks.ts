import { apiClient } from './client';
import type { 
  TaskItem, 
  TasksKpiSummary, 
  TaskPriority, 
  TaskStatus, 
  TaskRelatedType 
} from '../types/tasks';

export interface FetchTasksResult {
  tasks: TaskItem[];
  kpiSummary: TasksKpiSummary;
}

// Resilient Offline Fallback Store
let localTasks: TaskItem[] = [
  {
    id: 't-1',
    title: 'Send revised enterprise SLA to Jane Smith',
    description: 'Negotiate 3-month regional leadership enablement sprint & payment milestones.',
    priority: 'Urgent',
    status: 'todo',
    dueDate: 'Today, 4:00 PM',
    dueCategory: 'today',
    relatedType: 'deal',
    relatedName: 'Acme Technologies',
    ownerName: 'Ayoola Ade',
    ownerAvatarBg: '#eff6ff',
    ownerAvatarColor: '#1d4ed8'
  },
  {
    id: 't-2',
    title: 'Prepare discovery demo deck for Paystack',
    description: 'Tailor presentation around sales leadership coaching & commercial velocity.',
    priority: 'High',
    status: 'todo',
    dueDate: 'Tomorrow, 12:00 PM',
    dueCategory: 'upcoming',
    relatedType: 'meeting',
    relatedName: 'Paystack Discovery Call',
    ownerName: 'Ayoola Ade',
    ownerAvatarBg: '#eff6ff',
    ownerAvatarColor: '#1d4ed8'
  },
  {
    id: 't-3',
    title: 'Follow up on Flutterwave cross-border compliance review',
    description: 'Check in with leadership on executive board sign-off for 45 incoming compliance hires.',
    priority: 'High',
    status: 'todo',
    dueDate: 'In 2 days',
    dueCategory: 'upcoming',
    relatedType: 'deal',
    relatedName: 'Flutterwave',
    ownerName: 'Ayoola Ade',
    ownerAvatarBg: '#eff6ff',
    ownerAvatarColor: '#1d4ed8'
  },
  {
    id: 't-4',
    title: 'Re-engage stalled proposal at Delta Systems',
    description: 'Proposal viewed 4 times without reply. Follow-up recommended.',
    priority: 'Urgent',
    status: 'todo',
    dueDate: 'Yesterday (Overdue)',
    dueCategory: 'overdue',
    relatedType: 'deal',
    relatedName: 'Delta Systems',
    ownerName: 'Ayoola Ade',
    ownerAvatarBg: '#eff6ff',
    ownerAvatarColor: '#1d4ed8'
  },
  {
    id: 't-5',
    title: 'Review new hiring signal alert for Moniepoint',
    description: '32 new product & commercial openings detected in Lagos tech cluster.',
    priority: 'Medium',
    status: 'completed',
    dueDate: 'Yesterday',
    dueCategory: 'completed',
    relatedType: 'signal',
    relatedName: 'Moniepoint Inc',
    ownerName: 'Ayoola Ade',
    ownerAvatarBg: '#eff6ff',
    ownerAvatarColor: '#1d4ed8',
    completedAt: 'Yesterday, 2:30 PM'
  }
];

function calculateLocalKpi(list: TaskItem[]): TasksKpiSummary {
  const dueToday = list.filter(t => t.dueCategory === 'today' && t.status !== 'completed').length;
  const overdue = list.filter(t => t.dueCategory === 'overdue' && t.status !== 'completed').length;
  const upcoming = list.filter(t => t.dueCategory === 'upcoming' && t.status !== 'completed').length;
  const completedCount = list.filter(t => t.status === 'completed').length;

  return {
    dueToday,
    overdue,
    upcoming,
    completedCount
  };
}

/**
 * Fetch all tasks with optional filters.
 */
export async function fetchTasks(params?: {
  status?: string;
  priority?: string;
  dueCategory?: string;
  query?: string;
}): Promise<FetchTasksResult> {
  try {
    const result = await apiClient.get<FetchTasksResult | TaskItem[]>('/api/tasks', {
      params: {
        status: params?.status,
        priority: params?.priority,
        dueCategory: params?.dueCategory,
        q: params?.query
      }
    });

    if (Array.isArray(result)) {
      return { tasks: result, kpiSummary: calculateLocalKpi(result) };
    }
    return result;
  } catch (_err) {
    // Offline Engine Fallback
    let list = [...localTasks];

    if (params?.status && params.status !== 'all') {
      list = list.filter(t => t.status.toLowerCase() === params.status?.toLowerCase());
    }

    if (params?.priority && params.priority !== 'all') {
      list = list.filter(t => t.priority.toLowerCase() === params.priority?.toLowerCase());
    }

    if (params?.dueCategory && params.dueCategory !== 'all') {
      list = list.filter(t => t.dueCategory.toLowerCase() === params.dueCategory?.toLowerCase());
    }

    if (params?.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.relatedName.toLowerCase().includes(q)
      );
    }

    return { tasks: list, kpiSummary: calculateLocalKpi(localTasks) };
  }
}

/**
 * Get task by ID.
 */
export async function getTaskById(id: string): Promise<TaskItem> {
  try {
    return await apiClient.get<TaskItem>(`/api/tasks/${id}`);
  } catch (_err) {
    const found = localTasks.find(t => t.id === id);
    if (!found) throw new Error(`Task ${id} not found`);
    return found;
  }
}

/**
 * Create a new task.
 */
export async function createTask(payload: Partial<TaskItem>): Promise<TaskItem> {
  try {
    const created = await apiClient.post<TaskItem>('/api/tasks', payload);
    localTasks.unshift(created);
    return created;
  } catch (_err) {
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: payload.title || 'New Task',
      description: payload.description || '',
      priority: (payload.priority as TaskPriority) || 'Medium',
      status: (payload.status as TaskStatus) || 'todo',
      dueDate: payload.dueDate || 'Today, 5:00 PM',
      dueCategory: payload.dueCategory || 'today',
      relatedType: (payload.relatedType as TaskRelatedType) || 'deal',
      relatedName: payload.relatedName || 'General',
      ownerName: payload.ownerName || 'Ayoola Ade',
      ownerAvatarBg: '#eff6ff',
      ownerAvatarColor: '#1d4ed8'
    };
    localTasks.unshift(newTask);
    return newTask;
  }
}

/**
 * Update an existing task.
 */
export async function updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
  try {
    const updated = await apiClient.patch<TaskItem>(`/api/tasks/${id}`, updates);
    const idx = localTasks.findIndex(t => t.id === id);
    if (idx !== -1) localTasks[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localTasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      localTasks[idx] = { ...localTasks[idx], ...updates };
      return localTasks[idx];
    }
    throw new Error('Task not found');
  }
}

/**
 * Toggle task completed status.
 */
export async function toggleTaskComplete(id: string): Promise<TaskItem> {
  try {
    const updated = await apiClient.post<TaskItem>(`/api/tasks/${id}/toggle`);
    const idx = localTasks.findIndex(t => t.id === id);
    if (idx !== -1) localTasks[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localTasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const nextStatus: TaskStatus = localTasks[idx].status === 'completed' ? 'todo' : 'completed';
      localTasks[idx] = {
        ...localTasks[idx],
        status: nextStatus,
        dueCategory: nextStatus === 'completed' ? 'completed' : 'today',
        completedAt: nextStatus === 'completed' ? 'Just now' : undefined
      };
      return localTasks[idx];
    }
    throw new Error('Task not found');
  }
}

/**
 * Delete a task.
 */
export async function deleteTask(id: string): Promise<{ id: string; deleted: boolean }> {
  try {
    return await apiClient.delete<{ id: string; deleted: boolean }>(`/api/tasks/${id}`);
  } catch (_err) {
    localTasks = localTasks.filter(t => t.id !== id);
    return { id, deleted: true };
  }
}
