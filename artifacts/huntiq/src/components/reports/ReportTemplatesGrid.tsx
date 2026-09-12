import React from 'react';
import { 
  TrendingUp, 
  Globe, 
  Kanban, 
  Search, 
  Send, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { ReportType } from '../../types/reports';

interface ReportTemplatesGridProps {
  onSelectTemplate: (type: ReportType) => void;
}

export const ReportTemplatesGrid: React.FC<ReportTemplatesGridProps> = ({
  onSelectTemplate
}) => {
  const templates = [
    {
      type: 'sales' as ReportType,
      title: 'Sales Performance',
      description: 'Prospects reached, meetings booked, win rates & revenue velocity.',
      icon: <TrendingUp size={16} color="#4f46e5" />,
      iconBg: '#eff6ff',
      tag: 'Core Performance'
    },
    {
      type: 'market' as ReportType,
      title: 'Market Intelligence',
      description: 'Regional signal surges, industry trends & high-growth hotspots.',
      icon: <Globe size={16} color="#059669" />,
      iconBg: '#ecfdf5',
      tag: 'Macro Trends'
    },
    {
      type: 'pipeline' as ReportType,
      title: 'Pipeline & Forecast',
      description: 'Stage transitions, deal values, probability-weighted revenue & stalled deals.',
      icon: <Kanban size={16} color="#7c3aed" />,
      iconBg: '#f5f3ff',
      tag: 'Revenue Risk'
    },
    {
      type: 'prospecting' as ReportType,
      title: 'Prospecting & ICP Fit',
      description: 'AI Hunter yield, qualified decision makers & signal attribution.',
      icon: <Search size={16} color="#ea580c" />,
      iconBg: '#fff7ed',
      tag: 'Sourcing ROI'
    },
    {
      type: 'campaign' as ReportType,
      title: 'Campaign Analytics',
      description: 'Multi-channel open & reply rates, sequences & opportunity conversion.',
      icon: <Send size={16} color="#2563eb" />,
      iconBg: '#eff6ff',
      tag: 'Outbound ROI'
    },
    {
      type: 'executive_brief' as ReportType,
      title: 'AI Executive Brief',
      description: '1-Click synthesized briefing: key wins, risks, market shifts & action plan.',
      icon: <Sparkles size={16} color="#9333ea" />,
      iconBg: '#fdf4ff',
      tag: '★ Recommended'
    }
  ];

  return (
    <div style={{ margin: '0 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Generate Report from Template
          </h3>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
            Choose a standardized template or generate an AI executive intelligence brief
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '12px'
      }}>
        {templates.map((tpl) => (
          <div
            key={tpl.type}
            onClick={() => onSelectTemplate(tpl.type)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 6px rgba(16, 24, 40, 0.02)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#818cf8';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#eaecf0';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(16, 24, 40, 0.02)';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: tpl.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {tpl.icon}
                </div>

                <span style={{
                  fontSize: '9.5px',
                  fontWeight: 800,
                  color: tpl.type === 'executive_brief' ? '#9333ea' : '#64748b',
                  backgroundColor: tpl.type === 'executive_brief' ? '#fdf4ff' : '#f8fafc',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {tpl.tag}
                </span>
              </div>

              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                {tpl.title}
              </div>

              <div style={{ fontSize: '10.5px', color: '#64748b', lineHeight: 1.35 }}>
                {tpl.description}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#4f46e5',
              marginTop: '12px'
            }}>
              <span>Use Template</span>
              <ArrowRight size={11} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
