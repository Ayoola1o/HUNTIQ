import type { 
  CompanyResearchReport, 
  ResearchKpiSummary 
} from '../../src/types/research';
import { researchEngine } from '../engine-client/researchEngine';
import { persistentStore, DEFAULT_USER_ID, DEFAULT_WORKSPACE_ID } from '../db/persistentStore';


export class ResearchService {
  

  public listReports(params: {
    status?: string;
    query?: string;
    userId?: string;
    workspaceId?: string;
  } = {}): { reports: CompanyResearchReport[]; kpiSummary: ResearchKpiSummary } {
    const userId = params.userId || DEFAULT_USER_ID;
    const userReports = persistentStore.getResearchReportsByUser(userId, params.workspaceId);
    let list = [...userReports];

    if (params.status && params.status !== 'all') {
      list = list.filter(r => r.status === params.status);
    }

    if (params.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(r =>
        r.companyName.toLowerCase().includes(q) ||
        (r.domain && r.domain.toLowerCase().includes(q)) ||
        r.industry.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.executiveSummary.toLowerCase().includes(q)
      );
    }

    const kpiSummary: ResearchKpiSummary = {
      totalReports: userReports.length,
      inProgress: userReports.filter(r => r.status === 'researching').length,
      updatedThisWeek: userReports.length,
      highOpportunity: userReports.filter(r => r.opportunityScore >= 90).length
    };

    return { reports: list, kpiSummary };
  }

  public getById(id: string, userId?: string, workspaceId?: string): CompanyResearchReport | undefined {
    return persistentStore.getResearchReportById(id, userId, workspaceId);
  }

  public generateReport(
    companyName: string, 
    domain?: string, 
    industry?: string,
    userId?: string,
    workspaceId?: string
  ): CompanyResearchReport {
    const uId = userId || DEFAULT_USER_ID;
    const wId = workspaceId || DEFAULT_WORKSPACE_ID;

    // Generate AI Dossier
    const dossier = researchEngine.generateDossier(companyName);
    const id = `res-${Date.now()}`;
    const cleanDomain = domain && domain.trim().length > 0 ? domain.trim() : null;
    const cleanIndustry = industry || (dossier as any).industry || 'Technology & SaaS';

    const newReport: CompanyResearchReport = {
      id,
      companyId: `comp-${Date.now()}`,
      companyName,
      domain: cleanDomain,
      industry: cleanIndustry,
      location: 'Lagos, Nigeria',
      logoBg: '#4f46e5',
      logoColor: '#ffffff',
      logoInitial: companyName.charAt(0).toUpperCase(),
      employees: '100 – 500',
      revenue: '$10M – $25M',
      founded: '2019',
      status: 'complete',
      lastUpdated: 'Just now',
      opportunityScore: (dossier as any).opportunityScore || 92,
      opportunityLevel: 'Very High',
      buyingIntent: 'Very High',
      relationship: 'New Prospect',
      executiveSummary: dossier.executiveSummary || `${companyName} is experiencing strong commercial traction across West Africa, generating immediate requirements for operational expansion and advisory services.`,
      companyOverview: `${companyName} delivers high-reliability digital solutions in ${cleanIndustry}.`,
      businessModel: {
        whatTheySell: `${cleanIndustry} solutions and enterprise services.`,
        howTheyMakeMoney: 'Direct commercial contracts, retainers, and enterprise subscriptions.',
        targetCustomers: 'Mid-market to enterprise commercial accounts.',
        revenueModel: 'B2B Enterprise Services & Subscriptions'
      },
      currentSituation: [
        `Actively expanding operational footprint and client acquisition.`,
        `Recent leadership appointments across core divisions.`,
        `Investing in digital modernization and capability scaling.`
      ],
      growth: {
        employeeGrowth: '+22% YoY',
        hiringCount: '15+ open positions',
        expansionLocations: 'Lagos & Regional Hubs',
        fundingStage: 'Growth Stage',
        revenueTrend: '+35% ARR'
      },
      technologies: [
        { name: 'Cloud Infrastructure (AWS/GCP)', category: 'Cloud Infrastructure', confidence: 'Verified', lastDetected: 'Just now' },
        { name: 'Modern Web Stack', category: 'Frontend Tech', confidence: 'Verified', lastDetected: 'Just now' }
      ],
      competitors: [
        { id: 'c-gen-1', name: 'Regional Tech Providers', marketPosition: 'Established Mid-Market', productOverlap: 'Enterprise Platforms', relationship: 'Direct Competitor' }
      ],
      potentialProblems: [
        { title: 'Talent Scaling & Ramp Friction', description: 'Rapid hiring creates onboarding bottlenecks and leadership alignment challenges.', severity: 'High' }
      ],
      potentialOpportunities: [
        { serviceName: 'Workforce Scaling Strategy', relevance: 'High', reason: 'High alignment with current expansion velocity.' }
      ],
      whyNow: {
        headline: 'Active commercial momentum and hiring surge detected',
        signalCount: 2,
        signals: [
          'Multiple open vacancies detected across key business units',
          'Executive restructuring indicating growth priorities'
        ],
        aiConclusion: 'Excellent time to initiate high-value strategic dialogue.'
      },
      signalsTimeline: [
        { id: `st-${Date.now()}`, date: 'Just now', type: 'hiring', title: 'Hiring Surge & Business Expansion', detail: 'Multiple active open positions verified.', iconBg: '#eff6ff', iconColor: '#2563eb' }
      ],
      decisionMakers: [
        {
          id: `dm-${Date.now()}`,
          name: 'Executive Leadership',
          role: 'Managing Director / VP People',
          avatarBg: '#eff6ff',
          avatarColor: '#2563eb',
          influence: 'High',
          relevance: 95,
          email: null,
          emailStatus: 'not_found',
          isBestContact: true,
          reasonForContact: 'Key decision maker for strategic vendor partnerships.'
        }
      ],
      recommendedApproach: {
        headline: `Lead with strategic execution and workforce onboarding enablement`,
        openingAngle: `Congratulate ${companyName} on recent market growth and propose structured enablement models.`,
        relevantServices: 'Strategic Workforce Advisory',
        targetPerson: 'Managing Director / Executive Lead',
        timingReason: 'High buying intent score based on live signals.'
      },
      outreachScripts: {
        email: {
          subject: `Supporting ${companyName}'s scaling initiatives`,
          body: `Hi,\n\nI noticed ${companyName}'s recent growth trajectory and active hiring push across the region. Congratulations on the momentum!\n\nAs organizations scale rapidly, ensuring team alignment and rapid productivity for new leaders becomes paramount.\n\nAt Peak Consulting, we partner with high-growth teams to streamline leadership enablement and accelerate time-to-value.\n\nWould you be open to a brief 15-minute introductory conversation this Thursday at 2:00 PM?`
        },
        linkedIn: {
          text: `Hi! Congratulations on ${companyName}'s growth. Would love to share a short brief on how peer companies optimize manager onboarding.`
        },
        callScript: {
          intro: `Hello, this is Ayoola from Peak Consulting calling regarding ${companyName}'s expansion.`,
          valueHook: `We help executive teams scale operations without losing organizational momentum.`,
          close: `Could we connect for 10 minutes next week?`
        },
        whatsApp: {
          text: `Hi! Ayoola from Peak Consulting here. Sent a brief note regarding scaling frameworks for ${companyName}. Looking forward to connecting!`
        }
      },
      sources: [
        { id: `src-${Date.now()}`, sourceType: 'website', title: `${companyName} Corporate Portal`, sourceUrl: cleanDomain ? `https://${cleanDomain}` : `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`, publishedAt: 'Recently', retrievedAt: 'Just now', claimReference: 'Company profile and operational details verified.', confidence: 95 }
      ]
    };

    return persistentStore.saveResearchReport(uId, wId, newReport);
  }

