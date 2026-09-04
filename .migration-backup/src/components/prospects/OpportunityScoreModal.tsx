import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Loader2 
} from 'lucide-react';
import type { OpportunityScoringResult, CalculateOpportunityPayload } from '../../types/opportunityScoring';
import { calculateOpportunityScore } from '../../api/opportunityScoring';

interface OpportunityScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPayload: CalculateOpportunityPayload | null;
  onNavigateToOutreach?: () => void;
}

export const OpportunityScoreModal: React.FC<OpportunityScoreModalProps> = ({
  isOpen,
  onClose,
  targetPayload,
  onNavigateToOutreach
}) => {
  const [scoring, setScoring] = useState<OpportunityScoringResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetPayload) {
      setIsLoading(true);
      calculateOpportunityScore(targetPayload)
        .then(res => setScoring(res))
        .catch(err => console.error('Opportunity scoring error:', err))
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
        width: '840px',
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
                SEO OPPORTUNITY SCORING ENGINE
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Phase 4: Multi-Factor Commercial Valuation
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
              {targetPayload.prospectName}
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

        {isLoading || !scoring ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <Loader2 size={36} color="#4f46e5" className="animate-spin" />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Computing Multi-Factor Commercial Opportunity Formula...
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Evaluating Search Demand, Competitor Advantage, Prospect Weakness & Revenue Value
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Main Score & Revenue Banner (matching docs/as.md lines 677-686) */}
            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: '14px',
              padding: '20px 24px',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase' }}>
                  SEO Opportunity Score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0 6px 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff' }}>
                    {scoring.seoOpportunityScore}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#94a3b8' }}>/ 100</span>
                </div>
                {/* Score progress bar */}
                <div style={{ width: '220px', height: '8px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${scoring.seoOpportunityScore}%`,
                    height: '100%',
                    backgroundColor: '#4f46e5',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Estimated Monthly Revenue Opportunity</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8', margin: '4px 0 2px 0' }}>
                  {scoring.estimatedMonthlyOpportunity}
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                  Annual Projected Value: <strong style={{ color: '#ffffff' }}>{scoring.estimatedAnnualOpportunity}</strong>
                </div>
              </div>
            </div>

            {/* The 4 Sub-Pillars Row (matching docs/as.md lines 688-692) */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Core Intelligence Pillars
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { label: 'SEO HEALTH', score: scoring.pillars.seoHealth, sub: 'Technical & On-Page State' },
                  { label: 'COMPETITOR GAP', score: scoring.pillars.competitorGap, sub: 'Lead Competitor Advantage' },
                  { label: 'KEYWORD GAP', score: scoring.pillars.keywordGap, sub: 'Commercial Searches Missed' },
                  { label: 'CONTENT GAP', score: scoring.pillars.contentGap, sub: 'Page & Topic Depth Deficit' }
                ].map((pillar, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px' }}>
                      {pillar.label}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                      {pillar.score}/100
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                      {pillar.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Opportunities Bullets (matching docs/as.md lines 694-700) */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                Top High-Impact Opportunities Identified
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scoring.topOpportunities.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px' }}>
                    <span style={{ fontSize: '13px' }}>
                      {item.severity === 'CRITICAL' ? '🔴' : '🟠'}
                    </span>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The 6-Factor Formula Breakdown (matching docs/as.md Section 7) */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                The 6-Factor Valuation Formula (docs/as.md §7)
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
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Valuation Factor</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Factor Score</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Weight</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Weighted Pts</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Commercial Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoring.factors.map((f, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                          {f.name}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#16a34a' }}>
                          {f.score}/100
                        </td>
                        <td style={{ padding: '10px 14px', color: '#64748b' }}>
                          {Math.round(f.weight * 100)}%
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#4f46e5' }}>
                          +{f.weightedScore} pts
                        </td>
                        <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '11px' }}>
                          {f.rationale}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Commercial Diagnosis Callout */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <Sparkles size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                  Commercial Intelligence Diagnosis
                </div>
                <div style={{ fontSize: '12.5px', color: '#1e3a8a', marginTop: '2px', lineHeight: 1.4 }}>
                  {scoring.commercialDiagnosis}
                </div>
              </div>
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
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Target Recommended Package: </span>
            <strong style={{ fontSize: '12px', color: '#1d4ed8' }}>
              {scoring?.recommendedService || 'Local SEO Campaign'}
            </strong>
          </div>

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
              <span>Pitch Commercial Offer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
