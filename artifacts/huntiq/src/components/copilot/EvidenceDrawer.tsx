import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Sparkles 
} from 'lucide-react';
import type { OpportunityCardData } from './OpportunityCard';

interface EvidenceDrawerProps {
  opp: OpportunityCardData | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ opp, onClose }) => {
  if (!opp) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 15, 25, 0.55)',
      backdropFilter: 'blur(3px)',
      zIndex: 60,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '460px',
        maxWidth: '100%',
        backgroundColor: '#ffffff',
        height: '100%',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#1e1b4b',
              border: '1px solid #6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>Intelligence Evidence Dossier</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{opp.name} • Score: {opp.score}/100</div>
            </div>
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
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Section 1: Verified Data */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#059669',
              marginBottom: '10px'
            }}>
              <CheckCircle size={16} />
              <span>VERIFIED PRIMARY SIGNALS &amp; TRIGGERS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {opp.whyNow && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}>
                  <strong style={{ color: '#166534' }}>Primary Timing Trigger:</strong>
                  <div style={{ color: '#15803d', marginTop: '2px', lineHeight: 1.4 }}>
                    {opp.whyNow}
                  </div>
                </div>
              )}

              {opp.evidence && opp.evidence.length > 0 ? (
                opp.evidence.map((item, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    <strong style={{ color: '#166534' }}>Signal Event #{idx + 1}:</strong>
                    <div style={{ color: '#15803d', marginTop: '2px', lineHeight: 1.4 }}>
                      {item}
                    </div>
                  </div>
                ))
              ) : !opp.whyNow ? (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#64748b',
                  lineHeight: 1.4
                }}>
                  No active buying signals recorded yet for {opp.name}. Ingesting real-time signals via Signal Radar will automatically attach verified trigger events here.
                </div>
              ) : null}
            </div>
          </div>

          {/* Section 2: Inferred Information */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#d97706',
              marginBottom: '10px'
            }}>
              <AlertCircle size={16} />
              <span>ACCOUNT INTENT ANALYSIS</span>
            </div>

            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#92400e',
              lineHeight: 1.4
            }}>
              {opp.score !== null ? (
                <>
                  HUNTIQ scoring engine calculated an Opportunity Score of <strong>{opp.score}/100 ({opp.badge} Priority)</strong> for {opp.name} based on verified operational signals, account size ({opp.size}), and regional market momentum ({opp.location}).
                </>
              ) : (
                <>
                  Opportunity score is currently being indexed for {opp.name}. Market classification: <strong>{opp.industry}</strong> • Headcount: <strong>{opp.size}</strong>.
                </>
              )}
            </div>
          </div>

          {/* Section 3: AI Interpretation */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#7c3aed',
              marginBottom: '10px'
            }}>
              <Sparkles size={16} />
              <span>AI STRATEGIC RECOMMENDATION</span>
            </div>

            <div style={{
              backgroundColor: '#faf5ff',
              border: '1px solid #e9d5ff',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#6b21a8',
              lineHeight: 1.4
            }}>
              {opp.bestContact ? (
                `Initiate consultative engagement with ${opp.bestContact.name} (${opp.bestContact.role}) anchoring the conversation on ${opp.industry} velocity and current organizational priorities.`
              ) : (
                `Engage leadership at ${opp.name} with value messaging aligned to ${opp.industry} scale and upcoming business milestones.`
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #eaecf0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
