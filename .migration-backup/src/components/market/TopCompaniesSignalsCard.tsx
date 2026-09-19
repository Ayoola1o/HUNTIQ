import React from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import type { CompanySignalRow } from '../../types/market';

interface TopCompaniesSignalsCardProps {
  onSelectCompany: (companyName: string) => void;
  onViewAllCompanies?: () => void;
}

export const TopCompaniesSignalsCard: React.FC<TopCompaniesSignalsCardProps> = ({
  onSelectCompany,
  onViewAllCompanies
}) => {
  const companies: CompanySignalRow[] = [
    {
      id: 'comp-1',
      name: 'Flutterwave',
      logoBg: '#f59e0b',
      logoColor: '#ffffff',
      logoInitial: 'F',
      industry: 'FinTech',
      location: 'Lagos, Nigeria',
      topSignal: 'Hiring Surge (34 open tech roles)',
      signalType: 'hiring',
      signalsCount: 14,
      intensity: 5,
      intensityColor: '#ef4444',
      opportunityScore: 96,
      scoreLevel: 'Very High'
    },
    {
      id: 'comp-2',
      name: 'Paystack',
      logoBg: '#0ea5e9',
      logoColor: '#ffffff',
      logoInitial: 'P',
      industry: 'FinTech',
      location: 'Lagos, Nigeria',
      topSignal: 'Expansion (Opened 2 new regional hubs)',
      signalType: 'expansion',
      signalsCount: 9,
      intensity: 4,
      intensityColor: '#f97316',
      opportunityScore: 92,
      scoreLevel: 'Very High'
    },
    {
      id: 'comp-3',
      name: 'Moniepoint',
      logoBg: '#2563eb',
      logoColor: '#ffffff',
      logoInitial: 'M',
      industry: 'FinTech',
      location: 'Lagos, Nigeria',
      topSignal: 'Funding ($110M Series C announced)',
      signalType: 'funding',
      signalsCount: 12,
      intensity: 5,
      intensityColor: '#ef4444',
      opportunityScore: 95,
      scoreLevel: 'Very High'
    },
    {
      id: 'comp-4',
      name: 'OPay',
      logoBg: '#10b981',
      logoColor: '#ffffff',
      logoInitial: 'O',
      industry: 'FinTech',
      location: 'Lagos, Nigeria',
      topSignal: 'Tech Migration (Upgrading AWS infrastructure)',
      signalType: 'technology',
      signalsCount: 8,
      intensity: 4,
      intensityColor: '#f97316',
      opportunityScore: 90,
      scoreLevel: 'Very High'
    },
    {
      id: 'comp-5',
      name: 'Dangote Group',
      logoBg: '#e11d48',
      logoColor: '#ffffff',
      logoInitial: 'D',
      industry: 'Manufacturing',
      location: 'Lagos, Nigeria',
      topSignal: 'Leadership Change (New Chief Strategy Officer)',
      signalType: 'leadership',
      signalsCount: 7,
      intensity: 3,
      intensityColor: '#f59e0b',
      opportunityScore: 86,
      scoreLevel: 'High'
    }
  ];

  const getSignalBadgeStyle = (type: CompanySignalRow['signalType']) => {
    switch (type) {
      case 'hiring':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'expansion':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case 'funding':
        return { bg: '#fdf4ff', color: '#86198f', border: '#f5d0fe' };
      case 'technology':
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'leadership':
        return { bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '18px 20px',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      flex: 1.3,
      minWidth: 0
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            backgroundColor: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={14} color="#d97706" />
          </div>
          <div>
            <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Top Companies Showing Buying Signals
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Multi-signal momentum weighted by ICP fit & recency
            </span>
          </div>
        </div>

        <button
          onClick={onViewAllCompanies}
          style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: 0
          }}
        >
          <span>View all</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Companies List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {companies.map((company) => {
          const badgeStyle = getSignalBadgeStyle(company.signalType);

          return (
            <div
              key={company.id}
              onClick={() => onSelectCompany(company.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#f1f5f9';
              }}
            >
              {/* Left: Avatar + Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: company.logoBg,
                  color: company.logoColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {company.logoInitial}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                      {company.name}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      color: '#64748b',
                      backgroundColor: '#e2e8f0',
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}>
                      {company.industry}
                    </span>
                  </div>

                  {/* Signal preview line */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: badgeStyle.color,
                    backgroundColor: badgeStyle.bg,
                    border: `1px solid ${badgeStyle.border}`,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginTop: '3px'
                  }}>
                    <Zap size={10} />
                    <span>{company.topSignal}</span>
                  </div>
                </div>
              </div>

              {/* Right: Intensity Dots + Opp Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Intensity Dots */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 600 }}>
                    Signal Intensity
                  </span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: dot <= company.intensity ? company.intensityColor : '#cbd5e1'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Score Pill */}
                <div style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  textAlign: 'center',
                  minWidth: '48px'
                }}>
                  <div style={{ fontSize: '8.5px', color: '#047857', fontWeight: 700 }}>
                    OPP FIT
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>
                    {company.opportunityScore}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
