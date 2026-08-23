import React from 'react';
import { 
  Radio, 
  Users, 
  Flame, 
  Building2, 
  Star, 
  Activity, 
  ArrowUpRight 
} from 'lucide-react';

interface SignalsKpiCardsProps {
  activeFilter: string;
  onSelectKpi: (filter: string) => void;
}

export const SignalsKpiCards: React.FC<SignalsKpiCardsProps> = ({
  activeFilter,
  onSelectKpi
}) => {
  const kpis = [
    {
      id: 'total',
      title: 'Total Signals',
      value: '1,429',
      change: '↑ 31.2% vs last 30 days',
      icon: <Radio size={16} color="#7c3aed" />,
      iconBg: '#f5f3ff'
    },
    {
      id: 'new',
      title: 'New Signals',
      value: '184',
      change: '↑ 28.7% vs last 30 days',
      icon: <Users size={16} color="#059669" />,
      iconBg: '#ecfdf5'
    },
    {
      id: 'high_impact',
      title: 'High Impact Signals',
      value: '97',
      change: '↑ 26.4% vs last 30 days',
      icon: <Flame size={16} color="#e11d48" />,
      iconBg: '#ffe4e6'
    },
    {
      id: 'companies',
      title: 'Companies Affected',
      value: '386',
      change: '↑ 24.3% vs last 30 days',
      icon: <Building2 size={16} color="#2563eb" />,
      iconBg: '#eff6ff'
    },
    {
      id: 'hot_companies',
      title: 'Hot Companies',
      value: '68',
      change: '↑ 19.8% vs last 30 days',
      icon: <Star size={16} color="#d97706" />,
      iconBg: '#fef3c7'
    },
    {
      id: 'avg_impact',
      title: 'Avg. Signal Impact',
      value: '78/100',
      change: '↑ 15.1% vs last 30 days',
      icon: <Activity size={16} color="#8b5cf6" />,
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
