import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const PipelineHealthCard: React.FC = () => {
  const [period, setPeriod] = useState('This month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const stages = [
    { label: 'Won', count: 12, pct: '14%', color: '#22c55e' },
    { label: 'Proposal', count: 18, pct: '21%', color: '#3b82f6' },
    { label: 'Negotiation', count: 22, pct: '26%', color: '#f97316' },
    { label: 'Meeting', count: 16, pct: '19%', color: '#eab308' },
    { label: 'Contacted', count: 18, pct: '20%', color: '#94a3b8' },
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
      gap: '16px'
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
          Pipeline health
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
              {['This week', 'This month', 'This quarter', 'All time'].map((opt) => (
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

      {/* Donut Chart + Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
        {/* SVG Donut Chart */}
        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
          <svg width="130" height="130" viewBox="0 0 100 100">
            {/* SVG slices using dasharray */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#94a3b8"
              strokeWidth="14"
              strokeDasharray="47.7 238.7"
              strokeDashoffset="0"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#eab308"
              strokeWidth="14"
              strokeDasharray="45.3 238.7"
              strokeDashoffset="-47.7"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#f97316"
              strokeWidth="14"
              strokeDasharray="62.0 238.7"
              strokeDashoffset="-93.0"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="14"
              strokeDasharray="50.1 238.7"
              strokeDashoffset="-155.0"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#22c55e"
              strokeWidth="14"
              strokeDasharray="33.4 238.7"
              strokeDashoffset="-205.1"
            />
          </svg>

          {/* Center text */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              86
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
              Deals
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '110px' }}>
          {stages.map((st) => (
            <div key={st.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: st.color }} />
                <span style={{ color: '#475569', fontWeight: 500 }}>{st.label}</span>
              </div>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>
                {st.count} ({st.pct})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Footer Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid #f1f5f9'
      }}>
        <div>
          <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>
            Win rate
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            24.6%
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>
            Avg. sales cycle
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            38 days
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>
            Velocity
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>$11,279 / day</span>
            <span style={{ color: '#16a34a', fontSize: '10.5px' }}>↑ 14%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
