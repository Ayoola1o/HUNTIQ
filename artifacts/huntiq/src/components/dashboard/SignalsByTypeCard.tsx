import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

export const SignalsByTypeCard: React.FC = () => {
  const { signals } = useHuntiq();
  const [period, setPeriod] = useState<'Last 7 days' | 'Last 30 days' | 'Last 90 days' | 'All time'>('Last 30 days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredSignals = useMemo(() => {
    if (!signals || signals.length === 0) return [];
    if (period === 'All time') return signals;

    const now = Date.now();
    const days = period === 'Last 7 days' ? 7 : period === 'Last 30 days' ? 30 : 90;
    const cutoff = now - days * 86400000;

    return signals.filter((s: any) => {
      const dateVal = s.detectedTimestamp || s.firstDetected || s.detectedTime;
      if (!dateVal) return true;
      const parsed = Date.parse(dateVal);
      if (isNaN(parsed)) return true;
      return parsed >= cutoff;
    });
  }, [signals, period]);

  const { signalCategories, totalCount } = useMemo(() => {
    const total = filteredSignals.length;
    const countFor = (prefix: string) =>
      filteredSignals.filter((s) => s.type?.toLowerCase().includes(prefix.toLowerCase())).length;

    const hiringCount = countFor('hiring');
    const expCount = countFor('expansion');
    const leadCount = countFor('leadership');
    const fundCount = countFor('funding');
    const newsCount = countFor('news');
    const techCount = countFor('tech') || countFor('digital');

    const categories = [
      { label: 'Hiring', count: hiringCount, pctVal: total > 0 ? (hiringCount / total) * 100 : 0, color: '#3b82f6' },
      { label: 'Expansion', count: expCount, pctVal: total > 0 ? (expCount / total) * 100 : 0, color: '#06b6d4' },
      { label: 'Leadership', count: leadCount, pctVal: total > 0 ? (leadCount / total) * 100 : 0, color: '#f97316' },
      { label: 'Funding', count: fundCount, pctVal: total > 0 ? (fundCount / total) * 100 : 0, color: '#8b5cf6' },
      { label: 'News', count: newsCount, pctVal: total > 0 ? (newsCount / total) * 100 : 0, color: '#ef4444' },
      { label: 'Technology', count: techCount, pctVal: total > 0 ? (techCount / total) * 100 : 0, color: '#64748b' },
    ].map((cat) => ({
      ...cat,
      pct: `${Math.round(cat.pctVal)}%`
    }));

    return { signalCategories: categories, totalCount: total };
  }, [filteredSignals]);

  // Circumference of r=38 circle: 238.76
  const circumference = 238.76;
  let accumulatedOffset = 0;
  const svgSlices = signalCategories.map((cat) => {
    const dashLength = (cat.pctVal / 100) * circumference;
    const slice = {
      ...cat,
      dashArray: `${dashLength} ${circumference - dashLength}`,
      dashOffset: -accumulatedOffset,
    };
    accumulatedOffset += dashLength;
    return slice;
  });

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
              {(['Last 7 days', 'Last 30 days', 'Last 90 days', 'All time'] as const).map((opt) => (
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
            {totalCount === 0 ? (
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="14"
              />
            ) : (
              svgSlices.map((slice) =>
                slice.count > 0 ? (
                  <circle
                    key={slice.label}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="14"
                    strokeDasharray={slice.dashArray}
                    strokeDashoffset={slice.dashOffset}
                  />
                ) : null
              )
            )}
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
              {totalCount.toLocaleString()}
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
