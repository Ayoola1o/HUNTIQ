import React from 'react';
import { 
  Zap, 
  FileText, 
  Mail, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

export const RecentActivityCard: React.FC = () => {
  const activities = [
    {
      id: '1',
      title: 'New signal detected for Acme Technologies',
      desc: 'Hiring surge: 38 new job postings',
      time: '10m ago',
      icon: <Zap size={14} color="#6366f1" />,
      iconBg: '#ede9fe',
    },
    {
      id: '2',
      title: 'Research report generated for FinServe Ltd',
      desc: 'Market & company research completed',
      time: '32m ago',
      icon: <FileText size={14} color="#0284c7" />,
      iconBg: '#e0f2fe',
    },
    {
      id: '3',
      title: 'Email opened by Michael Okoro (FinServe Ltd)',
      desc: 'Re: HR consulting proposal',
      time: '1h ago',
      icon: <Mail size={14} color="#d97706" />,
      iconBg: '#fef3c7',
    },
    {
      id: '4',
      title: 'Task completed: Call John Adewale',
      desc: 'Discovery call completed',
      time: '2h ago',
      icon: <CheckCircle2 size={14} color="#16a34a" />,
      iconBg: '#dcfce7',
    },
  ];

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
          onClick={(e) => e.preventDefault()}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#4f46e5',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          <span>View all</span>
          <ArrowRight size={13} />
        </a>
      </div>

      {/* List of activity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activities.map((act) => (
          <div
            key={act.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '6px 0',
              borderBottom: act.id !== '4' ? '1px solid #f8fafc' : 'none'
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
        ))}
      </div>
    </div>
  );
};
