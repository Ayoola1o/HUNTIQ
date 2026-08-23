import React from 'react';
import { 
  X, 
  Send, 
  Clock, 
  Building2, 
  CheckCircle2, 
  Award, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import type { PipelineDealItem, PipelineStage } from '../../types/pipeline';

interface DealDetailModalProps {
  deal: PipelineDealItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStage: (dealId: string, stage: PipelineStage) => void;
  onNavigateToResearch: (companyName: string) => void;
  onNavigateToOutreach: () => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  isOpen,
  onClose,
  onUpdateStage,
  onNavigateToResearch,
  onNavigateToOutreach
}) => {
  if (!isOpen || !deal) return null;

  const stages: { id: PipelineStage; label: string }[] = [
    { id: 'contacted', label: '1. Contacted' },
    { id: 'meeting', label: '2. Meeting' },
    { id: 'proposal', label: '3. Proposal' },
    { id: 'negotiation', label: '4. Negotiation' },
    { id: 'won', label: '5. Won' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      zIndex: 1000,
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
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Top Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 600 }}>
                {deal.companyName}
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
              <span style={{ fontSize: '11px', color: '#cbd5e1' }}>{deal.domain}</span>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: '#ffffff' }}>
              {deal.dealTitle}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#34d399' }}>
                ${deal.dealValue.toLocaleString()}
              </div>
              <div style={{ fontSize: '10.5px', color: '#a5b4fc' }}>
                {deal.probability}% close probability
              </div>
            </div>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
            >
              <X size={20} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Pipeline Stage Tracker */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #eaecf0',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {stages.map((st, idx) => {
              const isCurrent = deal.stage === st.id;
              const isPast = stages.findIndex(s => s.id === deal.stage) > idx;

              return (
                <button
                  key={st.id}
                  onClick={() => onUpdateStage(deal.id, st.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: isCurrent ? '#4f46e5' : isPast ? '#ecfdf5' : '#ffffff',
                    color: isCurrent ? '#ffffff' : isPast ? '#059669' : '#64748b',
                    boxShadow: isCurrent ? '0 2px 6px rgba(79, 70, 229, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  {isPast ? <CheckCircle2 size={12} /> : null}
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onUpdateStage(deal.id, 'won')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Award size={12} />
              <span>Mark Won</span>
            </button>

            <button
              onClick={() => onUpdateStage(deal.id, 'lost')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <XCircle size={12} />
              <span>Mark Lost</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Commercial Snapshot Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #eaecf0' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Target Service</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {deal.serviceName}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #eaecf0' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Expected Revenue</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                ${Math.round(deal.dealValue * (deal.probability / 100)).toLocaleString()}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #eaecf0' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Opportunity Score</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                {deal.opportunityScore} / 100 High Fit
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #eaecf0' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Expected Close</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
                {deal.expectedCloseDate}
              </div>
            </div>
          </div>

          {/* Key Decision Maker & Next Action */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Contact Card */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #eaecf0',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Key Decision Maker
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: deal.contactAvatarBg,
                    color: deal.contactAvatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 800
                  }}>
                    {deal.contactName.split(' ').map(n => n[0]).join('')}
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      {deal.contactName}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {deal.contactRole}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToResearch(deal.companyName);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    color: '#6d28d9',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Building2 size={12} />
                  <span>View 360° Intel</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateToOutreach();
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Send size={12} />
                  <span>Outreach</span>
                </button>
              </div>
            </div>

            {/* Next Scheduled Action */}
            <div style={{
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 800, textTransform: 'uppercase' }}>
                  Next Required Action
                </span>

                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#9a3412' }}>
                    {deal.nextAction}
                  </div>
                  <div style={{ fontSize: '12px', color: '#c2410c', marginTop: '2px' }}>
                    Due date: {deal.nextActionDueDate}
                  </div>
                </div>
              </div>

              {deal.isAtRisk && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={13} color="#dc2626" />
                  <span>Warning: No proposal feedback received in 7+ days</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
              Engagement & Activity History
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {deal.activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Clock size={12} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#0f172a' }}>{act.title}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>{act.detail}</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                    {act.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
