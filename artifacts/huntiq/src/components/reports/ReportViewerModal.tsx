import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import type { ReportItem } from '../../types/reports';

interface ReportViewerModalProps {
  report: ReportItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  report,
  isOpen,
  onClose,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'attribution' | 'funnel' | 'actions'>('summary');

  if (!isOpen || !report) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        width: '920px',
        maxWidth: '100%',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                HUNTIQ Intelligence Report
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>{report.period}</span>
            </div>

            <h2 style={{ fontSize: '19px', fontWeight: 800, margin: '3px 0 0 0', color: '#ffffff' }}>
              {report.name}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34d399',
              padding: '4px 10px',
              borderRadius: '6px'
            }}>
              {report.confidenceScore}% Confidence
            </span>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
            >
              <X size={20} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #eaecf0',
          padding: '0 28px',
          display: 'flex',
          gap: '8px'
        }}>
          {[
            { id: 'summary', label: 'Executive Summary & KPIs' },
            { id: 'attribution', label: 'Signal → Opportunity Attribution' },
            { id: 'funnel', label: 'Sales Funnel & Velocity' },
            { id: 'actions', label: `Recommended Actions (${report.recommendations.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TAB 1: Summary & KPIs */}
          {activeTab === 'summary' && (
            <>
              {/* AI Executive Summary Block */}
              <div style={{
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={16} color="#ffffff" />
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#5b21b6', margin: 0 }}>
                    AI Executive Interpretation
                  </h4>
                  <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                    {report.summary}
                  </p>
                </div>
              </div>

              {/* Core Metric Comparison Table */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                  Period Performance Metrics vs Previous Baseline
                </h4>

                <div style={{ border: '1px solid #eaecf0', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eaecf0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px 16px', fontWeight: 700 }}>Key Metric</th>
                        <th style={{ padding: '10px 16px', fontWeight: 700 }}>Current Period</th>
                        <th style={{ padding: '10px 16px', fontWeight: 700 }}>Previous Period</th>
                        <th style={{ padding: '10px 16px', fontWeight: 700, textAlign: 'right' }}>Variance / Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.kpiMetrics.map((kpi, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{kpi.metric}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: '#2563eb' }}>{kpi.current}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b' }}>{kpi.previous}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '11px',
                              color: kpi.isPositive ? '#059669' : '#dc2626',
                              backgroundColor: kpi.isPositive ? '#ecfdf5' : '#fef2f2',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              {kpi.change}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top 5 Opportunities Identified */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                  Top Qualified Opportunities in Period
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {report.topOpportunities.map((opp, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #eaecf0',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          {opp.companyName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Primary Signal: <strong>{opp.signal}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#059669' }}>
                          ${opp.value.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#4f46e5' }}>
                          Opp Score {opp.score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: Signal Attribution */}
          {activeTab === 'attribution' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Signal → Opportunity Conversion Matrix
                </h4>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Quantifying which market buying signals generated the most qualified sales pipeline
                </p>
              </div>

              <div style={{ border: '1px solid #eaecf0', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eaecf0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Buying Signal Category</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Qualified Opportunities</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Pipeline Generated</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Yield Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.signalAttribution.map((sig, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>{sig.signal}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>{sig.oppCount} Deals</td>
                        <td style={{ padding: '12px 16px', fontWeight: 900, color: '#059669' }}>${sig.pipelineValue.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '2px 6px', borderRadius: '4px' }}>
                            ${Math.round(sig.pipelineValue / sig.oppCount).toLocaleString()} / opp
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Sales Funnel */}
          {activeTab === 'funnel' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  End-to-End Prospecting & Conversion Funnel
                </h4>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Velocity from Discovery → Outreach → Meeting → Closed Won
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {report.funnelStages.map((st, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #eaecf0',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {idx + 1}
                      </span>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{st.stage}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>
                        {st.count.toLocaleString()}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {st.conversionPct}% Conv.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Recommended Actions */}
          {activeTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px 18px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #eaecf0',
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                      {idx + 1}. {rec.title}
                    </strong>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      {rec.detail}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onNavigate(rec.actionRoute);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{rec.actionText}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
