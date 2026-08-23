import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';
import type { ReportItem, ReportType, ReportStatus } from '../../types/reports';

interface ReportsTableProps {
  reports: ReportItem[];
  selectedReportId: string | null;
  onSelectReport: (report: ReportItem) => void;
  onGenerateReport: () => void;
  onScheduleReport: () => void;
  onShareReport: (report: ReportItem) => void;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onGenerateReport,
  onScheduleReport,
  onShareReport
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'market' | 'pipeline' | 'scheduled' | 'shared'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter((r) => {
    if (activeTab === 'sales' && r.type !== 'sales') return false;
    if (activeTab === 'market' && r.type !== 'market') return false;
    if (activeTab === 'pipeline' && r.type !== 'pipeline') return false;
    if (activeTab === 'scheduled' && !r.isScheduled) return false;
    if (activeTab === 'shared' && !r.isShared) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'ready':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            fontSize: '10.5px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <CheckCircle2 size={11} />
            <span>Ready</span>
          </span>
        );
      case 'generating':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f5f3ff',
            color: '#7c3aed',
            border: '1px solid #ddd6fe',
            fontSize: '10.5px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <Sparkles size={11} />
            <span>Generating...</span>
          </span>
        );
      case 'scheduled':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            fontSize: '10.5px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <Calendar size={11} />
            <span>Scheduled</span>
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f8fafc',
            color: '#64748b',
            fontSize: '10.5px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <span>Draft</span>
          </span>
        );
    }
  };

  const getTypeLabel = (type: ReportType) => {
    switch (type) {
      case 'sales': return { label: 'Sales Performance', color: '#4f46e5', bg: '#eff6ff' };
      case 'market': return { label: 'Market Intel', color: '#059669', bg: '#ecfdf5' };
      case 'pipeline': return { label: 'Pipeline & Revenue', color: '#7c3aed', bg: '#f5f3ff' };
      case 'prospecting': return { label: 'Prospect Sourcing', color: '#ea580c', bg: '#fff7ed' };
      case 'campaign': return { label: 'Campaign Analytics', color: '#2563eb', bg: '#eff6ff' };
      default: return { label: 'AI Executive Brief', color: '#9333ea', bg: '#fdf4ff' };
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      margin: '0 32px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Table Controls Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left: Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'all', label: 'All Reports', count: reports.length },
            { id: 'sales', label: 'Sales', count: reports.filter(r => r.type === 'sales').length },
            { id: 'market', label: 'Market Intel', count: reports.filter(r => r.type === 'market').length },
            { id: 'pipeline', label: 'Pipeline', count: reports.filter(r => r.type === 'pipeline').length },
            { id: 'scheduled', label: 'Scheduled', count: reports.filter(r => r.isScheduled).length },
            { id: 'shared', label: 'Shared', count: reports.filter(r => r.isShared).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#f5f3ff' : 'transparent',
                color: activeTab === tab.id ? '#6d28d9' : '#64748b'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '10px',
                backgroundColor: activeTab === tab.id ? '#ddd6fe' : '#f1f5f9',
                color: activeTab === tab.id ? '#5b21b6' : '#64748b',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Search & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '5px 12px',
            width: '240px'
          }}>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '12px',
                color: '#0f172a',
                width: '100%',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            onClick={onScheduleReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Calendar size={13} />
            <span>Schedule</span>
          </button>

          <button
            onClick={onGenerateReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Plus size={13} />
            <span>+ Generate Report</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eaecf0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 20px', fontWeight: 700 }}>Report Name</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Type</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Period</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Generated Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Owner</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '12px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => {
              const isSelected = selectedReportId === report.id;
              const typeBadge = getTypeLabel(report.type);

              return (
                <tr
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  {/* Name & Summary */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                      {report.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {report.summary}
                    </div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: typeBadge.color,
                      backgroundColor: typeBadge.bg,
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {typeBadge.label}
                    </span>
                  </td>

                  {/* Period */}
                  <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    {report.period}
                  </td>

                  {/* Generated Date */}
                  <td style={{ padding: '14px 16px', fontSize: '11.5px', color: '#64748b' }}>
                    {report.createdAt}
                  </td>

                  {/* Owner */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: report.ownerAvatarBg,
                        color: report.ownerAvatarColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 800
                      }}>
                        {report.createdBy.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: '11.5px', color: '#334155', fontWeight: 600 }}>
                        {report.createdBy}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(report.status)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareReport(report);
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        <Share2 size={12} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(report);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#f5f3ff',
                          border: '1px solid #ddd6fe',
                          color: '#6d28d9',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <span>View Brief</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
