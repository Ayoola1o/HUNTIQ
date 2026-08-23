import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight
} from 'lucide-react';
import type { CompanyResearchReport, ResearchStatus } from '../../types/research';

interface RecentResearchTableProps {
  reports: CompanyResearchReport[];
  selectedReportId: string | null;
  onSelectReport: (report: CompanyResearchReport) => void;
  onRefreshReport: (reportId: string) => void;
  onStartNewResearch: () => void;
}

export const RecentResearchTable: React.FC<RecentResearchTableProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onRefreshReport,
  onStartNewResearch
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'complete' | 'researching' | 'needs_review'>('all');
  const [tableSearch, setTableSearch] = useState('');

  const filteredReports = reports.filter((rep) => {
    if (activeTab !== 'all' && rep.status !== activeTab) return false;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      return (
        rep.companyName.toLowerCase().includes(q) ||
        rep.domain.toLowerCase().includes(q) ||
        rep.industry.toLowerCase().includes(q) ||
        rep.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: ResearchStatus) => {
    switch (status) {
      case 'complete':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <CheckCircle2 size={12} />
            <span>Complete</span>
          </span>
        );
      case 'researching':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fde68a',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <Loader2 size={12} className="animate-spin" />
            <span>Researching</span>
          </span>
        );
      case 'needs_review':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <AlertCircle size={12} />
            <span>Needs Review</span>
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <span>Idle</span>
          </span>
        );
    }
  };

  const getIntentBadge = (intent: CompanyResearchReport['buyingIntent']) => {
    switch (intent) {
      case 'Very High':
        return { label: '🔥 Very High', bg: '#fee2e2', color: '#b91c1c' };
      case 'High':
        return { label: '⚡ High', bg: '#fef3c7', color: '#b45309' };
      case 'Medium':
        return { label: 'Medium', bg: '#eff6ff', color: '#1d4ed8' };
      default:
        return { label: 'Low', bg: '#f1f5f9', color: '#64748b' };
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
        {/* Left: Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'all', label: 'All Researched', count: reports.length },
            { id: 'complete', label: 'Complete', count: reports.filter(r => r.status === 'complete').length },
            { id: 'researching', label: 'Researching', count: reports.filter(r => r.status === 'researching').length },
            { id: 'needs_review', label: 'Needs Review', count: reports.filter(r => r.status === 'needs_review').length },
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
                color: activeTab === tab.id ? '#6d28d9' : '#64748b',
                transition: 'all 0.15s ease'
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

        {/* Right: Search Filter Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '5px 12px',
            width: '260px'
          }}>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search researched companies..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
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
            onClick={onStartNewResearch}
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
            <Sparkles size={13} />
            <span>+ New Research</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eaecf0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 20px', fontWeight: 700 }}>Company & Domain</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Industry & Geo</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Opportunity Score</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Buying Intent</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Research Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Last Updated</th>
              <th style={{ padding: '12px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => {
              const isSelected = selectedReportId === report.id;
              const intent = getIntentBadge(report.buyingIntent);

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
                  {/* Company & Domain */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '9px',
                        backgroundColor: report.logoBg,
                        color: report.logoColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {report.logoInitial}
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                          {report.companyName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {report.domain}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Industry & Geo */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {report.industry}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {report.location}
                    </div>
                  </td>

                  {/* Opportunity Score */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: report.opportunityScore >= 90 ? '#ecfdf5' : '#eff6ff',
                        border: report.opportunityScore >= 90 ? '2px solid #10b981' : '2px solid #3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 900,
                        color: report.opportunityScore >= 90 ? '#047857' : '#1d4ed8'
                      }}>
                        {report.opportunityScore}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>/ 100</span>
                    </div>
                  </td>

                  {/* Buying Intent */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: intent.bg,
                      color: intent.color,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {intent.label}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(report.status)}
                  </td>

                  {/* Last Updated */}
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '11.5px' }}>
                    {report.lastUpdated}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRefreshReport(report.id);
                        }}
                        title="Refresh Research"
                        style={{
                          background: 'none',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        <RefreshCw size={12} />
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
                        <span>View Intelligence</span>
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
