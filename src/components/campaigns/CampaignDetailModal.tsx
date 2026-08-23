import React, { useState } from 'react';
import { 
  X
} from 'lucide-react';
import type { CampaignItem } from '../../types/campaign';

interface CampaignDetailModalProps {
  campaign: CampaignItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPipeline?: () => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaign,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'sequence' | 'prospects' | 'analytics'>('sequence');

  if (!isOpen || !campaign) return null;

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
        {/* Header */}
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
              <span style={{ fontSize: '11.5px', color: '#a5b4fc', fontWeight: 600 }}>
                {campaign.targetAudienceName}
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
              <span style={{ fontSize: '11px', color: '#cbd5e1' }}>{campaign.audienceCount} contacts</span>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: '#ffffff' }}>
              {campaign.name}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#34d399' }}>
                {campaign.opportunitiesCount} Opportunities
              </div>
              <div style={{ fontSize: '11px', color: '#a5b4fc' }}>
                ${campaign.expectedValue.toLocaleString()} pipeline
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

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #eaecf0',
          padding: '0 24px',
          display: 'flex',
          gap: '8px'
        }}>
          {[
            { id: 'sequence', label: `Outreach Sequence (${campaign.sequence.length} Steps)` },
            { id: 'prospects', label: `Target Prospects (${campaign.prospects.length})` },
            { id: 'analytics', label: 'Funnel Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Sequence Steps Tab */}
          {activeTab === 'sequence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {campaign.sequence.map((step) => (
                <div
                  key={step.id}
                  style={{
                    border: '1px solid #eaecf0',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        {step.stepNumber}
                      </span>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{step.title}</strong>
                    </div>

                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                      {step.delayDays === 0 ? 'Sent Immediately' : `Wait ${step.delayDays} days`}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: '#475569',
                    backgroundColor: '#f8fafc',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    lineHeight: 1.45,
                    fontStyle: 'italic'
                  }}>
                    "{step.contentSnippet}"
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prospects Tab */}
          {activeTab === 'prospects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {campaign.prospects.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #eaecf0',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{p.contactName}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>• {p.contactRole} at {p.companyName}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      backgroundColor: p.status === 'replied' ? '#ecfdf5' : '#eff6ff',
                      color: p.status === 'replied' ? '#059669' : '#2563eb',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      textTransform: 'capitalize'
                    }}>
                      {p.status}
                    </span>

                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {p.lastTouch}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Funnel Tab */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Targeted</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{campaign.audienceCount}</div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Delivered</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>{campaign.sentCount}</div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Replies ({campaign.replyRate}%)</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>{Math.round(campaign.sentCount * (campaign.replyRate / 100))}</div>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#047857' }}>Pipeline Generated</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#059669', marginTop: '2px' }}>${campaign.expectedValue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
