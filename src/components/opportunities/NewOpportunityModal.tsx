import React, { useState } from 'react';
import type { OpportunityItem, OpportunityStage, OpportunityPriority } from '../../types/opportunity';
import { X, Plus, DollarSign } from 'lucide-react';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOpportunity: (newOpp: Partial<OpportunityItem>) => void;
}

export const NewOpportunityModal: React.FC<NewOpportunityModalProps> = ({
  isOpen,
  onClose,
  onAddOpportunity
}) => {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [employees, setEmployees] = useState('100-250');
  const [estimatedValue, setEstimatedValue] = useState('25000');
  const [stage, setStage] = useState<OpportunityStage>('Discovery');
  const [whyNow, setWhyNow] = useState('');
  const [priority, setPriority] = useState<OpportunityPriority>('High');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    onAddOpportunity({
      companyName,
      industry,
      location,
      employees: `${employees} employees`,
      estimatedValue: parseFloat(estimatedValue) || 25000,
      stage,
      whyNow: whyNow.trim() || 'Manual opportunity created from executive direct inbound.',
      priority,
      score: priority === 'Hot' ? 92 : priority === 'High' ? 82 : 65,
      avatarLetter: companyName.charAt(0).toUpperCase(),
      avatarBg: '#6366f1',
      tags: ['Manual', 'Executive', 'Inbound'],
      lastActivity: 'Just now',
      lastActivityType: 'stage_change',
      website: `${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      revenue: '$10M - $25M',
      linkedInUrl: '#',
      signals: [
        {
          id: `sig-${Date.now()}`,
          type: 'manual',
          title: 'Direct Referral / Inbound',
          detail: 'Created manually by sales representative',
          timeAgo: 'Just now',
          confidence: 100
        }
      ],
      scoreFactors: {
        icpFit: { score: 22, max: 25 },
        buyingIntent: { score: 20, max: 25 },
        triggerEvents: { score: 18, max: 20 },
        decisionMakerAccess: { score: 12, max: 15 },
        companySize: { score: 9, max: 10 },
        engagement: { score: 4, max: 5 }
      },
      bestNextStep: {
        actionText: 'Schedule discovery meeting with primary stakeholder.',
        targetRole: 'Managing Director / VP',
        targetName: 'Lead Decision Maker'
      }
    });

    onClose();
  };

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
        width: '560px',
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
          padding: '18px 24px',
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>Create New Opportunity</div>
            <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Manually add a high-intent deal to your pipeline</div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sterling Capital, PayFlow Africa..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Company Size
              </label>
              <select
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="10-50">10-50 employees</option>
                <option value="50-100">50-100 employees</option>
                <option value="100-250">100-250 employees</option>
                <option value="250-500">250-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as OpportunityPriority)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Hot">🔥 Hot Opportunity</option>
                <option value="High">⭐ High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Estimated Deal Value ($)
              </label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px 0 28px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Initial Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as OpportunityStage)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Discovery">Discovery</option>
                <option value="Qualification">Qualification</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Nurturing">Nurturing</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Why It's an Opportunity (Timing Trigger)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Recently completed executive restructuring and planning Q3 regional rollout..."
              value={whyNow}
              onChange={(e) => setWhyNow(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'none'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
            borderTop: '1px solid #eaecf0',
            paddingTop: '16px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Plus size={14} />
              <span>Create Opportunity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
