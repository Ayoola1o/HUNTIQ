import React from 'react';
import { 
  Flame, 
  Zap, 
  UserCheck, 
  Radar, 
  Calendar, 
  Send, 
  MoreVertical, 
  ChevronDown,
  ArrowRight
} from 'lucide-react';

interface AttentionFeedProps {
  onOpenResearch: (company: string) => void;
  onOpenContact: (person: string, company: string) => void;
}

export const AttentionFeed: React.FC<AttentionFeedProps> = ({ onOpenResearch, onOpenContact }) => {
  const attentionItems = [
    {
      id: 'acme',
      title: 'Acme Technologies',
      score: 94,
      scoreColor: '#0284c7',
      scoreBorder: '#38bdf8',
      typeBadge: 'HIGH PRIORITY',
      typeColor: '#e11d48',
      typeBg: '#ffe4e6',
      typeIcon: <Flame size={14} color="#e11d48" />,
      sub: 'Technology • 250-500 employees • Lagos, NG',
      description: 'Hiring 38 new employees + opened a second office + appointed a new COO.',
      tags: ['Hiring Surge', 'Expansion', 'New Executive'],
      bestContact: {
        name: 'Jane Smith',
        role: 'Head of People',
      },
      hasResearchBtn: true,
      hasContactBtn: true,
    },
    {
      id: 'finserve',
      title: 'FinServe Ltd',
      score: 88,
      scoreColor: '#d97706',
      scoreBorder: '#f59e0b',
      typeBadge: 'NEW SIGNAL',
      typeColor: '#d97706',
      typeBg: '#fef3c7',
      typeIcon: <Zap size={14} color="#d97706" />,
      sub: 'Financial Services • 200-500 employees • Lagos, NG',
      description: 'Announced expansion into two new markets: Ghana and Kenya.',
      tags: ['Expansion', 'News', 'Growth'],
      bestContact: {
        name: 'Michael Okoro',
        role: 'HR Director',
      },
      customAction: 'View Intelligence',
    },
    {
      id: 'sarah',
      title: 'Sarah Johnson',
      score: null,
      typeBadge: 'CONTACT CHANGED',
      typeColor: '#2563eb',
      typeBg: '#eff6ff',
      typeIcon: <UserCheck size={14} color="#2563eb" />,
      sub: 'Former HR Director at Company A • Now HR Director at Company B',
      description: 'Warm relationship opportunity detected.',
      tags: ['Career Move'],
      bestContact: {
        name: 'Company B',
        role: 'Technology • 150-300 employees',
      },
      customAction: 'View Contact',
    },
    {
      id: 'delta',
      title: 'Delta Systems',
      score: 81,
      scoreColor: '#059669',
      scoreBorder: '#10b981',
      typeBadge: 'NEW INTENT',
      typeColor: '#059669',
      typeBg: '#ecfdf5',
      typeIcon: <Radar size={14} color="#059669" />,
      sub: 'Software • 100-250 employees • Abuja, NG',
      description: 'Researching "cybersecurity solutions" in the last 7 days.',
      tags: ['Intent', 'Technology'],
      bestContact: {
        name: 'David Jonah',
        role: 'CTO',
      },
      customAction: 'Investigate',
    },
    {
      id: 'zenith',
      title: 'Zenith Bank PLC',
      score: 76,
      scoreColor: '#7c3aed',
      scoreBorder: '#8b5cf6',
      typeBadge: 'MEETING TODAY',
      typeColor: '#7c3aed',
      typeBg: '#f3e8ff',
      typeIcon: <Calendar size={14} color="#7c3aed" />,
      sub: 'Banking • 1000+ employees • Lagos, NG',
      description: 'Discovery call at 2:00 PM with John Adewale (CIO).',
      tags: ['Meeting'],
      bestContact: {
        name: 'John Adewale',
        role: 'CIO',
      },
      customAction: 'View Meeting',
    },
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '20px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            fontFamily: 'var(--font-primary)'
          }}>
            What needs your attention
          </h2>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid #bfdbfe'
          }}>
            12 new updates
          </span>
        </div>

        <a
          href="#updates"
          onClick={(e) => e.preventDefault()}
          style={{
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#4f46e5',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>View all updates</span>
          <ArrowRight size={13} />
        </a>
      </div>

      {/* Feed Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {attentionItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #f1f5f9',
              backgroundColor: '#fafbfc',
              gap: '16px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fafbfc';
              e.currentTarget.style.borderColor = '#f1f5f9';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Left: Icon Badge Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              flexShrink: 0
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: item.typeBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                {item.typeIcon}
              </div>
              <span style={{
                fontSize: '8.5px',
                fontWeight: 800,
                letterSpacing: '0.3px',
                color: item.typeColor,
                textAlign: 'center',
                lineHeight: 1.1
              }}>
                {item.typeBadge}
              </span>
            </div>

            {/* Middle Left: Company Title + Sub + Score + Description + Tags */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Row 1: Company + Score + Sub */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {item.title}
                </span>

                {item.score !== null && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: item.scoreColor,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `1.5px solid ${item.scoreBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}>
                    {item.score}
                  </span>
                )}
              </div>

              <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '6px' }}>
                {item.sub}
              </div>

              {/* Row 2: Event Description */}
              <p style={{
                fontSize: '12.5px',
                color: '#334155',
                margin: '0 0 8px 0',
                lineHeight: 1.35
              }}>
                {item.description}
              </p>

              {/* Row 3: Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Middle Right: Best Contact Info */}
            <div style={{ width: '130px', flexShrink: 0 }}>
              <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>
                Best contact
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {item.bestContact.name}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {item.bestContact.role}
              </div>
            </div>

            {/* Right: Actions Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {item.hasResearchBtn && (
                <button
                  onClick={() => onOpenResearch(item.title)}
                  style={{
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  Research
                </button>
              )}

              {item.hasContactBtn && (
                <button
                  onClick={() => onOpenContact(item.bestContact.name, item.title)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Contact</span>
                  <Send size={11} color="#6366f1" />
                </button>
              )}

              {item.customAction && (
                <button
                  onClick={() => onOpenResearch(item.title)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.customAction}
                </button>
              )}

              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Show more updates */}
      <div style={{ textAlign: 'center', marginTop: '4px' }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            color: '#6366f1',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>Show more updates</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};
