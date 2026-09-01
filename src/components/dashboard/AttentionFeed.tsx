import React from 'react';
import { 
  Flame, 
  Zap, 
  Send, 
  MoreVertical, 
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

interface AttentionFeedProps {
  onOpenResearch: (company: string) => void;
  onOpenContact: (person: string, company: string) => void;
}

export const AttentionFeed: React.FC<AttentionFeedProps> = ({ onOpenResearch, onOpenContact }) => {
  const { signals, companies } = useHuntiq();

  const attentionItems = React.useMemo(() => {
    const liveItems: any[] = [];

    // Map top signals
    signals.slice(0, 4).forEach((sig, idx) => {
      const comp = companies.find(c => c.name.toLowerCase() === sig.companyName?.toLowerCase()) || {
        name: sig.companyName || 'Target Account',
        industry: 'Technology & FinTech',
        employees: '100-500',
        location: sig.location || 'Lagos, Nigeria'
      };

      const isHigh = sig.impactLevel === 'Very High' || sig.impactLevel === 'High' || (sig.impactScore || 0) >= 85;

      liveItems.push({
        id: `sig-${sig.id || idx}`,
        title: comp.name,
        score: sig.impactScore || 90,
        scoreColor: isHigh ? '#e11d48' : '#0284c7',
        scoreBorder: isHigh ? '#f43f5e' : '#38bdf8',
        typeBadge: (sig.type || 'Signal').replace(/_/g, ' ').toUpperCase(),
        typeColor: isHigh ? '#e11d48' : '#2563eb',
        typeBg: isHigh ? '#ffe4e6' : '#eff6ff',
        typeIcon: isHigh ? <Flame size={14} color="#e11d48" /> : <Zap size={14} color="#2563eb" />,
        sub: `${comp.industry} • ${comp.employees} employees • ${comp.location}`,
        description: sig.whyItMatters || sig.subtitle || sig.title,
        tags: [(sig.type || 'Signal').replace(/_/g, ' '), 'Verified Signal'],
        bestContact: {
          name: sig.targetRole ? 'Decision Maker' : 'Head of People',
          role: sig.targetRole || 'Talent & Growth Strategy'
        },
        hasResearchBtn: true,
        hasContactBtn: true
      });
    });

    if (liveItems.length > 0) {
      return liveItems;
    }

    return [
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
      }
    ];
  }, [signals, companies]);

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
                {item.tags.map((tag: string, idx: number) => (
                  <span
                    key={`${item.id}-tag-${tag}-${idx}`}
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
