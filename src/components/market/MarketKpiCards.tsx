import React from 'react';
import { 
  Sparkles, 
  Building2, 
  Flame, 
  Briefcase, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';

interface MarketKpiCardsProps {
  activeFilter?: string;
  onSelectKpi?: (filter: string) => void;
}

export const MarketKpiCards: React.FC<MarketKpiCardsProps> = ({
  activeFilter = 'total',
  onSelectKpi
}) => {
  const cards = [
    {
      id: 'total',
      title: 'Total Signals',
      value: '6,842',
      change: '↑ 23.6%',
      subtext: 'vs previous 30 days',
      icon: <Sparkles size={15} color="#7c3aed" />,
      iconBg: '#f5f3ff',
      sparklineColor: '#8b5cf6',
      sparkPath: 'M0,18 Q15,6 30,14 T60,8 T90,20 T120,4 T140,12',
    },
    {
      id: 'companies',
      title: 'Companies Affected',
      value: '2,185',
      change: '↑ 17.2%',
      subtext: 'vs previous 30 days',
      icon: <Building2 size={15} color="#059669" />,
      iconBg: '#ecfdf5',
      sparklineColor: '#10b981',
      sparkPath: 'M0,16 Q20,12 40,18 T80,6 T110,14 T140,4',
    },
    {
      id: 'industries',
      title: 'Hot Industries',
      value: '8',
      change: '↑ 2',
      subtext: 'new this period',
      icon: <Flame size={15} color="#d97706" />,
      iconBg: '#fffbeb',
      sparklineColor: '#f59e0b',
      sparkPath: 'M0,20 Q25,8 50,15 T90,5 T120,16 T140,8',
    },
    {
      id: 'hiring',
      title: 'Hiring Signals',
      value: '2,413',
      change: '↑ 28.9%',
      subtext: 'vs previous 30 days',
      icon: <Briefcase size={15} color="#2563eb" />,
      iconBg: '#eff6ff',
      sparklineColor: '#3b82f6',
      sparkPath: 'M0,18 Q15,10 35,16 T75,4 T115,14 T140,6',
    },
    {
      id: 'funding',
      title: 'Funding Signals',
      value: '1,067',
      change: '↑ 19.4%',
      subtext: 'vs previous 30 days',
      icon: <DollarSign size={15} color="#e11d48" />,
      iconBg: '#fff1f2',
      sparklineColor: '#f43f5e',
      sparkPath: 'M0,15 Q30,5 60,18 T100,6 T125,12 T140,4',
    },
    {
      id: 'expansion',
      title: 'Expansion Signals',
      value: '1,178',
      change: '↑ 21.1%',
      subtext: 'vs previous 30 days',
      icon: <TrendingUp size={15} color="#6366f1" />,
      iconBg: '#ede9fe',
      sparklineColor: '#6366f1',
      sparkPath: 'M0,19 Q20,8 45,14 T85,4 T115,18 T140,5',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '14px',
      padding: '0 32px'
    }}>
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectKpi && onSelectKpi(card.id)}
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

            {/* Change text */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#059669',
              marginTop: '4px',
              marginBottom: '6px'
            }}>
              <span>{card.change}</span>
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>{card.subtext}</span>
            </div>

            {/* Sparkline curve */}
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
