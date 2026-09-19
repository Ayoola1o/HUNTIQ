import React from 'react';
import { 
  X, 
  Building2, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import type { IndustrySignalItem } from '../../types/market';

interface IndustryIntelligenceDrawerProps {
  industry: IndustrySignalItem | null;
  onClose: () => void;
  onExploreCompanies: (industryName: string) => void;
  onInvestigateCompany: (company: string) => void;
}

export const IndustryIntelligenceDrawer: React.FC<IndustryIntelligenceDrawerProps> = ({
  industry,
  onClose,
  onExploreCompanies,
  onInvestigateCompany
}) => {
  if (!industry) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        width: '520px',
        maxWidth: '100vw',
        backgroundColor: '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.12)',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: industry.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Building2 size={20} color={industry.iconColor} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {industry.name}
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {industry.trend} Growth
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Industry Deep Dive & Commercial Opportunity Analysis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Opportunity Index Hero Card */}
          <div style={{
            backgroundColor: '#f5f3ff',
            border: '1px solid #ede9fe',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
                Market Opportunity Index
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#4338ca', lineHeight: 1.1, marginTop: '4px' }}>
                {industry.opportunityIndex} <span style={{ fontSize: '14px', fontWeight: 500, color: '#7c3aed' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#5b21b6', marginTop: '4px' }}>
                High commercial priority based on signal density & ICP match.
              </div>
            </div>

            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '3px solid #818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 900,
              color: '#4f46e5'
            }}>
              {industry.opportunityIndex}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px'
          }}>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '10px',
              padding: '12px'
            }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Total Signals</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {industry.signalsFormatted}
              </div>
              <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700 }}>
                {industry.trend} vs 30d
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '10px',
              padding: '12px'
            }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Companies Tracked</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {industry.companiesAffected}
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                Active accounts
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '10px',
              padding: '12px'
            }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Opportunity Density</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                {(industry.opportunityDensity * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700 }}>
                High intent ratio
              </div>
            </div>
          </div>

          {/* Sub-Signals Breakdown */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: '12px',
            padding: '14px 16px'
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
              Sub-Signal Momentum
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#475569' }}>Hiring Activity</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{industry.hiringGrowth}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#475569' }}>Geographic Expansion</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{industry.expansionGrowth}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#475569' }}>Funding & Capital Influx</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{industry.fundingGrowth}</span>
              </div>
            </div>
          </div>

          {/* Why This Matters (AI Commercial Reasoning) */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={15} color="#2563eb" />
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e40af' }}>
                Commercial Implication & AI Reasoning
              </span>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#1e3a8a',
              lineHeight: 1.5,
              margin: 0
            }}>
              {industry.whyItMatters}
            </p>
          </div>

          {/* Top Companies in Sector */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
              High-Momentum Accounts in {industry.name}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {industry.topCompanies.map((compName) => (
                <div
                  key={compName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                    {compName}
                  </span>

                  <button
                    onClick={() => onInvestigateCompany(compName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#4f46e5',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Investigate</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          marginTop: 'auto',
          padding: '16px 24px',
          borderTop: '1px solid #eaecf0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={() => onExploreCompanies(industry.name)}
            style={{
              flex: 1,
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9px',
              padding: '10px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>Explore {industry.companiesAffected} Companies</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '9px',
              padding: '10px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
