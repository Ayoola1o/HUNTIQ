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
import { useHuntiq } from '../../context/HuntiqContext';

interface SignalsKpiCardsProps {
  activeFilter: string;
  onSelectKpi: (filter: string) => void;
}

export const SignalsKpiCards: React.FC<SignalsKpiCardsProps> = ({
  activeFilter,
  onSelectKpi
}) => {
  const { signals = [], companies = [] } = useHuntiq();

  const totalSignalsCount = signals.length;
  const newSignalsCount = signals.filter(s => {
    const timeStr = String(s.detectedTime || s.detectedTimestamp || '');
    return timeStr.includes('ago') || timeStr.includes('Just now') || timeStr.includes('Today') || !timeStr;
  }).length;

  const highImpactCount = signals.filter(s => 
    s.impactLevel === 'Very High' || s.impactLevel === 'High' || (s.impactScore || 0) >= 85
  ).length;

  const companiesAffectedCount = new Set(signals.map(s => String(s.companyName || 'Corporate Entity'))).size;
  const hotCompaniesCount = companies.filter(c => (c.opportunityScore || 0) >= 80).length;
  const avgImpactVal = totalSignalsCount > 0 
    ? Math.round(signals.reduce((sum, s) => sum + (s.impactScore || 80), 0) / totalSignalsCount) 
    : 0;

  const kpis = [
    {
      id: 'total',
      title: 'Total Signals',
      value: totalSignalsCount.toLocaleString(),
      change: 'Active intelligence stream',
      icon: <Radio size={16} color="#7c3aed" />,
      iconBg: '#f5f3ff'
    },
    {
      id: 'new',
      title: 'New Signals',
      value: newSignalsCount.toLocaleString(),
      change: 'Recently detected',
      icon: <Users size={16} color="#059669" />,
      iconBg: '#ecfdf5'
    },
    {
      id: 'high_impact',
      title: 'High Impact Signals',
      value: highImpactCount.toLocaleString(),
      change: 'Score ≥ 85 / Very High',
      icon: <Flame size={16} color="#e11d48" />,
      iconBg: '#ffe4e6'
    },
    {
      id: 'companies',
      title: 'Companies Affected',
      value: companiesAffectedCount.toLocaleString(),
      change: 'Unique corporate entities',
      icon: <Building2 size={16} color="#2563eb" />,
      iconBg: '#eff6ff'
    },
    {
      id: 'hot_companies',
      title: 'Hot Companies',
      value: hotCompaniesCount.toLocaleString(),
      change: 'High conversion propensity',
      icon: <Star size={16} color="#d97706" />,
      iconBg: '#fef3c7'
    },
    {
      id: 'avg_impact',
      title: 'Avg. Signal Impact',
      value: `${avgImpactVal}/100`,
      change: 'Weighted telemetry score',
      icon: <Activity size={16} color="#8b5cf6" />,
      iconBg: '#faf5ff'
    },
  ];

  return (
    <div className="kpi-grid-6">
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
              padding: '14px 14px',
              boxShadow: isSelected 
                ? '0 6px 16px -2px rgba(99, 102, 241, 0.15)' 
                : '0 1px 3px rgba(16, 24, 40, 0.04)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '94px',
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
