import type {
  TaskItem,
  TasksKpiSummary,
  TaskPriority,
  TaskStatus,
  TaskRelatedType
} from '../../src/types/tasks';
import { db } from '../db/memoryStore';

export class TaskService {
  private tasks: TaskItem[] = [];

  constructor() {
    this.seedTasksFromEngine();
  }

  /**
   * Seed tasks linked to real opportunities, contacts, and detected signals in memoryStore.
   */
  private seedTasksFromEngine() {
    const companies = db.companies;
    const contacts = db.contacts;
    const signals = db.signals;

    const comp1 = companies[0] || { name: 'Acme Technologies' };
    const comp2 = companies[1] || { name: 'Paystack' };
    const comp3 = companies[2] || { name: 'Flutterwave' };
    const contact1 = contacts[0] || { name: 'Jane Smith' };
    const signal1 = signals[0] || { title: 'Hiring surge detected' };

    this.tasks = [
      {
        id: 't-1',
        title: `Send revised enterprise SLA to ${contact1.name}`,
        description: 'Negotiate 3-month regional leadership enablement sprint & payment milestones.',
        priority: 'Urgent',
        status: 'todo',
        dueDate: 'Today, 4:00 PM',
        dueCategory: 'today',
        relatedType: 'deal',
        relatedName: comp1.name,
        ownerName: 'Ayoola Ade',
        ownerAvatarBg: '#eff6ff',
        ownerAvatarColor: '#1d4ed8'
      },
      {
        id: 't-2',
        title: `Prepare discovery demo deck for ${comp2.name}`,
        description: 'Tailor presentation around sales leadership coaching & commercial velocity.',
        priority: 'High',
        status: 'todo',
        dueDate: 'Tomorrow, 12:00 PM',
        dueCategory: 'upcoming',
        relatedType: 'meeting',
        relatedName: `${comp2.name} Discovery Call`,
        ownerName: 'Ayoola Ade',
        ownerAvatarBg: '#eff6ff',
        ownerAvatarColor: '#1d4ed8'
      },
      {
        id: 't-3',
        title: `Follow up on ${comp3.name} cross-border compliance review`,
        description: 'Check in with leadership on executive board sign-off for 45 incoming compliance hires.',
        priority: 'High',
        status: 'todo',
        dueDate: 'In 2 days',
        dueCategory: 'upcoming',
        relatedType: 'deal',
        relatedName: comp3.name,
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
        title: `Analyze recent momentum signal: ${signal1.title}`,
        description: '32 new product & commercial openings detected in Lagos tech cluster.',
        priority: 'Medium',
        status: 'completed',
        dueDate: 'Yesterday',
        dueCategory: 'completed',
        relatedType: 'signal',
        relatedName: signal1.title,
        ownerName: 'Ayoola Ade',
        ownerAvatarBg: '#eff6ff',
        ownerAvatarColor: '#1d4ed8',
        completedAt: 'Yesterday, 2:30 PM'
      }
    ];
  }

  /**
   * Calculate live KPI metrics across tasks.
   */
  public calculateKpiSummary(list: TaskItem[]): TasksKpiSummary {
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
   * List tasks with optional filtering.
   */
  public list(params?: {
    status?: string;
    priority?: string;
    dueCategory?: string;
    query?: string;
  }): { tasks: TaskItem[]; kpiSummary: TasksKpiSummary } {
    let results = [...this.tasks];

    if (params?.status && params.status !== 'all') {
      results = results.filter(t => t.status.toLowerCase() === params.status?.toLowerCase());
    }

    if (params?.priority && params.priority !== 'all') {
      results = results.filter(t => t.priority.toLowerCase() === params.priority?.toLowerCase());
    }

    if (params?.dueCategory && params.dueCategory !== 'all') {
      results = results.filter(t => t.dueCategory.toLowerCase() === params.dueCategory?.toLowerCase());
    }

    if (params?.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      results = results.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.relatedName.toLowerCase().includes(q)
      );
    }

    return {
      tasks: results,
      kpiSummary: this.calculateKpiSummary(this.tasks)
    };
  }

  /**
   * Get task by ID.
   */
  public getById(id: string): TaskItem | undefined {
    return this.tasks.find(t => t.id === id);
  }

  /**
   * Create a new task.
   */
  public create(payload: Partial<TaskItem>): TaskItem {
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: payload.title || 'New Sales Action Item',
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

    this.tasks.unshift(newTask);
    return newTask;
  }

  /**
   * Update task fields.
   */
  public update(id: string, updates: Partial<TaskItem>): TaskItem | undefined {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return undefined;

    this.tasks[idx] = {
      ...this.tasks[idx],
      ...updates
    };

    return this.tasks[idx];
  }

  /**
   * Toggle task completion status.
   */
  public toggleComplete(id: string): TaskItem | undefined {
    const task = this.getById(id);
    if (!task) return undefined;

    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    const completedAt = nextStatus === 'completed' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;
    const dueCategory = nextStatus === 'completed' ? 'completed' : 'today';

    return this.update(id, {
      status: nextStatus,
      completedAt,
      dueCategory
    });
  }

  /**
   * Delete task by ID.
   */
  public delete(id: string): boolean {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    return this.tasks.length < initialLen;
  }
}

export const taskService = new TaskService();
