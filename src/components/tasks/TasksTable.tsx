import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Search, 
  Plus, 
  Building2, 
  Kanban, 
  User, 
  Calendar 
} from 'lucide-react';
import type { TaskItem, TaskPriority } from '../../types/tasks';

interface TasksTableProps {
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onCreateTask: () => void;
  onNavigateToRelated: (type: string, name: string) => void;
}

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  onToggleTask,
  onCreateTask,
  onNavigateToRelated
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'overdue' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'today' && t.dueCategory !== 'today') return false;
    if (activeTab === 'overdue' && t.dueCategory !== 'overdue') return false;
    if (activeTab === 'upcoming' && t.dueCategory !== 'upcoming') return false;
    if (activeTab === 'completed' && t.status !== 'completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.relatedName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'Urgent':
        return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
      case 'High':
        return { color: '#ea580c', bg: '#fff7ed', border: '#ffedd5' };
      case 'Medium':
        return { color: '#2563eb', bg: '#eff6ff', border: '#dbeafe' };
      default:
        return { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
    }
  };

  const getRelatedIcon = (type: TaskItem['relatedType']) => {
    switch (type) {
      case 'company':
        return <Building2 size={11} color="#4f46e5" />;
      case 'deal':
        return <Kanban size={11} color="#059669" />;
      case 'contact':
        return <User size={11} color="#2563eb" />;
      default:
        return <Calendar size={11} color="#7c3aed" />;
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      margin: '0 32px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Table Controls Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left: Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'today', label: 'Due Today', count: tasks.filter(t => t.dueCategory === 'today').length },
            { id: 'overdue', label: 'Overdue', count: tasks.filter(t => t.dueCategory === 'overdue').length },
            { id: 'upcoming', label: 'Upcoming', count: tasks.filter(t => t.dueCategory === 'upcoming').length },
            { id: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#f5f3ff' : 'transparent',
                color: activeTab === tab.id ? '#6d28d9' : '#64748b'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '10px',
                backgroundColor: activeTab === tab.id ? '#ddd6fe' : '#f1f5f9',
                color: activeTab === tab.id ? '#5b21b6' : '#64748b',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Search & Create Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '5px 12px',
            width: '260px'
          }}>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search tasks, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '12px',
                color: '#0f172a',
                width: '100%',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            onClick={onCreateTask}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Plus size={13} />
            <span>+ New Task</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eaecf0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px', width: '36px' }}></th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Priority</th>
              <th style={{ padding: '12px 20px', fontWeight: 700 }}>Task & Description</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Connected Entity</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Due Date</th>
              <th style={{ padding: '12px 20px', fontWeight: 700 }}>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((t) => {
              const isCompleted = t.status === 'completed';
              const pBadge = getPriorityBadge(t.priority);

              return (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: isCompleted ? '#fafbfc' : '#ffffff',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isCompleted ? '#fafbfc' : '#ffffff';
                  }}
                >
                  {/* Checkbox */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => onToggleTask(t.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: isCompleted ? '#059669' : '#cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                  </td>

                  {/* Priority */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: pBadge.color,
                      backgroundColor: pBadge.bg,
                      border: `1px solid ${pBadge.border}`,
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {t.priority}
                    </span>
                  </td>

                  {/* Title & Description */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{
                      fontWeight: 800,
                      color: isCompleted ? '#94a3b8' : '#0f172a',
                      fontSize: '13px',
                      textDecoration: isCompleted ? 'line-through' : 'none'
                    }}>
                      {t.title}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: isCompleted ? '#cbd5e1' : '#64748b',
                      marginTop: '2px'
                    }}>
                      {t.description}
                    </div>
                  </td>

                  {/* Connected Entity */}
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => onNavigateToRelated(t.relatedType, t.relatedName)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {getRelatedIcon(t.relatedType)}
                      <span>{t.relatedName}</span>
                    </button>
                  </td>

                  {/* Due Date */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: t.dueCategory === 'overdue' ? '#dc2626' : t.dueCategory === 'today' ? '#ea580c' : '#475569'
                    }}>
                      {t.dueDate}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'capitalize' }}>
                      {t.dueCategory}
                    </div>
                  </td>

                  {/* Assignee */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: t.ownerAvatarBg,
                        color: t.ownerAvatarColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 800
                      }}>
                        {t.ownerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: '11.5px', color: '#334155', fontWeight: 600 }}>
                        {t.ownerName}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
