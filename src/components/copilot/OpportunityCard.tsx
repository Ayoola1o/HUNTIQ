import React from 'react';
import { 
  Flame, 
  Zap, 
  UserCheck, 
  Send, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export interface OpportunityCardData {
  id: string;
  rank: number;
  name: string;
  score: number;
  badge: 'HOT' | 'HIGH' | 'MEDIUM';
  industry: string;
  location: string;
  size: string;
  whyNow: string;
  evidence: string[];
  bestContact: {
    name: string;
    role: string;
    confidence: string;
  };
}

interface OpportunityCardProps {
  opp: OpportunityCardData;
  onViewCompany: (name: string) => void;
  onDraftOutreach: (opp: OpportunityCardData) => void;
  onViewEvidence: (opp: OpportunityCardData) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opp,
  onViewCompany,
  onDraftOutreach,
  onViewEvidence
}) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #eaecf0',
      padding: '16px',
      margin: '8px 0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'all 0.15s ease'
    }}>
      {/* Header Row: Rank + Company + Score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#ede9fe',
            color: '#6d28d9',
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {opp.rank}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                {opp.name}
              </span>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 800,
                backgroundColor: opp.badge === 'HOT' ? '#ffe4e6' : '#fef3c7',
                color: opp.badge === 'HOT' ? '#e11d48' : '#d97706',
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                {opp.badge === 'HOT' ? <Flame size={11} /> : <Zap size={11} />}
                {opp.score}/100 — {opp.badge}
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              {opp.industry} • {opp.size} • {opp.location}
            </div>
          </div>
        </div>

        <button
          onClick={() => onViewCompany(opp.name)}
          style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          <span>Profile</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Why Now Timing Trigger */}
      <div style={{
        backgroundColor: '#faf5ff',
        borderRadius: '8px',
        border: '1px solid #f3e8ff',
        padding: '10px 12px',
        fontSize: '12px'
      }}>
        <div style={{ color: '#7c3aed', fontWeight: 700, marginBottom: '2px' }}>
          ⚡ Why Now?
        </div>
        <div style={{ color: '#4c1d95', lineHeight: 1.35 }}>
          {opp.whyNow}
        </div>
      </div>

      {/* Evidence & Best Contact Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        paddingTop: '6px',
        borderTop: '1px solid #f8fafc'
      }}>
        {/* Decision Maker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCheck size={13} />
          </div>
          <div style={{ fontSize: '11.5px' }}>
            <span style={{ color: '#64748b' }}>Target: </span>
            <strong style={{ color: '#0f172a' }}>{opp.bestContact.name}</strong> ({opp.bestContact.role})
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onViewEvidence(opp)}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ShieldCheck size={12} color="#059669" />
            <span>Evidence</span>
          </button>

          <button
            onClick={() => onDraftOutreach(opp)}
            style={{
              backgroundColor: '#4f46e5',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Send size={11} />
            <span>Draft Outreach</span>
          </button>
        </div>
      </div>
    </div>
  );
};
