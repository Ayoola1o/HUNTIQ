import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Rocket, 
  CheckCircle2, 
  Target, 
  Globe2, 
  Users, 
  UserCheck, 
  Zap, 
  DollarSign, 
  ArrowLeft
} from 'lucide-react';
import type { OnboardingData } from '../../types/onboarding';

interface Step6FinishProps {
  data: OnboardingData;
  onPrev: () => void;
  onStartHunting: () => void;
}

export const Step6Finish: React.FC<Step6FinishProps> = ({ data, onPrev, onStartHunting }) => {
  useEffect(() => {
    // Fire festive celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const activeSignals = Object.entries(data.signals)
    .filter(([_, active]) => active)
    .map(([key]) => {
      const names: Record<string, string> = {
        hiringSpikes: 'Hiring Spikes',
        fundingRounds: 'Funding Rounds',
        geoExpansion: 'Expansion',
        leadershipChanges: 'Leadership Changes',
        techStackChanges: 'Tech Stack Changes',
        newsPR: 'PR & News',
        regulatoryEvents: 'Regulatory Events',
      };
      return names[key] || key;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with success badge */}
      <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          padding: '6px 16px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <CheckCircle2 size={16} />
          Workspace Configuration Complete
        </div>

        <h2 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 6px 0',
          letterSpacing: '-0.02em',
          fontFamily: 'var(--font-primary)'
        }}>
          Your hunting system is ready.
        </h2>
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          maxWidth: '560px',
          margin: '0 auto'
        }}>
          We've calibrated our autonomous intelligence engine around <strong>{data.workspaceName}</strong>'s ideal customer profile and timing triggers.
        </p>
      </div>

      {/* Structured Executive Summary Grid */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        {/* Item 1: ICP */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#ede9fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c3aed',
            flexShrink: 0
          }}>
            <Target size={18} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>ICP / Target Industries</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {data.industries.length > 0 ? data.industries.join(', ') : 'All High-Growth Tech & Finance'}
            </div>
          </div>
        </div>

        {/* Item 2: Location */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7',
            flexShrink: 0
          }}>
            <Globe2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Target Geography</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {data.geographicMarkets.length > 0 ? data.geographicMarkets.join(', ') : 'United States & Global'}
            </div>
          </div>
        </div>

        {/* Item 3: Company Size */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            flexShrink: 0
          }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Company Size</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {data.companySize}
            </div>
          </div>
        </div>

        {/* Item 4: Target Buyers */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a',
            flexShrink: 0
          }}>
            <UserCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Target Buyers & Decision Makers</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {data.targetBuyerRoles.slice(0, 3).join(', ')}
            </div>
          </div>
        </div>

        {/* Item 5: Priority Signals */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706',
            flexShrink: 0
          }}>
            <Zap size={18} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Priority Signals & Triggers</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {activeSignals.slice(0, 3).join(', ')}
            </div>
          </div>
        </div>

        {/* Item 6: Deal Value */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#ccfbf1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0d9488',
            flexShrink: 0
          }}>
            <DollarSign size={18} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Average Deal Value</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              ${data.averageDealValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        marginTop: '8px'
      }}>
        <button
          onClick={onStartHunting}
          style={{
            backgroundColor: '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 48px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5), 0 8px 10px -6px rgba(99, 102, 241, 0.4)',
            transition: 'transform 0.15s, background-color 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#4f46e5';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6366f1';
            e.currentTarget.style.transform = 'translateY(0px)';
          }}
        >
          <Rocket size={20} />
          <span>Start Hunting →</span>
        </button>

        <button
          onClick={onPrev}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ArrowLeft size={14} />
          <span>Edit Configuration</span>
        </button>
      </div>
    </div>
  );
};
