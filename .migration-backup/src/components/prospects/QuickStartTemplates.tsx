import React from 'react';
import type { QuickTemplate } from '../../types/prospectHunter';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  UserCheck, 
  Cpu, 
  ArrowRight
} from 'lucide-react';

interface QuickStartTemplatesProps {
  onSelectTemplate: (template: QuickTemplate) => void;
}

export const QuickStartTemplates: React.FC<QuickStartTemplatesProps> = ({ onSelectTemplate }) => {
  const templates: QuickTemplate[] = [
    {
      id: 'high-growth',
      title: 'High Growth Companies',
      description: 'Fast-growing companies with strong expansion signals.',
      iconType: 'growth',
      iconColor: '#059669',
      iconBg: '#ecfdf5',
      preset: {
        naturalQuery: 'Find fast-growing companies with strong expansion signals in Lagos & Abuja.',
        signals: ['Expansion', 'Hiring Activity', 'Funding Raised'],
        companySize: '50 - 500 employees',
        revenue: '$10M - $50M'
      }
    },
    {
      id: 'actively-hiring',
      title: 'Actively Hiring',
      description: 'Companies with large hiring activity across multiple departments.',
      iconType: 'hiring',
      iconColor: '#ea580c',
      iconBg: '#fff7ed',
      preset: {
        naturalQuery: 'Find companies with large hiring surges across engineering, sales, and operations.',
        signals: ['Hiring Activity', 'Leadership Change'],
        companySize: '50 - 500 employees'
      }
    },
    {
      id: 'recently-funded',
      title: 'Recently Funded',
      description: 'Companies that have raised funding in the last 6 months.',
      iconType: 'funding',
      iconColor: '#7c3aed',
      iconBg: '#f5f3ff',
      preset: {
        naturalQuery: 'Find startups and scaleups that closed Seed, Series A, or Series B funding rounds.',
        signals: ['Funding Raised', 'Expansion', 'Hiring Activity'],
        revenue: '$5M - $25M'
      }
    },
    {
      id: 'leadership-changes',
      title: 'Leadership Changes',
      description: 'Companies with new executives or leadership changes.',
      iconType: 'leadership',
      iconColor: '#2563eb',
      iconBg: '#eff6ff',
      preset: {
        naturalQuery: 'Find organizations with recent C-Suite executive appointments and leadership transitions.',
        signals: ['Leadership Change', 'New Office'],
        businessType: 'B2B'
      }
    },
    {
      id: 'tech-adopters',
      title: 'Technology Adopters',
      description: 'Companies adopting new technologies and digital solutions.',
      iconType: 'tech',
      iconColor: '#db2777',
      iconBg: '#fdf2f8',
      preset: {
        naturalQuery: 'Find enterprise businesses modernizing their technology stack and cloud systems.',
        signals: ['Technology Change', 'News Mentions'],
        industries: ['Technology', 'Financial Services']
      }
    },
  ];

  const getTemplateIcon = (type: string, color: string) => {
    switch (type) {
      case 'growth':
        return <TrendingUp size={16} color={color} />;
      case 'hiring':
        return <Users size={16} color={color} />;
      case 'funding':
        return <DollarSign size={16} color={color} />;
      case 'leadership':
        return <UserCheck size={16} color={color} />;
      case 'tech':
        return <Cpu size={16} color={color} />;
      default:
        return <TrendingUp size={16} color={color} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
            Quick Start Templates
          </h3>
          <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0 }}>
            Use a template to get started quickly.
          </p>
        </div>

        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          <span>View all templates</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 5 Cards Row Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
        position: 'relative'
      }}>
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => onSelectTemplate(tpl)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '16px 14px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px',
              minHeight: '120px',
              transition: 'all 0.16s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#c7d2fe';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#eaecf0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(16, 24, 40, 0.03)';
            }}
          >
            <div>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: tpl.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                {getTemplateIcon(tpl.iconType, tpl.iconColor)}
              </div>

              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '4px' }}>
                {tpl.title}
              </div>

              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
                {tpl.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
