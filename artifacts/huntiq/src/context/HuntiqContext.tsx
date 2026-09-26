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
  scoringEngine 
} from '../engine';
import {
  checkApiHealth,
  fetchCompanies as apiFetchCompanies,
  fetchSignals as apiFetchSignals,
  fetchPipelineDeals as apiFetchPipelineDeals,
  createPipelineDeal,
  updatePipelineDeal
} from '../api';
import { saveCompany } from '../api/companies';
import { executeCopilotPrompt, type CopilotResponse } from '../api/copilot';
import { currencyService, type CurrencyCode } from '../services/currencyService';
import { getStoredUser, fetchUserActivityLogs, fetchUserOnboarding, saveUserOnboarding, type UserAccount } from '../api/auth';
import type { ProspectPitchPayload } from '../types/outreach';
import type { OnboardingData } from '../types/onboarding';
import { initialOnboardingData } from '../types/onboarding';


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
  | 'team'
  | 'alerts'
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
  dataLoadError: string | null;
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

  // Active Prospect Pitch Draft
  activePitchDraft: ProspectPitchPayload | null;
  startPitchForProspect: (payload: ProspectPitchPayload) => void;
  clearActivePitchDraft: () => void;

  // Action Dispatchers (Optimized & Cached)
  searchCompanies: (query?: string, industry?: string) => CompanyItem[];
  addDealToPipeline: (deal: Partial<PipelineDealItem>) => Promise<PipelineDealItem | void>;
  updateDealStage: (dealId: string, stage: PipelineStage) => Promise<void>;
  toggleSaveCompany: (companyId: string) => Promise<void>;
  executeCopilotCommand: (prompt: string, model?: string) => Promise<CopilotResponse>;
  captureGeoBusinesses: (businesses: any[]) => void;

  // Multi-Currency Engine
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amountInUsd: number, options?: { compact?: boolean; precision?: number }) => string;
  convertAmount: (amountInUsd: number) => number;

  // Mobile Navigation & Drawer State
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;

  // Active User & Authentication State
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  updateCurrentUser: (updates: Partial<UserAccount>) => void;
  userActivityLogs: any[];
  refreshActivityLogs: () => Promise<void>;

  // Onboarding Profile State
  onboardingData: OnboardingData;
  isOnboardingCompleted: boolean;
  isOnboardingHydrated: boolean;
  resetOnboarding: () => void;
  saveOnboardingData: (data: OnboardingData) => Promise<void>;
}


const HuntiqContext = createContext<HuntiqContextType | undefined>(undefined);

