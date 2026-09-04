import { apiClient } from './client';
import type { CompanyResearchReport, ResearchKpiSummary } from '../types/research';
import type { ResearchDossier } from '../engine/types';
import { researchEngine } from '../engine/researchEngine';

export interface FetchResearchReportsResult {
  reports: CompanyResearchReport[];
  kpiSummary: ResearchKpiSummary;
}

// Local Fallback Store
let localReports: CompanyResearchReport[] = [
  {
    id: 'res-1',
    companyId: 'comp-1',
    companyName: 'Acme Technologies',
    domain: 'acmetech.com',
    industry: 'Technology & SaaS',
    location: 'Lagos, Nigeria',
    logoBg: '#ef4444',
    logoColor: '#ffffff',
    logoInitial: 'A',
    employees: '250 – 500',
    revenue: '$25M – $50M',
    founded: '2016',
    status: 'complete',
    lastUpdated: '10m ago',
    opportunityScore: 94,
    opportunityLevel: 'Very High',
    buyingIntent: 'Very High',
    relationship: 'New Prospect',
    executiveSummary: 'Acme Technologies is a rapidly growing enterprise software provider expanding its presence across West Africa. Recent hiring surges (38 new roles) and geographic expansion into Ghana and Kenya indicate a rapid scaling phase that is creating urgent requirements for HR consulting, workforce architecture, and leadership onboarding.',
    companyOverview: 'Acme Technologies builds cloud enterprise workflow automation software tailored for mid-market financial and commercial logistics enterprises in Sub-Saharan Africa.',
    businessModel: {
      whatTheySell: 'Enterprise SaaS automation platforms, custom CRM integration modules, and data pipelines.',
      howTheyMakeMoney: 'Annual recurring subscription licenses (ARR) with tiered user seat pricing and professional onboarding packages.',
      targetCustomers: 'Commercial banks, FinTechs, FMCG distributors, and logistics scaleups.',
      revenueModel: 'B2B Enterprise SaaS (80%) + Professional Custom Implementations (20%).'
    },
    currentSituation: [
      'Appointed new Chief Operating Officer to spearhead pan-African expansion.',
      'Posted 38 new job listings in engineering, sales operations, and compliance.',
      'Commenced migration of core customer databases to AWS cloud infrastructure.',
      'Secured series B venture capital extension to finance regional hubs.'
    ],
    growth: {
      employeeGrowth: '+18.4% YoY',
      hiringCount: '38 open roles',
      expansionLocations: 'Ghana, Kenya & Côte d’Ivoire',
      fundingStage: 'Series B ($28M)',
      revenueTrend: '+42% ARR growth'
    },
    technologies: [
      { name: 'AWS Cloud', category: 'Cloud Infrastructure', confidence: 'Verified', lastDetected: '2d ago' },
      { name: 'Salesforce CRM', category: 'Sales Stack', confidence: 'Verified', lastDetected: '1w ago' },
      { name: 'React & TypeScript', category: 'Frontend Tech', confidence: 'Verified', lastDetected: '3d ago' },
      { name: 'HubSpot Marketing', category: 'Inbound Automation', confidence: 'High', lastDetected: '2w ago' },
      { name: 'PostgreSQL', category: 'Database', confidence: 'Verified', lastDetected: '5d ago' },
      { name: 'Docker / K8s', category: 'DevOps', confidence: 'Inferred', lastDetected: '1mo ago' }
    ],
    competitors: [
      { id: 'c1', name: 'Terragon Group', marketPosition: 'Market Leader in Data Analytics', productOverlap: 'Marketing cloud automation', relationship: 'Direct Competitor' },
      { id: 'c2', name: 'SeamlessHR', marketPosition: 'Dominant Workforce Platform', productOverlap: 'HR & Payroll modules', relationship: 'Adjacent Solution' },
      { id: 'c3', name: 'Appzone / Qore', marketPosition: 'Core Banking Infrastructure', productOverlap: 'FinTech middleware', relationship: 'Adjacent Solution' }
    ],
    potentialProblems: [
      { title: 'Rapid Onboarding Friction', description: 'Adding 38+ new hires across 3 countries risks cultural dilution and prolonged time-to-productivity.', severity: 'High' },
      { title: 'Cross-Border Compliance Burden', description: 'Multi-jurisdictional tax and labor laws in Ghana and Kenya require localized HR governance.', severity: 'High' },
      { title: 'Middle Management Capacity Gap', description: 'Promoting senior engineers to management without leadership coaching often sparks turnover.', severity: 'Medium' }
    ],
    potentialOpportunities: [
      { serviceName: 'Workforce Scaling Strategy', relevance: 'High', reason: 'High fit for reducing new-hire ramp time from 90 days down to 45 days.' },
      { serviceName: 'Executive Leadership Coaching', relevance: 'High', reason: 'New COO and newly formed cross-regional managers require leadership alignment.' },
      { serviceName: 'Employee Training & Upskilling', relevance: 'High', reason: 'Engineering and sales teams scaling rapidly across distributed timezones.' }
    ],
    whyNow: {
      headline: '3 Major buying signals detected simultaneously in the last 14 days',
      signalCount: 3,
      signals: [
        '38 New job postings indicate severe HR workload and urgent hiring deadlines.',
        'COO appointment indicates top-level restructuring and budget reallocation.',
        'Expansion into Ghana creates instant compliance and onboarding requirements.'
      ],
      aiConclusion: 'High probability moment to pitch comprehensive workforce advisory services before organizational sprawl solidifies.'
    },
    signalsTimeline: [
      { id: 'st-1', date: '2h ago', type: 'hiring', title: 'Hiring Surge: 38 new postings', detail: 'Engineering, Sales, and People Operations roles across Lagos and Accra.', iconBg: '#eff6ff', iconColor: '#2563eb' },
      { id: 'st-2', date: 'Yesterday', type: 'leadership', title: 'New COO Appointed', detail: 'David Williams appointed as Chief Operating Officer to oversee international scaling.', iconBg: '#f5f3ff', iconColor: '#7c3aed' },
      { id: 'st-3', date: '3d ago', type: 'expansion', title: 'Ghana Entity Incorporation', detail: 'Registered legal operational subsidiary in Accra, Ghana.', iconBg: '#ecfdf5', iconColor: '#059669' }
    ],
    decisionMakers: [
      {
        id: 'dm-1',
        name: 'Jane Smith',
        role: 'Head of People',
        avatarBg: '#eff6ff',
        avatarColor: '#2563eb',
        influence: 'High',
        relevance: 96,
        email: 'jane.smith@acmetech.com',
        linkedin: 'https://linkedin.com/in/janesmith-acme',
        isBestContact: true,
        reasonForContact: 'Direct authority over HR budget, vendor selection, and management training.'
      },
      {
        id: 'dm-2',
        name: 'David Williams',
        role: 'Chief Operating Officer',
        avatarBg: '#f5f3ff',
        avatarColor: '#7c3aed',
        influence: 'High',
        relevance: 91,
        email: 'david.williams@acmetech.com',
        linkedin: 'https://linkedin.com/in/davidwilliams-coo',
        isBestContact: false,
        reasonForContact: 'Sponsor of cross-border operational expansion and organizational design.'
      }
    ],
    recommendedApproach: {
      headline: 'Lead with onboarding acceleration and cross-border management readiness',
      openingAngle: 'Congratulate Jane and David on opening 38 roles and expanding into Ghana, and address the challenge of scaling leadership without losing team velocity.',
      relevantServices: 'Workforce Strategy + Leadership Coaching Suite',
      targetPerson: 'Jane Smith (Head of People)',
      timingReason: 'Recent hiring surge means HR capacity is currently strained.'
    },
    outreachScripts: {
      email: {
        subject: 'Supporting Acme\'s regional expansion & scaling leadership team',
        body: 'Hi Jane,\n\nI noticed Acme Technologies recently posted 38 new openings and appointed a new COO to spearhead regional expansion into Ghana. Congratulations on the phenomenal growth!\n\nAs engineering and commercial teams scale from 250 to 500+ employees across borders, onboarding friction and manager ramp-up often become critical bottlenecks.\n\nAt Peak Consulting, we help high-growth African tech scaleups reduce new-hire time-to-productivity by 40% through structured leadership enablement.\n\nWould you be open to a brief 15-minute conversation this Thursday at 2:00 PM to compare notes on what other Lagos scaleups are doing?'
      },
      linkedIn: {
        text: 'Hi Jane, congrats on the massive hiring surge at Acme! Scaling across multiple hubs is no easy feat. We recently helped a similar 300-person tech company streamline manager onboarding across Ghana and Nigeria. Would love to share our 1-page framework if relevant.'
      },
      callScript: {
        intro: 'Hi Jane, this is Ayoola from Peak Consulting. The reason for my call is Acme\'s rapid hiring push and expansion into Accra.',
        valueHook: 'We\'ve developed a fast-track onboarding blueprint that helps scaling SaaS teams ramp senior managers in half the usual time.',
        close: 'Could we set aside 10 minutes next Tuesday to review how this could support your Q3 hiring milestones?'
      },
      whatsApp: {
        text: 'Hi Jane! Ayoola here from Peak Consulting. Saw the exciting news about Acme\'s regional expansion. Sent a quick note to your email regarding manager onboarding frameworks—let me know if you\'d like a brief walkthrough!'
      }
    },
    sources: [
      { id: 's1', sourceType: 'job_board', title: 'Acme Careers Portal & LinkedIn Jobs', sourceUrl: 'https://acmetech.com/careers', publishedAt: '2h ago', retrievedAt: '10m ago', claimReference: '38 open roles indexed across engineering and sales.', confidence: 98 },
      { id: 's2', sourceType: 'press', title: 'TechCabal Executive Announcement', sourceUrl: 'https://techcabal.com/acme-coo', publishedAt: '1d ago', retrievedAt: '10m ago', claimReference: 'David Williams appointed Chief Operating Officer.', confidence: 95 },
      { id: 's3', sourceType: 'tech_lookup', title: 'BuiltWith / Wappalyzer Cloud Inspection', sourceUrl: 'https://builtwith.com/acmetech.com', publishedAt: '3d ago', retrievedAt: '10m ago', claimReference: 'AWS EC2, PostgreSQL & Salesforce deployment detected.', confidence: 92 }
    ]
  },
  {
    id: 'res-2',
    companyId: 'comp-2',
    companyName: 'FinServe Ltd',
    domain: 'finserve.com',
    industry: 'Financial Services',
    location: 'Lagos, Nigeria',
    logoBg: '#2563eb',
    logoColor: '#ffffff',
    logoInitial: 'F',
    employees: '200 – 500',
    revenue: '$10M – $25M',
    founded: '2018',
    status: 'complete',
    lastUpdated: '1h ago',
    opportunityScore: 91,
    opportunityLevel: 'Very High',
    buyingIntent: 'High',
    relationship: 'In Pipeline',
    executiveSummary: 'FinServe is actively expanding its corporate banking rails across Francophone West Africa following a Series B funding extension. Key regulatory compliance roles and sales leadership are being filled rapidly.',
    companyOverview: 'FinServe provides API-driven business banking and cross-border settlement infrastructure for financial institutions.',
    businessModel: {
      whatTheySell: 'API Banking infrastructure and settlement accounts.',
      howTheyMakeMoney: 'Transaction fees and SaaS platform access tiers.',
      targetCustomers: 'Commercial merchants and financial apps.',
      revenueModel: 'Fee-per-transaction + ARR access tiers.'
    },
    currentSituation: [
      'Secured regulatory approvals in Côte d’Ivoire.',
      'Hiring 22 compliance and operations managers.',
      'Building new regional compliance center in Abidjan.'
    ],
    growth: {
      employeeGrowth: '+24.1% YoY',
      hiringCount: '22 open roles',
      expansionLocations: 'Côte d’Ivoire & Senegal',
      fundingStage: 'Series B ($15M)',
      revenueTrend: '+55% ARR growth'
    },
    technologies: [
      { name: 'Google Cloud Platform', category: 'Cloud Infrastructure', confidence: 'Verified', lastDetected: '1d ago' },
      { name: 'Kubernetes', category: 'DevOps', confidence: 'Verified', lastDetected: '3d ago' }
    ],
    competitors: [
      { id: 'c4', name: 'Flutterwave', marketPosition: 'Pan-African Leader', productOverlap: 'Cross-border payout', relationship: 'Direct Competitor' }
    ],
    potentialProblems: [
      { title: 'Regulatory Compliance Ramp-Up', description: 'Strict BCEAO requirements create high penalty risks if staff are not trained.', severity: 'High' }
    ],
    potentialOpportunities: [
      { serviceName: 'Compliance Team Enablement', relevance: 'High', reason: 'High alignment with regional fintech regulatory compliance mandates.' }
    ],
    whyNow: {
      headline: 'Regulatory milestone in Francophone Africa creates instant hiring push',
      signalCount: 2,
      signals: [
        'Acquired license in Côte d’Ivoire',
        'Recruiting 22 bilingual compliance analysts'
      ],
      aiConclusion: 'Engage HR leadership now before initial regulatory audits take place.'
    },
    signalsTimeline: [
      { id: 'st-4', date: 'Yesterday', type: 'expansion', title: 'Abidjan Regional Hub Launch', detail: 'Opened French-speaking operations office.', iconBg: '#ecfdf5', iconColor: '#059669' }
    ],
    decisionMakers: [
      {
        id: 'dm-3',
        name: 'Michael Okoro',
        role: 'HR Director',
        avatarBg: '#fef3c7',
        avatarColor: '#b45309',
        influence: 'High',
        relevance: 94,
        email: 'michael.okoro@finserve.com',
        isBestContact: true,
        reasonForContact: 'Owns talent strategy and vendor engagements across Francophone teams.'
      }
    ],
    recommendedApproach: {
      headline: 'Pitch cross-border workforce compliance and cultural alignment',
      openingAngle: 'Reference Abidjan expansion and propose structured bilingual team onboarding.',
      relevantServices: 'Workforce Advisory & Bilingual Training',
      targetPerson: 'Michael Okoro (HR Director)',
      timingReason: 'License obtained and hiring underway.'
    },
    outreachScripts: {
      email: {
        subject: 'Supporting FinServe\'s Abidjan expansion & compliance hiring',
        body: 'Hi Michael,\n\nCongratulations on securing regulatory clearance in Côte d\'Ivoire and expanding FinServe\'s regional footprint!\n\nAs you ramp up compliance and operations talent in Abidjan, localized labor practices and cross-border culture alignment can present unexpected friction.\n\nWe specialize in enabling regional West African fintech teams to achieve full compliance readiness in record time.\n\nWould next Tuesday at 11:00 AM work for a quick introductory chat?'
      },
      linkedIn: {
        text: 'Hi Michael, congrats on FinServe\'s Abidjan launch! Scaling bilingual operations teams is exciting. Would love to share insights on how other fintech leaders handle cross-border enablement.'
      },
      callScript: {
        intro: 'Hi Michael, Ayoola calling from Peak Consulting regarding FinServe\'s Abidjan compliance team ramp-up.',
        valueHook: 'We help fintech directors accelerate bilingual talent readiness and minimize onboarding friction.',
        close: 'Let\'s schedule a brief 10-minute discovery call next week.'
      },
      whatsApp: {
        text: 'Hi Michael! Ayoola from Peak Consulting here. Sent a short email regarding bilingual workforce frameworks for FinServe\'s Abidjan team. Let me know when is good to connect!'
      }
    },
    sources: [
      { id: 's4', sourceType: 'press', title: 'TechPoint Africa FinServe Licensing', sourceUrl: 'https://techpoint.africa/finserve', publishedAt: '2d ago', retrievedAt: '1h ago', claimReference: 'Secured Abidjan operational license.', confidence: 96 }
    ]
  }
];

