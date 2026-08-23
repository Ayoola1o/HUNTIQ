import React from 'react';
import { X, Flag, Check } from 'lucide-react';

interface TopBarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  onClose?: () => void;
}

const topSteps = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Ideal Customer Profile' },
  { id: 3, label: 'Services & Solutions' },
  { id: 4, label: 'Hunting Preferences' },
  { id: 5, label: 'AI Configuration' },
  { id: 6, label: 'Finish', isFinish: true },
];

export const TopBar: React.FC<TopBarProps> = ({ currentStep, onSelectStep, onClose }) => {
  return (
    <header style={{
      padding: '24px 32px 18px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #eaecf0',
    }}>
      {/* Title + Close button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-primary)'
          }}>
            Set up your hunting workspace
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0,
            fontWeight: 400
          }}>
            Tell us about your business so we can find your next best clients.
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s, color 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Horizontal Steps Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {topSteps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isLast = idx === topSteps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div
                onClick={() => onSelectStep(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '20px',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {/* Step badge */}
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: isActive
                    ? '#6366f1'
                    : isCompleted
                    ? '#e0e7ff'
                    : '#f1f5f9',
                  color: isActive ? '#ffffff' : isCompleted ? '#4f46e5' : '#64748b',
                  border: isActive ? 'none' : '1px solid #cbd5e1'
                }}>
                  {step.isFinish ? (
                    <Flag size={11} strokeWidth={2.5} />
                  ) : isCompleted ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    step.id
                  )}
                </div>

                <span style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#4f46e5' : isCompleted ? '#1e293b' : '#64748b',
                  whiteSpace: 'nowrap'
                }}>
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div style={{
                  height: '1px',
                  width: '24px',
                  minWidth: '16px',
                  backgroundColor: isCompleted ? '#818cf8' : '#e2e8f0',
                  flexShrink: 0,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </header>
  );
};
