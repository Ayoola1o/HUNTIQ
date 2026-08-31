import React from 'react';
import type { OpportunityItem } from '../../types/opportunity';
import { 
  X, 
  Flame, 
  Send, 
  Building2, 
  Users, 
  DollarSign, 
  Globe, 
  Briefcase, 
  MapPin, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface OpportunityDrawerProps {
  opp: OpportunityItem | null;
  onClose: () => void;
  onOpenScoreBreakdown: (opp: OpportunityItem) => void;
  onStartOutreach: (opp: OpportunityItem) => void;
  onViewCompany: (companyName: string) => void;
  onAddToPipeline?: (opp: OpportunityItem) => void;
}

export const OpportunityDrawer: React.FC<OpportunityDrawerProps> = ({
  opp,
  onClose,
  onOpenScoreBreakdown,
  onStartOutreach,
  onViewCompany,
  onAddToPipeline
}) => {
  if (!opp) return null;

  return (
    <div style={{
      width: '380px',
      minWidth: '380px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      boxShadow: '0 2px 12px rgba(16, 24, 40, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: opp.avatarBg,
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {opp.avatarLetter}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              {opp.companyName}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
              {opp.industry} • {opp.location}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Drawer Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        {/* Score Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          backgroundColor: '#faf5ff',
          padding: '14px 16px',
          borderRadius: '12px',
          border: '1px solid #f3e8ff'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: '3px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '17px',
            fontWeight: 800,
            color: '#0f172a',
            backgroundColor: '#ffffff'
          }}>
            {opp.score}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Opportunity Score
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '1px'
            }}>
              <span>{opp.priority} Opportunity</span>
              <Flame size={13} fill="#e11d48" />
            </div>
            <button
              onClick={() => onOpenScoreBreakdown(opp)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6366f1',
                fontSize: '11.5px',
                fontWeight: 700,
                padding: 0,
                marginTop: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <span>View score breakdown</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Why It's an Opportunity */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            Why It's an Opportunity
          </div>
          <p style={{
            fontSize: '12.5px',
            color: '#334155',
            lineHeight: 1.45,
            margin: 0,
            backgroundColor: '#f8fafc',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            {opp.whyNow}
          </p>
        </div>

        {/* Top Signals */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Top Signals
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {opp.signals.map((sig) => (
              <div
                key={sig.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  border: '1px solid #eaecf0',
                  borderRadius: '8px',
                  padding: '8px 10px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '1px',
                    flexShrink: 0
                  }}>
                    {sig.type === 'hiring' ? <Users size={13} /> : sig.type === 'expansion' ? <MapPin size={13} /> : <Briefcase size={13} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      {sig.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {sig.detail}
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '10.5px', color: '#94a3b8', flexShrink: 0 }}>
                  {sig.timeAgo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Gap Audit Package (if available) */}
        {opp.digitalAudit && (
          <div style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '10px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase' }}>
                Digital Audit Diagnostic (Gap Score: {opp.digitalGapScore || opp.digitalAudit.gapScore}/100)
              </span>
              <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#f43f5e', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                Priority: {opp.digitalAudit.fixPriority}
              </span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, color: '#881337', marginBottom: '4px' }}>
              {opp.digitalAudit.recommendedPackage.packageName}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '6px 0' }}>
              {opp.digitalAudit.issuesDetected.slice(0, 3).map((iss) => (
                <div key={iss.id} style={{ fontSize: '11px', color: '#9f1239' }}>
                  • <strong>{iss.title}:</strong> {iss.description}
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              padding: '6px 10px',
              border: '1px solid #fda4af',
              marginTop: '6px',
              fontSize: '10.5px',
              color: '#475569'
            }}>
              <strong style={{ color: '#0f172a' }}>Recommended Package: </strong>
              ${opp.digitalAudit.recommendedPackage.estimatedValue.min.toLocaleString()} - ${opp.digitalAudit.recommendedPackage.estimatedValue.max.toLocaleString()} USD ({opp.digitalAudit.recommendedPackage.timeline})
            </div>
          </div>
        )}

        {/* Best Next Step */}
        <div style={{
          backgroundColor: '#f5f3ff',
          border: '1px solid #ddd6fe',
          borderRadius: '10px',
          padding: '12px 14px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', marginBottom: '4px' }}>
            Best Next Step
          </div>
          <div style={{ fontSize: '12px', color: '#4c1d95', lineHeight: 1.4, marginBottom: '12px' }}>
            {opp.bestNextStep.actionText}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onStartOutreach(opp)}
                style={{
                  flex: 1,
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
                }}
              >
                <Send size={12} />
                <span>Start Outreach</span>
              </button>

              <button
                onClick={() => onViewCompany(opp.companyName)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                View Company
              </button>
            </div>

            {onAddToPipeline && (
              <button
                onClick={() => onAddToPipeline(opp)}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <span>Push to CRM Pipeline (${opp.estimatedValue.toLocaleString()})</span>
              </button>
            )}
          </div>
        </div>

        {/* Company Details Section */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <Users size={13} />
                <span>Employees</span>
              </div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{opp.employees}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <DollarSign size={13} />
                <span>Revenue</span>
              </div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{opp.revenue}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <Building2 size={13} />
                <span>Industry</span>
              </div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{opp.industry}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <Globe size={13} />
                <span>Website</span>
              </div>
              <a
                href={`https://${opp.website}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontWeight: 600,
                  color: '#4f46e5',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span>{opp.website}</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <Globe size={13} />
                <span>LinkedIn</span>
              </div>
              <a
                href={opp.linkedInUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontWeight: 600,
                  color: '#4f46e5',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span>View Profile</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
