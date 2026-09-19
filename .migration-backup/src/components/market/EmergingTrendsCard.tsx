import React from 'react';
import { 
  TrendingUp, 
  Cpu, 
  ShieldCheck, 
  Users, 
  Leaf, 
  CreditCard,
  Sparkles
} from 'lucide-react';
import type { EmergingTrendItem } from '../../types/market';

interface EmergingTrendsCardProps {
  onSelectTrend?: (trend: EmergingTrendItem) => void;
}

export const EmergingTrendsCard: React.FC<EmergingTrendsCardProps> = ({ onSelectTrend }) => {
  const trends: EmergingTrendItem[] = [
    {
      id: 'ai-automation',
      title: 'AI & Workflow Automation',
      growth: '+42%',
      growthPct: 42,
      description: 'Surge in enterprise adoption of LLM agents, automated customer support, and internal knowledge graphs.',
      category: 'Enterprise Tech',
      signalCount: 412,
      velocity: 'Fast Rising',
      iconType: 'ai',
      iconBg: '#f5f3ff',
      iconColor: '#7c3aed'
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity & Compliance',
      growth: '+36%',
      growthPct: 36,
      description: 'NDPR/GDPR enforcement driving rapid adoption of automated audit, DLP, and threat monitoring tooling.',
      category: 'Security',
      signalCount: 328,
      velocity: 'Fast Rising',
      iconType: 'security',
      iconBg: '#eff6ff',
      iconColor: '#2563eb'
    },
    {
      id: 'cross-border',
      title: 'Cross-Border B2B Settlement',
      growth: '+31%',
      growthPct: 31,
      description: 'Pan-African trade expansion triggering demand for multi-currency FX accounts and payment rails.',
      category: 'FinTech',
      signalCount: 295,
      velocity: 'High Growth',
      iconType: 'fintech',
      iconBg: '#ecfdf5',
      iconColor: '#059669'
    },
    {
      id: 'remote-work',
      title: 'Distributed Workforce Infrastructure',
      growth: '+21%',
      growthPct: 21,
      description: 'Global payroll, employer of record, and remote contractor compliance systems scaling 2.1x.',
      category: 'HR & Ops',
      signalCount: 184,
      velocity: 'Emerging',
      iconType: 'remote',
      iconBg: '#fffbeb',
      iconColor: '#d97706'
    },
    {
      id: 'sustainability',
      title: 'Clean Tech & ESG Mandates',
      growth: '+18%',
      growthPct: 18,
      description: 'Commercial real estate and industrial firms installing IoT energy meters and solar backup microgrids.',
      category: 'Sustainability',
      signalCount: 120,
      velocity: 'Emerging',
      iconType: 'sustainability',
      iconBg: '#fff1f2',
      iconColor: '#e11d48'
    }
  ];

  const getIcon = (type: EmergingTrendItem['iconType'], color: string) => {
    switch (type) {
      case 'ai':
        return <Cpu size={15} color={color} />;
      case 'security':
        return <ShieldCheck size={15} color={color} />;
      case 'fintech':
        return <CreditCard size={15} color={color} />;
      case 'remote':
        return <Users size={15} color={color} />;
      case 'sustainability':
        return <Leaf size={15} color={color} />;
      default:
        return <TrendingUp size={15} color={color} />;
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '18px 20px',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
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
            <TrendingUp size={14} color="#6366f1" />
          </div>
          <div>
            <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Emerging Market Trends
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Detected macro shifts across hiring, funding, and tech stack adoption
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#f5f3ff',
          border: '1px solid #ede9fe',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#6d28d9'
        }}>
          <Sparkles size={12} color="#7c3aed" />
          <span>AI Trend Engine Active</span>
        </div>
      </div>

      {/* Grid of 5 Trends */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px'
      }}>
        {trends.map((trend) => (
          <div
            key={trend.id}
            onClick={() => onSelectTrend && onSelectTrend(trend)}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '12px',
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#c7d2fe';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#f1f5f9';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              {/* Top row: Icon + Growth Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: trend.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getIcon(trend.iconType, trend.iconColor)}
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#059669',
                  backgroundColor: '#ecfdf5',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}>
                  {trend.growth}
                </span>
              </div>

              {/* Title */}
              <div style={{
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.3,
                marginBottom: '6px'
              }}>
                {trend.title}
              </div>

              {/* Description */}
              <p style={{
                fontSize: '10.5px',
                color: '#64748b',
                lineHeight: 1.4,
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {trend.description}
              </p>
            </div>

            {/* Bottom: Velocity + Signals count */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '10px'
            }}>
              <span style={{ color: '#4f46e5', fontWeight: 700 }}>
                {trend.velocity}
              </span>
              <span style={{ color: '#94a3b8' }}>
                {trend.signalCount} signals
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
