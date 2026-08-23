import React from 'react';
import { 
  Building2, 
  Star, 
  Flame, 
  TrendingUp, 
  Radio, 
  Users 
} from 'lucide-react';

interface CompaniesKpiCardsProps {
  activeFilter?: string;
  onSelectKpi?: (filter: string) => void;
}

export const CompaniesKpiCards: React.FC<CompaniesKpiCardsProps> = ({
  activeFilter = 'total',
  onSelectKpi
}) => {
  const cards = [
    {
      id: 'total',
      title: 'Total Companies',
      value: '2,842',
      change: '24.7%',
      isPositive: true,
      icon: <Building2 size={16} color="#2563eb" />,
      iconBg: '#eff6ff',
    },
    {
      id: 'new',
      title: 'New Companies',
      value: '186',
      change: '18.3%',
      isPositive: true,
      icon: <Star size={16} color="#0284c7" />,
      iconBg: '#f0f9ff',
    },
    {
      id: 'high-opportunity',
      title: 'High Opportunity',
      value: '412',
      change: '32.1%',
      isPositive: true,
      icon: <Flame size={16} color="#ea580c" />,
      iconBg: '#fff7ed',
    },
    {
      id: 'avg-score',
      title: 'Avg. Opportunity Score',
      value: '68/100',
      change: '6.8%',
      isPositive: true,
      icon: <TrendingUp size={16} color="#7c3aed" />,
      iconBg: '#f5f3ff',
    },
    {
      id: 'with-signals',
      title: 'Companies with Signals',
      value: '1,124',
      change: '27.9%',
      isPositive: true,
      icon: <Radio size={16} color="#16a34a" />,
      iconBg: '#f0fdf4',
    },
    {
      id: 'employees',
      title: 'Total Employees',
      value: '586K',
      change: '21.4%',
      isPositive: true,
      icon: <Users size={16} color="#2563eb" />,
      iconBg: '#eff6ff',
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
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = '#c7d2fe';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = '#eaecf0';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
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

            <div>
              <div style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                {card.value}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#059669',
                marginTop: '4px'
              }}>
                <span>↑ {card.change}</span>
                <span style={{ color: '#94a3b8', fontWeight: 400 }}>vs last 30 days</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