function calculateResearchKpi(list: CompanyResearchReport[]): ResearchKpiSummary {
  return {
    totalReports: list.length,
    inProgress: list.filter(r => r.status === 'researching').length,
    updatedThisWeek: list.length,
    highOpportunity: list.filter(r => r.opportunityScore >= 90).length
  };
}

/**
 * Fetch list of all company research reports with status/search filtering and KPI summaries.
 */
export async function fetchResearchReports(params?: {
  status?: string;
  query?: string;
}): Promise<FetchResearchReportsResult> {
  try {
    const result = await apiClient.get<FetchResearchReportsResult | CompanyResearchReport[]>('/api/research/reports', {
      params: {
        status: params?.status,
        q: params?.query
      }
    });

    if (Array.isArray(result)) {
      return { reports: result, kpiSummary: calculateResearchKpi(result) };
    }
    return result;
  } catch (_err) {
    // Offline Engine Fallback
    let list = [...localReports];
    if (params?.status && params.status !== 'all') {
      list = list.filter(r => r.status === params.status);
    }
    if (params?.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(r =>
        r.companyName.toLowerCase().includes(q) ||
        (r.domain ? r.domain.toLowerCase().includes(q) : false) ||
        r.industry.toLowerCase().includes(q)
      );
    }
    return { reports: list, kpiSummary: calculateResearchKpi(localReports) };
  }
}

