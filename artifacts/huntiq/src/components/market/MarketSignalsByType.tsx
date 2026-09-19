import React from 'react';

interface MarketSignalsByTypeProps {
  onSelectType?: (type: string) => void;
}

export const MarketSignalsByType: React.FC<MarketSignalsByTypeProps> = ({ onSelectType }) => {
  const slices = [
    { id: 'hiring', label: 'Hiring', pct: '35%', count: '2,395', color: '#6366f1' },
    { id: 'expansion', label: 'Expansion', pct: '17%', count: '1,178', color: '#06b6d4' },
    { id: 'funding', label: 'Funding', pct: '16%', count: '1,067', color: '#0ea5e9' },
    { id: 'technology', label: 'Technology', pct: '14%', count: '958', color: '#10b981' },
    { id: 'leadership', label: 'Leadership', pct: '9%', count: '616', color: '#84cc16' },
    { id: 'news', label: 'News & PR', pct: '6%', count: '428', color: '#f43f5e' },
    { id: 'other', label: 'Other Intent', pct: '3%', count: '200', color: '#f59e0b' },
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '18px 20px',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
            Signals by Type
          </h3>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Distribution across 6,842 events
          </span>
        </div>

        <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, backgroundColor: '#f5f3ff', padding: '2px 8px', borderRadius: '6px' }}>
          7 Types
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
        {/* SVG Donut Chart */}
        <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            {/* Hiring 35% ~ 105.5 */}
            <circle cx="65" cy="65" r="48" fill="none" stroke="#6366f1" strokeWidth="20"
              strokeDasharray="105.5 301.6" strokeDashoffset="0" transform="rotate(-90 65 65)" />
            {/* Expansion 17% ~ 51.3 */}
            <circle cx="65" cy="65" r="48" fill="none" stroke="#06b6d4" strokeWidth="20"
              strokeDasharray="51.3 301.6" strokeDashoffset="-105.5" transform="rotate(-90 65 65)" />
            {/* Funding 16% ~ 48.2 */}
            <circle cx="65" cy="65" r="48" fill="none" stroke="#0ea5e9" strokeWidth="20"
              strokeDasharray="48.2 301.6" strokeDashoffset="-156.8" transform="rotate(-90 65 65)" />
            {/* Technology 14% ~ 42.2 */}
            <circle cx="65" cy="65" r="48" fill="none" stroke="#10b981" strokeWidth="20"
              strokeDasharray="42.2 301.6" strokeDashoffset="-205.0" transform="rotate(-90 65 65)" />
            {/* Leadership 9% ~ 27.1 */}
            <circle cx="65" cy="65" r="48" fill="none" stroke="#84cc16" strokeWidth="20"
              strokeDasharray="27.1 301.6" strokeDashoffset="-247.2" transform="rotate(-90 65 65)" />
            {/* News 6% ~ 18.1 */}
            <circle cx="65" cy="65" r="48" fill="none" stroke="#f43f5e" strokeWidth="20"
              strokeDasharray="18.1 301.6" strokeDashoffset="-274.3" transform="rotate(-90 65 65)" />
            {/* Other 3% ~ 9.0 */}
            <circle cx="65" cy="65" r="48" fill="none" stroke="#f59e0b" strokeWidth="20"
              strokeDasharray="9.0 301.6" strokeDashoffset="-292.4" transform="rotate(-90 65 65)" />
          </svg>

          {/* Center Label */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              6,842
            </span>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
              Total
            </span>
          </div>
        </div>

        {/* Breakdown Legend List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
          {slices.map((slice) => (
            <div
              key={slice.id}
              onClick={() => onSelectType && onSelectType(slice.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                padding: '2px 4px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  backgroundColor: slice.color
                }} />
                <span style={{ color: '#334155', fontWeight: 500 }}>{slice.label}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', color: '#64748b' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{slice.pct}</span>
                <span>({slice.count})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
