import type { TaskItem } from '../../../src/types/tasks';
import type { TaskRepository, TaskFilterOptions } from './task-repository';

export class InMemoryTaskRepository implements TaskRepository {
  private static tasksByWorkspace = new Map<string, TaskItem[]>();

  constructor() {
    const defaultWs = 'ws-default-001';
    if (!InMemoryTaskRepository.tasksByWorkspace.has(defaultWs)) {
      InMemoryTaskRepository.tasksByWorkspace.set(defaultWs, [
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
        }
      ]);
    }
  }

  public async list(workspaceId: string, filter?: TaskFilterOptions): Promise<TaskItem[]> {
    const list = InMemoryTaskRepository.tasksByWorkspace.get(workspaceId) || [];
    let filtered = [...list];

    if (filter?.status && filter.status !== 'all') {
      filtered = filtered.filter(t => t.status === filter.status);
    }
    if (filter?.priority && filter.priority !== 'all') {
      filtered = filtered.filter(t => t.priority.toLowerCase() === filter.priority!.toLowerCase());
    }
    if (filter?.dueCategory && filter.dueCategory !== 'all') {
      filtered = filtered.filter(t => t.dueCategory === filter.dueCategory);
    }
    if (filter?.query?.trim()) {
      const q = filter.query.toLowerCase().trim();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.relatedName.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  public async getById(id: string, workspaceId: string): Promise<TaskItem | undefined> {
    const list = InMemoryTaskRepository.tasksByWorkspace.get(workspaceId) || [];
    return list.find(t => t.id === id);
  }

  public async create(task: Partial<TaskItem>, workspaceId: string, _userId?: string): Promise<TaskItem> {
    const newItem: TaskItem = {
      id: task.id || `t-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: task.title || 'Untitled Task',
      description: task.description || '',
      priority: task.priority || 'Medium',
      status: task.status || 'todo',
      dueDate: task.dueDate || 'Tomorrow',
      dueCategory: task.dueCategory || 'upcoming',
      relatedType: task.relatedType || 'deal',
      relatedName: task.relatedName || 'General Account',
      ownerName: task.ownerName || 'Ayoola Ade',
      ownerAvatarBg: task.ownerAvatarBg || '#eff6ff',
      ownerAvatarColor: task.ownerAvatarColor || '#1d4ed8'
    };

    const current = InMemoryTaskRepository.tasksByWorkspace.get(workspaceId) || [];
    current.unshift(newItem);
    InMemoryTaskRepository.tasksByWorkspace.set(workspaceId, current);

    return newItem;
  }

  public async update(id: string, partial: Partial<TaskItem>, workspaceId: string): Promise<TaskItem | undefined> {
    const list = InMemoryTaskRepository.tasksByWorkspace.get(workspaceId) || [];
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...list[index],
      ...partial
    };
    list[index] = updated;
    return updated;
  }

  public async delete(id: string, workspaceId: string): Promise<boolean> {
    const list = InMemoryTaskRepository.tasksByWorkspace.get(workspaceId) || [];
    const filtered = list.filter(t => t.id !== id);
    if (filtered.length === list.length) return false;

    InMemoryTaskRepository.tasksByWorkspace.set(workspaceId, filtered);
    return true;
  }
}
