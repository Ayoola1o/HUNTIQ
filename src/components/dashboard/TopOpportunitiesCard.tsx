import React from 'react';
import { ArrowRight } from 'lucide-react';

interface TopOpportunitiesCardProps {
  onSelectCompany: (name: string) => void;
}

export const TopOpportunitiesCard: React.FC<TopOpportunitiesCardProps> = ({ onSelectCompany }) => {
  const topList = [
    { rank: 1, name: 'Acme Technologies', location: 'Lagos, Nigeria', score: 94 },
    { rank: 2, name: 'FinServe Ltd', location: 'Lagos, Nigeria', score: 88 },
    { rank: 3, name: 'Delta Systems', location: 'Abuja, Nigeria', score: 81 },
    { rank: 4, name: 'Vertex Solutions', location: 'Lagos, Nigeria', score: 78 },
    { rank: 5, name: 'Nimbus Analytics', location: 'Lagos, Nigeria', score: 76 },
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 800,
          color: '#0f172a',
          margin: 0,
          fontFamily: 'var(--font-primary)'
        }}>
          Top opportunities
        </h3>

        <a
          href="#top"
          onClick={(e) => e.preventDefault()}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#4f46e5',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          <span>View all</span>
          <ArrowRight size={13} />
        </a>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {topList.map((item) => (
          <div
            key={item.name}
            onClick={() => onSelectCompany(item.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: '10px',
              backgroundColor: '#fafbfc',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f3ff';
              e.currentTarget.style.borderColor = '#ddd6fe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fafbfc';
              e.currentTarget.style.borderColor = '#f1f5f9';
            }}
          >
            {/* Rank + Company Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.rank}
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {item.location}
                </div>
              </div>
            </div>

            {/* Score pill */}
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1.5px solid #10b981',
              color: '#059669',
              fontSize: '11.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              {item.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