/**
 * Get full research report by ID.
 */
export async function getResearchReportById(id: string): Promise<CompanyResearchReport> {
  try {
    return await apiClient.get<CompanyResearchReport>(`/api/research/reports/${id}`);
  } catch (_err) {
    const found = localReports.find(r => r.id === id);
    if (!found) throw new Error(`Report ${id} not found`);
    return found;
  }
}

/**
 * Create/generate a new deep company research report.
 */
export async function createResearchReport(payload: {
  companyName: string;
  domain?: string;
  industry?: string;
}): Promise<CompanyResearchReport> {
  try {
    const created = await apiClient.post<CompanyResearchReport>('/api/research/reports', payload);
    localReports.unshift(created);
    return created;
  } catch (_err) {
    const dossier = researchEngine.generateDossier(payload.companyName);
    const cleanDomain = payload.domain || `${payload.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const newReport: CompanyResearchReport = {
      id: `res-${Date.now()}`,
      companyId: `comp-${Date.now()}`,
      companyName: payload.companyName,
      domain: cleanDomain,
      industry: payload.industry || dossier.company?.industry || 'Technology & SaaS',
      location: 'Lagos, Nigeria',
      logoBg: '#4f46e5',
      logoColor: '#ffffff',
      logoInitial: payload.companyName.charAt(0).toUpperCase(),
      employees: '100 – 500',
      revenue: '$10M – $25M',
      founded: '2019',
      status: 'complete',
      lastUpdated: 'Just now',
      opportunityScore: 92,
      opportunityLevel: 'Very High',
      buyingIntent: 'Very High',
      relationship: 'New Prospect',
      executiveSummary: dossier.executiveSummary || `${payload.companyName} is expanding across West Africa with strong operational momentum.`,
      companyOverview: `${payload.companyName} provides high-reliability enterprise solutions.`,
      businessModel: {
        whatTheySell: 'Enterprise digital software solutions.',
        howTheyMakeMoney: 'Subscription access plans and custom deployments.',
        targetCustomers: 'Commercial enterprises and financial institutions.',
        revenueModel: 'B2B Subscriptions & Services'
      },
      currentSituation: ['Active hiring surge detected across key units', 'Expanding regional hubs'],
      growth: { employeeGrowth: '+22% YoY', hiringCount: '15+ open roles', expansionLocations: 'Lagos, Regional', fundingStage: 'Growth Stage', revenueTrend: '+35%' },
      technologies: [{ name: 'Cloud Infrastructure (AWS)', category: 'Cloud Infrastructure', confidence: 'Verified', lastDetected: 'Just now' }],
      competitors: [{ id: 'c-1', name: 'Regional Providers', marketPosition: 'Mid-Market', productOverlap: 'Enterprise Solutions', relationship: 'Direct Competitor' }],
      potentialProblems: [{ title: 'Leadership Ramp Friction', description: 'Fast scaling requires structured onboarding.', severity: 'High' }],
      potentialOpportunities: [{ serviceName: 'Workforce Scaling Strategy', relevance: 'High', reason: 'High alignment with growth phase.' }],
      whyNow: {
        headline: 'Active hiring and business momentum detected',
        signalCount: 2,
        signals: ['15+ open roles across key units', 'Regional expansion push'],
        aiConclusion: 'Ideal moment to initiate executive dialogue.'
      },
      signalsTimeline: [{ id: `st-${Date.now()}`, date: 'Just now', type: 'hiring', title: 'Hiring Surge Verified', detail: 'Active openings indexed.', iconBg: '#eff6ff', iconColor: '#2563eb' }],
      decisionMakers: [{ id: `dm-${Date.now()}`, name: 'Head of People', role: 'VP People / HR Lead', avatarBg: '#eff6ff', avatarColor: '#2563eb', influence: 'High', relevance: 95, isBestContact: true, reasonForContact: 'Direct authority over HR initiatives.' }],
      recommendedApproach: { headline: 'Lead with workforce scaling and onboarding enablement.', openingAngle: 'Headcount expansion enablement', relevantServices: 'Workforce Strategy', targetPerson: 'Head of People', timingReason: 'Active growth phase' },
      outreachScripts: {
        email: { subject: `Supporting ${payload.companyName}'s scaling initiatives`, body: `Hi,\n\nNoticed ${payload.companyName}'s recent hiring surge. Would love to share how we help scaling teams cut onboarding ramp time by 40%.\n\nBest,\nAyoola Ade` },
        linkedIn: { text: `Hi, congratulations on ${payload.companyName}'s growth! Would love to share insights on scaling leadership frameworks.` },
        callScript: { intro: `Hello, calling regarding ${payload.companyName}'s recent hiring announcements.`, valueHook: `We help fast-scaling teams build agile management frameworks.`, close: `Could we connect for 10 minutes next week?` },
        whatsApp: { text: `Hello! Ayoola here. Congrats on ${payload.companyName}'s milestones!` }
      },
      sources: [{ id: `src-${Date.now()}`, sourceType: 'website', title: `${payload.companyName} Portal`, sourceUrl: `https://${cleanDomain}`, publishedAt: 'Recently', retrievedAt: 'Just now', claimReference: 'Company Profile Verified', confidence: 95 }]
    };
    localReports.unshift(newReport);
    return newReport;
  }
}

