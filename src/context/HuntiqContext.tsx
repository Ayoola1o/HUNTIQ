import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { CompanyItem } from '../types/company';
import type { SignalItem } from '../types/signal';
import type { OpportunityItem } from '../types/opportunity';
import type { PipelineDealItem, PipelineStage } from '../types/pipeline';
import type { ResearchDossier, CopilotExecutionResult } from '../engine/types';
import { 
  prospectorEngine, 
  signalEngine, 
  researchEngine, 
  scoringEngine, 
  copilotEngine 
} from '../engine';
import {
  checkApiHealth,
  fetchCompanies as apiFetchCompanies,
  fetchSignals as apiFetchSignals,
  fetchPipelineDeals as apiFetchPipelineDeals,
  createPipelineDeal,
  updatePipelineDeal
} from '../api';

export type AppView = 
  | 'dashboard' 
  | 'copilot' 
  | 'opportunities' 
  | 'signals' 
  | 'find-prospects' 
  | 'companies' 
  | 'contacts' 
  | 'market-intel' 
  | 'research' 
  | 'saved-searches' 
  | 'pipeline' 
  | 'campaigns' 
  | 'outreach' 
  | 'tasks' 
  | 'meetings' 
  | 'reports' 
  | 'integrations' 
  | 'settings' 
  | 'profile' 
  | 'onboarding';

interface HuntiqContextType {
  // Navigation
  currentView: AppView;
  navigateTo: (view: string) => void;

  // Global Data
  companies: CompanyItem[];
  signals: SignalItem[];
  opportunities: OpportunityItem[];
  pipelineDeals: PipelineDealItem[];
  isLiveBackend: boolean;
  isDataLoading: boolean;
  refreshData: () => Promise<void>;
  
  // Modals & Active Inspect
  isCopilotOpen: boolean;
  openCopilot: (initialQuery?: string) => void;
  closeCopilot: () => void;
  copilotInitialQuery: string;
  
  researchedCompany: string | null;
  activeDossier: ResearchDossier | null;
  openResearch: (companyName: string) => void;
  closeResearch: () => void;

  // Action Dispatchers (Optimized & Cached)
  searchCompanies: (query?: string, industry?: string) => CompanyItem[];
  addDealToPipeline: (deal: Partial<PipelineDealItem>) => void;
  updateDealStage: (dealId: string, stage: PipelineStage) => void;
  toggleSaveCompany: (companyId: string) => void;
  executeCopilotCommand: (prompt: string) => CopilotExecutionResult;
}

const HuntiqContext = createContext<HuntiqContextType | undefined>(undefined);

