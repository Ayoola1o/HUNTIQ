import React from 'react';
import { Zap, Clock, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import type { LatestMarketSignalItem } from '../../types/market';

interface LatestSignalsFeedCardProps {
  onInvestigateCompany: (company: string) => void;
  onViewAllSignals?: () => void;
}

export const LatestSignalsFeedCard: React.FC<LatestSignalsFeedCardProps> = ({
  onInvestigateCompany,
  onViewAllSignals
}) => {
  const signals: LatestMarketSignalItem[] = [
    {
      id: 'sig-1',
      title: 'Flutterwave opens 45 engineering & compliance roles',
      company: 'Flutterwave',
      industry: 'FinTech',
      location: 'Lagos, Nigeria',
      timeAgo: '2h ago',
      signalType: 'hiring',
      strength: 'Very High',
      confidence: 96,
      evidence: 'Direct company careers portal + LinkedIn Talent Insights (45 newly indexed listings).',
      aiInterpretation: 'Substantial talent expansion in regulatory compliance and payment infrastructure.',
      iconBg: '#eff6ff',
      iconColor: '#2563eb'
    },
    {
      id: 'sig-2',
      title: 'Paystack establishes operations in Abidjan and Nairobi',
      company: 'Paystack',
      industry: 'FinTech',
      location: 'Pan-Africa',
      timeAgo: '5h ago',
      signalType: 'expansion',
      strength: 'High',
      confidence: 94,
      evidence: 'Official press release and corporate registry filings in Côte d’Ivoire.',
      aiInterpretation: 'Expansion into Francophone Africa signaling demand for localized cross-border infrastructure.',
      iconBg: '#ecfdf5',
      iconColor: '#059669'
    },
    {
      id: 'sig-3',
      title: 'Moniepoint completes $110M Series C financing round',
      company: 'Moniepoint',
      industry: 'FinTech',
      location: 'Lagos, Nigeria',
      timeAgo: '1d ago',
      signalType: 'funding',
      strength: 'Very High',
      confidence: 98,
      evidence: 'Regulatory disclosures and verified press confirmation led by Development Partners International.',
      aiInterpretation: 'Massive capital runway earmarked for retail banking and enterprise payroll product suite.',
      iconBg: '#fdf4ff',
      iconColor: '#c026d3'
    },
    {
      id: 'sig-4',
      title: 'Helium Health appoints former AWS Director as VP Engineering',
      company: 'Helium Health',
      industry: 'Healthcare',
      location: 'Lagos, Nigeria',
      timeAgo: '1d ago',
      signalType: 'leadership',
      strength: 'High',
      confidence: 92,
      evidence: 'Executive profile change on LinkedIn + internal company announcement.',
      aiInterpretation: 'Key leadership hire typically precedes major enterprise architecture upgrades and vendor evaluations.',
      iconBg: '#f5f3ff',
      iconColor: '#7c3aed'
    },
    {
      id: 'sig-5',
      title: 'Dangote Group commissions new automated packaging line',
      company: 'Dangote Group',
      industry: 'Manufacturing',
      location: 'Lagos, Nigeria',
      timeAgo: '2d ago',
      signalType: 'technology',
      strength: 'Medium',
      confidence: 89,
      evidence: 'Trade journal publication and supply chain procurement tender bulletin.',
      aiInterpretation: 'Heavy capital expenditure on factory floor automation and predictive maintenance sensors.',
      iconBg: '#fffbeb',
      iconColor: '#d97706'
    }
  ];

  const getBadgeDetails = (type: LatestMarketSignalItem['signalType']) => {
    switch (type) {
      case 'hiring':
        return { label: 'Hiring Surge', bg: '#eff6ff', color: '#1d4ed8' };
      case 'expansion':
        return { label: 'Geo Expansion', bg: '#ecfdf5', color: '#047857' };
      case 'funding':
        return { label: 'Funding Event', bg: '#fdf4ff', color: '#86198f' };
      case 'leadership':
        return { label: 'Leadership Change', bg: '#f5f3ff', color: '#5b21b6' };
      case 'technology':
        return { label: 'Tech Stack Shift', bg: '#fffbeb', color: '#b45309' };
      default:
        return { label: 'Market Signal', bg: '#f1f5f9', color: '#475569' };
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
      flex: 1.4,
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
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={14} color="#dc2626" />
          </div>
          <div>
            <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Latest Market Signals Feed
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Real-time chronological stream with AI provenance & confidence
            </span>
          </div>
        </div>

        <button
          onClick={onViewAllSignals}
          style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0
          }}
        >
          View all signals →
        </button>
      </div>

      {/* Signals Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {signals.map((sig) => {
          const badge = getBadgeDetails(sig.signalType);

          return (
            <div
              key={sig.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 24, 40, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#f1f5f9';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Left Column: Title + Meta details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Top Badge & Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: badge.bg,
                    color: badge.color,
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    {badge.label}
                  </span>

                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                    {sig.company}
                  </span>

                  <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>•</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', color: '#64748b' }}>
                    <Clock size={11} color="#94a3b8" />
                    <span>{sig.timeAgo}</span>
                  </div>

                  <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>•</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', color: '#64748b' }}>
                    <MapPin size={11} color="#94a3b8" />
                    <span>{sig.location}</span>
                  </div>
                </div>

                {/* Main Headline */}
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1e293b',
                  lineHeight: 1.35,
                  marginBottom: '4px'
                }}>
                  {sig.title}
                </div>

                {/* AI Interpretation snippet */}
                <div style={{
                  fontSize: '11px',
                  color: '#475569',
                  lineHeight: 1.3,
                  backgroundColor: '#f1f5f9',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <ShieldCheck size={12} color="#6366f1" />
                  <span style={{ fontStyle: 'italic' }}>"{sig.aiInterpretation}"</span>
                </div>
              </div>

              {/* Right Column: CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <span style={{
                  fontSize: '10px',
                  color: '#059669',
                  backgroundColor: '#ecfdf5',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  {sig.confidence}% Conf.
                </span>

                <button
                  onClick={() => onInvestigateCompany(sig.company)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#4338ca',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f3ff';
                    e.currentTarget.style.borderColor = '#818cf8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  <span>Investigate</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
