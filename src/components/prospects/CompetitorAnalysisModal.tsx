import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  Globe, 
  ExternalLink, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Loader2 
} from 'lucide-react';
import type { CompetitorAnalysisResult, RunCompetitorAnalysisPayload } from '../../types/competitorAnalysis';
import { analyzeCompetitors } from '../../api/competitors';

interface CompetitorAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPayload: RunCompetitorAnalysisPayload | null;
  onNavigateToOutreach?: () => void;
}

export const CompetitorAnalysisModal: React.FC<CompetitorAnalysisModalProps> = ({
  isOpen,
  onClose,
  targetPayload,
  onNavigateToOutreach
}) => {
  const [analysis, setAnalysis] = useState<CompetitorAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetPayload) {
      setIsLoading(true);
      analyzeCompetitors(targetPayload)
        .then(res => setAnalysis(res))
        .catch(err => console.error('Competitor analysis error:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, targetPayload]);

  if (!isOpen || !targetPayload) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '860px',
        maxWidth: '100%',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                color: '#a5b4fc',
                border: '1px solid rgba(165, 180, 252, 0.3)',
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                COMPETITOR GAP ENGINE
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Phase 3: Head-to-Head Search Benchmark
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
              {targetPayload.prospectName} vs Market Leaders
            </h3>

            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              {targetPayload.niche || 'Commercial Niche'} • {targetPayload.location || 'Local Market'}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {isLoading || !analysis ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <Loader2 size={36} color="#4f46e5" className="animate-spin" />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Benchmarking SERP Competitors & Domain Authority...
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Comparing organic keywords, monthly traffic, backlink networks, and content volume
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top 3 Competitor Anchors Row (matching docs/as.md lines 298-302 and 703-706) */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} color="#4f46e5" />
                <span>Market Leaders Occupying High-Intent SERPs</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${analysis.competitors.length}, 1fr)`, gap: '12px' }}>
                {analysis.competitors.map((comp) => (
                  <div
                    key={comp.id}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{comp.name}</strong>
                        {comp.domain && (
                          <a
                            href={comp.domain}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '11px',
                              color: '#2563eb',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              marginTop: '2px'
                            }}
                          >
                            <Globe size={10} />
                            <span>{comp.domain.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink size={9} />
                          </a>
                        )}
                      </div>

                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        padding: '2px 7px',
                        borderRadius: '6px'
                      }}>
                        SEO {comp.seoScore}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '11.5px',
                      color: '#475569',
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '6px'
                    }}>
                      <span>Monthly Traffic:</span>
                      <strong style={{ color: '#0f172a' }}>{comp.estimatedTraffic}</strong>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Top keywords: <em>{comp.topRankingKeywords.slice(0, 2).join(', ')}</em>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side-by-Side 8-Metric Comparison Table (matching docs/as.md lines 306-316) */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={15} color="#4f46e5" />
                <span>Head-to-Head Metric Benchmark</span>
              </div>

              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Metric</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#dc2626' }}>
                        {analysis.prospectName} (Prospect)
                      </th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#16a34a' }}>
                        Competitor Average
                      </th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Commercial Implication</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.comparisonMetrics.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{row.metric}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#dc2626' }}>
                          {row.prospectValue}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#16a34a' }}>
                          {row.competitorAvg}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '11px' }}>
                          {row.commercialImplication}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Why the Competitor is Winning (matching docs/as.md lines 317-320 and 502-509) */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Why the Competitor is Winning:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {analysis.whyCompetitorsAreWinning.map((point, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle2 size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Sales Pitch Hook Banner */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                  Recommended Sales Outreach Pitch Angle
                </div>
                <div style={{ fontSize: '12.5px', color: '#1e3a8a', marginTop: '2px', fontWeight: 600, lineHeight: 1.4 }}>
                  &ldquo;Your top 3 competitors currently capture {analysis.competitiveGapSummary.trafficGap}. Because they maintain 8x more referring domains and dedicated pages for every treatment, they are winning an estimated {analysis.competitiveGapSummary.leadGap}. Here is how we bridge that gap.&rdquo;
                </div>
              </div>
              <Sparkles size={28} color="#2563eb" style={{ flexShrink: 0 }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #eaecf0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            Benchmark compiled from organic SERP & link graph analysis.
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                if (onNavigateToOutreach) onNavigateToOutreach();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Send size={13} />
              <span>Pitch Competitor Gap</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
