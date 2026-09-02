import React from 'react';
import { 
  Users, 
  Flame, 
  Zap, 
  Briefcase, 
  DollarSign, 
  Calculator, 
  Tag 
} from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

interface KpiCardsProps {
  onCardClick?: (metricId: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ onCardClick }) => {
  const { companies, signals, pipelineDeals, formatCurrency } = useHuntiq();

  // Dynamic real data calculations
  const totalProspectsCount = companies.length;
  const hotOppsCount = companies.filter(c => (c.opportunityScore || 0) >= 80).length;
  const signalsCount = signals.length;
  const activeDeals = pipelineDeals.filter(d => d.stage !== 'lost');
  const activeDealsCount = activeDeals.length;
  
  const pipelineValueTotal = activeDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);
  const expectedRevenueTotal = activeDeals.reduce((sum, d) => {
    const prob = (d.probability ?? 50) / 100;
    return sum + Math.round((d.dealValue || 0) * prob);
  }, 0);

  const avgDealSizeVal = activeDealsCount > 0 ? Math.round(pipelineValueTotal / activeDealsCount) : 0;

  const kpis = [
    {
      id: 'prospects',
      label: 'Total Prospects',
      value: totalProspectsCount.toLocaleString(),
      trend: totalProspectsCount > 0 ? 'Live Stream' : '0 verified',
      period: 'active directory',
      icon: <Users size={16} color="#7c3aed" />,
      iconBg: '#f3e8ff',
    },
    {
      id: 'hot_opps',
      label: 'Hot Opportunities',
      value: hotOppsCount.toLocaleString(),
      trend: hotOppsCount > 0 ? `${Math.round((hotOppsCount / Math.max(1, totalProspectsCount)) * 100)}% of total` : '0 active',
      period: 'score ≥ 80',
      icon: <Flame size={16} color="#e11d48" />,
      iconBg: '#ffe4e6',
    },
    {
      id: 'signals',
      label: 'Buying Signals',
      value: signalsCount.toLocaleString(),
      trend: signalsCount > 0 ? 'Verified real-time' : '0 detected',
      period: 'active telemetry',
      icon: <Zap size={16} color="#d97706" />,
      iconBg: '#fef3c7',
    },
    {
      id: 'deals',
      label: 'Active Deals',
      value: activeDealsCount.toLocaleString(),
      trend: activeDealsCount > 0 ? 'In pipeline' : '0 in pipeline',
      period: 'pipeline stages',
      icon: <Briefcase size={16} color="#4f46e5" />,
      iconBg: '#e0e7ff',
    },
    {
      id: 'pipeline',
      label: 'Pipeline Value',
      value: formatCurrency(pipelineValueTotal),
      trend: 'Cumulative volume',
      period: 'active pipeline',
      icon: <DollarSign size={16} color="#16a34a" />,
      iconBg: '#dcfce7',
    },
    {
      id: 'revenue',
      label: 'Expected Revenue',
      value: formatCurrency(expectedRevenueTotal),
      trend: 'Weighted forecast',
      period: 'probability weighted',
      icon: <Calculator size={16} color="#0284c7" />,
      iconBg: '#e0f2fe',
    },
    {
      id: 'avg_deal',
      label: 'Avg. Deal Size',
      value: formatCurrency(avgDealSizeVal),
      trend: 'Per active deal',
      period: 'deal average',
      icon: <Tag size={16} color="#9333ea" />,
      iconBg: '#f5f3ff',
    },
  ];

  return (
    <div className="responsive-container" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
      gap: '12px',
      padding: '0 24px',
    }}>
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          onClick={() => onCardClick?.(kpi.id)}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #eaecf0',
            padding: '14px 14px 12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
            e.currentTarget.style.borderColor = '#eaecf0';
          }}
        >
          {/* Top Row: Icon + Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              backgroundColor: kpi.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {kpi.icon}
            </div>
            <span style={{
              fontSize: '11.5px',
              color: '#64748b',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {kpi.label}
            </span>
          </div>

          {/* Big Metric Value */}
          <div style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '6px',
            fontFamily: 'var(--font-primary)'
          }}>
            {kpi.value}
          </div>

          {/* Bottom Trend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>
              {kpi.trend}
            </span>
            <span style={{ color: '#94a3b8', fontWeight: 400 }}>
              {kpi.period}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
