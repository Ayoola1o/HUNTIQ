import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { ResearchKpiCards } from './ResearchKpiCards';
import { RecentResearchTable } from './RecentResearchTable';
import { ResearchReportView } from './ResearchReportView';
import { NewResearchModal } from './NewResearchModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { CompanyResearchReport, ResearchKpiSummary } from '../../types/research';
import {
  fetchResearchReports,
  createResearchReport as apiCreateResearchReport,
  refreshResearchReport as apiRefreshResearchReport
} from '../../api';
import { 
  Compass, 
  Sparkles, 
  Search, 
  ArrowRight,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ResearchPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const ResearchPage: React.FC<ResearchPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [reports, setReports] = useState<CompanyResearchReport[]>([]);
  const [kpiSummary, setKpiSummary] = useState<ResearchKpiSummary>({
    totalReports: 0,
    inProgress: 0,
    updatedThisWeek: 0,
    highOpportunity: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<CompanyResearchReport | null>(null);
  const [isNewResearchModalOpen, setIsNewResearchModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load Reports from Live API
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const response = await fetchResearchReports({
        query: searchQuery.trim() ? searchQuery : undefined
      });

      const list = response.reports || [];
      setReports(list);
      if (response.kpiSummary) {
        setKpiSummary(response.kpiSummary);
      }

      // If viewing a report, update its reference
      setSelectedReport(prev => {
        if (!prev) return null;
        return list.find(r => r.id === prev.id) || prev;
      });
    } catch (err: any) {
      console.error('Failed to fetch research reports:', err);
      setIsError(true);
      setErrorMessage(err?.message || 'Unable to connect to live backend API');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);


  // Filter reports by active KPI filter
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (activeKpiFilter === 'high_opportunity') return r.opportunityScore >= 90;
      if (activeKpiFilter === 'in_progress') return r.status === 'researching';
      if (activeKpiFilter === 'needs_review') return r.status === 'needs_review';
      return true;
    });
  }, [reports, activeKpiFilter]);

  const handleStartSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if report exists
    const match = reports.find(r => 
      r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (r.domain ? r.domain.toLowerCase().includes(searchQuery.toLowerCase()) : false)
    );

    if (match) {
      setSelectedReport(match);
    } else {
      const detectedDomain = searchQuery.includes('.') ? searchQuery.toLowerCase().trim() : '';
      handleCompleteNewResearch(searchQuery, detectedDomain);
    }
  };

  const handleCompleteNewResearch = async (name: string, domain: string) => {
    try {
      const newReport = await apiCreateResearchReport({
        companyName: name,
        domain
      });
      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
    } catch (err) {
      console.error('Failed to create research report via API:', err);
      // Fallback
      loadReports();
    }
  };

  const handleRefreshReport = async (id: string) => {
    try {
      const refreshed = await apiRefreshResearchReport(id);
      setReports(prev => prev.map(r => r.id === id ? refreshed : r));
      if (selectedReport?.id === id) {
        setSelectedReport(refreshed);
      }
    } catch (err) {
      console.warn('Failed to refresh report on backend:', err);
      setReports(prev => prev.map(r => r.id === id ? { ...r, lastUpdated: 'Just now' } : r));
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f4f6fa',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Left Sidebar */}
      <DashboardSidebar
        activeNav="research"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {selectedReport ? (
          /* Individual 360° Company Intelligence Report View */
          <ResearchReportView
            report={selectedReport}
            onBack={() => setSelectedReport(null)}
            onRefresh={handleRefreshReport}
            onNavigateToContacts={() => onNavigate('contacts')}
            onNavigateToOutreach={() => onNavigate('campaigns')}
          />
        ) : (
          /* Research Dashboard & Listing View */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            paddingBottom: '40px'
          }}>
            {/* Top Header */}
            <header style={{
              height: '62px',
              minHeight: '62px',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #eaecf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 32px',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  backgroundColor: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #dbeafe'
                }}>
                  <Compass size={16} color="#2563eb" />
                </div>
                <div>
                  <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Company Research Intelligence
                  </h1>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                    Investigate companies, uncover buying signals, and understand your next best opportunity
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Sync API Button */}
                <button
                  onClick={loadReports}
                  disabled={isLoading}
                  title="Sync live research from API"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  <span>{isLoading ? 'Syncing...' : 'Sync API'}</span>
                </button>

                <button
                  onClick={() => setIsCopilotOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    color: '#6d28d9',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={13} />
                  <span>Ask AI Copilot</span>
                </button>

                <button
                  onClick={() => setIsNewResearchModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 16px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
                  }}
                >
                  <Plus size={14} />
                  <span>+ New Research</span>
                </button>
              </div>
            </header>

            {/* Error Banner */}
            {isError && (
              <div style={{
                margin: '12px 32px 0 32px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '12px' }}>
                  <AlertCircle size={15} />
                  <span>{errorMessage || 'Live backend connection error. Showing cached research.'}</span>
                </div>
                <button
                  onClick={loadReports}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Hero Research Search Banner */}
            <div style={{
              margin: '24px 32px 20px 32px',
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Research a Company in Real-Time
                </h2>
                <p style={{ fontSize: '12px', color: '#a5b4fc', margin: '4px 0 0 0' }}>
                  Enter any company name or domain. HUNTIQ will gather hiring surges, leadership changes, tech stack signals and generate actionable outreach.
                </p>
              </div>

              <form onSubmit={handleStartSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '8px 16px'
                }}>
                  <Search size={16} color="#cbd5e1" />
                  <input
                    type="text"
                    placeholder="Search company name, website or domain (e.g. Acme Technologies, Flutterwave, Moniepoint)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      outline: 'none',
                      fontSize: '13px',
                      color: '#ffffff',
                      width: '100%',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(124, 58, 237, 0.4)'
                  }}
                >
                  <span>Research Company</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>

            {/* KPI Cards */}
            <div style={{ marginBottom: '20px' }}>
              <ResearchKpiCards
                summary={kpiSummary}
                activeFilter={activeKpiFilter}
                onSelectFilter={setActiveKpiFilter}
              />
            </div>

            {/* Recent Research Table */}
            {isLoading && reports.length === 0 ? (
              <div style={{ margin: '0 32px', padding: '32px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #eaecf0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ height: '48px', backgroundColor: '#f8fafc', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : (
              <RecentResearchTable
                reports={filteredReports}
                selectedReportId={selectedReport ? (selectedReport as CompanyResearchReport).id : null}
                onSelectReport={(rep) => setSelectedReport(rep)}
                onRefreshReport={handleRefreshReport}
                onStartNewResearch={() => setIsNewResearchModalOpen(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* New Research Agent Modal */}
      <NewResearchModal
        isOpen={isNewResearchModalOpen}
        onClose={() => setIsNewResearchModalOpen(false)}
        onCompleteResearch={handleCompleteNewResearch}
      />

      {/* AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={(comp) => {
          const found = reports.find(r => r.companyName.toLowerCase().includes(comp.toLowerCase()));
          if (found) setSelectedReport(found);
          else handleCompleteNewResearch(comp, `${comp.toLowerCase().replace(/\s+/g, '')}.com`);
        }}
      />
    </div>
  );
};
