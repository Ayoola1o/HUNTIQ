import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { ReportsKpiCards } from './ReportsKpiCards';
import { FeaturedReportCard } from './FeaturedReportCard';
import { ReportTemplatesGrid } from './ReportTemplatesGrid';
import { ReportsTable } from './ReportsTable';
import { ReportViewerModal } from './ReportViewerModal';
import { GenerateReportWizardModal } from './GenerateReportWizardModal';
import { ScheduleReportModal } from './ScheduleReportModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { ReportItem, ReportsKpiSummary, ReportType } from '../../types/reports';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Calendar 
} from 'lucide-react';

interface ReportsPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardInitialType, setWizardInitialType] = useState<ReportType>('executive_brief');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState('generated');

  // Initial Mock Reports
  const [reports, setReports] = useState<ReportItem[]>([
    {
      id: 'rep-1',
      name: 'Weekly Sales Intelligence & Market Brief',
      type: 'executive_brief',
      period: 'Aug 17 – Aug 23, 2026',
      createdAt: 'Today, 8:00 AM',
      createdBy: 'Ayoola Ade',
      ownerAvatarBg: '#eff6ff',
      ownerAvatarColor: '#1d4ed8',
      status: 'ready',
      isScheduled: true,
      isShared: true,
      confidenceScore: 94,
      sourcesCount: 842,
      summary: 'Your prospecting activity increased 24% this week. Financial Services generated the highest number of qualified opportunities, while hiring signals remained the strongest buying indicator.',
      kpiMetrics: [
        { metric: 'Prospects Discovered', current: '1,284', previous: '1,031', change: '+24.5%', isPositive: true },
        { metric: 'Signals Detected', current: '842', previous: '713', change: '+18.1%', isPositive: true },
        { metric: 'Opportunities', current: '73', previous: '61', change: '+19.7%', isPositive: true },
        { metric: 'Active Pipeline', current: '$428,600', previous: '$381,000', change: '+12.3%', isPositive: true }
      ],
      topOpportunities: [
        { companyName: 'Acme Technologies', score: 94, value: 35000, signal: 'Hiring (+38 openings)' },
        { companyName: 'Flutterwave', score: 96, value: 32000, signal: 'Cross-Border Expansion' },
        { companyName: 'Paystack', score: 92, value: 24000, signal: 'Sales Team Scaling' },
        { companyName: 'Vertex Solutions', score: 88, value: 22000, signal: 'Executive Succession' },
        { companyName: 'CloudNova Tech', score: 91, value: 18000, signal: 'AWS Cloud Migration' }
      ],
      signalAttribution: [
        { signal: 'Hiring Surge', oppCount: 31, pipelineValue: 184000 },
        { signal: 'Regional Expansion', oppCount: 18, pipelineValue: 102000 },
        { signal: 'Leadership Addition', oppCount: 9, pipelineValue: 61000 },
        { signal: 'Funding / Capital', oppCount: 8, pipelineValue: 48000 },
        { signal: 'Tech Stack Shift', oppCount: 7, pipelineValue: 33600 }
      ],
      funnelStages: [
        { stage: '1. Prospects Discovered', count: 1284, conversionPct: 100 },
        { stage: '2. Contacted via Outreach', count: 384, conversionPct: 29.9 },
        { stage: '3. Engaged & Replied', count: 126, conversionPct: 32.8 },
        { stage: '4. Qualified Opportunities', count: 73, conversionPct: 57.9 },
        { stage: '5. Discovery Meetings Held', count: 28, conversionPct: 38.3 },
        { stage: '6. Proposals Delivered', count: 14, conversionPct: 50.0 },
        { stage: '7. Closed Won Revenue', count: 6, conversionPct: 42.8 }
      ],
      recommendations: [
        { title: 'Prioritize West African FinTechs', detail: 'Financial Services generated 42% of qualified pipeline with lowest CAC.', actionText: 'Explore Opportunities', actionRoute: 'opportunities' },
        { title: 'Re-engage 8 Stalled Proposals', detail: 'Deals viewed >3 times without feedback in 6 days are losing momentum.', actionText: 'Review Pipeline', actionRoute: 'pipeline' },
        { title: 'Target 14 Companies with Dual Signals', detail: 'Companies exhibiting both hiring and expansion showed 3.2x higher close rates.', actionText: 'View Signals', actionRoute: 'signals' }
      ]
    },
    {
      id: 'rep-2',
      name: 'Lagos & Abuja Market Expansion Report',
      type: 'market',
      period: 'August 1 – August 23, 2026',
      createdAt: 'Yesterday',
      createdBy: 'Ayoola Ade',
      ownerAvatarBg: '#eff6ff',
      ownerAvatarColor: '#1d4ed8',
      status: 'ready',
      isShared: true,
      confidenceScore: 91,
      sourcesCount: 620,
      summary: 'Lagos technology scaleups increased hiring velocity by 28% month-over-month. Workforce enablement and compliance leadership emerged as highest-demand external services.',
      kpiMetrics: [
        { metric: 'Companies Monitored', current: '512', previous: '430', change: '+19.0%', isPositive: true },
        { metric: 'Expansion Signals', current: '142', previous: '98', change: '+44.8%', isPositive: true },
        { metric: 'Average Deal Size', current: '$18,400', previous: '$14,200', change: '+29.5%', isPositive: true },
        { metric: 'Conversion to Meeting', current: '8.4%', previous: '6.1%', change: '+2.3%', isPositive: true }
      ],
      topOpportunities: [
        { companyName: 'Flutterwave', score: 96, value: 32000, signal: 'Cross-Border Expansion' },
        { companyName: 'Delta Systems', score: 84, value: 18000, signal: 'HR Modernization' }
      ],
      signalAttribution: [
        { signal: 'Regional Expansion', oppCount: 18, pipelineValue: 102000 },
        { signal: 'Hiring Surge', oppCount: 14, pipelineValue: 86000 }
      ],
      funnelStages: [],
      recommendations: [
        { title: 'Launch Outbound Sequence to Abuja Scaleups', detail: 'Abuja public commercial modernization segment has 0 active campaigns.', actionText: 'Launch Campaign', actionRoute: 'campaigns' }
      ]
    },
    {
      id: 'rep-3',
      name: 'Q3 Pipeline Risk & Forecast Analysis',
      type: 'pipeline',
      period: 'Q3 2026 to Date',
      createdAt: 'Aug 21, 2026',
      createdBy: 'Sarah Jenkins',
      ownerAvatarBg: '#fbcfe8',
      ownerAvatarColor: '#9d174d',
      status: 'ready',
      isScheduled: true,
      confidenceScore: 89,
      sourcesCount: 73,
      summary: 'Expected probability-weighted revenue currently stands at $176,400 against a $428,600 gross pipeline. 8 opportunities require immediate executive touch to prevent stall.',
      kpiMetrics: [
        { metric: 'Active Deals', current: '86', previous: '74', change: '+16.2%', isPositive: true },
        { metric: 'Expected Revenue', current: '$176,400', previous: '$142,000', change: '+24.2%', isPositive: true },
        { metric: 'Win Rate', current: '24.8%', previous: '21.6%', change: '+3.2%', isPositive: true },
        { metric: 'Avg Sales Cycle', current: '31 days', previous: '38 days', change: '-7 days', isPositive: true }
      ],
      topOpportunities: [
        { companyName: 'Acme Technologies', score: 94, value: 35000, signal: 'Hiring' },
        { companyName: 'Vertex Solutions', score: 88, value: 22000, signal: 'Succession' }
      ],
      signalAttribution: [],
      funnelStages: [],
      recommendations: [
        { title: 'Follow Up on Negotiation Stage Deals', detail: '3 negotiation deals closing in <10 days require finalized SLA.', actionText: 'Open Pipeline', actionRoute: 'pipeline' }
      ]
    }
  ]);

  const kpiSummary: ReportsKpiSummary = {
    totalGenerated: reports.length,
    scheduledCount: reports.filter(r => r.isScheduled).length,
    sharedCount: reports.filter(r => r.isShared).length,
    thisMonthCount: 12
  };

  const handleOpenWizard = (type: ReportType = 'executive_brief') => {
    setWizardInitialType(type);
    setIsWizardOpen(true);
  };

  const handleReportGenerated = (newReport: ReportItem) => {
    setReports([newReport, ...reports]);
    setSelectedReport(newReport);
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
      {/* Sidebar */}
      <DashboardSidebar
        activeNav="reports"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        paddingBottom: '40px',
        gap: '20px'
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
              <FileText size={16} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Intelligence Reports & Attribution
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Convert prospecting signals, outreach velocity and pipeline data into decision-ready reports
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              onClick={() => setIsScheduleModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <Calendar size={13} />
              <span>Schedule Report</span>
            </button>

            <button
              onClick={() => handleOpenWizard('executive_brief')}
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
              <span>+ Generate Report</span>
            </button>
          </div>
        </header>

        {/* KPI Metrics Row */}
        <div>
          <ReportsKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Featured Report Card */}
        {reports[0] && (
          <FeaturedReportCard
            report={reports[0]}
            onOpenReport={(r) => setSelectedReport(r)}
            onShareReport={() => {}}
          />
        )}

        {/* Report Templates Grid */}
        <ReportTemplatesGrid
          onSelectTemplate={(type) => handleOpenWizard(type)}
        />

        {/* Reports Table / Library */}
        <ReportsTable
          reports={reports}
          selectedReportId={selectedReport?.id || null}
          onSelectReport={(r) => setSelectedReport(r)}
          onGenerateReport={() => handleOpenWizard('executive_brief')}
          onScheduleReport={() => setIsScheduleModalOpen(true)}
          onShareReport={() => {}}
        />
      </div>

      {/* Deep Report Viewer Modal */}
      <ReportViewerModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onNavigate={onNavigate}
      />

      {/* Generate Report Wizard Modal */}
      <GenerateReportWizardModal
        isOpen={isWizardOpen}
        initialType={wizardInitialType}
        onClose={() => setIsWizardOpen(false)}
        onReportGenerated={handleReportGenerated}
      />

      {/* Schedule Report Modal */}
      <ScheduleReportModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirmSchedule={() => {}}
      />

      {/* AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={() => {
          setIsCopilotOpen(false);
          onNavigate('research');
        }}
      />
    </div>
  );
};
