import React from 'react';
import { 
  Sparkles, 
  ArrowUpRight, 
  Share2 
} from 'lucide-react';
import type { ReportItem } from '../../types/reports';

interface FeaturedReportCardProps {
  report: ReportItem;
  onOpenReport: (report: ReportItem) => void;
  onShareReport: (report: ReportItem) => void;
}

export const FeaturedReportCard: React.FC<FeaturedReportCardProps> = ({
  report,
  onOpenReport,
  onShareReport
}) => {
  return (
    <div style={{
      margin: '0 32px',
      background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #172554 100%)',
      borderRadius: '18px',
      padding: '24px 28px',
      color: '#ffffff',
      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(165, 180, 252, 0.3)',
              color: '#c7d2fe',
              fontSize: '10.5px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <Sparkles size={11} color="#a5b4fc" />
              <span>Featured Intelligence Brief</span>
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px' }}>•</span>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{report.period}</span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 0 0', color: '#ffffff', letterSpacing: '-0.01em' }}>
            {report.name}
          </h2>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onShareReport(report)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>

          <button
            onClick={() => onOpenReport(report)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          >
            <span>Open Report</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 Metric Callout Blocks */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        margin: '18px 0',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '14px 16px'
      }}>
        {report.kpiMetrics.map((kpi, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{kpi.metric}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                {kpi.current}
              </span>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: kpi.isPositive ? '#34d399' : '#f87171',
                backgroundColor: kpi.isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Executive Summary Snippet */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          backgroundColor: 'rgba(124, 58, 237, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Sparkles size={14} color="#e0e7ff" />
        </div>

        <p style={{
          fontSize: '12px',
          color: '#e2e8f0',
          margin: 0,
          lineHeight: 1.4,
          fontStyle: 'italic'
        }}>
          "{report.summary}"
        </p>
      </div>
    </div>
  );
};
