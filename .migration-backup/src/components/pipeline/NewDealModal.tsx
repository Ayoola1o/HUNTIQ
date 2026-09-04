import React, { useState } from 'react';
import { 
  X, 
  Sparkles 
} from 'lucide-react';
import type { PipelineDealItem, PipelineStage } from '../../types/pipeline';

interface NewDealModalProps {
  isOpen: boolean;
  initialStage?: PipelineStage;
  onClose: () => void;
  onCreateDeal: (deal: PipelineDealItem) => void;
}

export const NewDealModal: React.FC<NewDealModalProps> = ({
  isOpen,
  initialStage = 'contacted',
  onClose,
  onCreateDeal
}) => {
  const [companyName, setCompanyName] = useState('');
  const [dealTitle, setDealTitle] = useState('');
  const [serviceName] = useState('HR Consulting & Workforce Scaling');
  const [dealValue, setDealValue] = useState('15000');
  const [probability, setProbability] = useState('60');
  const [stage, setStage] = useState<PipelineStage>(initialStage);
  const [contactName, setContactName] = useState('');
  const [contactRole] = useState('Head of Operations');
  const [closeDate] = useState('June 30, 2025');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !dealTitle.trim()) return;

    const val = parseInt(dealValue) || 15000;
    const prob = parseInt(probability) || 60;

    const newDeal: PipelineDealItem = {
      id: `deal-${Date.now()}`,
      companyName,
      domain: `${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      dealTitle,
      serviceName,
      dealValue: val,
      probability: prob,
      opportunityScore: 90,
      stage,
      stageEnteredAt: 'Just now',
      expectedCloseDate: closeDate,
      ownerName: 'Ayoola Ade',
      contactName: contactName || 'Jane Doe',
      contactRole: contactRole || 'Director',
      contactAvatarBg: '#dbeafe',
      contactAvatarColor: '#1e40af',
      lastActivity: 'Deal created',
      nextAction: 'Introductory discovery call',
      nextActionDueDate: 'Tomorrow',
      priority: 'High',
      activities: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          type: 'note',
          title: 'Opportunity created in Pipeline',
          detail: `Initial stage set to ${stage} with $${val.toLocaleString()} expected value.`
        }
      ]
    };

    onCreateDeal(newDeal);
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
                Add New Pipeline Deal
              </h3>
              <p style={{ fontSize: '11px', color: '#a5b4fc', margin: '2px 0 0 0' }}>
                Track opportunity stage, commercial terms & expected close
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
              Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Technologies, Flutterwave, Moniepoint"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
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
              Deal / Project Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Workforce Scaling Engagement, Leadership Development Program"
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Deal Value ($)
              </label>
              <input
                type="number"
                placeholder="15000"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
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
                Close Probability (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as PipelineStage)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="contacted">Contacted</option>
                <option value="meeting">Meeting Scheduled</option>
                <option value="proposal">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Closed Won</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Key Contact Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jane Smith"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
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
              <span>Add Opportunity to Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
