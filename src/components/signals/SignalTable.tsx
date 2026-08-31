import React, { useState } from 'react';
import type { SignalItem, SignalType, SignalImpactLevel } from '../../types/signal';
import { 
  Users, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Cpu, 
  FileText, 
  ShieldAlert, 
  Globe, 
  MoreVertical, 
  Download, 
  List, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface SignalTableProps {
  signals: SignalItem[];
  selectedSignalId: string | null;
  onSelectSignal: (signal: SignalItem) => void;
  activeTypeFilter: string;
  onSelectTypeFilter: (type: string) => void;
}

export const SignalTable: React.FC<SignalTableProps> = ({
  signals,
  selectedSignalId,
  onSelectSignal,
  activeTypeFilter,
  onSelectTypeFilter
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['sig-1']);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filterTabs = [
    { id: 'all', label: 'All Signals' },
    { id: 'hiring', label: 'Hiring' },
    { id: 'funding', label: 'Funding' },
    { id: 'expansion', label: 'Expansion' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'technology', label: 'Technology' },
    { id: 'news', label: 'News' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'other', label: 'Other' },
  ];

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === signals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(signals.map((s) => s.id));
    }
  };

  const getSignalIcon = (type: SignalType) => {
    switch (type) {
      case 'hiring':
        return <Users size={15} color="#059669" />;
      case 'expansion':
        return <MapPin size={15} color="#2563eb" />;
      case 'leadership':
        return <Briefcase size={15} color="#ea580c" />;
      case 'funding':
        return <DollarSign size={15} color="#16a34a" />;
      case 'technology':
        return <Cpu size={15} color="#7c3aed" />;
      case 'news':
        return <FileText size={15} color="#9333ea" />;
      case 'compliance':
        return <ShieldAlert size={15} color="#e11d48" />;
      default:
        return <Globe size={15} color="#64748b" />;
    }
  };

  const getTypeBadge = (type: SignalType) => {
    switch (type) {
      case 'hiring':
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            Hiring
          </span>
        );
      case 'expansion':
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            Expansion
          </span>
        );
      case 'leadership':
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#fff7ed',
            color: '#ea580c',
            border: '1px solid #fed7aa',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            Leadership
          </span>
        );
      case 'funding':
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            Funding
          </span>
        );
      case 'technology':
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#f5f3ff',
            color: '#7c3aed',
            border: '1px solid #ddd6fe',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            Technology
          </span>
        );
      case 'news':
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#faf5ff',
            color: '#9333ea',
            border: '1px solid #f3e8ff',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            News
          </span>
        );
      case 'compliance':
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#fff1f2',
            color: '#e11d48',
            border: '1px solid #fecdd3',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            Compliance
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: '#f1f5f9',
            color: '#475569',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            {type}
          </span>
        );
    }
  };

  const getImpactBars = (level: SignalImpactLevel) => {
    const isHigh = level === 'High' || level === 'Very High';
    const isMed = level === 'Medium';
    const barColor = isHigh ? '#e11d48' : isMed ? '#d97706' : '#94a3b8';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: barColor }}>
          {level}
        </span>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '10px' }}>
          <div style={{ width: '3px', height: '4px', backgroundColor: barColor, borderRadius: '1px' }} />
          <div style={{ width: '3px', height: '6px', backgroundColor: barColor, borderRadius: '1px' }} />
          <div style={{ width: '3px', height: '8px', backgroundColor: isHigh || isMed ? barColor : '#e2e8f0', borderRadius: '1px' }} />
          <div style={{ width: '3px', height: '10px', backgroundColor: isHigh ? barColor : '#e2e8f0', borderRadius: '1px' }} />
        </div>
      </div>
    );
  };

  const getSourceIcon = (sourceType: string) => {
    if (sourceType === 'linkedin') {
      return (
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          backgroundColor: '#0a66c2',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 900
        }}>
          in
        </div>
      );
    }
    if (sourceType === 'globe') {
      return <Globe size={18} color="#64748b" />;
    }
    if (sourceType === 'compliance') {
      return <ShieldAlert size={18} color="#64748b" />;
    }
    return <FileText size={18} color="#64748b" />;
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
      {/* Top Filter Tabs + Tools */}
      <div style={{
        padding: '14px 20px 0',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Type Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
          {filterTabs.map((tab) => {
            const isActive = activeTypeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTypeFilter(tab.id)}
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

        {/* Right Tools */}
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
        </div>
      </div>

      {/* Table Column Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px 2.4fr 1.8fr 1fr 1fr 1fr 3fr 70px 30px',
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
            checked={selectedIds.length === signals.length && signals.length > 0}
            onChange={handleSelectAll}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div>Signal</div>
        <div>Company</div>
        <div>Type</div>
        <div>Impact</div>
        <div>Detected</div>
        <div>Why It Matters</div>
        <div>Source</div>
        <div></div>
      </div>

      {/* Table Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {signals.map((sig) => {
          const isSelected = selectedSignalId === sig.id;
          const isChecked = selectedIds.includes(sig.id);

          return (
            <div
              key={sig.id}
              onClick={() => onSelectSignal(sig)}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 2.4fr 1.8fr 1fr 1fr 1fr 3fr 70px 30px',
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
                  onChange={(e) => handleToggleSelect(sig.id, e as any)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* Signal Title + Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getSignalIcon(sig.type)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {sig.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                    {sig.subtitle}
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {sig.companyName}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {sig.location}
                </div>
              </div>

              {/* Type Badge */}
              <div>
                {getTypeBadge(sig.type)}
              </div>

              {/* Impact Level */}
              <div>
                {getImpactBars(sig.impactLevel)}
              </div>

              {/* Detected Time */}
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {sig.detectedTime}
              </div>

              {/* Why It Matters */}
              <div style={{ paddingRight: '12px', fontSize: '12px', color: '#334155', lineHeight: 1.35 }}>
                {sig.whyItMatters}
              </div>

              {/* Source Icon */}
              <div>
                {getSourceIcon(sig.sourceType)}
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
        <span>Showing {signals.length > 0 ? 1 : 0} to {signals.length} of {signals.length} signals</span>

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
              width: '32px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            179
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
