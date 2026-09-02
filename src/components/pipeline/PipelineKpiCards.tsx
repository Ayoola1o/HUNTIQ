import React from 'react';
import { 
  Kanban, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Briefcase 
} from 'lucide-react';
import type { PipelineKpiSummary } from '../../types/pipeline';

import { useHuntiq } from '../../context/HuntiqContext';

interface PipelineKpiCardsProps {
  summary: PipelineKpiSummary;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const PipelineKpiCards: React.FC<PipelineKpiCardsProps> = ({
  summary,
  activeFilter,
  onSelectFilter
}) => {
  const { formatCurrency } = useHuntiq();

  const cards = [
    {
      id: 'active_deals',
      title: 'Active Deals',
      value: summary.activeDeals.toString(),
      subtext: 'In active sales process',
      icon: <Kanban size={16} color="#4f46e5" />,
      iconBg: '#eff6ff',
      sparklineColor: '#6366f1',
      sparkPath: 'M0,18 Q20,8 40,16 T80,10 T110,14 T140,6',
      badge: '5 Stages Active',
      badgeColor: '#4338ca',
      badgeBg: '#eef2ff'
    },
    {
      id: 'pipeline_value',
      title: 'Pipeline Value',
      value: formatCurrency(summary.pipelineValue),
      subtext: 'Gross total deal value',
      icon: <DollarSign size={16} color="#059669" />,
      iconBg: '#ecfdf5',
      sparklineColor: '#10b981',
      sparkPath: 'M0,16 Q25,6 50,14 T90,6 T120,16 T140,4',
      badge: 'Active pipeline',
      badgeColor: '#047857',
      badgeBg: '#d1fae5'
    },
    {
      id: 'expected_revenue',
      title: 'Expected Revenue',
      value: formatCurrency(summary.expectedRevenue),
      subtext: 'Probability-weighted forecast',
      icon: <TrendingUp size={16} color="#7c3aed" />,
      iconBg: '#f5f3ff',
      sparklineColor: '#8b5cf6',
      sparkPath: 'M0,20 Q20,12 45,18 T85,4 T115,12 T140,2',
      badge: 'Weighted conversion',
      badgeColor: '#6d28d9',
      badgeBg: '#ede9fe'
    },
    {
      id: 'win_rate',
      title: 'Win Rate',
      value: `${summary.winRate}%`,
      subtext: 'Won vs closed opportunities',
      icon: <Award size={16} color="#ea580c" />,
      iconBg: '#fff7ed',
      sparklineColor: '#f97316',
      sparkPath: 'M0,18 Q15,4 30,12 T60,6 T90,16 T120,4 T140,8',
      badge: '+3.2% vs Q1',
      badgeColor: '#c2410c',
      badgeBg: '#ffedd5'
    },
    {
      id: 'avg_deal_size',
      title: 'Avg Deal Size',
      value: formatCurrency(summary.avgDealSize),
      subtext: '31 days average sales cycle',
      icon: <Briefcase size={16} color="#2563eb" />,
      iconBg: '#eff6ff',
      sparklineColor: '#3b82f6',
      sparkPath: 'M0,14 Q20,18 40,8 T80,16 T110,6 T140,12',
      badge: 'Mid-Market Fit',
      badgeColor: '#1d4ed8',
      badgeBg: '#dbeafe'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '14px',
      padding: '0 32px'
    }}>
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter(card.id)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: isSelected ? '1.5px solid #6366f1' : '1px solid #eaecf0',
              padding: '16px 14px',
              boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = '#c7d2fe';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = '#eaecf0';
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                {card.title}
              </span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: card.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {card.icon}
              </div>
            </div>

            {/* Value */}
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              {card.value}
            </div>

            {/* Badge & Subtext */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '4px',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: card.badgeColor,
                backgroundColor: card.badgeBg,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {card.badge}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>{card.subtext}</span>
            </div>

            {/* Sparkline */}
            <div style={{ width: '100%', height: '20px', marginTop: '2px' }}>
              <svg width="100%" height="20" viewBox="0 0 140 20" fill="none" preserveAspectRatio="none">
                <path
                  d={card.sparkPath}
                  stroke={card.sparklineColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};
