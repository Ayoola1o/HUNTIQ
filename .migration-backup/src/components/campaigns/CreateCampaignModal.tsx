import React, { useState } from 'react';
import { 
  X, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import type { CampaignItem, CampaignChannel } from '../../types/campaign';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: (campaign: Partial<CampaignItem>) => Promise<void> | void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreateCampaign
}) => {
  const [name, setName] = useState('');
  const [audienceName, setAudienceName] = useState('Lagos Technology Growth Companies');
  const [channel, setChannel] = useState<CampaignChannel>('multichannel');
  const [audienceCount, setAudienceCount] = useState('184');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const count = parseInt(audienceCount, 10) || 150;

    try {
      await onCreateCampaign({
        name: name.trim(),
        description: `Targeting decision makers in ${audienceName} with personalized AI outreach sequences.`,
        channel,
        status: 'active',
        targetAudienceName: audienceName,
        audienceCount: count,
        expectedValue: count * 350
      });
      onClose();
    } catch (err) {
      console.error('Failed to create campaign:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '540px',
        maxWidth: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Create AI Outreach Campaign
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                Generate automated multi-channel sequences based on live market signals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Campaign Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Campaign Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lagos Tech Hiring Surge Outreach"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Target Audience / ICP */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Target Audience (ICP / Segment)
              </label>
              <select
                value={audienceName}
                onChange={(e) => {
                  setAudienceName(e.target.value);
                  if (e.target.value.includes('Lagos')) setAudienceCount('184');
                  else if (e.target.value.includes('FinTech')) setAudienceCount('96');
                  else setAudienceCount('120');
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Lagos Technology Growth Companies">Lagos Technology Growth Companies (184 matches)</option>
                <option value="Pan-African FinTech Scaleups">Pan-African FinTech Scaleups (96 matches)</option>
                <option value="Executive Moves & New Leadership ICP">Executive Moves & New Leadership ICP (42 matches)</option>
                <option value="Commercial Enterprises & Regional Scaleups">Commercial Enterprises & Regional Scaleups (140 matches)</option>
              </select>
            </div>

            {/* Channel Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Outreach Channel Strategy
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'multichannel', title: 'Multi-Channel', desc: 'Email + LinkedIn + Call' },
                  { id: 'email', title: 'Email Only', desc: 'Direct 3-step sequence' },
                  { id: 'linkedin', title: 'LinkedIn Only', desc: 'InMail + Connection' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setChannel(item.id as CampaignChannel)}
                    style={{
                      border: channel === item.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                      backgroundColor: channel === item.id ? '#f5f3ff' : '#ffffff',
                      borderRadius: '10px',
                      padding: '12px 10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 800, color: channel === item.id ? '#4f46e5' : '#1e293b' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Generator Notice */}
            <div style={{
              padding: '12px 14px',
              backgroundColor: '#eff6ff',
              borderRadius: '10px',
              border: '1px solid #bfdbfe',
              fontSize: '11.5px',
              color: '#1e40af',
              lineHeight: 1.45,
              display: 'flex',
              gap: '8px'
            }}>
              <Sparkles size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Signal Engine Automation:</strong> Outreach copy, follow-up cadence, and personalized hooks will be generated automatically based on each company&apos;s real-time hiring, leadership, and expansion signals.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: name.trim() && !isSubmitting ? '#4f46e5' : '#a5b4fc',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: name.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating Sequences...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Launch Campaign</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