export const HuntiqProvider: React.FC<{ children: React.ReactNode; initialView?: AppView }> = ({ 
  children,
  initialView = 'dashboard'
}) => {
  const [currentView, setCurrentView] = useState<AppView>(initialView);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  // Data State
  const [companies, setCompanies] = useState<CompanyItem[]>(() => prospectorEngine.getAllCompanies());
  const [signals, setSignals] = useState<SignalItem[]>(() => signalEngine.getAllSignals());
  
  const [pipelineDeals, setPipelineDeals] = useState<PipelineDealItem[]>([
    {
      id: 'deal-1',
      companyName: 'Acme Technologies',
      domain: 'acme.io',
      dealTitle: 'Enterprise Talent Scaling & Mgmt',
      serviceName: 'HR Advisory Suite',
      dealValue: 25000,
      probability: 75,
      opportunityScore: 94,
      stage: 'proposal',
      stageEnteredAt: '2 days ago',
      expectedCloseDate: 'Aug 30, 2026',
      ownerName: 'Ayoola Ade',
      contactName: 'Jane Smith',
      contactRole: 'Head of People',
      contactAvatarBg: '#eff6ff',
      contactAvatarColor: '#1d4ed8',
      lastActivity: 'Proposal sent yesterday',
      nextAction: 'Executive follow-up call',
      nextActionDueDate: 'Tomorrow, 2 PM',
      priority: 'High',
      activities: []
    },
    {
      id: 'deal-2',
      companyName: 'FinServe Ltd',
      domain: 'finserve.africa',
      dealTitle: 'Regional Expansion Advisory',
      serviceName: 'Expansion Strategy',
      dealValue: 35000,
      probability: 60,
      opportunityScore: 91,
      stage: 'meeting',
      stageEnteredAt: '4 days ago',
      expectedCloseDate: 'Sep 15, 2026',
      ownerName: 'Ayoola Ade',
      contactName: 'Michael Okoro',
      contactRole: 'HR Director',
      contactAvatarBg: '#fef3c7',
      contactAvatarColor: '#b45309',
      lastActivity: 'Discovery call held',
      nextAction: 'Draft custom scoping deck',
      nextActionDueDate: 'Thursday',
      priority: 'High',
      activities: []
    },
    {
      id: 'deal-3',
      companyName: 'Paystack',
      domain: 'paystack.com',
      dealTitle: 'Cross-Border Compliance Platform',
      serviceName: 'Regulatory Cloud',
      dealValue: 48000,
      probability: 85,
      opportunityScore: 94,
      stage: 'negotiation',
      stageEnteredAt: '1 week ago',
      expectedCloseDate: 'Aug 28, 2026',
      ownerName: 'Ayoola Ade',
      contactName: 'Babafemi Lawson',
      contactRole: 'Head of Operations',
      contactAvatarBg: '#ecfdf5',
      contactAvatarColor: '#047857',
      lastActivity: 'MSA & SLA under legal review',
      nextAction: 'Final terms confirmation',
      nextActionDueDate: 'Friday, 11 AM',
      priority: 'High',
      activities: []
    }
  ]);

  // Modals & Research Dossier
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState('');
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);

  // Cached Research Dossier
  const activeDossier = useMemo(() => {
    if (!researchedCompany) return null;
    return researchEngine.generateDossier(researchedCompany);
  }, [researchedCompany]);

  // Memoized Scored Opportunities
  const opportunities = useMemo(() => {
    return companies.map((c) => {
      const evaluation = scoringEngine.evaluateOpportunity(c, signals);
      const opp: OpportunityItem = {
        id: `opp-${c.id}`,
        companyName: c.name,
        avatarLetter: c.name.charAt(0),
        avatarBg: '#eff6ff',
        industry: c.industry,
        employees: c.employees,
        location: c.location,
        score: evaluation.totalScore,
        scoreTrend: 'up',
        priority: evaluation.tier === 'High Intent' ? 'Hot' : 'High',
        whyNow: evaluation.whyNowSummary,
        tags: c.activeSignals?.map(s => s.type) || ['High Intent'],
        estimatedValue: evaluation.totalScore * 450,
        stage: 'Discovery',
        lastActivity: '2 hours ago',
        lastActivityType: 'signal',
        website: c.domain,
        revenue: c.revenue,
        linkedInUrl: c.socials?.linkedin || 'https://linkedin.com',
        signals: [
          {
            id: `sig-opp-${c.id}`,
            type: 'expansion',
            title: c.activeSignals?.[0]?.title || 'Recent Regional Expansion',
            detail: c.activeSignals?.[0]?.description || 'Hiring spike and new office locations',
            timeAgo: '2h ago',
            confidence: 94
          }
        ],
        scoreFactors: {
          icpFit: { score: evaluation.icpFitScore, max: 100 },
          buyingIntent: { score: evaluation.signalVelocityScore, max: 100 },
          triggerEvents: { score: evaluation.hiringSurgeScore, max: 100 },
          decisionMakerAccess: { score: evaluation.reachabilityScore, max: 100 },
          companySize: { score: 85, max: 100 },
          engagement: { score: 70, max: 100 }
        },
        bestNextStep: {
          actionText: evaluation.recommendedAction,
          targetRole: 'Head of Operations',
          targetName: 'Decision Maker'
        }
      };
      return opp;
    });
  }, [companies, signals]);

  // Optimized Navigation Handler
  const navigateTo = useCallback((nav: string) => {
    const clean = nav.toLowerCase().replace('_', '-');
    if (clean === 'dashboard') setCurrentView('dashboard');
    else if (clean === 'copilot') {
      setCurrentView('copilot');
      setIsCopilotOpen(true);
    }
    else if (clean === 'opportunities' || clean === 'opp') setCurrentView('opportunities');
    else if (clean === 'signals' || clean === 'signal' || clean === 'alerts' || clean === 'alert') setCurrentView('signals');
    else if (clean === 'find-prospects' || clean === 'prospects') setCurrentView('find-prospects');
    else if (clean === 'companies' || clean === 'company') setCurrentView('companies');
    else if (clean === 'contacts' || clean === 'contact') setCurrentView('contacts');
    else if (clean === 'market-intel' || clean === 'market') setCurrentView('market-intel');
    else if (clean === 'research') setCurrentView('research');
    else if (clean === 'saved-searches' || clean === 'saved') setCurrentView('saved-searches');
    else if (clean === 'pipeline') setCurrentView('pipeline');
    else if (clean === 'campaigns') setCurrentView('campaigns');
    else if (clean === 'outreach') setCurrentView('outreach');
    else if (clean === 'tasks') setCurrentView('tasks');
    else if (clean === 'meetings') setCurrentView('meetings');
    else if (clean === 'reports' || clean === 'report') setCurrentView('reports');
    else if (clean === 'integrations' || clean === 'integration') setCurrentView('integrations');
    else if (clean === 'settings' || clean === 'setting' || clean === 'team') setCurrentView('settings');
    else if (clean === 'profile' || clean === 'user-profile' || clean === 'account') setCurrentView('profile');
    else if (clean === 'onboarding') setCurrentView('onboarding');
  }, []);

  // Modal Triggers
  const openCopilot = useCallback((initialQuery: string = '') => {
    setCopilotInitialQuery(initialQuery);
    setIsCopilotOpen(true);
  }, []);

  const closeCopilot = useCallback(() => {
    setIsCopilotOpen(false);
  }, []);

  const openResearch = useCallback((companyName: string) => {
    setResearchedCompany(companyName);
  }, []);

  const closeResearch = useCallback(() => {
    setResearchedCompany(null);
  }, []);

  // Search Dispatcher with Query Caching
  const searchCompanies = useCallback((query?: string, industry?: string): CompanyItem[] => {
    return prospectorEngine.searchProspects({
      query,
      industries: industry && industry !== 'All' ? [industry] : undefined
    });
  }, []);

  // Data Hydration & Live Sync
  const refreshData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const health = await checkApiHealth();
      if (health.status === 'ok' && health.environment !== 'browser-local') {
        setIsLiveBackend(true);
      }

      const [liveCompanies, liveSignals, liveDeals] = await Promise.allSettled([
        apiFetchCompanies(),
        apiFetchSignals(),
        apiFetchPipelineDeals()
      ]);

      if (liveCompanies.status === 'fulfilled' && liveCompanies.value && liveCompanies.value.length > 0) {
        setCompanies(liveCompanies.value);
      }
      if (liveSignals.status === 'fulfilled' && liveSignals.value && liveSignals.value.length > 0) {
        setSignals(liveSignals.value);
      }
      if (liveDeals.status === 'fulfilled' && liveDeals.value && liveDeals.value.length > 0) {
        setPipelineDeals(liveDeals.value);
      }
    } catch (_err) {
      // Graceful local engine fallback
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Deal Management
  const addDealToPipeline = useCallback(async (deal: Partial<PipelineDealItem>) => {
    const newDeal: PipelineDealItem = {
      id: `deal-${Date.now()}`,
      companyName: deal.companyName || 'New Target Account',
      domain: deal.domain || 'company.com',
      dealTitle: deal.dealTitle || 'Strategic Advisory Deal',
      serviceName: deal.serviceName || 'Core Consulting',
      dealValue: deal.dealValue || 20000,
      probability: deal.probability || 50,
      opportunityScore: deal.opportunityScore || 85,
      stage: deal.stage || 'contacted',
      stageEnteredAt: 'Just now',
      expectedCloseDate: deal.expectedCloseDate || 'In 30 days',
      ownerName: 'Ayoola Ade',
      contactName: deal.contactName || 'Decision Maker',
      contactRole: deal.contactRole || 'Executive',
      contactAvatarBg: '#eff6ff',
      contactAvatarColor: '#1d4ed8',
      lastActivity: 'Added from HUNTIQ Intelligence Engine',
      nextAction: 'Send introductory outreach',
      nextActionDueDate: 'Tomorrow',
      priority: 'High',
      activities: []
    };

    setPipelineDeals((prev) => [newDeal, ...prev]);

    try {
      await createPipelineDeal(newDeal);
    } catch (_err) {
      // Optimistic update retained
    }
  }, []);

  const updateDealStage = useCallback(async (dealId: string, newStage: PipelineStage) => {
    setPipelineDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage, stageEnteredAt: 'Just now' } : d))
    );

    try {
      await updatePipelineDeal(dealId, { stage: newStage });
    } catch (_err) {
      // Optimistic update retained
    }
  }, []);

  const toggleSaveCompany = useCallback((companyId: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, isSaved: !c.isSaved } : c))
    );
  }, []);

  const executeCopilotCommand = useCallback((prompt: string): CopilotExecutionResult => {
    return copilotEngine.executePrompt(prompt);
  }, []);

  const value = useMemo(() => ({
    currentView,
    navigateTo,
    companies,
    signals,
    opportunities,
    pipelineDeals,
    isLiveBackend,
    isDataLoading,
    refreshData,
    isCopilotOpen,
    openCopilot,
    closeCopilot,
    copilotInitialQuery,
    researchedCompany,
    activeDossier,
    openResearch,
    closeResearch,
    searchCompanies,
    addDealToPipeline,
    updateDealStage,
    toggleSaveCompany,
    executeCopilotCommand
  }), [
    currentView,
    navigateTo,
    companies,
    signals,
    opportunities,
    pipelineDeals,
    isLiveBackend,
    isDataLoading,
    refreshData,
    isCopilotOpen,
    openCopilot,
    closeCopilot,
    copilotInitialQuery,
    researchedCompany,
    activeDossier,
    openResearch,
    closeResearch,
    searchCompanies,
    addDealToPipeline,
    updateDealStage,
    toggleSaveCompany,
    executeCopilotCommand
  ]);

  return (
    <HuntiqContext.Provider value={value}>
      {children}
    </HuntiqContext.Provider>
  );
};

export const useHuntiq = () => {
  const context = useContext(HuntiqContext);
  if (!context) {
    throw new Error('useHuntiq must be used within a HuntiqProvider');
  }
  return context;
};
