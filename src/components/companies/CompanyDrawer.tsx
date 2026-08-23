import React from 'react';
import type { CompanyItem } from '../../types/company';
import { 
  X, 
  ExternalLink, 
  ArrowRight, 
  Briefcase, 
  Users, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Share2,
  Flame,
  Radio,
  UserCheck,
  Cpu
} from 'lucide-react';

interface CompanyDrawerProps {
  company: CompanyItem | null;
  onClose: () => void;
  onViewProfile: (company: CompanyItem) => void;
  onAddToList: (company: CompanyItem) => void;
  onViewScoreBreakdown: (company: CompanyItem) => void;
}

export const CompanyDrawer: React.FC<CompanyDrawerProps> = ({
  company,
  onClose,
  onViewProfile,
  onAddToList,
  onViewScoreBreakdown
}) => {
  if (!company) return null;

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'hiring':
        return <Users size={14} color="#059669" />;
      case 'expansion':
        return <Radio size={14} color="#2563eb" />;
      case 'leadership':
        return <UserCheck size={14} color="#ea580c" />;
      case 'technology':
        return <Cpu size={14} color="#7c3aed" />;
      default:
        return <Flame size={14} color="#ea580c" />;
    }
  };

  return (
    <div style={{
      width: '380px',
      minWidth: '380px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      boxShadow: '0 2px 12px rgba(16, 24, 40, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
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
            backgroundColor: company.logoBg || '#ef4444',
            color: company.logoColor || '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            fontWeight: 900,
            flexShrink: 0
          }}>
            {company.logoInitial || company.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              {company.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
              <span>{company.industry} • {company.location}</span>
            </div>
            <a
              href={`https://${company.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                color: '#6366f1',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                marginTop: '1px'
              }}
            >
              <span>{company.domain}</span>
              <ExternalLink size={10} />
            </a>
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
        {/* Opportunity Score Box + Sparkline */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '2px' }}>
              Opportunity Score
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#059669', lineHeight: 1 }}>
                {company.opportunityScore}
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                /100
              </span>
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
              {company.opportunityLevel} Opportunity
            </div>
            <button
              onClick={() => onViewScoreBreakdown(company)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6366f1',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <span>View score breakdown</span>
              <ArrowRight size={11} />
            </button>
          </div>

          {/* SVG Sparkline */}
          <div style={{ width: '80px', height: '40px' }}>
            <svg viewBox="0 0 80 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path
                d="M 0 32 Q 20 28, 30 18 T 50 14 T 70 8 T 80 4"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="80" cy="4" r="3" fill="#10b981" />
            </svg>
          </div>
        </div>

        {/* About the Company */}
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            About the Company
          </div>
          <p style={{
            fontSize: '12px',
            color: '#475569',
            lineHeight: 1.45,
            margin: '0 0 12px 0'
          }}>
            {company.description}
          </p>

          {/* Structured Attributes */}
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
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Briefcase size={12} />
                <span>Industry</span>
              </span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{company.industry}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Users size={12} />
                <span>Employees</span>
              </span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{company.employees}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <DollarSign size={12} />
                <span>Revenue</span>
              </span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{company.revenue}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={12} />
                <span>Founded</span>
              </span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{company.founded}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={12} />
                <span>Headquarters</span>
              </span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{company.headquarters}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Share2 size={12} />
                <span>Social</span>
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '3px',
                  backgroundColor: '#0a66c2',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  in
                </span>
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '3px',
                  backgroundColor: '#000',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  𝕏
                </span>
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '3px',
                  backgroundColor: '#1877f2',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  f
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Signals */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>Top Signals</span>
            <button style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: 0
            }}>
              <span>View all signals</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {company.activeSignals.map((sig, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 10px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid #e2e8f0'
                  }}>
                    {getSignalIcon(sig.type)}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      {sig.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {sig.description}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '10.5px', color: '#94a3b8', flexShrink: 0 }}>
                  {sig.time}
                </span>
              </div>
            ))}

            <div style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', cursor: 'pointer', marginTop: '2px' }}>
              +2 more signals
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
          <button
            onClick={() => onViewProfile(company)}
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            View Full Profile
          </button>

          <button
            onClick={() => onAddToList(company)}
            style={{
              flex: 1,
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 12px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
            }}
          >
            Add to List
          </button>
        </div>
      </div>
    </div>
  );
};
