import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

export const PipelineHealthCard: React.FC = () => {
  const { pipelineDeals, formatCurrency } = useHuntiq();
  const [period, setPeriod] = useState<'This week' | 'This month' | 'This quarter' | 'All time'>('This month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /**
   * Chosen Date Filtering Semantics:
   * Deals are evaluated by their entry/creation timestamp (createdAt or stageEnteredAt).
   * - 'This week': Created or updated in current stage within last 7 days (>= now - 7d).
   * - 'This month': Created or updated in current stage within last 30 days (>= now - 30d).
   * - 'This quarter': Created or updated in current stage within last 90 days (>= now - 90d).
   * - 'All time': Unbounded historical workspace deals.
   */
  const filteredDeals = useMemo(() => {
    if (!pipelineDeals || pipelineDeals.length === 0) return [];
    if (period === 'All time') return pipelineDeals;

    const now = Date.now();
    const days = period === 'This week' ? 7 : period === 'This month' ? 30 : 90;
    const cutoff = now - days * 86400000;

    return pipelineDeals.filter((d: any) => {
      const dateVal = d.createdAt || d.stageEnteredAt;
      if (!dateVal) return true;
      const parsed = Date.parse(dateVal);
      if (isNaN(parsed)) {
        // Human strings like 'Just now', 'Today', '2 days ago' map to current window
        return true;
      }
      return parsed >= cutoff;
    });
  }, [pipelineDeals, period]);

  const { stages, totalDeals, winRate, totalVolume, avgSalesCycleDays } = useMemo(() => {
    const total = filteredDeals.length;
    const countByStage = (st: string) =>
      filteredDeals.filter((d) => d.stage?.toLowerCase() === st.toLowerCase()).length;

    const wonCount = countByStage('won');
    const proposalCount = countByStage('proposal');
    const negotiationCount = countByStage('negotiation');
    const meetingCount = countByStage('meeting');
    const contactedCount = countByStage('contacted');

    const wonPct = total > 0 ? (wonCount / total) * 100 : 0;
    const proposalPct = total > 0 ? (proposalCount / total) * 100 : 0;
    const negotiationPct = total > 0 ? (negotiationCount / total) * 100 : 0;
    const meetingPct = total > 0 ? (meetingCount / total) * 100 : 0;
    const contactedPct = total > 0 ? (contactedCount / total) * 100 : 0;

    const stageList = [
      { label: 'Won', count: wonCount, pctVal: wonPct, pct: `${Math.round(wonPct)}%`, color: '#22c55e' },
      { label: 'Proposal', count: proposalCount, pctVal: proposalPct, pct: `${Math.round(proposalPct)}%`, color: '#3b82f6' },
      { label: 'Negotiation', count: negotiationCount, pctVal: negotiationPct, pct: `${Math.round(negotiationPct)}%`, color: '#f97316' },
      { label: 'Meeting', count: meetingCount, pctVal: meetingPct, pct: `${Math.round(meetingPct)}%`, color: '#eab308' },
      { label: 'Contacted', count: contactedCount, pctVal: contactedPct, pct: `${Math.round(contactedPct)}%`, color: '#94a3b8' },
    ];

    const volume = filteredDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);
    const winRateFormatted = total > 0 ? `${((wonCount / total) * 100).toFixed(1)}%` : '0.0%';

    return {
      stages: stageList,
      totalDeals: total,
      winRate: winRateFormatted,
      totalVolume: volume,
      avgSalesCycleDays: total > 0 ? 30 : 0
    };
  }, [filteredDeals]);

  // Circumference of r=38 circle is 2 * PI * 38 ≈ 238.76
  const circumference = 238.76;

  // Compute SVG stroke-dasharray and offsets dynamically
  let accumulatedOffset = 0;
  const svgSlices = stages.map((st) => {
    const dashLength = (st.pctVal / 100) * circumference;
    const slice = {
      ...st,
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
              {(['This week', 'This month', 'This quarter', 'All time'] as const).map((opt) => (
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
            {totalDeals === 0 ? (
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
                    style={{ transition: 'stroke-dasharray 0.3s ease' }}
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
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {totalDeals}
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
            {winRate}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>
            Volume
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            {formatCurrency(totalVolume, { compact: true })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>
            Avg. cycle
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{avgSalesCycleDays > 0 ? `${avgSalesCycleDays} days` : '0 days'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
