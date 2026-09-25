import React, { useState, useMemo } from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

export const SignalsOverTimeChart: React.FC = () => {
  const { signals } = useHuntiq();
  const [period, setPeriod] = useState<'Last 7 days' | 'Last 30 days' | 'Last 90 days' | 'All time'>('Last 30 days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; value: number; x: number; y: number } | null>(null);

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

  const { points, maxVal, pathD, areaD } = useMemo(() => {
    const days = period === 'Last 7 days' ? 7 : period === 'Last 30 days' ? 30 : 90;
    const stepCount = 5;
    const now = Date.now();
    const stepDuration = (days * 86400000) / (stepCount - 1);

    const buckets = Array.from({ length: stepCount }, (_, i) => {
      const time = now - (stepCount - 1 - i) * stepDuration;
      const dateObj = new Date(time);
      const label = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return {
        startTime: time - stepDuration / 2,
        endTime: time + stepDuration / 2,
        label,
        count: 0
      };
    });

    filteredSignals.forEach((s: any) => {
      const dateVal = s.detectedTimestamp || s.firstDetected || s.detectedTime;
      const t = dateVal ? Date.parse(dateVal) : NaN;
      const sigTime = !isNaN(t) ? t : now;

      const bucket = buckets.find((b) => sigTime >= b.startTime && sigTime <= b.endTime) || buckets[buckets.length - 1];
      if (bucket) {
        bucket.count += 1;
      }
    });

    const values = buckets.map((b) => b.count);
    const max = Math.max(5, ...values);

    // Coordinate mapping: x from 30 to 370, y from 160 (val 0) to 30 (max)
    const pts = buckets.map((b, i) => {
      const x = 30 + (i / (stepCount - 1)) * 340;
      const y = 160 - (b.count / max) * 130;
      return {
        date: b.label,
        value: b.count,
        x,
        y
      };
    });

    // Generate SVG path string
    let pathString = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cx = (prev.x + curr.x) / 2;
      pathString += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const areaString = `${pathString} L ${pts[pts.length - 1].x} 165 L ${pts[0].x} 165 Z`;

    return {
      points: pts,
      maxVal: max,
      pathD: pathString,
      areaD: areaString
    };
  }, [filteredSignals, period]);

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

      {/* Interactive Line Chart SVG */}
      <div style={{ position: 'relative', height: '170px', width: '100%' }}>
        <svg
          viewBox="0 0 400 180"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="lineGlowReal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="20" y1="20" x2="390" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="60" x2="390" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="100" x2="390" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="140" x2="390" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="165" x2="390" y2="165" stroke="#e2e8f0" strokeWidth="1" />

          {/* Y Axis Labels */}
          <text x="5" y="24" fontSize="9" fill="#94a3b8">{maxVal}</text>
          <text x="5" y="64" fontSize="9" fill="#94a3b8">{Math.round(maxVal * 0.75)}</text>
          <text x="5" y="104" fontSize="9" fill="#94a3b8">{Math.round(maxVal * 0.5)}</text>
          <text x="5" y="144" fontSize="9" fill="#94a3b8">{Math.round(maxVal * 0.25)}</text>
          <text x="16" y="169" fontSize="9" fill="#94a3b8">0</text>

          {/* Area Fill */}
          <path d={areaD} fill="url(#lineGlowReal)" />

          {/* Main Spline Curve */}
          <path
            d={pathD}
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
              r={hoveredPoint?.date === pt.date ? 5 : 3.5}
              fill="#ffffff"
              stroke="#6366f1"
              strokeWidth={hoveredPoint?.date === pt.date ? 3 : 2}
              style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Floating Tooltip */}
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
            <div style={{ color: '#64748b', fontWeight: 600 }}>{hoveredPoint.date}</div>
            <div style={{ color: '#0f172a', fontWeight: 800 }}>{hoveredPoint.value} {hoveredPoint.value === 1 ? 'signal' : 'signals'}</div>
          </div>
        )}
      </div>

      {/* X Axis Labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '10.5px',
        color: '#94a3b8'
      }}>
        {points.map((pt) => (
          <span key={pt.date}>{pt.date}</span>
        ))}
      </div>
    </div>
  );
};