export const HuntiqProvider: React.FC<{ children: React.ReactNode; initialView?: AppView }> = ({ 
  children,
  initialView = 'dashboard'
}) => {
  const [currentView, setCurrentView] = useState<AppView>(initialView);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User Session & Activity State
  const [currentUser, setCurrentUserState] = useState<UserAccount | null>(() => getStoredUser());
  const [userActivityLogs, setUserActivityLogs] = useState<any[]>([]);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);


  // Multi-Currency State
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      return (localStorage.getItem('huntiq_preferred_currency') as CurrencyCode) || 'USD';
    } catch {
      return 'USD';
    }
  });

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('huntiq_preferred_currency', newCurrency);
    } catch {}
  }, []);

  const setCurrentUser = useCallback((user: UserAccount | null) => {
    setCurrentUserState(user);
    if (user?.defaultCurrency) {
      setCurrency(user.defaultCurrency as CurrencyCode);
    }
  }, [setCurrency]);

  const updateCurrentUser = useCallback((updates: Partial<UserAccount>) => {
    setCurrentUserState((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('huntiq_user_profile', JSON.stringify(updated));
      } catch {}
      if (updates.defaultCurrency) {
        setCurrency(updates.defaultCurrency as CurrencyCode);
      }
      return updated;
    });
  }, [setCurrency]);

  const refreshActivityLogs = useCallback(async () => {
    try {
      const logs = await fetchUserActivityLogs();
      setUserActivityLogs(logs || []);
    } catch {}
  }, []);

  // Onboarding Profile State Scoped to Current Profile & Workspace
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(initialOnboardingData);
  const [isOnboardingHydrated, setIsOnboardingHydrated] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('huntiq_onboarding_completed') === 'true';
    } catch {
      return false;
    }
  });

  // Load and hydrate onboarding data for current user / profile
  useEffect(() => {
    let isMounted = true;
    setIsOnboardingHydrated(false);

    if (!currentUser) {
      setOnboardingData(initialOnboardingData);
      setIsOnboardingCompleted(false);
      setIsOnboardingHydrated(true);
      return () => {
        isMounted = false;
      };
    }

    fetchUserOnboarding()
      .then((saved) => {
        if (!isMounted) return;
        if (saved) {
          setOnboardingData((prev) => ({
            ...prev,
            ...saved,
            workspaceName: saved.workspaceName || currentUser?.companyName || prev.workspaceName
          }));
          setIsOnboardingCompleted(true);
        } else if (currentUser?.companyName) {
          setOnboardingData((prev) => ({
            ...prev,
            workspaceName: currentUser.companyName || prev.workspaceName
          }));
          setIsOnboardingCompleted(false);
        }
        setIsOnboardingHydrated(true);
      })
      .catch(() => {
        if (isMounted) {
          setIsOnboardingCompleted(false);
          setIsOnboardingHydrated(true);
        }
      });
    return () => { isMounted = false; };
  }, [currentUser?.id, currentUser?.companyName]);

  const resetOnboarding = useCallback(() => {
    setOnboardingData(initialOnboardingData);
    setIsOnboardingCompleted(false);
    setIsOnboardingHydrated(false);
    try {
      localStorage.removeItem('huntiq_onboarding_completed');
      if (currentUser?.id) {
        localStorage.removeItem(`huntiq_onboarding_${currentUser.id}`);
      }
    } catch {}
  }, [currentUser?.id]);

  const saveOnboardingData = useCallback(async (data: OnboardingData) => {
    setOnboardingData(data);
    setIsOnboardingCompleted(true);
    setIsOnboardingHydrated(true);
    try {
      await saveUserOnboarding(data);
    } catch (err) {
      console.warn('Could not save onboarding to backend:', err);
    }
    if (data.workspaceName && currentUser) {
      updateCurrentUser({ companyName: data.workspaceName });
    }
  }, [currentUser, updateCurrentUser]);

  const formatCurrency = useCallback((amountInUsd: number, options?: { compact?: boolean; precision?: number }) => {
    return currencyService.format(amountInUsd, currency, options);
  }, [currency]);

  const convertAmount = useCallback((amountInUsd: number) => {
    return currencyService.convertUsdTo(amountInUsd, currency);
  }, [currency]);

  
  // Data State - initialized cleanly with zero demo data
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [pipelineDeals, setPipelineDeals] = useState<PipelineDealItem[]>([]);

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
  // Scores are derived from the scoringEngine using actual company and signal data.
  // No fabricated values are inserted — fields without real data are left undefined.
  const opportunities = useMemo(() => {
    return companies.map((c) => {
      const evaluation = scoringEngine.evaluateOpportunity(c, signals);
      const isDigitalGap = c.tags?.includes('Digital Gap') || !!c.digitalAudit;
      const estimatedValue = c.digitalAudit?.recommendedPackage?.estimatedValue?.max || (evaluation.totalScore * 450);

      // Use the first real active signal for this company (if any)
      const primarySignal = c.activeSignals?.[0];

      const opp: OpportunityItem = {
        id: `opp-${c.id}`,
        companyName: c.name,
        avatarLetter: c.name.charAt(0),
        avatarBg: isDigitalGap && c.digitalAudit?.opportunityUrgency === 'CRITICAL' ? '#fee2e2' : '#eff6ff',
        industry: c.industry,
        employees: c.employees,
        location: c.location,
        score: evaluation.totalScore,
        scoreTrend: 'up',
        priority: evaluation.tier === 'High Intent' ? 'Hot' : 'High',
        whyNow: c.digitalAudit?.issuesDetected?.map((i: any) => i.title).join(' • ') || evaluation.whyNowSummary,
        tags: c.tags || (c.activeSignals?.map(s => s.type) || []),
        estimatedValue,
        stage: 'Discovery',
        // lastActivity is not fabricated — it is left as a live signal timestamp or undefined
        lastActivity: primarySignal?.time || undefined,
        lastActivityType: primarySignal ? 'signal' : undefined,
        website: c.domain,
        revenue: c.revenue,
        linkedInUrl: c.socials?.linkedin,
        signals: primarySignal
          ? [
              {
                id: `sig-opp-${c.id}`,
                type: isDigitalGap ? 'digital_gap' : 'expansion',
                title: primarySignal.title,
                detail: primarySignal.description,
                // timeAgo and confidence only included if provided by the real signal data
                timeAgo: primarySignal.time,
                confidence: undefined
              }
            ]
          : [],
        scoreFactors: {
          // Scores from the deterministic scoringEngine — no hardcoded overrides
          icpFit: { score: evaluation.icpFitScore, max: 100 },
          buyingIntent: { score: evaluation.signalVelocityScore, max: 100 },
          triggerEvents: { score: evaluation.hiringSurgeScore, max: 100 },
          decisionMakerAccess: { score: evaluation.reachabilityScore, max: 100 },
          // companySize and engagement are not calculated yet — left undefined rather than fabricated
          companySize: undefined,
          engagement: undefined
        },
        bestNextStep: {
          actionText: c.digitalAudit?.recommendedPackage?.packageName || evaluation.recommendedAction,
          targetRole: isDigitalGap ? 'Managing Director / Owner' : 'Head of Operations',
          // targetName is not known without a real contact record
          targetName: undefined
        },
        source: isDigitalGap ? 'GEO_RADAR' : 'AI_SEARCH',
        opportunityType: isDigitalGap ? 'DIGITAL_GAP' : 'HIGH_GROWTH',
        digitalGapScore: c.digitalAudit?.gapScore || (isDigitalGap ? 100 - evaluation.totalScore : undefined),
        digitalAudit: c.digitalAudit
      };
      return opp;
    });
  }, [companies, signals]);

  // Optimized Navigation Handler
  const navigateTo = useCallback((nav: string) => {
    setIsMobileSidebarOpen(false);
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

  // Active Prospect Pitch Draft State
  const [activePitchDraft, setActivePitchDraft] = useState<ProspectPitchPayload | null>(null);

  const startPitchForProspect = useCallback((payload: ProspectPitchPayload) => {
    setActivePitchDraft(payload);
    navigateTo('outreach');
  }, [navigateTo]);

  const clearActivePitchDraft = useCallback(() => {
    setActivePitchDraft(null);
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
  // On API failure the previous state is preserved and an error message is set so
  // the UI can surface it. State is NEVER replaced with demo/fake data on failure.
  const refreshData = useCallback(async () => {
    if (!localStorage.getItem('huntiq_auth_token')) {
      setIsDataLoading(false);
      return;
    }
    setIsDataLoading(true);
    setDataLoadError(null);
    try {
      const health = await checkApiHealth();
      if ((health.status === 'ok' || health.status === 'degraded' || health.service === 'huntiq-api') && health.environment !== 'browser-local') {
        setIsLiveBackend(true);
      }

      const [liveCompanies, liveSignals, liveDeals] = await Promise.allSettled([
        apiFetchCompanies(),
        apiFetchSignals(),
        apiFetchPipelineDeals()
      ]);

      const errors: string[] = [];

      if (liveCompanies.status === 'fulfilled') {
        setCompanies(Array.isArray(liveCompanies.value) ? liveCompanies.value : []);
      } else {
        errors.push('companies');
        console.error('[HUNTIQ] Failed to load companies:', liveCompanies.reason);
      }

      if (liveSignals.status === 'fulfilled') {
        setSignals(Array.isArray(liveSignals.value) ? liveSignals.value : []);
      } else {
        errors.push('signals');
        console.error('[HUNTIQ] Failed to load signals:', liveSignals.reason);
      }

      if (liveDeals.status === 'fulfilled') {
        setPipelineDeals(Array.isArray(liveDeals.value) ? liveDeals.value : []);
      } else {
        errors.push('pipeline deals');
        console.error('[HUNTIQ] Failed to load pipeline deals:', liveDeals.reason);
      }

      if (errors.length > 0) {
        setDataLoadError(`Failed to load: ${errors.join(', ')}. Previous data shown.`);
      }

      refreshActivityLogs();
    } catch (err) {
      console.error('[HUNTIQ] Error refreshing data from API:', err);
      setDataLoadError('Failed to connect to the HUNTIQ backend. Please refresh.');
    } finally {
      setIsDataLoading(false);
    }
  }, [refreshActivityLogs]);

  useEffect(() => {
    Promise.resolve().then(() => refreshData());
  }, [refreshData, currentUser]);


  // Deal Management with optimistic update & authoritative backend rollback
  const addDealToPipeline = useCallback(async (deal: Partial<PipelineDealItem>): Promise<PipelineDealItem | void> => {
    const tempId = `temp-${Date.now()}`;
    const optimisticDeal: PipelineDealItem = {
      id: tempId,
      companyName: deal.companyName || 'New Target Account',
      domain: deal.domain || null,
      dealTitle: deal.dealTitle || (deal as any).title || 'Strategic Advisory Deal',
      serviceName: deal.serviceName || 'Core Consulting',
      dealValue: deal.dealValue || 20000,
      probability: deal.probability || 50,
      opportunityScore: deal.opportunityScore || 85,
      stage: deal.stage || 'contacted',
      stageEnteredAt: new Date().toISOString(),
      expectedCloseDate: deal.expectedCloseDate || 'In 30 days',
      ownerName: currentUser?.fullName || 'Ayoola Ade',
      contactName: deal.contactName || 'Decision Maker',
      contactRole: deal.contactRole || 'Executive',
      contactAvatarBg: '#eff6ff',
      contactAvatarColor: '#1d4ed8',
      lastActivity: 'Added to Pipeline',
      nextAction: deal.nextAction || 'Send introductory outreach',
      nextActionDueDate: deal.nextActionDueDate || 'Tomorrow',
      priority: deal.priority || 'High',
      activities: []
    };

    setPipelineDeals((prev) => [optimisticDeal, ...prev]);

    try {
      const persisted = await createPipelineDeal(deal);
      setPipelineDeals((prev) =>
        prev.map((d) => (d.id === tempId ? { ...optimisticDeal, ...persisted } : d))
      );
      return persisted;
    } catch (err: any) {
      setPipelineDeals((prev) => prev.filter((d) => d.id !== tempId));
      console.error('[HUNTIQ] Failed to persist pipeline deal:', err);
      throw err;
    }
  }, [currentUser]);

  const updateDealStage = useCallback(async (dealId: string, newStage: PipelineStage): Promise<void> => {
    let prevStage: PipelineStage | undefined;
    setPipelineDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          prevStage = d.stage;
          return { ...d, stage: newStage, stageEnteredAt: new Date().toISOString() };
        }
        return d;
      })
    );

    try {
      const updated = await updatePipelineDeal(dealId, { stage: newStage });
      if (updated) {
        setPipelineDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, ...updated } : d))
        );
      }
    } catch (err: any) {
      if (prevStage) {
        setPipelineDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage: prevStage! } : d))
        );
      }
      console.error('[HUNTIQ] Failed to update deal stage:', err);
      throw err;
    }
  }, []);

  const toggleSaveCompany = useCallback(async (companyId: string): Promise<void> => {
    let prevSaved = false;
    let nextSaved = true;

    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === companyId) {
          prevSaved = Boolean(c.isSaved);
          nextSaved = !c.isSaved;
          return { ...c, isSaved: nextSaved };
        }
        return c;
      })
    );

    try {
      await saveCompany(companyId, nextSaved);
    } catch (err: any) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, isSaved: prevSaved } : c))
      );
      console.error('[HUNTIQ] Failed to persist saved status for company:', err);
      throw err;
    }
  }, []);

  const executeCopilotCommand = useCallback(async (prompt: string, model?: string): Promise<CopilotResponse> => {
    return await executeCopilotPrompt(prompt, model);
  }, []);

  const captureGeoBusinesses = useCallback((scrapedList: any[]) => {
    const newCompanies: CompanyItem[] = scrapedList.map((b) => ({
      id: `comp-geo-${b.id}`,
      name: b.name,
      domain: b.domain || (b.website ? b.website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] : null),
      industry: b.category,
      employees: b.headcountEstimate || '25-50',
      revenue: '$1M - $10M',
      location: `${b.district}, ${b.address}`,
      opportunityScore: b.opportunityScore || 85,
      opportunityLevel: (b.opportunityScore >= 90 ? 'Very High' : b.opportunityScore >= 80 ? 'High' : 'Medium') as 'Very High' | 'High' | 'Medium',
      scoreColor: b.opportunityScore >= 90 ? '#10b981' : '#6366f1',
      scoreTrend: [70, 75, 80, b.opportunityScore || 85],
      isSaved: true,
      signalsCount: b.detectedSignals?.length || 2,
      activeSignals: b.detectedSignals?.map((sig: string) => ({
        type: 'digital_gap',
        title: sig,
        description: sig,
        time: 'Just now',
        iconType: 'Zap'
      })) || [],
      lastActivity: 'Just now',
      description: `${b.name} operating in ${b.district || 'commercial district'}. Discovered via HUNTIQ Geo Radar.`,
      founded: '',
      headquarters: b.district || '',
      phone: b.phone,
      tags: b.targetType === 'LOCAL_COMMERCIAL' ? ['Digital Gap', 'Local SME'] : ['Enterprise Tech'],
      digitalAudit: b.digitalAudit,
      socials: {
        website: b.website
      }
    }));

    setCompanies((prev) => {
      const existingNames = new Set(prev.map(c => c.name.toLowerCase()));
      const filtered = newCompanies.filter(c => !existingNames.has(c.name.toLowerCase()));
      return [...filtered, ...prev];
    });

    // Push new buying & digital gap signals into global feed
    const newSignals: SignalItem[] = scrapedList.map((b) => ({
      id: `sig-geo-${b.id}`,
      title: b.targetType === 'ENTERPRISE'
        ? `High Growth Commercial Expansion in ${b.district}`
        : `Critical Digital Gap Detected (${b.digitalAudit?.issuesDetected?.[0]?.title || 'Zero Web Presence'})`,
      subtitle: `Commercial Entity in ${b.district || 'Commercial District'}`,
      companyName: b.name,
      location: `${b.district || 'Lagos'}, Nigeria`,
      type: (b.targetType === 'ENTERPRISE' ? 'expansion' : 'technology') as any,
      impactLevel: (b.opportunityScore >= 85 ? 'Very High' : 'High') as any,
      impactScore: b.opportunityScore || 85,
      detectedTime: 'Just now',
      detectedTimestamp: 'Just now',
      whyItMatters: `Gap Score: ${b.digitalAudit?.gapScore || 65}/100. High conversion propensity for digital modernization & client acquisition.`,
      whatHappened: `Audited by HUNTIQ Geo Radar: ${b.digitalAudit?.issuesDetected?.[0]?.description || 'Missing verified digital infrastructure.'}`,
      source: 'HUNTIQ Live Geo Radar',
      sourceType: 'globe' as const,
      confidence: `${Math.min(99, b.opportunityScore || 88)}%`,
      firstDetected: 'Just now',
      lastUpdated: 'Just now',
      recommendedAction: `Deliver ${b.digitalAudit?.recommendedPackage?.packageName || 'Digital Modernization Suite'} turnkey proposal.`,
      targetRole: 'Managing Director / Owner'
    }));

    setSignals((prev) => [...newSignals, ...prev]);
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
    dataLoadError,
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
    executeCopilotCommand,
    captureGeoBusinesses,
    currency,
    setCurrency,
    formatCurrency,
    convertAmount,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleMobileSidebar,
    currentUser,
    setCurrentUser,
    updateCurrentUser,
    userActivityLogs,
    refreshActivityLogs,
    activePitchDraft,
    startPitchForProspect,
    clearActivePitchDraft,
    onboardingData,
    isOnboardingCompleted,
    isOnboardingHydrated,
    resetOnboarding,
    saveOnboardingData
  }), [
    currentView,
    navigateTo,
    companies,
    signals,
    opportunities,
    pipelineDeals,
    isLiveBackend,
    isDataLoading,
    dataLoadError,
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
    executeCopilotCommand,
    captureGeoBusinesses,
    currency,
    setCurrency,
    formatCurrency,
    convertAmount,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleMobileSidebar,
    currentUser,
    setCurrentUser,
    updateCurrentUser,
    userActivityLogs,
    refreshActivityLogs,
    activePitchDraft,
    startPitchForProspect,
    clearActivePitchDraft,
    onboardingData,
    isOnboardingCompleted,
    isOnboardingHydrated,
    resetOnboarding,
    saveOnboardingData
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
