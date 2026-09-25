import React, { useMemo } from 'react';
import { 
  Zap, 
  FileText, 
  Mail, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

export const RecentActivityCard: React.FC = () => {
  const { navigateTo, userActivityLogs, signals, pipelineDeals } = useHuntiq();

  const activities = useMemo(() => {
    // 1. Prefer authenticated userActivityLogs from PostgreSQL
    if (userActivityLogs && userActivityLogs.length > 0) {
      return userActivityLogs.slice(0, 4).map((log: any, idx: number) => ({
        id: log.id || `log-${idx}`,
        title: log.action || log.title || 'User activity recorded',
        desc: log.description || log.detail || log.resource || 'Workspace event',
        time: log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        icon: <CheckCircle2 size={14} color="#16a34a" />,
        iconBg: '#dcfce7',
      }));
    }

    // 2. Otherwise derive from recent live signals and pipeline deals
    const derived: any[] = [];

    signals.slice(0, 2).forEach((sig, idx) => {
      derived.push({
        id: `sig-act-${sig.id || idx}`,
        title: `New signal: ${sig.companyName || 'Target account'}`,
        desc: sig.title || sig.whyItMatters || 'Buying trigger detected',
        time: sig.detectedTime || 'Recently',
        icon: <Zap size={14} color="#6366f1" />,
        iconBg: '#ede9fe',
      });
    });

    pipelineDeals.slice(0, 2).forEach((deal, idx) => {
      derived.push({
        id: `deal-act-${deal.id || idx}`,
        title: `Deal: ${deal.companyName || 'Account'}`,
        desc: `Stage: ${deal.stage} • ${deal.dealTitle || 'Strategic Opportunity'}`,
        time: deal.stageEnteredAt || 'Recently',
        icon: <TrendingUp size={14} color="#0284c7" />,
        iconBg: '#e0f2fe',
      });
    });

    return derived.slice(0, 4);
  }, [userActivityLogs, signals, pipelineDeals]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      flex: 1
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 800,
          color: '#0f172a',
          margin: 0,
          fontFamily: 'var(--font-primary)'
        }}>
          Recent activity
        </h3>

        <a
          href="#activity"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('signals');
          }}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#4f46e5',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <span>View all</span>
          <ArrowRight size={13} />
        </a>
      </div>

      {/* List of activity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activities.length === 0 ? (
          <div style={{
            padding: '24px 12px',
            textAlign: 'center',
            backgroundColor: '#fafbfc',
            borderRadius: '10px',
            border: '1px dashed #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Zap size={18} color="#94a3b8" />
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              No recent activity logged yet
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Signal discoveries and pipeline events will record here automatically.
            </div>
          </div>
        ) : (
          activities.map((act, index) => (
            <div
              key={act.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '10px',
                padding: '6px 0',
                borderBottom: index !== activities.length - 1 ? '1px solid #f8fafc' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: act.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {act.icon}
                </div>

                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                    {act.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {act.desc}
                  </div>
                </div>
              </div>

              <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {act.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
