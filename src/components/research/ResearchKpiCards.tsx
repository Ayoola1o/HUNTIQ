import React from 'react';
import { FileText, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import type { ResearchKpiSummary } from '../../types/research';

interface ResearchKpiCardsProps {
  summary: ResearchKpiSummary;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const ResearchKpiCards: React.FC<ResearchKpiCardsProps> = ({
  summary,
  activeFilter,
  onSelectFilter
}) => {
  const cards = [
    {
      id: 'all',
      title: 'Research Reports',
      value: summary.totalReports.toString(),
      subtext: 'Total company intelligence files',
      icon: <FileText size={16} color="#4f46e5" />,
      iconBg: '#eff6ff',
      sparklineColor: '#6366f1',
      sparkPath: 'M0,18 Q20,10 40,16 T80,8 T110,14 T140,4',
      badge: 'All Verified',
      badgeColor: '#4338ca',
      badgeBg: '#eef2ff'
    },
    {
      id: 'in_progress',
      title: 'Research in Progress',
      value: summary.inProgress.toString(),
      subtext: 'Active background scraping jobs',
      icon: <Loader2 size={16} color="#d97706" className="animate-spin" />,
      iconBg: '#fffbeb',
      sparklineColor: '#f59e0b',
      sparkPath: 'M0,16 Q25,6 50,14 T90,8 T120,16 T140,6',
      badge: 'Live Syncing',
      badgeColor: '#b45309',
      badgeBg: '#fef3c7'
    },
    {
      id: 'updated',
      title: 'Updated This Week',
      value: summary.updatedThisWeek.toString(),
      subtext: 'Signals & leadership refreshed',
      icon: <RefreshCw size={16} color="#059669" />,
      iconBg: '#ecfdf5',
      sparklineColor: '#10b981',
      sparkPath: 'M0,20 Q20,12 45,18 T85,6 T115,12 T140,4',
      badge: '+18% vs last week',
      badgeColor: '#047857',
      badgeBg: '#d1fae5'
    },
    {
      id: 'high_opp',
      title: 'High Opportunity Fit',
      value: summary.highOpportunity.toString(),
      subtext: 'Score 90+ with active intent signals',
      icon: <Sparkles size={16} color="#7c3aed" />,
      iconBg: '#f5f3ff',
      sparklineColor: '#8b5cf6',
      sparkPath: 'M0,18 Q15,4 30,12 T60,6 T90,18 T120,2 T140,10',
      badge: 'Ready for Outreach',
      badgeColor: '#6d28d9',
      badgeBg: '#ede9fe'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
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
              padding: '18px 16px',
              boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = '#c7d2fe';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = '#eaecf0';
            }}
          >
            {/* Top row: Title + Icon */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                {card.title}
              </span>
              <div style={{
                width: '30px',
                height: '30px',
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
              fontSize: '24px',
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
              marginTop: '6px',
              marginBottom: '6px'
            }}>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: card.badgeColor,
                backgroundColor: card.badgeBg,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {card.badge}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>{card.subtext}</span>
            </div>

            {/* Sparkline */}
            <div style={{ width: '100%', height: '24px', marginTop: '2px' }}>
              <svg width="100%" height="24" viewBox="0 0 140 24" fill="none" preserveAspectRatio="none">
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
