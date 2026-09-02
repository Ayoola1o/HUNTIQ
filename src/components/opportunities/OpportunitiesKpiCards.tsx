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
import { useHuntiq } from '../../context/HuntiqContext';

interface OpportunitiesKpiCardsProps {
  activeFilter: string;
  onSelectKpi: (filter: string) => void;
}

export const OpportunitiesKpiCards: React.FC<OpportunitiesKpiCardsProps> = ({
  activeFilter,
  onSelectKpi
}) => {
  const { companies, pipelineDeals, formatCurrency } = useHuntiq();

  const totalOppsCount = companies.length;
  const hotCount = companies.filter(c => (c.opportunityScore || 0) >= 85).length;
  const highCount = companies.filter(c => (c.opportunityScore || 0) >= 75 && (c.opportunityScore || 0) < 85).length;
  
  const activeDeals = pipelineDeals.filter(d => d.stage !== 'lost');
  const pipelineValueTotal = activeDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);
  const expectedRevenueTotal = activeDeals.reduce((sum, d) => {
    const prob = (d.probability ?? 50) / 100;
    return sum + Math.round((d.dealValue || 0) * prob);
  }, 0);
  const avgDealSizeVal = activeDeals.length > 0 ? Math.round(pipelineValueTotal / activeDeals.length) : 0;

  const kpis = [
    {
      id: 'all',
      title: 'Total Opportunities',
      value: totalOppsCount.toLocaleString(),
      change: 'Active account directory',
      icon: <Briefcase size={16} color="#7c3aed" />,
      iconBg: '#f5f3ff'
    },
    {
      id: 'hot',
      title: 'Hot Opportunities',
      value: hotCount.toLocaleString(),
      change: 'Score ≥ 85',
      icon: <Flame size={16} color="#e11d48" />,
      iconBg: '#ffe4e6'
    },
    {
      id: 'high',
      title: 'High Priority',
      value: highCount.toLocaleString(),
      change: 'Score 75 - 84',
      icon: <Star size={16} color="#d97706" />,
      iconBg: '#fef3c7'
    },
    {
      id: 'pipeline',
      title: 'Pipeline Value',
      value: formatCurrency(pipelineValueTotal),
      change: `${activeDeals.length} active deals`,
      icon: <ShieldCheck size={16} color="#059669" />,
      iconBg: '#ecfdf5'
    },
    {
      id: 'expected',
      title: 'Expected Revenue',
      value: formatCurrency(expectedRevenueTotal),
      change: 'Weighted conversion',
      icon: <BarChart3 size={16} color="#2563eb" />,
      iconBg: '#eff6ff'
    },
    {
      id: 'deal_size',
      title: 'Avg. Deal Size',
      value: formatCurrency(avgDealSizeVal),
      change: 'Per active deal',
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
