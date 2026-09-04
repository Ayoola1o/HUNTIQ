import React, { useState } from 'react';

export const MarketTrendsOverTime: React.FC = () => {
  const [activeSeries, setActiveSeries] = useState<string[]>(['Hiring', 'Funding', 'Expansion', 'Technology', 'News', 'Leadership']);
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; total: number; hiring: number; funding: number; expansion: number; tech: number; news: number; leadership: number } | null>(null);

  const series = [
    { label: 'Hiring', color: '#6366f1' },
    { label: 'Funding', color: '#10b981' },
    { label: 'Expansion', color: '#0ea5e9' },
    { label: 'Technology', color: '#f59e0b' },
    { label: 'News', color: '#f43f5e' },
    { label: 'Leadership', color: '#94a3b8' },
  ];

  const toggleSeries = (label: string) => {
    if (activeSeries.includes(label)) {
      if (activeSeries.length > 1) {
        setActiveSeries(activeSeries.filter(s => s !== label));
      }
    } else {
      setActiveSeries([...activeSeries, label]);
    }
  };

  const pointsData = [
    { x: 0, date: 'May 16', total: 210, hiring: 78, funding: 35, expansion: 42, tech: 28, news: 18, leadership: 9 },
    { x: 90, date: 'May 21', total: 280, hiring: 110, funding: 48, expansion: 56, tech: 34, news: 20, leadership: 12 },
    { x: 180, date: 'May 26', total: 320, hiring: 132, funding: 55, expansion: 64, tech: 38, news: 20, leadership: 11 },
    { x: 270, date: 'May 31', total: 365, hiring: 154, funding: 62, expansion: 75, tech: 40, news: 22, leadership: 12 },
    { x: 360, date: 'Jun 5', total: 390, hiring: 165, funding: 68, expansion: 84, tech: 39, news: 22, leadership: 12 },
    { x: 450, date: 'Jun 10', total: 412, hiring: 174, funding: 72, expansion: 93, tech: 41, news: 22, leadership: 10 },
    { x: 540, date: 'Jun 15', total: 445, hiring: 192, funding: 78, expansion: 98, tech: 44, news: 23, leadership: 10 }
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
      flex: 1.4,
      minWidth: 0
    }}>
      {/* Header + Time Range */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div>
          <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
            Signals Over Time
          </h3>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Multi-series volume trends & anomaly detection
          </span>
        </div>

        {/* Anomaly Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '20px',
          padding: '3px 10px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#b91c1c'
        }}>
          <span>🔥</span>
          <span>Spike: Hiring +48% this week</span>
        </div>
      </div>

      {/* Series Filter Toggles */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '12px'
      }}>
        {series.map((s) => {
          const isSelected = activeSeries.includes(s.label);
          return (
            <button
              key={s.label}
              onClick={() => toggleSeries(s.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '6px',
                border: isSelected ? `1px solid ${s.color}` : '1px solid #e2e8f0',
                backgroundColor: isSelected ? `${s.color}15` : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isSelected ? s.color : '#cbd5e1'
              }} />
              <span style={{ fontSize: '11px', color: isSelected ? '#0f172a' : '#94a3b8', fontWeight: isSelected ? 700 : 500 }}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stacked Spline Curves SVG Canvas */}
      <div style={{ flex: 1, minHeight: '160px', width: '100%', position: 'relative' }}>
        <svg width="100%" height="160" viewBox="0 0 540 160" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="20" x2="540" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
          <line x1="0" y1="55" x2="540" y2="55" stroke="#f1f5f9" strokeDasharray="3 3" />
          <line x1="0" y1="90" x2="540" y2="90" stroke="#f1f5f9" strokeDasharray="3 3" />
          <line x1="0" y1="125" x2="540" y2="125" stroke="#f1f5f9" strokeDasharray="3 3" />

          {/* Curves rendered conditional on active series */}
          {activeSeries.includes('Hiring') && (
            <>
              <path
                d="M0,75 Q90,30 180,45 T360,25 T450,40 T540,30 L540,145 L0,145 Z"
                fill="url(#purpleGrad)"
              />
              <path
                d="M0,75 Q90,30 180,45 T360,25 T450,40 T540,30"
                stroke="#6366f1"
                strokeWidth="2.5"
                fill="none"
              />
            </>
          )}

          {activeSeries.includes('Expansion') && (
            <path
              d="M0,90 Q90,65 180,72 T360,50 T450,60 T540,55"
              stroke="#0ea5e9"
              strokeWidth="2"
              fill="none"
            />
          )}

          {activeSeries.includes('Funding') && (
            <path
              d="M0,105 Q90,85 180,92 T360,75 T450,85 T540,78"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
            />
          )}

          {activeSeries.includes('Technology') && (
            <path
              d="M0,120 Q90,105 180,110 T360,98 T450,105 T540,102"
              stroke="#f59e0b"
              strokeWidth="1.5"
              fill="none"
            />
          )}

          {/* Interactive hover points */}
          {pointsData.map((pt) => (
            <g
              key={pt.date}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.x === 0 ? 75 : pt.x === 90 ? 30 : pt.x === 180 ? 45 : pt.x === 270 ? 35 : pt.x === 360 ? 25 : pt.x === 450 ? 40 : 30}
                r={hoveredPoint?.date === pt.date ? 6 : 4}
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '11px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            pointerEvents: 'none'
          }}>
            <div style={{ fontWeight: 800, color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '3px' }}>
              {hoveredPoint.date} • Total: {hoveredPoint.total}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', color: '#cbd5e1' }}>
              <div>Hiring: <strong style={{ color: '#818cf8' }}>{hoveredPoint.hiring}</strong></div>
              <div>Funding: <strong style={{ color: '#34d399' }}>{hoveredPoint.funding}</strong></div>
              <div>Expansion: <strong style={{ color: '#38bdf8' }}>{hoveredPoint.expansion}</strong></div>
              <div>Technology: <strong style={{ color: '#fbbf24' }}>{hoveredPoint.tech}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* X-Axis Dates */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10.5px',
        color: '#94a3b8',
        marginTop: '6px'
      }}>
        {pointsData.map((d) => (
          <span key={d.date}>{d.date}</span>
        ))}
      </div>
    </div>
  );
};
