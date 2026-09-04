import React, { useState } from 'react';
import type { OpportunityItem, OpportunityPriority, OpportunityStage } from '../../types/opportunity';
import { 
  TrendingUp, 
  Flame, 
  Star, 
  MoreVertical, 
  Download, 
  List, 
  LayoutGrid, 
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface OpportunityTableProps {
  opportunities: OpportunityItem[];
  selectedOpportunityId: string | null;
  onSelectOpportunity: (opp: OpportunityItem) => void;
  onOpenNewModal: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onStageChange?: (id: string, stage: OpportunityStage) => void;
}

export const OpportunityTable: React.FC<OpportunityTableProps> = ({
  opportunities,
  selectedOpportunityId,
  onSelectOpportunity,
  onOpenNewModal,
  activeTab,
  onSelectTab
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['opp-1']);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const tabs = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'hot', label: 'Hot' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
    { id: 'won', label: 'Won' },
    { id: 'lost', label: 'Lost' },
  ];

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === opportunities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(opportunities.map((o) => o.id));
    }
  };

  const getPriorityBadge = (priority: OpportunityPriority) => {
    if (priority === 'Hot') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          backgroundColor: '#fff1f2',
          color: '#e11d48',
          border: '1px solid #fecdd3',
          padding: '3px 8px',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Flame size={12} fill="#e11d48" />
          Hot
        </span>
      );
    }
    if (priority === 'High') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          backgroundColor: '#fffbeb',
          color: '#d97706',
          border: '1px solid #fde68a',
          padding: '3px 8px',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Star size={12} fill="#d97706" />
          High
        </span>
      );
    }
    if (priority === 'Medium') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          backgroundColor: '#fffbeb',
          color: '#b45309',
          border: '1px solid #fef3c7',
          padding: '3px 8px',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Star size={12} />
          Medium
        </span>
      );
    }
    return (
      <span style={{
        fontSize: '11px',
        fontWeight: 700,
        backgroundColor: '#f1f5f9',
        color: '#475569',
        padding: '3px 8px',
        borderRadius: '12px'
      }}>
        {priority}
      </span>
    );
  };

  const getStageBadge = (stage: OpportunityStage) => {
    if (stage === 'Discovery') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#f5f3ff',
          color: '#7c3aed',
          border: '1px solid #ddd6fe',
          padding: '4px 10px',
          borderRadius: '8px'
        }}>
          Discovery
        </span>
      );
    }
    if (stage === 'Qualification') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          border: '1px solid #bfdbfe',
          padding: '4px 10px',
          borderRadius: '8px'
        }}>
          Qualification
        </span>
      );
    }
    if (stage === 'Proposal') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#fff7ed',
          color: '#ea580c',
          border: '1px solid #fed7aa',
          padding: '4px 10px',
          borderRadius: '8px'
        }}>
          Proposal
        </span>
      );
    }
    if (stage === 'Negotiation') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#eef2ff',
          color: '#4f46e5',
          border: '1px solid #c7d2fe',
          padding: '4px 10px',
          borderRadius: '8px'
        }}>
          Negotiation
        </span>
      );
    }
    if (stage === 'Nurturing') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#ecfdf5',
          color: '#059669',
          border: '1px solid #a7f3d0',
          padding: '4px 10px',
          borderRadius: '8px'
        }}>
          Nurturing
        </span>
      );
    }
    return (
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: '#f8fafc',
        color: '#475569',
        border: '1px solid #e2e8f0',
        padding: '4px 10px',
        borderRadius: '8px'
      }}>
        {stage}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#059669';
    if (score >= 75) return '#10b981';
    if (score >= 60) return '#d97706';
    return '#dc2626';
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
      {/* Top Tabs + Actions Row */}
      <div style={{
        padding: '14px 20px 0',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Tab List */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                style={{
                  padding: '8px 14px 14px',
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

        {/* Right Tools & + New Opportunity CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px' }}>
          {/* List/Grid View Toggle */}
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

          {/* Export Button */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Download size={13} />
            <span>Export</span>
          </button>

          {/* + New Opportunity Primary Button */}
          <button
            onClick={onOpenNewModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Plus size={14} />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Table Content with Horizontal Scroll for Mobile */}
      <div className="mobile-table-wrapper">

        <div style={{ minWidth: '780px' }}>
          {/* Table Column Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 2.2fr 1.1fr 1fr 2.8fr 1fr 1.1fr 1fr 30px',
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
            checked={selectedIds.length === opportunities.length && opportunities.length > 0}
            onChange={handleSelectAll}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div>Company</div>
        <div>Opportunity Score</div>
        <div>Priority</div>
        <div>Why It's an Opportunity</div>
        <div>Value</div>
        <div>Stage</div>
        <div>Last Activity</div>
        <div></div>
      </div>

      {/* Table Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {opportunities.map((opp) => {
          const isSelected = selectedOpportunityId === opp.id;
          const isChecked = selectedIds.includes(opp.id);

          return (
            <div
              key={opp.id}
              onClick={() => onSelectOpportunity(opp)}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 2.2fr 1.1fr 1fr 2.8fr 1fr 1.1fr 1fr 30px',
                padding: '14px 18px',
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
                  onChange={(e) => handleToggleSelect(opp.id, e as any)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* Company Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: opp.avatarBg,
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {opp.avatarLetter}
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                    {opp.companyName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                    {opp.industry} • {opp.employees}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                    {opp.location}
                  </div>
                </div>
              </div>

              {/* Opportunity Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: `2px solid ${getScoreColor(opp.score)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#0f172a'
                }}>
                  {opp.score}
                </div>
                <TrendingUp size={14} color="#059669" />
              </div>

              {/* Priority */}
              <div>
                {getPriorityBadge(opp.priority)}
              </div>

              {/* Why It's an Opportunity */}
              <div style={{ paddingRight: '12px' }}>
                <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500, lineHeight: 1.35 }}>
                  {opp.whyNow}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '5px' }}>
                  {opp.tags.map((tag, idx) => (
                    <span
                      key={`${opp.id}-tag-${tag}-${idx}`}
                      style={{
                        fontSize: '10.5px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Value */}
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                ${opp.estimatedValue.toLocaleString()}
              </div>

              {/* Stage */}
              <div>
                {getStageBadge(opp.stage)}
              </div>

              {/* Last Activity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#64748b' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>{opp.lastActivity}</span>
              </div>

              {/* Actions Menu */}
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
        </div>
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
        <span>Showing 1 to 6 of 284 opportunities</span>

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
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            24
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
