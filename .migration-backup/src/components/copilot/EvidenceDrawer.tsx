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
              <span>VERIFIED PRIMARY DATA (100% CONFIRMED)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <strong style={{ color: '#166534' }}>Job Postings Surge:</strong>
                <div style={{ color: '#15803d', marginTop: '2px' }}>
                  38 active job listings published across LinkedIn, Jobberman & company portal in last 30 days.
                </div>
              </div>

              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <strong style={{ color: '#166534' }}>Leadership Appointment:</strong>
                <div style={{ color: '#15803d', marginTop: '2px' }}>
                  Verified C-Suite addition: Chief Operating Officer joined 18 days ago.
                </div>
              </div>

              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <strong style={{ color: '#166534' }}>Corporate Registration:</strong>
                <div style={{ color: '#15803d', marginTop: '2px' }}>
                  New corporate entity branch registered in Abuja on April 28, 2025.
                </div>
              </div>
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
              <span>INFERRED INFORMATION (MODEL CONFIDENCE: 92%)</span>
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
              Based on the 38 open requisitions in engineering & operations, team scaling is projected at <strong>+24% headcount expansion</strong> over Q2-Q3.
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
              <span>AI STRATEGIC INTERPRETATION</span>
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
              Target <strong>{opp.bestContact.name} ({opp.bestContact.role})</strong> with leadership onboarding workflows and management scaling rather than generic staffing pitches.
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
