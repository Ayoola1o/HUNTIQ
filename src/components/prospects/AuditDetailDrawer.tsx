import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Zap 
} from 'lucide-react';
import type { GeoScrapedBusiness } from '../../engine/geoScraperEngine';

interface AuditDetailDrawerProps {
  business: GeoScrapedBusiness | null;
  onClose: () => void;
  onCaptureOpportunity: (business: GeoScrapedBusiness) => void;
  onPushToPipeline: (business: GeoScrapedBusiness) => void;
}

export const AuditDetailDrawer: React.FC<AuditDetailDrawerProps> = ({
  business,
  onClose,
  onCaptureOpportunity,
  onPushToPipeline
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'pitch' | 'score'>('audit');
  const [pitchChannel, setPitchChannel] = useState<'email' | 'linkedin' | 'call'>('email');
  const [copied, setCopied] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isPushed, setIsPushed] = useState(false);

  if (!business) return null;

  const audit = business.digitalAudit;
  const gapScore = audit.gapScore;
  const currentScore = audit.beforeAfterScores.current.total;
  const potentialScore = audit.beforeAfterScores.potential.total;

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCapture = () => {
    setIsCaptured(true);
    onCaptureOpportunity(business);
    setTimeout(() => setIsCaptured(false), 3000);
  };

  const handlePush = () => {
    setIsPushed(true);
    onPushToPipeline(business);
    setTimeout(() => setIsPushed(false), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '460px',
      maxWidth: '92vw',
      backgroundColor: '#ffffff',
      boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.18)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #e2e8f0',
      animation: 'slideIn 0.25s ease-out'
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '10.5px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: audit.fixPriority === 'CRITICAL' ? '#fee2e2' : audit.fixPriority === 'HIGH' ? '#ffedd5' : '#e0e7ff',
              color: audit.fixPriority === 'CRITICAL' ? '#dc2626' : audit.fixPriority === 'HIGH' ? '#ea580c' : '#4338ca'
            }}>
              Priority: {audit.fixPriority}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {business.category}
            </span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            {business.name}
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            {business.address}
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 20px',
        backgroundColor: '#ffffff'
      }}>
        {[
          { id: 'audit', label: 'Issues & Package' },
          { id: 'score', label: 'Score Breakdown' },
          { id: 'pitch', label: 'Pitch Language' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === tab.id ? '#4f46e5' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drawer Body Scroll */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Before / After Digital Score Card */}
        <div style={{
          backgroundColor: '#090d16',
          borderRadius: '12px',
          padding: '16px',
          color: '#ffffff',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} />
              <span>Digital Transformation Opportunity</span>
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              backgroundColor: gapScore >= 80 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
              color: gapScore >= 80 ? '#fca5a5' : '#fcd34d',
              padding: '2px 8px',
              borderRadius: '9999px',
              border: `1px solid ${gapScore >= 80 ? '#ef4444' : '#f59e0b'}`
            }}>
              Gap Score: {gapScore}/100
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Current Digital Score</span>
              <strong style={{ fontSize: '20px', fontWeight: 900, color: '#f87171' }}>{currentScore} / 100</strong>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Potential Score Post-Fix</span>
              <strong style={{ fontSize: '20px', fontWeight: 900, color: '#34d399' }}>{potentialScore} / 100</strong>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
            Estimated Commercial Deal: <strong style={{ color: '#ffffff' }}>${audit.recommendedPackage.estimatedValue.min.toLocaleString()} – ${audit.recommendedPackage.estimatedValue.max.toLocaleString()} USD</strong> ({audit.conversionProbability}% Closing Probability)
          </div>
        </div>

        {/* Tab 1: Issues & Recommended Package */}
        {activeTab === 'audit' && (
          <>
            {/* Recommended Package */}
            <div style={{
              backgroundColor: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>
                  Recommended Solution Package
                </span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#4338ca' }}>
                  ${audit.recommendedPackage.estimatedValue.max.toLocaleString()} USD
                </span>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#312e81', margin: '0 0 6px 0' }}>
                {audit.recommendedPackage.packageName}
              </h4>
              <p style={{ fontSize: '12px', color: '#4c1d95', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                {audit.recommendedPackage.description}
              </p>
              <div style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 700 }}>
                Deliverables: {audit.recommendedPackage.deliverables.join(' • ')}
              </div>
            </div>

            {/* Detected Issues List */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={15} color="#e11d48" />
                <span>Detected Commercial Problems ({audit.issuesDetected.length})</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {audit.issuesDetected.map((iss) => (
                  <div
                    key={iss.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #fecdd3',
                      backgroundColor: '#fff1f2'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '12.5px', color: '#881337' }}>
                        {iss.title}
                      </strong>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        backgroundColor: iss.severity === 'CRITICAL' ? '#f43f5e' : '#fb923c',
                        color: '#ffffff',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {iss.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#9f1239', margin: '2px 0 4px 0', lineHeight: 1.35 }}>
                      {iss.description}
                    </p>
                    <div style={{ fontSize: '11px', color: '#475569' }}>
                      <strong style={{ color: '#0f172a' }}>Fix: </strong>{iss.recommendedFix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Score Breakdown */}
        {activeTab === 'score' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              6-Dimension Digital Maturity Breakdown
            </h4>

            {[
              { label: 'Website Presence & SSL', score: audit.digitalMaturity.website, max: 25 },
              { label: 'Google Maps & Local Presence', score: audit.digitalMaturity.localPresence, max: 15 },
              { label: 'Corporate Email Credibility', score: audit.digitalMaturity.emailCredibility, max: 10 },
              { label: 'Conversion & Online Booking', score: audit.digitalMaturity.conversionTools, max: 20 },
              { label: 'Social Media & NAP Citations', score: audit.digitalMaturity.socialPresence, max: 10 },
              { label: 'Local Search SEO Authority', score: audit.digitalMaturity.localSeo, max: 20 }
            ].map((item, idx) => {
              const pct = (item.score / item.max) * 100;
              return (
                <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>
                    <span style={{ color: '#334155' }}>{item.label}</span>
                    <span style={{ color: '#0f172a' }}>{item.score} / {item.max}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444',
                      borderRadius: '9999px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Pitch Language */}
        {activeTab === 'pitch' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['email', 'linkedin', 'call'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setPitchChannel(ch)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: pitchChannel === ch ? '#4f46e5' : '#f1f5f9',
                    color: pitchChannel === ch ? '#ffffff' : '#64748b'
                  }}
                >
                  {ch === 'email' ? 'Email Pitch' : ch === 'linkedin' ? 'LinkedIn' : 'Cold Call'}
                </button>
              ))}
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '14px',
              position: 'relative'
            }}>
              <button
                onClick={() => handleCopyScript(
                  pitchChannel === 'email'
                    ? audit.pitchAngles.emailPitch
                    : pitchChannel === 'linkedin'
                    ? audit.pitchAngles.linkedInPitch
                    : audit.pitchAngles.salesCallOpener
                )}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#4f46e5',
                  cursor: 'pointer'
                }}
              >
                <Copy size={12} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <p style={{ fontSize: '12px', color: '#1e293b', fontStyle: 'italic', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line', paddingRight: '40px' }}>
                {pitchChannel === 'email'
                  ? audit.pitchAngles.emailPitch
                  : pitchChannel === 'linkedin'
                  ? audit.pitchAngles.linkedInPitch
                  : audit.pitchAngles.salesCallOpener}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Action Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #f1f5f9',
        backgroundColor: '#f8fafc',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={handleCapture}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: isCaptured ? '#059669' : '#ffffff',
            color: isCaptured ? '#ffffff' : '#0f172a',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isCaptured ? <Check size={14} /> : <Zap size={14} color="#4f46e5" fill="#4f46e5" />}
          <span>{isCaptured ? 'Captured!' : 'Capture Opportunity'}</span>
        </button>

        <button
          onClick={handlePush}
          style={{
            flex: 1.3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: isPushed ? '#059669' : '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          {isPushed ? <Check size={14} /> : <Send size={14} />}
          <span>{isPushed ? 'Pushed to Pipeline!' : `Push to Pipeline ($${audit.recommendedPackage.estimatedValue.max.toLocaleString()})`}</span>
        </button>
      </div>
    </div>
  );
};
