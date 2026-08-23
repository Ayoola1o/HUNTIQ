import React from 'react';
import { 
  Briefcase, 
  Flame, 
  Star, 
  ShieldCheck, 
  BarChart3, 
  Tag, 
  ArrowUpRight 
} from 'lucide-react';

interface OpportunitiesKpiCardsProps {
  activeFilter: string;
  onSelectKpi: (filter: string) => void;
}

export const OpportunitiesKpiCards: React.FC<OpportunitiesKpiCardsProps> = ({
  activeFilter,
  onSelectKpi
}) => {
  const kpis = [
    {
      id: 'all',
      title: 'Total Opportunities',
      value: '284',
      change: '↑ 24.7% vs last 30 days',
      icon: <Briefcase size={16} color="#7c3aed" />,
      iconBg: '#f5f3ff'
    },
    {
      id: 'hot',
      title: 'Hot Opportunities',
      value: '68',
      change: '↑ 19.3% vs last 30 days',
      icon: <Flame size={16} color="#e11d48" />,
      iconBg: '#ffe4e6'
    },
    {
      id: 'high',
      title: 'High Priority',
      value: '116',
      change: '↑ 23.5% vs last 30 days',
      icon: <Star size={16} color="#d97706" />,
      iconBg: '#fef3c7'
    },
    {
      id: 'pipeline',
      title: 'Pipeline Value',
      value: '$428,600',
      change: '↑ 16.1% vs last 30 days',
      icon: <ShieldCheck size={16} color="#059669" />,
      iconBg: '#ecfdf5'
    },
    {
      id: 'expected',
      title: 'Expected Revenue',
      value: '$176,400',
      change: '↑ 19.3% vs last 30 days',
      icon: <BarChart3 size={16} color="#2563eb" />,
      iconBg: '#eff6ff'
    },
    {
      id: 'deal_size',
      title: 'Avg. Deal Size',
      value: '$25,812',
      change: '↑ 8.7% vs last 30 days',
      icon: <Tag size={16} color="#8b5cf6" />,
      iconBg: '#faf5ff'
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '14px',
      padding: '0 32px'
    }}>
      {kpis.map((k) => {
        const isSelected = activeFilter === k.id;
        return (
          <div
            key={k.id}
            onClick={() => onSelectKpi(k.id)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: isSelected ? '1.5px solid #6366f1' : '1px solid #eaecf0',
              padding: '16px 18px',
              boxShadow: isSelected 
                ? '0 6px 16px -2px rgba(99, 102, 241, 0.15)' 
                : '0 1px 3px rgba(16, 24, 40, 0.04)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '100px',
              transition: 'all 0.18s ease'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = '#c7d2fe';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = '#eaecf0';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {/* Header: Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: k.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {k.icon}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {k.title}
              </span>
            </div>

            {/* Value */}
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              marginTop: '8px',
              marginBottom: '4px',
              fontFamily: 'var(--font-primary)'
            }}>
              {k.value}
            </div>

            {/* Delta badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#059669'
            }}>
              <ArrowUpRight size={13} />
              <span>{k.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
