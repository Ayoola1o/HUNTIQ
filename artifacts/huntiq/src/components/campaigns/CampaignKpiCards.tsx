import React from 'react';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Target, 
  DollarSign 
} from 'lucide-react';
import type { CampaignKpiSummary } from '../../types/campaign';

interface CampaignKpiCardsProps {
  summary: CampaignKpiSummary;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const CampaignKpiCards: React.FC<CampaignKpiCardsProps> = ({
  summary,
  activeFilter,
  onSelectFilter
}) => {
  const cards = [
    {
      id: 'active_campaigns',
      title: 'Active Campaigns',
      value: summary.activeCampaigns.toString(),
      subtext: 'Queued or active email campaigns',
      icon: <Send size={16} color="#4f46e5" />,
      iconBg: '#eff6ff',
    },
    {
      id: 'prospects',
      title: 'Prospects Targeted',
      value: summary.totalAudience.toLocaleString(),
      subtext: 'Recipients across campaigns',
      icon: <Users size={16} color="#059669" />,
      iconBg: '#ecfdf5',
    },
    {
      id: 'replies',
      title: 'Replies Received',
      value: summary.totalReplies.toString(),
      subtext: 'Recorded replies',
      icon: <MessageSquare size={16} color="#7c3aed" />,
      iconBg: '#f5f3ff',
    },
    {
      id: 'opportunities',
      title: 'Opportunities Created',
      value: summary.opportunitiesCreated.toString(),
      subtext: 'Recorded conversions',
      icon: <Target size={16} color="#ea580c" />,
      iconBg: '#fff7ed',
    },
    {
      id: 'pipeline_generated',
      title: 'Pipeline Generated',
      value: `$${summary.pipelineGenerated.toLocaleString()}`,
      subtext: 'Attributed directly to campaigns',
      icon: <DollarSign size={16} color="#2563eb" />,
      iconBg: '#eff6ff',
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

            <span style={{ color: '#64748b', fontSize: '10.5px' }}>{card.subtext}</span>
          </div>
        );
      })}
    </div>
  );
};
