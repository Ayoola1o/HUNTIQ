import React from 'react';
import { 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Building, 
  MapPin, 
  Users, 
  Zap, 
  ArrowRight,
  Loader2
} from 'lucide-react';

export interface ActionCardData {
  id: string;
  type: 'search' | 'research' | 'crm_update' | 'outreach';
  status: 'proposed' | 'running' | 'completed';
  title: string;
  parameters: {
    industry?: string;
    location?: string;
    size?: string;
    signals?: string[];
    company?: string;
    stage?: string;
    dealValue?: string;
  };
  results?: {
    totalFound: number;
    highIntent: number;
    hotOpportunities: number;
  };
}

interface ActionCardProps {
  action: ActionCardData;
  onExecute: (id: string) => void;
  onViewResults?: (id: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, onExecute, onViewResults }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '14px',
      border: action.status === 'completed' ? '1.5px solid #a7f3d0' : '1.5px solid #c7d2fe',
      padding: '16px 18px',
      boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.08)',
      margin: '10px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: action.status === 'completed' ? '#ecfdf5' : '#eef2ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: action.status === 'completed' ? '#059669' : '#4f46e5'
          }}>
            {action.status === 'completed' ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {action.status === 'proposed' ? 'PROPOSED AUTONOMOUS ACTION' : action.status === 'running' ? 'EXECUTING ACTION...' : 'ACTION COMPLETED'}
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
              {action.title}
            </div>
          </div>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          backgroundColor: action.status === 'completed' ? '#ecfdf5' : '#eff6ff',
          color: action.status === 'completed' ? '#047857' : '#1d4ed8',
          padding: '3px 8px',
          borderRadius: '6px',
          border: `1px solid ${action.status === 'completed' ? '#a7f3d0' : '#bfdbfe'}`
        }}>
          {action.status === 'proposed' ? 'Requires Approval' : action.status === 'running' ? 'In Progress' : 'Verified'}
        </span>
      </div>

      {/* Parameter Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
        backgroundColor: '#f8fafc',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '12px'
      }}>
        {action.parameters.industry && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
            <Building size={14} color="#6366f1" />
            <span>{action.parameters.industry}</span>
          </div>
        )}

        {action.parameters.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
            <MapPin size={14} color="#0284c7" />
            <span>{action.parameters.location}</span>
          </div>
        )}

        {action.parameters.size && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
            <Users size={14} color="#2563eb" />
            <span>{action.parameters.size}</span>
          </div>
        )}

        {action.parameters.signals && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
            <Zap size={14} color="#d97706" />
            <span>{action.parameters.signals.join(' + ')}</span>
          </div>
        )}
      </div>

      {/* Execution Results if completed */}
      {action.status === 'completed' && action.results && (
        <div style={{
          display: 'flex',
          gap: '12px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <div><strong>{action.results.totalFound}</strong> prospects found</div>
          <div>•</div>
          <div><strong style={{ color: '#0284c7' }}>{action.results.highIntent}</strong> high-intent</div>
          <div>•</div>
          <div><strong style={{ color: '#e11d48' }}>{action.results.hotOpportunities}</strong> hot opportunities (Score &gt; 85)</div>
        </div>
      )}

      {/* CTA Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        {action.status === 'proposed' && (
          <button
            onClick={() => onExecute(action.id)}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
            }}
          >
            <Play size={14} fill="#ffffff" />
            <span>Execute Search</span>
          </button>
        )}

        {action.status === 'running' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6366f1',
            fontSize: '12.5px',
            fontWeight: 600
          }}>
            <Loader2 size={16} className="animate-spin" />
            <span>Querying HUNTIQ Signal Radar...</span>
          </div>
        )}

        {action.status === 'completed' && (
          <button
            onClick={() => onViewResults?.(action.id)}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>View 50 Results</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
