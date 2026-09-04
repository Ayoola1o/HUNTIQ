import React, { useState } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import type { MarketAiInsightItem } from '../../types/market';

interface MarketAiInsightsProps {
  onExploreIndustry?: (industry: string) => void;
  onViewReport?: () => void;
}

export const MarketAiInsights: React.FC<MarketAiInsightsProps> = ({
  onExploreIndustry,
  onViewReport
}) => {
  const [selectedInsightIdx, setSelectedInsightIdx] = useState(0);

  const insights: MarketAiInsightItem[] = [
    {
      id: 'ins-1',
      title: 'Hiring activity surging in FinTech sector',
      category: 'Talent & Workforce',
      observation: 'FinTech companies are hiring 34% more than the previous period across engineering, compliance, and product.',
      evidence: '412 newly indexed roles across 87 verified companies in Lagos, Nairobi, and Accra.',
      interpretation: 'Regional expansion combined with local central bank licensing mandates is accelerating technical talent acquisition.',
      commercialImplication: 'High demand for workforce planning, employee onboarding, IT hardware provisioning, and HR automation tooling.',
      recommendedAction: 'Target Heads of People, CTOs, and COOs at the top 27 highest-fit FinTech scaleups.',
      actionCta: 'Explore FinTech Accounts',
      confidence: 94,
      sampleCompaniesCount: 27,
      industryTarget: 'Financial Services'
    },
    {
      id: 'ins-2',
      title: 'Pan-African payments expansion wave',
      category: 'Geographic Expansion',
      observation: 'Payment gateways are opening physical offices across Francophone West Africa at 2.4x the 90-day baseline.',
      evidence: 'Official corporate registrations and 18 expansion announcements in Abidjan, Dakar, and Douala.',
      interpretation: 'Firms are mitigating single-country currency volatility through multi-region footprint diversification.',
      commercialImplication: 'Immediate requirements for multi-currency treasury, cross-border legal compliance, and regional sales partners.',
      recommendedAction: 'Engage VP of Expansion and Strategy Leaders with localized expansion enablement frameworks.',
      actionCta: 'View Expansion Signals',
      confidence: 91,
      sampleCompaniesCount: 19,
      industryTarget: 'Financial Services'
    },
    {
      id: 'ins-3',
      title: 'Enterprise AI & Automation Stack Upgrades',
      category: 'Tech Stack Modernization',
      observation: 'Mid-market & enterprise tech companies are increasing LLM automation and security tooling investments (+42%).',
      evidence: '78 technology adoption signals and 45 AWS/GCP migration announcements detected.',
      interpretation: 'Companies are transitioning internal workflows to automated AI pipelines to boost operational efficiency.',
      commercialImplication: 'High conversion window for AI consulting, security audit certifications, and cloud optimization services.',
      recommendedAction: 'Present AI integration and compliance hardening case studies to Tech scaleup decision-makers.',
      actionCta: 'Explore Tech Sector',
      confidence: 89,
      sampleCompaniesCount: 23,
      industryTarget: 'Technology'
    }
  ];

  const current = insights[selectedInsightIdx];

  const bulletInsights = [
    '3 new industries showing high buying intent this quarter',
    'Expansion signals up 21% in West Africa corridor',
    'Leadership changes increased by 18% in Enterprise Tech',
    'AI & Automation investment velocity at all-time high (+42%)',
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '18px 20px',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      flex: 1.2,
      minWidth: 0
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            backgroundColor: '#ede9fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={14} color="#7c3aed" />
          </div>
          <div>
            <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Market Insights (AI Engine)
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Data-backed commercial reasoning & opportunity signals
            </span>
          </div>
        </div>

        <button
          onClick={onViewReport}
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
          <span>View full report</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Insight Switcher Pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {insights.map((ins, idx) => (
          <button
            key={ins.id}
            onClick={() => setSelectedInsightIdx(idx)}
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedInsightIdx === idx ? '1px solid #7c3aed' : '1px solid #e2e8f0',
              backgroundColor: selectedInsightIdx === idx ? '#f5f3ff' : '#f8fafc',
              color: selectedInsightIdx === idx ? '#6d28d9' : '#64748b',
              transition: 'all 0.15s ease'
            }}
          >
            {ins.category}
          </button>
        ))}
      </div>

      {/* Hero AI Box with Provenance and Structured Reasoning */}
      <div style={{
        backgroundColor: '#f5f3ff',
        border: '1px solid #ede9fe',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '12px'
      }}>
        {/* Title + Confidence */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#4338ca', lineHeight: 1.2 }}>
              {current.title}
            </div>
            <div style={{ fontSize: '11px', color: '#5b21b6', marginTop: '3px', lineHeight: 1.4 }}>
              {current.observation}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ede9fe',
            color: '#6d28d9',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '10.5px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
          }}>
            <ShieldCheck size={12} />
            <span>{current.confidence}% Conf.</span>
          </div>
        </div>

        {/* Evidence & Commercial Implication Snippet */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '8px 10px',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '11px'
        }}>
          <div>
            <span style={{ fontWeight: 700, color: '#4338ca' }}>Evidence: </span>
            <span style={{ color: '#475569' }}>{current.evidence}</span>
          </div>
          <div>
            <span style={{ fontWeight: 700, color: '#047857' }}>Commercial Implication: </span>
            <span style={{ color: '#475569' }}>{current.commercialImplication}</span>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
          <span style={{ fontSize: '11px', color: '#5b21b6', fontWeight: 600 }}>
            Recommended: {current.recommendedAction}
          </span>

          <button
            onClick={() => onExploreIndustry && onExploreIndustry(current.industryTarget || 'Financial Services')}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '7px',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
              boxShadow: '0 1px 4px rgba(79, 70, 229, 0.3)'
            }}
          >
            <span>{current.actionCta}</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Bullet Insights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {bulletInsights.map((text, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11.5px', color: '#475569' }}>
            <span style={{ color: '#6366f1', fontSize: '14px', lineHeight: 1 }}>•</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
