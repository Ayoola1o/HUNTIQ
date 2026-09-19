import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  UserPlus, 
  Cpu, 
  Newspaper, 
  Scale, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';
import type { OnboardingData } from '../../types/onboarding';

interface Step4HuntingSignalsProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface SignalItem {
  key: keyof OnboardingData['signals'];
  title: string;
  desc: string;
  weight: string;
  weightColor: string;
  icon: React.ReactNode;
}

export const Step4HuntingSignals: React.FC<Step4HuntingSignalsProps> = ({ data, onChange, onNext, onPrev }) => {
  const signalItems: SignalItem[] = [
    {
      key: 'hiringSpikes',
      title: 'Hiring Spikes & Headcount Growth',
      desc: 'Triggers when a company posts >15 job openings or expands departments rapidly (+15% in 60d).',
      weight: 'High Impact (+25 pts)',
      weightColor: '#059669',
      icon: <TrendingUp size={20} color="#059669" />,
    },
    {
      key: 'fundingRounds',
      title: 'Funding & Capital Infusion',
      desc: 'Triggers when fresh Seed, Series A–D, or private equity investments are finalized.',
      weight: 'High Impact (+25 pts)',
      weightColor: '#059669',
      icon: <DollarSign size={20} color="#16a34a" />,
    },
    {
      key: 'geoExpansion',
      title: 'Geographic & Market Expansion',
      desc: 'Triggers when announcements are made regarding opening new regional offices or foreign entities.',
      weight: 'Medium (+20 pts)',
      weightColor: '#2563eb',
      icon: <MapPin size={20} color="#2563eb" />,
    },
    {
      key: 'leadershipChanges',
      title: 'Leadership & C-Suite Changes',
      desc: 'Triggers when new CEOs, COOs, VPs, or Heads of Departments are hired or promoted in the last 90 days.',
      weight: 'High Impact (+20 pts)',
      weightColor: '#059669',
      icon: <UserPlus size={20} color="#7c3aed" />,
    },
    {
      key: 'techStackChanges',
      title: 'Technology & Tool Migrations',
      desc: 'Triggers when changes in cloud providers, CRM, ERP, or internal development stacks are detected.',
      weight: 'Medium (+15 pts)',
      weightColor: '#2563eb',
      icon: <Cpu size={20} color="#0284c7" />,
    },
    {
      key: 'newsPR',
      title: 'Press & Media Mentions',
      desc: 'Triggers on major PR releases, product launches, key partnerships, or industry accolades.',
      weight: 'Low (+10 pts)',
      weightColor: '#d97706',
      icon: <Newspaper size={20} color="#d97706" />,
    },
    {
      key: 'regulatoryEvents',
      title: 'Regulatory, Compliance & Standards',
      desc: 'Triggers when new compliance deadlines, audits, or industry regulations take effect in their sector.',
      weight: 'Medium (+15 pts)',
      weightColor: '#2563eb',
      icon: <Scale size={20} color="#dc2626" />,
    },
  ];

  const toggleSignal = (key: keyof OnboardingData['signals']) => {
    onChange({
      signals: {
        ...data.signals,
        [key]: !data.signals[key],
      },
    });
  };

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
          4. Hunting Preferences & Trigger Signals
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: 0
        }}>
          Choose the buying signals that indicate a prospect is ready to buy <em>right now</em>.
        </p>
      </div>

      {/* Signals Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {signalItems.map((item) => {
          const isChecked = data.signals[item.key];

          return (
            <div
              key={item.key}
              onClick={() => toggleSignal(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '12px',
                border: isChecked ? '1.5px solid #818cf8' : '1px solid #e2e8f0',
                backgroundColor: isChecked ? '#fbfbfe' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isChecked ? '0 2px 8px rgba(99, 102, 241, 0.08)' : 'none'
              }}
            >
              {/* Left Details */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, paddingRight: '16px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: isChecked ? '#ede9fe' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                      {item.title}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: item.weightColor,
                      backgroundColor: `${item.weightColor}15`,
                      padding: '1px 7px',
                      borderRadius: '6px'
                    }}>
                      {item.weight}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: isChecked ? '#6366f1' : '#cbd5e1',
                padding: '2px',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  transform: isChecked ? 'translateX(20px)' : 'translateX(0px)',
                  transition: 'transform 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <button
          onClick={onPrev}
          style={{
            backgroundColor: '#ffffff',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '11px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

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
          }}
        >
          <span>Save & Continue</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
