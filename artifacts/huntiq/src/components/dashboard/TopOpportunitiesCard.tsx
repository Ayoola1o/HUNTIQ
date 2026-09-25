import React from 'react';
import { ArrowRight, Target } from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

interface TopOpportunitiesCardProps {
  onSelectCompany: (name: string) => void;
}

export const TopOpportunitiesCard: React.FC<TopOpportunitiesCardProps> = ({ onSelectCompany }) => {
  const { opportunities, navigateTo } = useHuntiq();

  const topList = React.useMemo(() => {
    if (opportunities && opportunities.length > 0) {
      return [...opportunities]
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5)
        .map((opp, idx) => ({
          rank: idx + 1,
          name: opp.companyName,
          location: opp.location || 'Unknown',
          score: opp.score || 0
        }));
    }
    return [];
  }, [opportunities]);

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
          onClick={(e) => {
            e.preventDefault();
            navigateTo('opportunities');
          }}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#4f46e5',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <span>View all</span>
          <ArrowRight size={13} />
        </a>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {topList.length === 0 ? (
          <div style={{
            padding: '24px 12px',
            textAlign: 'center',
            backgroundColor: '#fafbfc',
            borderRadius: '10px',
            border: '1px dashed #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Target size={18} color="#94a3b8" />
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              No opportunities scored yet
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Add target accounts to compute opportunity scores and ICP fit rankings.
            </div>
          </div>
        ) : (
          topList.map((item) => (
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
          ))
        )}
      </div>
    </div>
  );
};
