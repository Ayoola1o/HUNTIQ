import React, { useState } from 'react';
import { 
  X, 
  Sparkles 
} from 'lucide-react';
import type { CampaignItem, CampaignChannel } from '../../types/campaign';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: (campaign: CampaignItem) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreateCampaign
}) => {
  const [name, setName] = useState('');
  const [audienceName, setAudienceName] = useState('Lagos Technology Growth Companies');
  const [channel, setChannel] = useState<CampaignChannel>('multichannel');
  const [audienceCount] = useState('184');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const count = parseInt(audienceCount) || 150;

    const newCampaign: CampaignItem = {
      id: `camp-${Date.now()}`,
      name,
      description: `Targeting decision makers in ${audienceName} with personalized AI outreach sequences.`,
      channel,
      status: 'active',
      targetAudienceName: audienceName,
      audienceCount: count,
      sentCount: 0,
      openRate: 0,
      replyRate: 0,
      opportunitiesCount: 0,
      expectedValue: 36000,
      createdAt: 'Just now',
      lastActivity: 'Campaign initialized',
      sequence: [
        {
          id: 'sq-1',
          stepNumber: 1,
          channel: 'email',
          title: 'AI Signal-Based Value Intro',
          delayDays: 0,
          contentSnippet: 'I noticed your recent 38 openings and expansion into Ghana... We help scaleups reduce new-hire ramp by 40%.'
        },
        {
          id: 'sq-2',
          stepNumber: 2,
          channel: 'linkedin',
          title: 'LinkedIn InMail Follow-up',
          delayDays: 3,
          contentSnippet: 'Saw your rapid headcount growth—wanted to share our workforce scaling framework.'
        },
        {
          id: 'sq-3',
          stepNumber: 3,
          channel: 'call',
          title: 'Cold Call Opener & Meeting Hook',
          delayDays: 6,
          contentSnippet: 'Following up on my note regarding management training for your expanding team.'
        }
      ],
      prospects: [
        {
          id: 'p-1',
          contactName: 'Jane Smith',
          contactRole: 'Head of People',
          companyName: 'Acme Technologies',
          domain: 'acmetech.com',
          email: 'jane@acmetech.com',
          status: 'pending',
          opportunityScore: 94,
          lastTouch: 'Scheduled for sending'
        }
      ]
    };

    onCreateCampaign(newCampaign);
    onClose();
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
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '580px',
        maxWidth: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Launch New Outreach Campaign
              </h3>
              <p style={{ fontSize: '11px', color: '#a5b4fc', margin: '2px 0 0 0' }}>
                Automated multi-step sequences powered by buying signals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <X size={18} color="#ffffff" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Campaign Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Lagos HR Directors Hiring Surge, Pan-African FinTech Execs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Target Prospect Audience (from Saved Searches)
            </label>
            <select
              value={audienceName}
              onChange={(e) => setAudienceName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontFamily: 'inherit'
              }}
            >
              <option value="Lagos Technology Growth Companies">Lagos Technology Growth Companies (184 prospects)</option>
              <option value="Pan-African FinTech Scaleups">Pan-African FinTech Scaleups (96 prospects)</option>
              <option value="Abuja Public & Commercial Enterprise">Abuja Commercial Enterprise (54 prospects)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Outreach Channels
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setChannel('multichannel')}
                style={{
                  border: channel === 'multichannel' ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                  backgroundColor: channel === 'multichannel' ? '#f5f3ff' : '#ffffff',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <strong style={{ fontSize: '12px', color: '#4338ca', display: 'block' }}>Multi-Channel AI</strong>
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>Email + LinkedIn + Call</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('email')}
                style={{
                  border: channel === 'email' ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                  backgroundColor: channel === 'email' ? '#f5f3ff' : '#ffffff',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <strong style={{ fontSize: '12px', color: '#1e293b', display: 'block' }}>Email Only</strong>
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>3-step cold email</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('linkedin')}
                style={{
                  border: channel === 'linkedin' ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                  backgroundColor: channel === 'linkedin' ? '#f5f3ff' : '#ffffff',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <strong style={{ fontSize: '12px', color: '#1e293b', display: 'block' }}>LinkedIn</strong>
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>InMail + Connect</span>
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Sparkles size={14} />
              <span>Launch Campaign Sequence</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
