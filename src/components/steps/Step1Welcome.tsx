import React from 'react';
import { 
  Building2, 
  Globe, 
  Tag, 
  Pencil, 
  Target, 
  TrendingUp, 
  Handshake, 
  Megaphone,
  ArrowRight
} from 'lucide-react';
import type { OnboardingData } from '../../types/onboarding';

interface Step1WelcomeProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export const Step1Welcome: React.FC<Step1WelcomeProps> = ({ data, onChange, onNext }) => {
  const objectives = [
    {
      id: 'generate_clients',
      title: 'Generate new clients',
      desc: 'Find and acquire new customers',
      icon: <Target size={24} color="#e11d48" />,
    },
    {
      id: 'increase_pipeline',
      title: 'Increase pipeline',
      desc: 'Fill my sales pipeline with qualified opportunities',
      icon: <TrendingUp size={24} color="#6366f1" />,
    },
    {
      id: 'expand_accounts',
      title: 'Expand accounts',
      desc: 'Find opportunities to sell more to existing clients',
      icon: <Handshake size={24} color="#d97706" />,
    },
    {
      id: 'market_intelligence',
      title: 'Market intelligence',
      desc: 'Understand my market and competitors',
      icon: <Megaphone size={24} color="#4f46e5" />,
    },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#5c45fd',
          margin: '0 0 4px 0',
          fontFamily: 'var(--font-primary)'
        }}>
          1. Welcome
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: 0
        }}>
          Let's start with the basics about your business.
        </p>
      </div>

      {/* Row 1: Workspace Name + Website */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Workspace Name */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Workspace / Company Name
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Building2 size={20} color="#0284c7" />
            </div>
            <input
              type="text"
              value={data.workspaceName}
              onChange={(e) => onChange({ workspaceName: e.target.value })}
              placeholder="e.g. Peak Consulting"
              style={{
                flex: 1,
                height: '42px',
                padding: '0 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Website <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Globe size={20} color="#64748b" />
            </div>
            <input
              type="url"
              value={data.website}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="https://yourcompany.com"
              style={{
                flex: 1,
                height: '42px',
                padding: '0 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: What does your business sell? */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
          What does your business sell?
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#ede9fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Tag size={20} color="#7c3aed" />
          </div>
          <input
            type="text"
            value={data.whatYouSell}
            onChange={(e) => onChange({ whatYouSell: e.target.value })}
            placeholder="e.g. HR Consulting & Employee Training Services"
            style={{
              flex: 1,
              height: '42px',
              padding: '0 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              color: '#0f172a',
              outline: 'none',
              backgroundColor: '#ffffff',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Row 3: Short business description */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            Short business description
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#f3e8ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <Pencil size={18} color="#9333ea" />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              rows={3}
              maxLength={300}
              value={data.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Explain what problems you solve and for whom..."
              style={{
                width: '100%',
                padding: '10px 14px',
                paddingBottom: '24px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                lineHeight: '1.5',
                color: '#0f172a',
                outline: 'none',
                resize: 'none',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            />
            <span style={{
              position: 'absolute',
              bottom: '8px',
              right: '12px',
              fontSize: '11px',
              color: '#94a3b8',
              pointerEvents: 'none'
            }}>
              {data.description.length}/300
            </span>
          </div>
        </div>
      </div>

      {/* Row 4: Primary sales objective */}
      <div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
            Primary sales objective
          </label>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            What is your main goal with this platform?
          </span>
        </div>

        {/* 4 Objective Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
        }}>
          {objectives.map((obj) => {
            const isSelected = data.primaryObjective === obj.id;

            return (
              <div
                key={obj.id}
                onClick={() => onChange({ primaryObjective: obj.id })}
                style={{
                  padding: '16px 14px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#f8f7ff' : '#ffffff',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.12)' : 'none'
                }}
              >
                {/* Radio indicator */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: isSelected ? '5px solid #6366f1' : '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.15s ease'
                }} />

                {/* Icon */}
                <div style={{
                  margin: '8px 0 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {obj.icon}
                </div>

                {/* Title */}
                <h4 style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: '0 0 6px 0',
                  lineHeight: 1.2
                }}>
                  {obj.title}
                </h4>

                {/* Description */}
                <p style={{
                  fontSize: '11.5px',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: 1.35
                }}>
                  {obj.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button
          onClick={onNext}
          style={{
            backgroundColor: '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            transition: 'background-color 0.15s, transform 0.1s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6366f1')}
        >
          <span>Save & Continue</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
