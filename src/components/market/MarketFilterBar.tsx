import React from 'react';
import { 
  Calendar, 
  Globe, 
  Building2, 
  Users, 
  Zap, 
  X,
  Sparkles,
  Search
} from 'lucide-react';

interface MarketFilterBarProps {
  dateRange: string;
  onChangeDateRange: (val: string) => void;
  geography: string;
  onChangeGeography: (val: string) => void;
  industry: string;
  onChangeIndustry: (val: string) => void;
  companySize: string;
  onChangeCompanySize: (val: string) => void;
  signalType: string;
  onChangeSignalType: (val: string) => void;
  searchQuery: string;
  onChangeSearchQuery: (val: string) => void;
  onOpenCopilot?: () => void;
  onGenerateBrief?: () => void;
  activeFilterCount: number;
  onResetFilters: () => void;
}

export const MarketFilterBar: React.FC<MarketFilterBarProps> = ({
  dateRange,
  onChangeDateRange,
  geography,
  onChangeGeography,
  industry,
  onChangeIndustry,
  companySize,
  onChangeCompanySize,
  signalType,
  onChangeSignalType,
  searchQuery,
  onChangeSearchQuery,
  onOpenCopilot,
  onGenerateBrief,
  activeFilterCount,
  onResetFilters
}) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #eaecf0',
      padding: '14px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)'
    }}>
      {/* Top Row: Search + Quick Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Left: Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '7px 14px',
          width: '380px',
          transition: 'all 0.15s ease'
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search industries, companies, signals, trends..."
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '12.5px',
              color: '#0f172a',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onChangeSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right: AI Copilot & Generate Market Brief */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenCopilot}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f5f3ff',
              border: '1px solid #ddd6fe',
              color: '#6d28d9',
              padding: '7px 14px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ede9fe'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
          >
            <Sparkles size={14} color="#7c3aed" />
            <span>Ask AI Copilot</span>
          </button>

          <button
            onClick={onGenerateBrief}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '7px 16px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Zap size={14} />
            <span>Generate Market Brief</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Filter Dropdowns */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Date Range */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '11.5px',
            color: '#334155'
          }}>
            <Calendar size={13} color="#64748b" />
            <select
              value={dateRange}
              onChange={(e) => onChangeDateRange(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '11.5px',
                color: '#1e293b',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <option value="Today">Today</option>
              <option value="7 days">Last 7 days</option>
              <option value="30 days">Last 30 days</option>
              <option value="90 days">Last 90 days</option>
              <option value="This quarter">This quarter</option>
            </select>
          </div>

          {/* Geography */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '11.5px',
            color: '#334155'
          }}>
            <Globe size={13} color="#64748b" />
            <select
              value={geography}
              onChange={(e) => onChangeGeography(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '11.5px',
                color: '#1e293b',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <option value="All">All Geographies</option>
              <option value="Nigeria">Nigeria (Lagos, Abuja)</option>
              <option value="Ghana">Ghana (Accra)</option>
              <option value="Kenya">Kenya (Nairobi)</option>
              <option value="South Africa">South Africa (Joburg)</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
            </select>
          </div>

          {/* Industry */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '11.5px',
            color: '#334155'
          }}>
            <Building2 size={13} color="#64748b" />
            <select
              value={industry}
              onChange={(e) => onChangeIndustry(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '11.5px',
                color: '#1e293b',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <option value="All">All Industries</option>
              <option value="Financial Services">Financial Services (FinTech)</option>
              <option value="Technology">Technology & SaaS</option>
              <option value="Healthcare">Healthcare & Bio</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail & E-commerce</option>
              <option value="Telecom">Telecom</option>
            </select>
          </div>

          {/* Company Size */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '11.5px',
            color: '#334155'
          }}>
            <Users size={13} color="#64748b" />
            <select
              value={companySize}
              onChange={(e) => onChangeCompanySize(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '11.5px',
                color: '#1e293b',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <option value="All">All Company Sizes</option>
              <option value="1-10">1 – 10 (Seed)</option>
              <option value="11-50">11 – 50 (Early)</option>
              <option value="51-200">51 – 200 (Growth)</option>
              <option value="201-500">201 – 500 (Mid-Market)</option>
              <option value="501-1000">501 – 1,000 (Scale)</option>
              <option value="1000+">1,000+ (Enterprise)</option>
            </select>
          </div>

          {/* Signal Type */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '11.5px',
            color: '#334155'
          }}>
            <Zap size={13} color="#64748b" />
            <select
              value={signalType}
              onChange={(e) => onChangeSignalType(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '11.5px',
                color: '#1e293b',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <option value="All">All Signals</option>
              <option value="Hiring">Hiring (35%)</option>
              <option value="Funding">Funding (16%)</option>
              <option value="Expansion">Expansion (17%)</option>
              <option value="Technology">Technology Change (14%)</option>
              <option value="Leadership">Leadership Change (9%)</option>
              <option value="News">News & PR (6%)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters indicator */}
        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#fee2e2',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              color: '#b91c1c',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <X size={11} />
            <span>Reset {activeFilterCount} filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
