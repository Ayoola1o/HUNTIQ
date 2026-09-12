import React, { useState } from 'react';
import type { CompanyItem } from '../../types/company';
import { 
  Star, 
  ChevronDown, 
  List, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  Flame,
  Building2,
  UserCheck
} from 'lucide-react';

interface CompanyTableProps {
  companies: CompanyItem[];
  selectedCompanyId: string | null;
  onSelectCompany: (company: CompanyItem) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onToggleSave?: (companyId: string) => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  activeTab,
  onSelectTab,
  onToggleSave
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['comp-1']);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const tabs = [
    { id: 'all', label: 'All Companies' },
    { id: 'high-opportunity', label: 'High Opportunity' },
    { id: 'recently-added', label: 'Recently Added' },
    { id: 'saved', label: 'Saved Companies' },
    { id: 'my-lists', label: 'My Lists' },
  ];

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === companies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(companies.map((c) => c.id));
    }
  };

  const getScoreCircle = (score: number, level: string) => {
    const isVeryHigh = score >= 90;
    const isHigh = score >= 75 && score < 90;
    const isMedium = score >= 50 && score < 75;

    const borderColor = isVeryHigh ? '#10b981' : isHigh ? '#10b981' : isMedium ? '#f59e0b' : '#94a3b8';
    const textColor = isVeryHigh ? '#059669' : isHigh ? '#059669' : isMedium ? '#d97706' : '#64748b';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: `2px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 800,
          color: textColor,
          flexShrink: 0
        }}>
          {score}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: textColor }}>
            {level}
          </span>
          <span style={{ fontSize: '10px', color: textColor }}>↗</span>
        </div>
      </div>
    );
  };

  const getIndustryBadge = (industry: string) => {
    return (
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: '#f1f5f9',
        color: '#475569',
        padding: '3px 8px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        whiteSpace: 'nowrap'
      }}>
        {industry}
      </span>
    );
  };

  const getSignalIcons = (company: CompanyItem) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCheck size={11} color="#2563eb" />
        </div>
        <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={11} color="#ea580c" />
        </div>
        <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={11} color="#059669" />
        </div>
        {company.signalsCount > 3 ? (
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginLeft: '2px' }}>
            +{company.signalsCount - 3}
          </span>
        ) : (
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginLeft: '2px' }}>
            0
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Tabs + View/Sort Controls */}
      <div style={{
        padding: '14px 20px 0',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                style={{
                  padding: '8px 12px 14px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#4f46e5' : '#64748b',
                  borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Tools: View Mode + Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                border: viewMode === 'list' ? '1px solid #cbd5e1' : 'none',
                borderRadius: '6px',
                padding: '4px 7px',
                cursor: 'pointer',
                color: viewMode === 'list' ? '#0f172a' : '#64748b',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                border: viewMode === 'grid' ? '1px solid #cbd5e1' : 'none',
                borderRadius: '6px',
                padding: '4px 7px',
                cursor: 'pointer',
                color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#334155',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '5px 10px',
            cursor: 'pointer'
          }}>
            <span>Sort by: Opportunity Score</span>
            <ChevronDown size={12} />
          </div>
        </div>
      </div>

      {/* Table Column Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 2.2fr 1.4fr 1fr 1fr 1.3fr 1.4fr 1.2fr 1fr 30px',
        padding: '10px 18px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #eaecf0',
        fontSize: '11.5px',
        fontWeight: 700,
        color: '#64748b',
        alignItems: 'center'
      }}>
        <div>
          <input
            type="checkbox"
            checked={selectedIds.length === companies.length && companies.length > 0}
            onChange={handleSelectAll}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div>Company</div>
        <div>Industry</div>
        <div>Employees</div>
        <div>Revenue</div>
        <div>Location</div>
        <div>Opportunity Score</div>
        <div>Signals</div>
        <div>Last Activity</div>
        <div></div>
      </div>

      {/* Table Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {companies.map((comp) => {
          const isSelected = selectedCompanyId === comp.id;
          const isChecked = selectedIds.includes(comp.id);

          return (
            <div
              key={comp.id}
              onClick={() => onSelectCompany(comp)}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 2.2fr 1.4fr 1fr 1fr 1.3fr 1.4fr 1.2fr 1fr 30px',
                padding: '13px 18px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: isSelected ? '#f5f3ff' : isChecked ? '#f8fafc' : '#ffffff',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.12s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = isChecked ? '#f8fafc' : '#ffffff';
              }}
            >
              {/* Checkbox */}
              <div onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleToggleSelect(comp.id, e as any)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* Company Logo + Name + Star */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: comp.logoBg || '#ef4444',
                  color: comp.logoColor || '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  {comp.logoInitial || comp.name.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {comp.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave && onToggleSave(comp.id);
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      <Star
                        size={12}
                        fill={comp.isSaved ? '#f59e0b' : 'none'}
                        color={comp.isSaved ? '#f59e0b' : '#cbd5e1'}
                      />
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {comp.domain}
                  </div>
                </div>
              </div>

              {/* Industry */}
              <div>
                {getIndustryBadge(comp.industry)}
              </div>

              {/* Employees */}
              <div style={{ fontSize: '12px', color: '#334155' }}>
                {comp.employees}
              </div>

              {/* Revenue */}
              <div style={{ fontSize: '12px', color: '#334155' }}>
                {comp.revenue}
              </div>

              {/* Location */}
              <div style={{ fontSize: '12px', color: '#334155' }}>
                {comp.location}
              </div>

              {/* Opportunity Score */}
              <div>
                {getScoreCircle(comp.opportunityScore, comp.opportunityLevel)}
              </div>

              {/* Signals */}
              <div>
                {getSignalIcons(comp)}
              </div>

              {/* Last Activity */}
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {comp.lastActivity}
              </div>

              {/* Menu */}
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <MoreVertical size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <span>Showing 1 to 8 of 2,842 companies</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <ChevronLeft size={14} />
          </button>

          {[1, 2, 3].map((page) => (
            <button
              key={page}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: page === 1 ? '1px solid #6366f1' : '1px solid #e2e8f0',
                backgroundColor: page === 1 ? '#ede9fe' : '#ffffff',
                color: page === 1 ? '#6d28d9' : '#475569',
                fontSize: '12px',
                fontWeight: page === 1 ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {page}
            </button>
          ))}

          <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>

          <button
            style={{
              width: '36px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            356
          </button>

          <button
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
