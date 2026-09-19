import React from 'react';
import { Building2, TrendingUp, ChevronRight } from 'lucide-react';
import type { IndustrySignalItem } from '../../types/market';

interface TopIndustriesCardProps {
  onSelectIndustry: (industry: IndustrySignalItem) => void;
}

export const TopIndustriesCard: React.FC<TopIndustriesCardProps> = ({ onSelectIndustry }) => {
  const industries: IndustrySignalItem[] = [
    {
      id: 'fintech',
      name: 'Financial Services',
      signalsCount: 1842,
      signalsFormatted: '1,842',
      trend: '+32%',
      trendPositive: true,
      opportunityIndex: 89,
      opportunityDensity: 0.48,
      companiesAffected: 421,
      hiringGrowth: '+38%',
      expansionGrowth: '+21%',
      fundingGrowth: '+14%',
      whyItMatters: 'Financial services companies in your target market are showing heavy hiring and expansion activity, suggesting high demand for operational tooling.',
      sparkline: [45, 52, 60, 68, 75, 89],
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      topCompanies: ['Flutterwave', 'Paystack', 'Moniepoint', 'OPay']
    },
    {
      id: 'tech',
      name: 'Technology & SaaS',
      signalsCount: 1102,
      signalsFormatted: '1,102',
      trend: '+28%',
      trendPositive: true,
      opportunityIndex: 94,
      opportunityDensity: 0.54,
      companiesAffected: 285,
      hiringGrowth: '+42%',
      expansionGrowth: '+26%',
      fundingGrowth: '+31%',
      whyItMatters: 'SaaS and tech scaleups are rapidly upgrading cloud infrastructure and scaling sales teams across the region.',
      sparkline: [50, 58, 65, 78, 88, 94],
      iconBg: '#f5f3ff',
      iconColor: '#7c3aed',
      topCompanies: ['Acme Tech', 'Helium Health', 'Terragon', 'SeamlessHR']
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Biotech',
      signalsCount: 1256,
      signalsFormatted: '1,256',
      trend: '+24%',
      trendPositive: true,
      opportunityIndex: 82,
      opportunityDensity: 0.39,
      companiesAffected: 310,
      hiringGrowth: '+27%',
      expansionGrowth: '+33%',
      fundingGrowth: '+19%',
      whyItMatters: 'Healthtech expansion into Abuja and Nairobi is driving procurement for clinical management and logistics solutions.',
      sparkline: [40, 48, 55, 62, 70, 82],
      iconBg: '#ecfdf5',
      iconColor: '#059669',
      topCompanies: ['54gene', 'LifeBank', 'Remedial Health', 'mPharma']
    },
    {
      id: 'retail',
      name: 'Retail & E-Commerce',
      signalsCount: 876,
      signalsFormatted: '876',
      trend: '+19%',
      trendPositive: true,
      opportunityIndex: 76,
      opportunityDensity: 0.32,
      companiesAffected: 194,
      hiringGrowth: '+15%',
      expansionGrowth: '+22%',
      fundingGrowth: '+12%',
      whyItMatters: 'Omnichannel retailers are establishing multi-hub fulfillment centers in West Africa.',
      sparkline: [35, 42, 50, 58, 64, 76],
      iconBg: '#fffbeb',
      iconColor: '#d97706',
      topCompanies: ['Jumia', 'Omnibiz', 'TradeDepot', 'Wasoko']
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing & Industrial',
      signalsCount: 645,
      signalsFormatted: '645',
      trend: '+15%',
      trendPositive: true,
      opportunityIndex: 71,
      opportunityDensity: 0.28,
      companiesAffected: 142,
      hiringGrowth: '+12%',
      expansionGrowth: '+18%',
      fundingGrowth: '+8%',
      whyItMatters: 'Industrial supply chain optimization and factory automation drive leadership changes in plant operations.',
      sparkline: [30, 36, 44, 52, 60, 71],
      iconBg: '#fff1f2',
      iconColor: '#e11d48',
      topCompanies: ['Dangote Group', 'BUA Cement', 'Innoson', 'Flour Mills']
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
      flex: 1.2,
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
            <Building2 size={14} color="#6366f1" />
          </div>
          <div>
            <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Top Industries by Signal Volume
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Ranked by Opportunity Index & Signal Density
            </span>
          </div>
        </div>

        <div style={{
          fontSize: '11px',
          color: '#6366f1',
          fontWeight: 600,
          backgroundColor: '#f5f3ff',
          padding: '3px 8px',
          borderRadius: '6px'
        }}>
          5 Hot Sectors
        </div>
      </div>

      {/* Industries Table / List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {industries.map((ind, idx) => (
          <div
            key={ind.id}
            onClick={() => onSelectIndustry(ind)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: idx === 0 ? 'rgba(99, 102, 241, 0.04)' : '#f8fafc',
              border: idx === 0 ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = idx === 0 ? 'rgba(99, 102, 241, 0.04)' : '#f8fafc';
              e.currentTarget.style.borderColor = idx === 0 ? '1px solid rgba(99, 102, 241, 0.2)' : '#f1f5f9';
            }}
          >
            {/* Left: Rank + Name + Density */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                backgroundColor: idx === 0 ? '#6366f1' : '#e2e8f0',
                color: idx === 0 ? '#ffffff' : '#475569',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {idx + 1}
              </div>

              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                  {ind.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: '#64748b' }}>
                  <span>{ind.companiesAffected} companies</span>
                  <span>•</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>
                    {(ind.opportunityDensity * 100).toFixed(0)}% high intent
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Signals + Growth + Opp Index */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                  {ind.signalsFormatted}
                </div>
                <div style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '2px'
                }}>
                  <TrendingUp size={10} />
                  <span>{ind.trend}</span>
                </div>
              </div>

              {/* Opportunity Index Badge */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: ind.opportunityIndex >= 90 ? '#ecfdf5' : '#eff6ff',
                border: ind.opportunityIndex >= 90 ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '3px 8px',
                minWidth: '46px'
              }}>
                <span style={{ fontSize: '9px', color: ind.opportunityIndex >= 90 ? '#047857' : '#1d4ed8', fontWeight: 600 }}>
                  INDEX
                </span>
                <span style={{ fontSize: '12px', fontWeight: 900, color: ind.opportunityIndex >= 90 ? '#059669' : '#2563eb' }}>
                  {ind.opportunityIndex}
                </span>
              </div>

              <ChevronRight size={14} color="#94a3b8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
