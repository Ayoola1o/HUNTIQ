import React from 'react';
import { Flag, Check } from 'lucide-react';

interface SidebarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
}

const steps = [
  { id: 1, title: 'Welcome', subtitle: 'Tell us about your business' },
  { id: 2, title: 'Ideal Customer Profile', subtitle: 'Define your target clients' },
  { id: 3, title: 'Services & Solutions', subtitle: 'What you offer' },
  { id: 4, title: 'Hunting Preferences', subtitle: 'Signals that matter' },
  { id: 5, title: 'AI Configuration', subtitle: 'Tune your hunting system' },
  { id: 6, title: 'Finish', subtitle: 'Review and start hunting' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentStep, onSelectStep }) => {
  return (
    <aside style={{
      width: '280px',
      minWidth: '280px',
      backgroundColor: '#0b0f19',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 20px',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'relative',
      height: '100vh',
      overflowY: 'auto'
    }}>
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', paddingLeft: '8px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(124, 58, 237, 0.5)'
          }}>
            {/* HUNTIQ custom mark */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C14.0747 21 15.9868 20.2974 17.5097 19.1171L19.2929 20.9003C19.6834 21.2908 20.3166 21.2908 20.7071 20.9003C21.0976 20.5097 21.0976 19.8766 20.7071 19.486L18.9959 17.7748C20.2474 16.1952 21 14.1873 21 12C21 7.02944 16.9706 3 12 3ZM7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51472 16.5 7.5 14.4853 7.5 12Z"
                fill="white"
              />
              <circle cx="12" cy="12" r="2.5" fill="#a78bfa" />
            </svg>
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: '#ffffff',
            fontFamily: 'var(--font-primary)'
          }}>
            HUNTIQ
          </span>
        </div>

        {/* Stepper Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
          {steps.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isLast = idx === steps.length - 1;

            return (
              <div
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Step Icon Badge */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  flexShrink: 0,
                  backgroundColor: isActive
                    ? '#6366f1'
                    : isCompleted
                    ? 'rgba(99, 102, 241, 0.25)'
                    : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#ffffff' : isCompleted ? '#a5b4fc' : '#94a3b8',
                  border: isActive
                    ? '2px solid #818cf8'
                    : isCompleted
                    ? '1px solid rgba(99, 102, 241, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: isActive ? '0 0 12px rgba(99, 102, 241, 0.6)' : 'none',
                  zIndex: 2,
                }}>
                  {isLast ? (
                    <Flag size={13} strokeWidth={2.5} />
                  ) : isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Text */}
                <div style={{ flex: 1, paddingTop: '2px' }}>
                  <div style={{
                    fontSize: '13.5px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#ffffff' : isCompleted ? '#e2e8f0' : '#94a3b8',
                    lineHeight: 1.2,
                    marginBottom: '3px'
                  }}>
                    {step.title}
                  </div>
                  <div style={{
                    fontSize: '11.5px',
                    color: isActive ? '#a5b4fc' : '#64748b',
                    lineHeight: 1.2
                  }}>
                    {step.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Glowing AI Bot Card */}
      <div style={{
        marginTop: '20px',
        backgroundColor: '#111827',
        borderRadius: '16px',
        padding: '20px 16px 16px',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.15)'
      }}>
        {/* Glow ambient background */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%)',
          pointerEvents: 'none'
        }} />

        {/* 3D Cute AI Bot Illustration */}
        <div style={{ position: 'relative', margin: '0 auto 12px', width: '76px', height: '76px' }} className="animate-float">
          <svg width="76" height="76" viewBox="0 0 100 100" fill="none">
            {/* Glowing background circle */}
            <circle cx="50" cy="50" r="44" fill="url(#botGlow)" opacity="0.3" />
            <circle cx="50" cy="50" r="38" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
            
            {/* Robot Head Body */}
            <rect x="28" y="32" width="44" height="34" rx="14" fill="#e0e7ff" />
            
            {/* Screen Face */}
            <rect x="34" y="38" width="32" height="22" rx="8" fill="#0f172a" stroke="#4f46e5" strokeWidth="1.5" />
            
            {/* Eyes Glowing Cyan/Purple */}
            <ellipse cx="43" cy="48" rx="3.5" ry="4.5" fill="#38bdf8" />
            <ellipse cx="57" cy="48" rx="3.5" ry="4.5" fill="#38bdf8" />
            <circle cx="44" cy="46.5" r="1.2" fill="#ffffff" />
            <circle cx="58" cy="46.5" r="1.2" fill="#ffffff" />
            
            {/* Smile */}
            <path d="M47 54C48.5 55.5 51.5 55.5 53 54" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />

            {/* Antennas / Ears */}
            <rect x="23" y="44" width="5" height="10" rx="2" fill="#6366f1" />
            <rect x="72" y="44" width="5" height="10" rx="2" fill="#6366f1" />
            <circle cx="50" cy="24" r="4" fill="#818cf8" />
            <line x1="50" y1="28" x2="50" y2="32" stroke="#818cf8" strokeWidth="2.5" />
            
            <defs>
              <radialGradient id="botGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#cbd5e1',
          lineHeight: '1.45',
          margin: 0,
          fontWeight: 400
        }}>
          We'll use this information to find the companies that need you most.
        </p>

        {/* Ambient waveform footer in card */}
        <div style={{ marginTop: '12px', height: '14px', width: '100%', opacity: 0.6 }}>
          <svg width="100%" height="14" viewBox="0 0 200 14" fill="none" preserveAspectRatio="none">
            <path
              d="M0 10 Q 25 2, 50 8 T 100 6 T 150 11 T 200 7"
              stroke="url(#waveGradient)"
              strokeWidth="2"
              fill="none"
            />
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </aside>
  );
};