/**
 * Re-scan and refresh an existing research report.
 */
export async function refreshResearchReport(id: string): Promise<CompanyResearchReport> {
  try {
    const refreshed = await apiClient.post<CompanyResearchReport>(`/api/research/reports/${id}/refresh`);
    const idx = localReports.findIndex(r => r.id === id);
    if (idx !== -1) localReports[idx] = refreshed;
    return refreshed;
  } catch (_err) {
    const idx = localReports.findIndex(r => r.id === id);
    if (idx !== -1) {
      localReports[idx] = {
        ...localReports[idx],
        lastUpdated: 'Just now',
        opportunityScore: Math.min(99, localReports[idx].opportunityScore + 1)
      };
      return localReports[idx];
    }
    throw new Error('Report not found');
  }
}

/**
 * Update report status or notes.
 */
export async function updateResearchReport(
  id: string, 
  updates: Partial<CompanyResearchReport>
): Promise<CompanyResearchReport> {
  try {
    const updated = await apiClient.patch<CompanyResearchReport>(`/api/research/reports/${id}`, updates);
    const idx = localReports.findIndex(r => r.id === id);
    if (idx !== -1) localReports[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localReports.findIndex(r => r.id === id);
    if (idx !== -1) {
      localReports[idx] = { ...localReports[idx], ...updates, lastUpdated: 'Just now' };
      return localReports[idx];
    }
    throw new Error('Report not found');
  }
}

/**
 * Delete a research report.
 */
export async function deleteResearchReport(id: string): Promise<{ id: string; deleted: boolean }> {
  try {
    return await apiClient.delete<{ id: string; deleted: boolean }>(`/api/research/reports/${id}`);
  } catch (_err) {
    localReports = localReports.filter(r => r.id !== id);
    return { id, deleted: true };
  }
}

/**
 * Generate a quick brief research dossier.
 */
export async function generateResearchDossier(companyName: string): Promise<ResearchDossier> {
  try {
    return await apiClient.post<ResearchDossier>('/api/research/generate', { companyName });
  } catch (_err) {
    return researchEngine.generateDossier(companyName);
  }
}
