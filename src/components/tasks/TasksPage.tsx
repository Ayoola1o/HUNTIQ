import React, { useState, useEffect, useCallback } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { TasksKpiCards } from './TasksKpiCards';
import { TasksTable } from './TasksTable';
import { NewTaskModal } from './NewTaskModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { TaskItem, TasksKpiSummary } from '../../types/tasks';
import { 
  fetchTasks, 
  toggleTaskComplete as apiToggleTaskComplete, 
  createTask as apiCreateTask 
} from '../../api/tasks';
import { 
  CheckSquare, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
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

  // Live Task State
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [kpiSummary, setKpiSummary] = useState<TasksKpiSummary>({
    dueToday: 0,
    overdue: 0,
    upcoming: 0,
    completedCount: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const loadTasks = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchTasks();
      setTasks(response.tasks || []);
      if (response.kpiSummary) {
        setKpiSummary(response.kpiSummary);
      }
    } catch (err: any) {
      console.error('Failed to load tasks from API:', err);
      setErrorMessage(err?.message || 'Unable to connect to live tasks server');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggleTask = async (taskId: string) => {
    try {
      const updated = await apiToggleTaskComplete(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      setActionToast(
        updated.status === 'completed' 
          ? 'Task marked as complete! 🎉' 
          : 'Task reopened and moved to To-Do'
      );
      setTimeout(() => setActionToast(null), 3000);
      await loadTasks(true);
    } catch (err: any) {
      console.error('Failed to toggle task completion:', err);
      setActionToast('Failed to update task status');
      setTimeout(() => setActionToast(null), 3000);
    }
  };

  const handleCreateTask = async (newTaskPayload: Partial<TaskItem>) => {
    try {
      const created = await apiCreateTask(newTaskPayload);
      setTasks(prev => [created, ...prev]);
      setActionToast(`Action item "${created.title}" created!`);
      setTimeout(() => setActionToast(null), 3500);
      await loadTasks(true);
    } catch (err: any) {
      console.error('Failed to create task:', err);
      setActionToast('Failed to create task');
      setTimeout(() => setActionToast(null), 3000);
    }
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Sales Tasks & Action Items
                </h1>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  SYNCED
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Prioritize deal momentum, follow-ups, contract reviews, and meeting actions
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Sync Button */}
            <button
              onClick={() => loadTasks(true)}
              disabled={isRefreshing}
              title="Sync tasks with live backend"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#475569',
                cursor: isRefreshing ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

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

        {/* Action Toast Banner */}
        {actionToast && (
          <div style={{
            margin: '12px 32px 0',
            padding: '10px 16px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#065f46',
            fontWeight: 600
          }}>
            <CheckCircle2 size={15} color="#059669" />
            <span>{actionToast}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div style={{
            margin: '12px 32px 0',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#991b1b',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#dc2626" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => loadTasks(true)}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* KPI Metrics Row */}
        <div style={{ margin: '20px 0' }}>
          <TasksKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Tasks Table / Loading State */}
        {isLoading ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #eaecf0',
            margin: '0 32px',
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <Loader2 size={32} color="#4f46e5" className="animate-spin" />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Loading Action Items...
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Retrieving high-priority sales execution tasks and deadlines
            </div>
          </div>
        ) : (
          <TasksTable
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onCreateTask={() => setIsNewTaskModalOpen(true)}
            onNavigateToRelated={(type) => {
              if (type === 'deal') onNavigate('pipeline');
              else if (type === 'meeting') onNavigate('meetings');
              else if (type === 'company') onNavigate('companies');
              else onNavigate('pipeline');
            }}
          />
        )}
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
