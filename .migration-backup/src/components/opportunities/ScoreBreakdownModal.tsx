import React from 'react';
import type { OpportunityItem } from '../../types/opportunity';
import { 
  X, 
  CheckCircle2, 
  Target, 
  Zap, 
  Flame, 
  Users, 
  Building, 
  MessageSquare 
} from 'lucide-react';

interface ScoreBreakdownModalProps {
  opp: OpportunityItem | null;
  onClose: () => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ opp, onClose }) => {
  if (!opp) return null;

  const factors = [
    { label: 'ICP Fit', score: opp.scoreFactors.icpFit.score, max: opp.scoreFactors.icpFit.max, icon: <Target size={15} color="#4f46e5" />, note: 'Matches Lagos Tech & SaaS tier, 250-500 employees.' },
    { label: 'Buying Intent', score: opp.scoreFactors.buyingIntent.score, max: opp.scoreFactors.buyingIntent.max, icon: <Flame size={15} color="#e11d48" />, note: 'Strong active research on org scaling & management frameworks.' },
    { label: 'Trigger Events', score: opp.scoreFactors.triggerEvents.score, max: opp.scoreFactors.triggerEvents.max, icon: <Zap size={15} color="#d97706" />, note: '38 new open roles + Abuja branch expansion + new COO.' },
    { label: 'Decision Maker Access', score: opp.scoreFactors.decisionMakerAccess.score, max: opp.scoreFactors.decisionMakerAccess.max, icon: <Users size={15} color="#2563eb" />, note: 'Verified contact details for Head of People & COO.' },
    { label: 'Company Size Fit', score: opp.scoreFactors.companySize.score, max: opp.scoreFactors.companySize.max, icon: <Building size={15} color="#7c3aed" />, note: 'Ideal $25K-$50K contract capacity.' },
    { label: 'Engagement History', score: opp.scoreFactors.engagement.score, max: opp.scoreFactors.engagement.max, icon: <MessageSquare size={15} color="#059669" />, note: 'Prior newsletter subscriber and content download.' },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 15, 25, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '540px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>Opportunity Score Breakdown</div>
            <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{opp.companyName} • Total Score: {opp.score}/100</div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '460px', overflowY: 'auto' }}>
          {factors.map((f) => {
            const pct = Math.round((f.score / f.max) * 100);

            return (
              <div
                key={f.label}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {f.icon}
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      {f.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#4f46e5' }}>
                    {f.score} / {f.max} pts
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: pct >= 90 ? '#10b981' : pct >= 70 ? '#6366f1' : '#f59e0b',
                    borderRadius: '3px'
                  }} />
                </div>

                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {f.note}
                </div>
              </div>
            );
          })}

          {/* Total Summary Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#faf5ff',
            border: '1.5px solid #ddd6fe',
            borderRadius: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#7c3aed" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#6d28d9' }}>Total Calculated Score</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#6d28d9' }}>{opp.score} / 100</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #eaecf0',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
