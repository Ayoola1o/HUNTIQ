import React from 'react';
import type { SignalItem } from '../../types/signal';
import { 
  X, 
  Flame, 
  Send, 
  Users 
} from 'lucide-react';

interface SignalDrawerProps {
  signal: SignalItem | null;
  onClose: () => void;
  onStartOutreach: (signal: SignalItem) => void;
  onViewCompany: (companyName: string) => void;
}

export const SignalDrawer: React.FC<SignalDrawerProps> = ({
  signal,
  onClose,
  onStartOutreach,
  onViewCompany
}) => {
  if (!signal) return null;

  return (
    <div className="responsive-drawer-overlay" onClick={onClose}>
      <div 
        className="responsive-drawer-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div 
          className="mobile-only"
          style={{ 
            justifyContent: 'center', 
            alignItems: 'center',
            paddingTop: '8px', 
            paddingBottom: '2px' 
          }}
        >
          <div style={{ width: '38px', height: '4px', borderRadius: '2px', backgroundColor: '#cbd5e1' }} />
        </div>

        {/* Drawer Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              {signal.title}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
              {signal.companyName} • {signal.location}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Drawer Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* High Impact Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '8px',
          padding: '8px 12px',
          color: '#e11d48',
          fontSize: '12px',
          fontWeight: 700
        }}>
          <span>High Impact Signal</span>
          <Flame size={15} fill="#e11d48" />
        </div>

        {/* Signal Overview Table */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Signal Overview
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '11.5px',
            backgroundColor: '#f8fafc',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Type</span>
              <span style={{ fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>{signal.type}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Detected</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{signal.detectedTimestamp}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Impact Score</span>
              <span style={{ fontWeight: 700, color: '#e11d48' }}>{signal.impactScore} / 100 📶</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Confidence</span>
              <span style={{ fontWeight: 600, color: '#059669' }}>{signal.confidence}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Source</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{signal.source}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>First Detected</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{signal.firstDetected}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Last Updated</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{signal.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* What Happened */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            What Happened
          </div>
          <p style={{
            fontSize: '12px',
            color: '#334155',
            lineHeight: 1.45,
            margin: 0,
            backgroundColor: '#f8fafc',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            {signal.whatHappened}
          </p>
        </div>

        {/* Why It Matters */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            Why It Matters
          </div>
          <p style={{
            fontSize: '12px',
            color: '#334155',
            lineHeight: 1.45,
            margin: 0,
            backgroundColor: '#faf5ff',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #f3e8ff'
          }}>
            {signal.whyItMatters}
          </p>
        </div>

        {/* Affected Departments (Top 5) */}
        {signal.affectedDepartments && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Affected Departments (Top 5)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {signal.affectedDepartments.map((dept) => (
                <div
                  key={dept.name}
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{dept.name}</span>
                  <span style={{
                    backgroundColor: '#cbd5e1',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    fontWeight: 700,
                    fontSize: '10px'
                  }}>
                    {dept.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Action */}
        <div style={{
          backgroundColor: '#f5f3ff',
          border: '1px solid #ddd6fe',
          borderRadius: '10px',
          padding: '12px 14px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', marginBottom: '4px' }}>
            Recommended Action
          </div>
          <div style={{ fontSize: '12px', color: '#4c1d95', lineHeight: 1.4, marginBottom: '12px' }}>
            {signal.recommendedAction}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onViewCompany(signal.companyName)}
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              View Company
            </button>

            <button
              onClick={() => onStartOutreach(signal)}
              style={{
                flex: 1,
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Send size={12} />
              <span>Start Outreach</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
