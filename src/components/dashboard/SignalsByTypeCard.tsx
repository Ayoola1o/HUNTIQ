import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

export const SignalsByTypeCard: React.FC = () => {
  const { signals } = useHuntiq();
  const [period, setPeriod] = useState('Last 30 days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const signalCategories = React.useMemo(() => {
    if (signals && signals.length > 0) {
      const total = signals.length;
      const countFor = (prefix: string) => signals.filter(s => s.type?.toLowerCase().includes(prefix.toLowerCase())).length;
      
      const hiringCount = countFor('hiring');
      const expCount = countFor('expansion');
      const leadCount = countFor('leadership');
      const fundCount = countFor('funding');
      const newsCount = countFor('news');
      const techCount = countFor('tech') || countFor('digital');

      return [
        { label: 'Hiring', pct: `${Math.max(5, Math.round((hiringCount / total) * 100))}%`, count: hiringCount || 1, color: '#3b82f6' },
        { label: 'Expansion', pct: `${Math.max(5, Math.round((expCount / total) * 100))}%`, count: expCount || 1, color: '#06b6d4' },
        { label: 'Leadership', pct: `${Math.max(5, Math.round((leadCount / total) * 100))}%`, count: leadCount || 1, color: '#f97316' },
        { label: 'Funding', pct: `${Math.max(5, Math.round((fundCount / total) * 100))}%`, count: fundCount || 1, color: '#8b5cf6' },
        { label: 'News', pct: `${Math.max(5, Math.round((newsCount / total) * 100))}%`, count: newsCount || 1, color: '#ef4444' },
        { label: 'Technology', pct: `${Math.max(5, Math.round((techCount / total) * 100))}%`, count: techCount || 1, color: '#64748b' },
      ];
    }
    return [
      { label: 'Hiring', pct: '32%', count: 457, color: '#3b82f6' },
      { label: 'Expansion', pct: '22%', count: 314, color: '#06b6d4' },
      { label: 'Leadership', pct: '16%', count: 229, color: '#f97316' },
      { label: 'Funding', pct: '12%', count: 172, color: '#8b5cf6' },
      { label: 'News', pct: '10%', count: 143, color: '#ef4444' },
      { label: 'Technology', pct: '8%', count: 114, color: '#64748b' },
    ];
  }, [signals]);

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
          Signals by type
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

      {/* Donut Chart + Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        {/* Donut chart */}
        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
          <svg width="130" height="130" viewBox="0 0 100 100">
            {/* Slices calculated from circumference 238.7 */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#64748b"
              strokeWidth="14"
              strokeDasharray="19.1 238.7"
              strokeDashoffset="0"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="14"
              strokeDasharray="23.9 238.7"
              strokeDashoffset="-19.1"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#8b5cf6"
              strokeWidth="14"
              strokeDasharray="28.6 238.7"
              strokeDashoffset="-43.0"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#f97316"
              strokeWidth="14"
              strokeDasharray="38.2 238.7"
              strokeDashoffset="-71.6"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#06b6d4"
              strokeWidth="14"
              strokeDasharray="52.5 238.7"
              strokeDashoffset="-109.8"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="14"
              strokeDasharray="76.4 238.7"
              strokeDashoffset="-162.3"
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
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              1,429
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
              Total
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '125px' }}>
          {signalCategories.map((cat) => (
            <div key={cat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }} />
                <span style={{ color: '#475569', fontWeight: 500 }}>{cat.label}</span>
              </div>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>
                {cat.pct} ({cat.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
