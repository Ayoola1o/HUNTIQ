import type { CompanyItem } from '../types/company';
import type { OpportunityItem } from '../types/opportunity';
import type { SignalItem } from '../types/signal';

export type SignalCategory = 
  | 'hiring' 
  | 'funding' 
  | 'expansion' 
  | 'leadership' 
  | 'technology' 
  | 'news' 
  | 'compliance';

export interface ScoreBreakdown {
  totalScore: number;
  tier: 'High Intent' | 'Medium Intent' | 'Low Intent';
  icpFitScore: number;
  signalVelocityScore: number;
  hiringSurgeScore: number;
  reachabilityScore: number;
  whyNowSummary: string;
  recommendedAction: string;
}

export interface ProspectSearchParams {
  query?: string;
  industries?: string[];
  locations?: string[];
  headcountMin?: number;
  headcountMax?: number;
  hasSignals?: boolean;
  minOpportunityScore?: number;
}

export interface ResearchDossier {
  company: CompanyItem;
  executiveSummary: string;
  painPoints: string[];
  growthDrivers: string[];
  hiringFocus: { role: string; count: number; department: string }[];
  techStack: string[];
  decisionMakers: {
    name: string;
    role: string;
    department: string;
    email: string;
    phone?: string;
    linkedin: string;
    confidence: number;
  }[];
  triggerEvents: SignalItem[];
  recommendedPitch: {
    hook: string;
    valueProposition: string;
    objectionHandling: string;
  };
}

export interface GeneratedOutreach {
  email: {
    subject: string;
    body: string;
    followUpBody: string;
  };
  linkedin: {
    connectionNote: string;
    inMailMessage: string;
  };
  callScript: {
    opening: string;
    elevatorPitch: string;
    qualifyingQuestions: string[];
    closingAsk: string;
  };
}

export type CopilotIntentType = 
  | 'SEARCH' 
  | 'RESEARCH' 
  | 'PRIORITIZE' 
  | 'ANALYZE' 
  | 'CRM_ACTION' 
  | 'OUTREACH' 
  | 'REPORT' 
  | 'MARKET_INTEL' 
  | 'NAVIGATE' 
  | 'UNKNOWN';

export interface CopilotExecutionResult {
  intent: CopilotIntentType;
  message: string;
  actionTaken?: string;
  targetView?: string;
  companies?: CompanyItem[];
  opportunities?: OpportunityItem[];
  signals?: SignalItem[];
  researchData?: ResearchDossier;
  outreachData?: GeneratedOutreach;
  suggestedFollowUps?: string[];
}
