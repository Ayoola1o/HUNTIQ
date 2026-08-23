import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { TasksKpiCards } from './TasksKpiCards';
import { TasksTable } from './TasksTable';
import { NewTaskModal } from './NewTaskModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { TaskItem, TasksKpiSummary } from '../../types/tasks';
import { 
  CheckSquare, 
  Sparkles, 
  Plus 
} from 'lucide-react';

interface TasksPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState('due_today');

  // Initial Mock Tasks
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 't-1',
      title: 'Send revised contract SLA to Jane Smith',
      description: 'Negotiate 3-month regional leadership ramp payment terms.',
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
      title: 'Prepare demo deck for Paystack discovery call',
      description: 'Highlight sales enablement & leadership coaching curriculum.',
      priority: 'High',
      status: 'todo',
      dueDate: 'Thursday, 12:00 PM',
      dueCategory: 'upcoming',
      relatedType: 'meeting',
      relatedName: 'Paystack Demo Call',
      ownerName: 'Ayoola Ade',
      ownerAvatarBg: '#eff6ff',
      ownerAvatarColor: '#1d4ed8'
    },
    {
      id: 't-3',
      title: 'Follow up on Flutterwave proposal executive review',
      description: 'Check in with Oluwaseun on board approval for 45 compliance hires.',
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
      title: 'Re-engage Delta Systems COO regarding stalled proposal',
      description: 'Proposal viewed 4 times without response in 6 days.',
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
      description: '32 new product & commercial openings detected in Lagos.',
      priority: 'Medium',
      status: 'completed',
      dueDate: 'May 16',
      dueCategory: 'completed',
      relatedType: 'company',
      relatedName: 'Moniepoint Inc',
      ownerName: 'Ayoola Ade',
      ownerAvatarBg: '#eff6ff',
      ownerAvatarColor: '#1d4ed8',
      completedAt: 'May 16, 2:30 PM'
    }
  ]);

  const kpiSummary: TasksKpiSummary = {
    dueToday: tasks.filter(t => t.dueCategory === 'today').length,
    overdue: tasks.filter(t => t.dueCategory === 'overdue').length,
    upcoming: tasks.filter(t => t.dueCategory === 'upcoming').length,
    completedCount: 124
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
        return {
          ...t,
          status: nextStatus,
          dueCategory: nextStatus === 'completed' ? 'completed' : t.dueCategory
        };
      }
      return t;
    }));
  };

  const handleCreateTask = (newTask: TaskItem) => {
    setTasks([newTask, ...tasks]);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f4f6fa',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Sidebar */}
      <DashboardSidebar
        activeNav="tasks"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        paddingBottom: '40px'
      }}>
        {/* Top Header */}
        <header style={{
          height: '62px',
          minHeight: '62px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dbeafe'
            }}>
              <CheckSquare size={16} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Tasks & Sales Action Items
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Stay on top of follow-ups, calls, and actions that accelerate revenue
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsCopilotOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                color: '#6d28d9',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={13} />
              <span>Ask AI Copilot</span>
            </button>

            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Plus size={14} />
              <span>+ New Task</span>
            </button>
          </div>
        </header>

        {/* KPI Metrics Row */}
        <div style={{ margin: '20px 0' }}>
          <TasksKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Tasks Table */}
        <TasksTable
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onCreateTask={() => setIsNewTaskModalOpen(true)}
          onNavigateToRelated={(type) => {
            if (type === 'deal') onNavigate('pipeline');
            else if (type === 'company') onNavigate('research');
            else if (type === 'meeting') onNavigate('meetings');
            else onNavigate('contacts');
          }}
        />
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      {/* AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={() => {
          setIsCopilotOpen(false);
          onNavigate('research');
        }}
      />
    </div>
  );
};
