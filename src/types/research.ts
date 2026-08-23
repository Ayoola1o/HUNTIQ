export type ResearchStatus = 'complete' | 'researching' | 'needs_review' | 'failed';

export interface ResearchSourceItem {
  id: string;
  sourceType: 'website' | 'linkedin' | 'press' | 'job_board' | 'sec_filing' | 'tech_lookup';
  title: string;
  sourceUrl: string;
  publishedAt: string;
  retrievedAt: string;
  claimReference: string;
  confidence: number; // 0 - 100
}

export interface ResearchDecisionMaker {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  avatarColor: string;
  influence: 'High' | 'Medium' | 'Low';
  relevance: number; // e.g. 96%
  email?: string;
  linkedin?: string;
  isBestContact?: boolean;
  reasonForContact?: string;
}

export interface ResearchSignalItem {
  id: string;
  date: string;
  type: 'hiring' | 'expansion' | 'leadership' | 'funding' | 'technology';
  title: string;
  detail: string;
  iconBg: string;
  iconColor: string;
}

export interface ResearchCompetitor {
  id: string;
  name: string;
  marketPosition: string;
  productOverlap: string;
  relationship: 'Direct Competitor' | 'Adjacent Solution' | 'Legacy Vendor';
}

export interface ResearchTechItem {
  name: string;
  category: string;
  confidence: 'Verified' | 'High' | 'Inferred';
  lastDetected: string;
}

export interface CompanyResearchReport {
  id: string;
  companyId: string;
  companyName: string;
  domain: string;
  industry: string;
  location: string;
  logoBg: string;
  logoColor: string;
  logoInitial: string;
  employees: string;
  revenue: string;
  founded: string;
  status: ResearchStatus;
  lastUpdated: string;
  opportunityScore: number;
  opportunityLevel: 'Very High' | 'High' | 'Medium' | 'Low';
  buyingIntent: 'Very High' | 'High' | 'Medium' | 'Low';
  relationship: 'New Prospect' | 'In Pipeline' | 'Past Client';
  
  // Executive Sections
  executiveSummary: string;
  companyOverview: string;
  businessModel: {
    whatTheySell: string;
    howTheyMakeMoney: string;
    targetCustomers: string;
    revenueModel: string;
  };
  currentSituation: string[];
  
  // Growth Metrics
  growth: {
    employeeGrowth: string;
    hiringCount: string;
    expansionLocations: string;
    fundingStage: string;
    revenueTrend: string;
  };

  // Technologies
  technologies: ResearchTechItem[];
  
  // Competitors
  competitors: ResearchCompetitor[];
  
  // Problems & Opportunities
  potentialProblems: {
    title: string;
    description: string;
    severity: 'High' | 'Medium';
  }[];
  potentialOpportunities: {
    serviceName: string;
    relevance: 'High' | 'Medium';
    reason: string;
  }[];

  // Why Contact Them Now?
  whyNow: {
    headline: string;
    signalCount: number;
    signals: string[];
    aiConclusion: string;
  };

  // Signals Timeline
  signalsTimeline: ResearchSignalItem[];

  // Key Decision Makers
  decisionMakers: ResearchDecisionMaker[];

  // Recommended Approach & Outreach
  recommendedApproach: {
    headline: string;
    openingAngle: string;
    relevantServices: string;
    targetPerson: string;
    timingReason: string;
  };

  // Multi-channel generated messaging
  outreachScripts: {
    email: { subject: string; body: string };
    linkedIn: { text: string };
    callScript: { intro: string; valueHook: string; close: string };
    whatsApp: { text: string };
  };

  // Provenance & Evidence
  sources: ResearchSourceItem[];
}

export interface ResearchKpiSummary {
  totalReports: number;
  inProgress: number;
  updatedThisWeek: number;
  highOpportunity: number;
}
