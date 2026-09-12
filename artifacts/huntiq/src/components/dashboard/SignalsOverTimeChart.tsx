import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const SignalsOverTimeChart: React.FC = () => {
  const [period, setPeriod] = useState('Last 30 days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; value: number; x: number; y: number } | null>({
    date: 'May 14, 2025',
    value: 1429,
    x: 380,
    y: 40
  });

  const points = [
    { date: 'Apr 16', value: 210, x: 20, y: 145 },
    { date: 'Apr 20', value: 340, x: 75, y: 130 },
    { date: 'Apr 23', value: 460, x: 130, y: 120 },
    { date: 'Apr 27', value: 510, x: 185, y: 118 },
    { date: 'Apr 30', value: 680, x: 240, y: 95 },
    { date: 'May 4', value: 720, x: 290, y: 92 },
    { date: 'May 7', value: 890, x: 335, y: 78 },
    { date: 'May 14', value: 1429, x: 380, y: 40 },
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
      gap: '14px',
      flex: 1
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
          Signals over time
        </h3>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <span>{period}</span>
            <ChevronDown size={13} color="#94a3b8" />
          </button>

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              zIndex: 20,
              minWidth: '110px'
            }}>
              {['Last 7 days', 'Last 30 days', 'Last 90 days', 'All time'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    setPeriod(opt);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    color: period === opt ? '#4f46e5' : '#334155',
                    backgroundColor: period === opt ? '#f5f3ff' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Line Chart SVG */}
      <div style={{ position: 'relative', height: '170px', width: '100%' }}>
        <svg
          viewBox="0 0 400 180"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="lineGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="20" y1="20" x2="390" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="60" x2="390" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="100" x2="390" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="140" x2="390" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="170" x2="390" y2="170" stroke="#e2e8f0" strokeWidth="1" />

          {/* Y Axis Labels */}
          <text x="5" y="24" fontSize="9" fill="#94a3b8">1,000</text>
          <text x="12" y="64" fontSize="9" fill="#94a3b8">750</text>
          <text x="12" y="104" fontSize="9" fill="#94a3b8">500</text>
          <text x="12" y="144" fontSize="9" fill="#94a3b8">250</text>
          <text x="16" y="174" fontSize="9" fill="#94a3b8">0</text>

          {/* Area Fill */}
          <path
            d="M 20 145 C 50 135, 100 125, 130 120 C 160 115, 210 110, 240 95 C 270 80, 310 85, 335 78 C 360 70, 370 45, 380 40 L 380 170 L 20 170 Z"
            fill="url(#lineGlow)"
          />

          {/* Main Spline Curve */}
          <path
            d="M 20 145 C 50 135, 100 125, 130 120 C 160 115, 210 110, 240 95 C 270 80, 310 85, 335 78 C 360 70, 370 45, 380 40"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive points */}
          {points.map((pt) => (
            <circle
              key={pt.date}
              cx={pt.x}
              cy={pt.y}
              r={pt.date === 'May 14' ? 4.5 : 3}
              fill="#ffffff"
              stroke="#6366f1"
              strokeWidth={pt.date === 'May 14' ? 3 : 2}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(pt)}
            />
          ))}
        </svg>

        {/* Floating Tooltip matching mockup */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            top: '0px',
            right: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            padding: '6px 10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            pointerEvents: 'none',
            fontSize: '11px',
            lineHeight: 1.3
          }}>
            <div style={{ color: '#64748b', fontWeight: 600 }}>May 14, 2025</div>
            <div style={{ color: '#0f172a', fontWeight: 800 }}>1,429 signals</div>
          </div>
        )}
      </div>

      {/* X Axis Labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 10px',
        fontSize: '10.5px',
        color: '#94a3b8'
      }}>
        <span>Apr 16</span>
        <span>Apr 23</span>
        <span>Apr 30</span>
        <span>May 7</span>
        <span>May 14</span>
      </div>
    </div>
  );
};
