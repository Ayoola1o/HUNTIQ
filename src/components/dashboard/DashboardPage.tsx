import React, { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { KpiCards } from './KpiCards';
import { AttentionFeed } from './AttentionFeed';
import { PipelineHealthCard } from './PipelineHealthCard';
import { TopOpportunitiesCard } from './TopOpportunitiesCard';
import { SignalsOverTimeChart } from './SignalsOverTimeChart';
import { SignalsByTypeCard } from './SignalsByTypeCard';
import { RecentActivityCard } from './RecentActivityCard';
import { AiCopilotModal } from './AiCopilotModal';
import { CompanyResearchModal } from './CompanyResearchModal';

interface DashboardPageProps {
  onGoToOnboarding?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onGoToOnboarding }) => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [dateRange, setDateRange] = useState('May 16, 2025');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  
  // Modals state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);

  const handleOpenResearch = (company: string) => {
    setResearchedCompany(company);
  };

  const handleOpenContact = (_person: string, company: string) => {
    setResearchedCompany(company);
  };

  const handleSelectNav = (nav: string) => {
    setActiveNav(nav);
    if (nav === 'copilot') {
      setIsCopilotOpen(true);
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
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
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
        {/* Top Header */}
        <DashboardHeader
          onOpenCopilot={() => setIsCopilotOpen(true)}
          dateRange={dateRange}
          onChangeDateRange={setDateRange}
          selectedTeam={selectedTeam}
          onChangeTeam={setSelectedTeam}
          onSearch={() => {}}
        />

        {/* Scrollable Dashboard Body */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          paddingBottom: '32px'
        }}>
          {/* KPI Summary Cards */}
          <KpiCards onCardClick={() => {}} />

          {/* Middle 2-Column Section */}
          <div className="grid-2-1 responsive-container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '18px',
            padding: '0 24px'
          }}>
            {/* Left: What Needs Your Attention */}
            <AttentionFeed
              onOpenResearch={handleOpenResearch}
              onOpenContact={handleOpenContact}
            />

            {/* Right Column: Pipeline Health & Top Opportunities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <PipelineHealthCard />
              <TopOpportunitiesCard onSelectCompany={handleOpenResearch} />
            </div>
          </div>

          {/* Bottom 3-Column Intelligence & Activity Section */}
          <div className="grid-3-cols responsive-container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px',
            padding: '0 24px'
          }}>
            <SignalsOverTimeChart />
            <SignalsByTypeCard />
            <RecentActivityCard />
          </div>
        </main>
      </div>

      {/* AI Copilot Interactive Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={handleOpenResearch}
      />

      {/* 360° Company Intelligence Report Modal */}
      <CompanyResearchModal
        companyName={researchedCompany}
        onClose={() => setResearchedCompany(null)}
      />
    </div>
  );
};
