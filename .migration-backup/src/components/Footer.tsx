import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  currentStep: number;
  totalSteps?: number;
}

export const Footer: React.FC<FooterProps> = ({ currentStep, totalSteps = 5 }) => {
  const displayStep = Math.min(currentStep, totalSteps);
  const percentage = Math.round((displayStep / totalSteps) * 100);

  return (
    <footer style={{
      height: '56px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #eaecf0',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      bottom: 0,
      zIndex: 10,
    }}>
      {/* Security badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
        <ShieldCheck size={18} color="#10b981" />
        <span>Your data is 100% secure and never shared.</span>
      </div>

      {/* Step Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
          Step {displayStep} of {totalSteps}
        </span>

        {/* Progress bar container */}
        <div style={{
          width: '180px',
          height: '7px',
          backgroundColor: '#e2e8f0',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '9999px',
            transition: 'width 0.35s ease'
          }} />
        </div>

        <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600, minWidth: '85px' }}>
          {percentage}% complete
        </span>
      </div>
    </footer>
  );
};
