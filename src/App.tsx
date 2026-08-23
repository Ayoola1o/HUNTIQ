import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { SummaryCard } from './components/SummaryCard';
import { Footer } from './components/Footer';
import { Step1Welcome } from './components/steps/Step1Welcome';
import { Step2ICP } from './components/steps/Step2ICP';
import { Step3Services } from './components/steps/Step3Services';
import { Step4HuntingSignals } from './components/steps/Step4HuntingSignals';
import { Step5AIConfig } from './components/steps/Step5AIConfig';
import { Step6Finish } from './components/steps/Step6Finish';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { CopilotPage } from './components/copilot/CopilotPage';
import { OpportunitiesPage } from './components/opportunities/OpportunitiesPage';
import { SignalsPage } from './components/signals/SignalsPage';
import { FindProspectsPage } from './components/prospects/FindProspectsPage';
import { CompaniesPage } from './components/companies/CompaniesPage';
import { ContactsPage } from './components/contacts/ContactsPage';
import { MarketIntelligencePage } from './components/market/MarketIntelligencePage';
import { ResearchPage } from './components/research/ResearchPage';
import { SavedSearchesPage } from './components/saved/SavedSearchesPage';
import { PipelinePage } from './components/pipeline/PipelinePage';
import { CampaignsPage } from './components/campaigns/CampaignsPage';
import { OutreachPage } from './components/outreach/OutreachPage';
import { TasksPage } from './components/tasks/TasksPage';
import { MeetingsPage } from './components/meetings/MeetingsPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { IntegrationsPage } from './components/integrations/IntegrationsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import type { OnboardingData } from './types/onboarding';
import { initialOnboardingData } from './types/onboarding';

export function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'copilot' | 'opportunities' | 'signals' | 'find-prospects' | 'companies' | 'contacts' | 'market-intel' | 'research' | 'saved-searches' | 'pipeline' | 'campaigns' | 'outreach' | 'tasks' | 'meetings' | 'reports' | 'integrations' | 'settings' | 'onboarding'>('settings');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<OnboardingData>(initialOnboardingData);

  const handleDataChange = (updates: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSelectStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleStartHunting = () => {
    setCurrentView('dashboard');
  };

  const handleNavigate = (nav: string) => {
    if (nav === 'dashboard') setCurrentView('dashboard');
    else if (nav === 'copilot') setCurrentView('copilot');
    else if (nav === 'opportunities') setCurrentView('opportunities');
    else if (nav === 'signals') setCurrentView('signals');
    else if (nav === 'find-prospects' || nav === 'find_prospects' || nav === 'prospects') setCurrentView('find-prospects');
    else if (nav === 'companies') setCurrentView('companies');
    else if (nav === 'contacts') setCurrentView('contacts');
    else if (nav === 'market-intel' || nav === 'market' || nav === 'market_intel') setCurrentView('market-intel');
    else if (nav === 'research') setCurrentView('research');
    else if (nav === 'saved-searches' || nav === 'saved_searches' || nav === 'saved') setCurrentView('saved-searches');
    else if (nav === 'pipeline') setCurrentView('pipeline');
    else if (nav === 'campaigns') setCurrentView('campaigns');
    else if (nav === 'outreach') setCurrentView('outreach');
    else if (nav === 'tasks') setCurrentView('tasks');
    else if (nav === 'meetings') setCurrentView('meetings');
    else if (nav === 'reports' || nav === 'report') setCurrentView('reports');
    else if (nav === 'integrations' || nav === 'integration') setCurrentView('integrations');
    else if (nav === 'settings' || nav === 'setting') setCurrentView('settings');
    else if (nav === 'onboarding') {
      setCurrentStep(1);
      setCurrentView('onboarding');
    }
  };

  if (currentView === 'settings') {
    return (
      <SettingsPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'integrations') {
    return (
      <IntegrationsPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'reports') {
    return (
      <ReportsPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'pipeline') {
    return (
      <PipelinePage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'campaigns') {
    return (
      <CampaignsPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'outreach') {
    return (
      <OutreachPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'tasks') {
    return (
      <TasksPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'meetings') {
    return (
      <MeetingsPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'saved-searches') {
    return (
      <SavedSearchesPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'research') {
    return (
      <ResearchPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'market-intel') {
    return (
      <MarketIntelligencePage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'contacts') {
    return (
      <ContactsPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'companies') {
    return (
      <CompaniesPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'find-prospects') {
    return (
      <FindProspectsPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'signals') {
    return (
      <SignalsPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'opportunities') {
    return (
      <OpportunitiesPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'copilot') {
    return (
      <CopilotPage
        onNavigate={handleNavigate}
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <DashboardPage
        onGoToOnboarding={() => {
          setCurrentStep(1);
          setCurrentView('onboarding');
        }}
      />
    );
  }

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
      <Sidebar
        currentStep={currentStep}
        onSelectStep={handleSelectStep}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Top Navigation & Step Indicator Bar */}
        <TopBar
          currentStep={currentStep}
          onSelectStep={handleSelectStep}
          onClose={() => setCurrentView('dashboard')}
        />

        {/* Scrollable Center Body: Form + Summary */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start'
        }}>
          {/* Active Step Form Card Container */}
          <div style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #eaecf0',
            padding: '28px 32px',
            boxShadow: '0 4px 20px -2px rgba(16, 24, 40, 0.04)',
            minWidth: 0,
          }}>
            {currentStep === 1 && (
              <Step1Welcome
                data={formData}
                onChange={handleDataChange}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <Step2ICP
                data={formData}
                onChange={handleDataChange}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}

            {currentStep === 3 && (
              <Step3Services
                data={formData}
                onChange={handleDataChange}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}

            {currentStep === 4 && (
              <Step4HuntingSignals
                data={formData}
                onChange={handleDataChange}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}

            {currentStep === 5 && (
              <Step5AIConfig
                data={formData}
                onChange={handleDataChange}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}

            {currentStep === 6 && (
              <Step6Finish
                data={formData}
                onPrev={handlePrev}
                onStartHunting={handleStartHunting}
              />
            )}
          </div>

          {/* Right Summary Card (Always Visible and Live Syncing) */}
          <SummaryCard
            data={formData}
            currentStep={currentStep}
          />
        </main>

        {/* Bottom Fixed/Sticky Security & Progress Footer */}
        <Footer
          currentStep={currentStep}
          totalSteps={5}
        />
      </div>
    </div>
  );
}

export default App;