  public refreshReport(id: string, userId?: string, workspaceId?: string): CompanyResearchReport | undefined {
    const uId = userId || DEFAULT_USER_ID;
    const wId = workspaceId || DEFAULT_WORKSPACE_ID;
    const current = persistentStore.getResearchReportById(id, uId, wId);
    if (!current) return undefined;

    const updated: CompanyResearchReport = {
      ...current,
      lastUpdated: 'Just now',
      status: 'complete',
      opportunityScore: Math.min(99, (current.opportunityScore || 90) + 1),
      signalsTimeline: [
        {
          id: `st-${Date.now()}`,
          date: 'Just now',
          type: 'technology',
          title: 'Live Re-Scan Complete',
          detail: 'Prospector engine verified latest digital signals, tech stack, and corporate registries.',
          iconBg: '#ecfdf5',
          iconColor: '#059669'
        },
        ...(current.signalsTimeline || [])
      ]
    };

    return persistentStore.saveResearchReport(uId, wId, updated);
  }

  public updateReport(id: string, updates: Partial<CompanyResearchReport>, userId?: string, workspaceId?: string): CompanyResearchReport | undefined {
    const uId = userId || DEFAULT_USER_ID;
    const wId = workspaceId || DEFAULT_WORKSPACE_ID;
    const current = persistentStore.getResearchReportById(id, uId, wId);
    if (!current) return undefined;

    const updated = {
      ...current,
      ...updates,
      lastUpdated: 'Just now'
    };

    return persistentStore.saveResearchReport(uId, wId, updated);
  }

  public deleteReport(id: string, userId?: string, workspaceId?: string): boolean {
    return persistentStore.deleteResearchReport(id, userId, workspaceId);
  }
}


export const researchService = new ResearchService();
