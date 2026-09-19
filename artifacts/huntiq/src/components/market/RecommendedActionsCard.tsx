import React from 'react';
import { Target, FileText, ArrowRight } from 'lucide-react';
import type { RecommendedActionItem } from '../../types/market';

interface RecommendedActionsCardProps {
  onNavigate: (nav: string) => void;
  onOpenResearch: (company: string) => void;
  onGenerateBrief: () => void;
}

export const RecommendedActionsCard: React.FC<RecommendedActionsCardProps> = ({
  onNavigate,
  onOpenResearch,
  onGenerateBrief
}) => {
  const actions: RecommendedActionItem[] = [
    {
      id: 'act-1',
      title: 'Explore 184 companies with hiring surges',
      subtitle: 'Target HR tech and recruitment ops buyers while headcount budgets are active.',
      badge: 'High Intent',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      actionText: 'View companies',
      targetNav: 'companies'
    },
    {
      id: 'act-2',
      title: 'Review 67 expansion opportunities',
      subtitle: 'Companies opening new physical branches in West and East Africa.',
      badge: 'Immediate Fit',
      badgeBg: '#ecfdf5',
      badgeColor: '#047857',
      actionText: 'View opportunities',
      targetNav: 'opportunities'
    },
    {
      id: 'act-3',
      title: 'Research 24 multi-signal accounts',
      subtitle: 'Companies simultaneously hiring, expanding, and announcing new leadership.',
      badge: 'Hot Accounts',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
      actionText: 'Start research',
      targetNav: 'research'
    },
    {
      id: 'act-4',
      title: 'Build target prospect list in FinTech',
      subtitle: 'Filter 421 decision-makers at fast-growing African payment scaleups.',
      badge: 'Outreach Ready',
      badgeBg: '#f5f3ff',
      badgeColor: '#6d28d9',
      actionText: 'Create list',
      targetNav: 'find-prospects'
    }
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '18px 20px',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            backgroundColor: '#ede9fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Target size={14} color="#6366f1" />
          </div>
          <div>
            <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Recommended Sales Actions
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Turn intelligence into immediate pipeline opportunities
            </span>
          </div>
        </div>

        <div style={{
          fontSize: '11px',
          color: '#4f46e5',
          fontWeight: 700,
          backgroundColor: '#eef2ff',
          padding: '3px 8px',
          borderRadius: '6px'
        }}>
          4 Next Steps
        </div>
      </div>

      {/* Action Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {actions.map((act) => (
          <div
            key={act.id}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 24, 40, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#f1f5f9';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  backgroundColor: act.badgeBg,
                  color: act.badgeColor,
                  padding: '1px 5px',
                  borderRadius: '4px'
                }}>
                  {act.badge}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  {act.title}
                </span>
              </div>
              <p style={{ fontSize: '10.5px', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                {act.subtitle}
              </p>
            </div>

            {/* Action CTA Button */}
            <button
              onClick={() => {
                if (act.targetNav === 'research') {
                  onOpenResearch('Flutterwave');
                } else {
                  onNavigate(act.targetNav);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4f46e5';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#334155';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <span>{act.actionText}</span>
              <ArrowRight size={11} />
            </button>
          </div>
        ))}

        {/* Generate Full Brief Banner */}
        <div style={{
          marginTop: '4px',
          padding: '10px 12px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
          border: '1px dashed #818cf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="#6366f1" />
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#4338ca' }}>
                Need an executive synthesis?
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                Generate an AI market brief ready for strategy meetings.
              </div>
            </div>
          </div>

          <button
            onClick={onGenerateBrief}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            Generate Brief
          </button>
        </div>
      </div>
    </div>
  );
};
