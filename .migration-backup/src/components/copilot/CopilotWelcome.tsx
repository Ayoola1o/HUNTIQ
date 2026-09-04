import React from 'react';
import { 
  Search, 
  Activity, 
  Target, 
  Compass, 
  AlertTriangle, 
  Mail, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CopilotWelcomeProps {
  onSelectPrompt: (promptText: string) => void;
}

export const CopilotWelcome: React.FC<CopilotWelcomeProps> = ({ onSelectPrompt }) => {
  const promptCards = [
    {
      category: 'Find Prospects',
      prompt: 'Find 25 technology companies in Lagos that are hiring.',
      desc: 'Autonomous search filtered by size, location, and open job roles.',
      icon: <Search size={18} color="#6366f1" />,
      iconBg: '#eef2ff'
    },
    {
      category: 'Analyze Market',
      prompt: 'What industries are showing the strongest buying signals?',
      desc: 'Live radar aggregate across hiring spikes, expansion, and funding.',
      icon: <Activity size={18} color="#0284c7" />,
      iconBg: '#e0f2fe'
    },
    {
      category: 'Prioritize',
      prompt: 'Which prospects should I contact today?',
      desc: 'Ranked high-intent opportunities based on timing urgency and score.',
      icon: <Target size={18} color="#e11d48" />,
      iconBg: '#ffe4e6'
    },
    {
      category: 'Company Research',
      prompt: 'Research Acme Technologies.',
      desc: 'Deep 360° dossier with org charts, tech stack, and pain points.',
      icon: <Compass size={18} color="#7c3aed" />,
      iconBg: '#f3e8ff'
    },
    {
      category: 'Pipeline Audit',
      prompt: 'Which deals in my pipeline are currently at risk?',
      desc: 'Detect stalled deals with no touchpoints in >14 days.',
      icon: <AlertTriangle size={18} color="#d97706" />,
      iconBg: '#fef3c7'
    },
    {
      category: 'Draft Outreach',
      prompt: 'Draft an email for my five hottest prospects.',
      desc: 'Contextual, bespoke pitch matching recent trigger events.',
      icon: <Mail size={18} color="#059669" />,
      iconBg: '#dcfce7'
    },
  ];

  return (
    <div style={{
      maxWidth: '820px',
      margin: '0 auto',
      padding: '40px 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      {/* Bot Icon Hero */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(124, 58, 237, 0.45)',
        marginBottom: '20px',
        position: 'relative'
      }}>
        <Sparkles size={32} color="#ffffff" />
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          border: '2px solid #ffffff'
        }} />
      </div>

      {/* Main Welcome Heading */}
      <h2 style={{
        fontSize: '28px',
        fontWeight: 800,
        color: '#0f172a',
        letterSpacing: '-0.02em',
        margin: '0 0 10px 0',
        fontFamily: 'var(--font-primary)'
      }}>
        What can I help you hunt today?
      </h2>

      <p style={{
        fontSize: '14.5px',
        color: '#64748b',
        maxWidth: '620px',
        lineHeight: 1.5,
        margin: '0 0 32px 0'
      }}>
        I can find prospects, investigate companies, identify decision-makers, analyze buying signals, manage your pipeline and help you plan your next move.
      </p>

      {/* 6 Responsive Grid Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px',
        width: '100%',
        textAlign: 'left'
      }}>
        {promptCards.map((c) => (
          <div
            key={c.category}
            onClick={() => onSelectPrompt(c.prompt)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px',
              transition: 'all 0.18s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#c7d2fe';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.borderColor = '#eaecf0';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: c.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {c.icon}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.4px' }}>
                  {c.category.toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.35, marginBottom: '4px' }}>
                "{c.prompt}"
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.35 }}>
                {c.desc}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#4f46e5',
              paddingTop: '6px'
            }}>
              <span>Try prompt</span>
              <ArrowRight size={13} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
