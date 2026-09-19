import type {
  DbWorkspace,
  DbCompany,
  DbJobSource,
  DbJob,
  DbContact,
  DbSignal,
  DbEvidence,
  DbLead,
  DbActivity
} from './types';

export const seedWorkspace: DbWorkspace = {
  id: 'ws-main',
  name: 'Ayoola Ade Strategic Advisory',
  slug: 'huntiq-growth',
  plan: 'growth',
  ownerEmail: 'ayoola.ade@huntiq.com',
  createdAt: '2026-01-15T08:00:00.000Z',
  updatedAt: '2026-08-24T12:00:00.000Z'
};

export const seedCompanies: DbCompany[] = [
  {
    id: 'comp-1',
    workspaceId: 'ws-main',
    name: 'Paystack',
    legalName: 'Paystack Payments Limited',
    domain: 'paystack.com',
    website: 'https://paystack.com',
    industry: 'FinTech & Payments',
    employeeCount: '320',
    employeeRange: '250-500',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos',
    description: 'Modern online and offline payments infrastructure for African businesses.',
    logoUrl: 'https://paystack.com/favicon.ico',
    linkedinUrl: 'https://linkedin.com/company/paystack',
    twitterUrl: 'https://twitter.com/paystack',
    foundedYear: '2015',
    status: 'ACTIVE',
    firstSeenAt: '2026-02-10T10:00:00.000Z',
    lastVerifiedAt: '2026-08-24T09:00:00.000Z',
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-08-24T09:00:00.000Z'
  },
  {
    id: 'comp-2',
    workspaceId: 'ws-main',
    name: 'Flutterwave',
    legalName: 'Flutterwave Inc.',
    domain: 'flutterwave.com',
    website: 'https://flutterwave.com',
    industry: 'FinTech & Banking',
    employeeCount: '480',
    employeeRange: '250-500',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos',
    description: 'Global payments technology facilitating international transactions and remittances across Africa.',
    logoUrl: 'https://flutterwave.com/favicon.ico',
    linkedinUrl: 'https://linkedin.com/company/flutterwave',
    twitterUrl: 'https://twitter.com/theflutterwave',
    foundedYear: '2016',
    status: 'ACTIVE',
    firstSeenAt: '2026-02-12T11:00:00.000Z',
    lastVerifiedAt: '2026-08-24T10:00:00.000Z',
    createdAt: '2026-02-12T11:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z'
  },
  {
    id: 'comp-3',
    workspaceId: 'ws-main',
    name: 'Moniepoint',
    legalName: 'Moniepoint Microfinance Bank Ltd',
    domain: 'moniepoint.com',
    website: 'https://moniepoint.com',
    industry: 'Digital Banking & POS',
    employeeCount: '850',
    employeeRange: '500-1000',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos',
    description: 'All-in-one business banking platform powering merchant POS terminals and working capital.',
    logoUrl: 'https://moniepoint.com/favicon.ico',
    linkedinUrl: 'https://linkedin.com/company/moniepoint',
    twitterUrl: 'https://twitter.com/moniepoint',
    foundedYear: '2015',
    status: 'ACTIVE',
    firstSeenAt: '2026-03-01T08:00:00.000Z',
    lastVerifiedAt: '2026-08-24T08:30:00.000Z',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-08-24T08:30:00.000Z'
  }
];

export const seedJobSources: DbJobSource[] = [
  {
    id: 'source-1',
    workspaceId: 'ws-main',
    companyId: 'comp-1',
    provider: 'GREENHOUSE',
    sourceType: 'ATS_API',
    sourceUrl: 'https://boards-api.greenhouse.io/v1/boards/paystack/jobs',
    companyIdentifier: 'paystack',
    lastSyncedAt: '2026-08-24T08:00:00.000Z',
    syncStatus: 'SUCCESS',
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-08-24T08:00:00.000Z'
  },
  {
    id: 'source-2',
    workspaceId: 'ws-main',
    companyId: 'comp-2',
    provider: 'LEVER',
    sourceType: 'ATS_API',
    sourceUrl: 'https://api.lever.co/v0/postings/flutterwave',
    companyIdentifier: 'flutterwave',
    lastSyncedAt: '2026-08-24T08:15:00.000Z',
    syncStatus: 'SUCCESS',
    createdAt: '2026-02-12T11:00:00.000Z',
    updatedAt: '2026-08-24T08:15:00.000Z'
  },
  {
    id: 'source-3',
    workspaceId: 'ws-main',
    companyId: 'comp-3',
    provider: 'ASHBY',
    sourceType: 'ATS_API',
    sourceUrl: 'https://api.ashbyhq.com/posting-api/job-board/moniepoint',
    companyIdentifier: 'moniepoint',
    lastSyncedAt: '2026-08-24T08:30:00.000Z',
    syncStatus: 'SUCCESS',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-08-24T08:30:00.000Z'
  }
];

export const seedJobs: DbJob[] = [
  {
    id: 'job-1',
    workspaceId: 'ws-main',
    companyId: 'comp-1',
    sourceId: 'source-1',
    externalId: 'gh_4091823',
    title: 'Head of People & Regional Talent Scaling',
    department: 'People & Culture',
    seniority: 'DIRECTOR',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    remote: false,
    employmentType: 'FULL_TIME',
    jobUrl: 'https://paystack.com/careers/4091823',
    postedAt: '2026-08-22T14:00:00.000Z',
    status: 'OPEN',
    firstSeenAt: '2026-08-22T15:00:00.000Z',
    lastSeenAt: '2026-08-24T08:00:00.000Z',
    createdAt: '2026-08-22T15:00:00.000Z',
    updatedAt: '2026-08-24T08:00:00.000Z'
  },
  {
    id: 'job-2',
    workspaceId: 'ws-main',
    companyId: 'comp-1',
    sourceId: 'source-1',
    externalId: 'gh_4091884',
    title: 'Francophone Africa Expansion Lead',
    department: 'Operations & Expansion',
    seniority: 'LEAD',
    location: 'Abidjan / Lagos',
    country: 'Cote dIvoire',
    remote: true,
    employmentType: 'FULL_TIME',
    jobUrl: 'https://paystack.com/careers/4091884',
    postedAt: '2026-08-23T09:30:00.000Z',
    status: 'OPEN',
    firstSeenAt: '2026-08-23T10:00:00.000Z',
    lastSeenAt: '2026-08-24T08:00:00.000Z',
    createdAt: '2026-08-23T10:00:00.000Z',
    updatedAt: '2026-08-24T08:00:00.000Z'
  },
  {
    id: 'job-3',
    workspaceId: 'ws-main',
    companyId: 'comp-2',
    sourceId: 'source-2',
    externalId: 'lev_91024',
    title: 'VP of Global Compliance & Risk',
    department: 'Legal & Compliance',
    seniority: 'VP',
    location: 'Lagos / London',
    country: 'United Kingdom',
    remote: false,
    employmentType: 'FULL_TIME',
    jobUrl: 'https://flutterwave.com/careers/91024',
    postedAt: '2026-08-21T16:00:00.000Z',
    status: 'OPEN',
    firstSeenAt: '2026-08-21T18:00:00.000Z',
    lastSeenAt: '2026-08-24T08:15:00.000Z',
    createdAt: '2026-08-21T18:00:00.000Z',
    updatedAt: '2026-08-24T08:15:00.000Z'
  }
];

export const seedContacts: DbContact[] = [
  {
    id: 'contact-1',
    workspaceId: 'ws-main',
    companyId: 'comp-1',
    firstName: 'Jane',
    lastName: 'Smith',
    jobTitle: 'Head of People & Strategy',
    department: 'Human Resources',
    seniority: 'DIRECTOR',
    email: 'jane.smith@paystack.com',
    emailStatus: 'VALID',
    emailConfidence: 96,
    phone: '+234 802 345 6789',
    linkedinUrl: 'https://linkedin.com/in/jane-smith-paystack',
    source: 'HUNTER_IO',
    firstSeenAt: '2026-08-22T15:30:00.000Z',
    lastVerifiedAt: '2026-08-24T09:00:00.000Z',
    createdAt: '2026-08-22T15:30:00.000Z',
    updatedAt: '2026-08-24T09:00:00.000Z'
  },
  {
    id: 'contact-2',
    workspaceId: 'ws-main',
    companyId: 'comp-2',
    firstName: 'Michael',
    lastName: 'Okoro',
    jobTitle: 'VP of People Operations',
    department: 'Human Resources',
    seniority: 'VP',
    email: 'm.okoro@flutterwave.com',
    emailStatus: 'VALID',
    emailConfidence: 94,
    phone: '+234 803 987 6543',
    linkedinUrl: 'https://linkedin.com/in/michael-okoro-flutterwave',
    source: 'APOLLO',
    firstSeenAt: '2026-08-21T18:30:00.000Z',
    lastVerifiedAt: '2026-08-24T10:00:00.000Z',
    createdAt: '2026-08-21T18:30:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z'
  }
];

export const seedSignals: DbSignal[] = [
  {
    id: 'sig-1',
    workspaceId: 'ws-main',
    companyId: 'comp-1',
    type: 'HIRING_ACCELERATION',
    title: 'Rapid Talent Expansion (18 Open Roles in 14 Days)',
    summary: 'Paystack opened 18 strategic roles across Engineering, People, and Regional Expansion in Francophone West Africa.',
    strength: 'HIGH',
    confidence: 96,
    detectedAt: '2026-08-24T08:00:00.000Z',
    observedFrom: '2026-08-10T00:00:00.000Z',
    observedTo: '2026-08-24T08:00:00.000Z',
    status: 'ACTIVE',
    createdAt: '2026-08-24T08:00:00.000Z',
    updatedAt: '2026-08-24T08:00:00.000Z'
  },
  {
    id: 'sig-2',
    workspaceId: 'ws-main',
    companyId: 'comp-2',
    type: 'LEADERSHIP_HIRING',
    title: 'Senior Compliance & Regulatory Leadership Expansion',
    summary: 'Flutterwave is onboarding former global tier-1 banking executives to prepare for enterprise cross-border clearing licenses.',
    strength: 'HIGH',
    confidence: 92,
    detectedAt: '2026-08-23T14:30:00.000Z',
    status: 'ACTIVE',
    createdAt: '2026-08-23T14:30:00.000Z',
    updatedAt: '2026-08-23T14:30:00.000Z'
  }
];

export const seedEvidence: DbEvidence[] = [
  {
    id: 'ev-1',
    workspaceId: 'ws-main',
    signalId: 'sig-1',
    companyId: 'comp-1',
    sourceType: 'ATS_FEED',
    provider: 'Greenhouse API',
    sourceUrl: 'https://boards-api.greenhouse.io/v1/boards/paystack/jobs',
    title: '18 Active Greenhouse Job Postings Detected',
    description: 'Velocity increased by +240% compared to previous 30-day baseline period.',
    observedAt: '2026-08-24T08:00:00.000Z',
    retrievedAt: '2026-08-24T08:05:00.000Z',
    confidence: 98,
    rawReference: { openCount: 18, prevCount: 5, delta: 13 },
    createdAt: '2026-08-24T08:05:00.000Z'
  },
  {
    id: 'ev-2',
    workspaceId: 'ws-main',
    signalId: 'sig-2',
    companyId: 'comp-2',
    sourceType: 'NEWS_API',
    provider: 'TechCabal & Bloomberg Africa',
    sourceUrl: 'https://techcabal.com/2026/08/flutterwave-expansion',
    title: 'Press Announcement: European & Francophone Expansion',
    description: 'Secured new financial licenses requiring VP of Risk and Local Compliance leadership.',
    observedAt: '2026-08-23T14:00:00.000Z',
    retrievedAt: '2026-08-23T14:30:00.000Z',
    confidence: 94,
    createdAt: '2026-08-23T14:30:00.000Z'
  }
];

export const seedLeads: DbLead[] = [
  {
    id: 'lead-1',
    workspaceId: 'ws-main',
    companyId: 'comp-1',
    contactId: 'contact-1',
    signalId: 'sig-1',
    score: 94,
    tier: 'Tier 1',
    status: 'NEW',
    source: 'AUTONOMOUS_RADAR',
    reason: 'Rapid hiring surge + People department director role open + Francophone expansion.',
    summary: 'Paystack is in active hiring acceleration mode and Jane Smith is heading talent strategy.',
    createdAt: '2026-08-24T08:10:00.000Z',
    updatedAt: '2026-08-24T08:10:00.000Z'
  },
  {
    id: 'lead-2',
    workspaceId: 'ws-main',
    companyId: 'comp-2',
    contactId: 'contact-2',
    signalId: 'sig-2',
    score: 91,
    tier: 'Tier 1',
    status: 'NEW',
    source: 'AUTONOMOUS_RADAR',
    reason: 'Regulatory compliance expansion + verified People Operations VP contact.',
    summary: 'High-intent compliance and executive scaling advisory fit.',
    createdAt: '2026-08-24T08:20:00.000Z',
    updatedAt: '2026-08-24T08:20:00.000Z'
  }
];

export const seedActivities: DbActivity[] = [
  {
    id: 'act-1',
    workspaceId: 'ws-main',
    userId: 'usr-1',
    companyId: 'comp-1',
    leadId: 'lead-1',
    type: 'LEAD_CREATED',
    title: 'High-Intent Lead Qualified: Paystack (Score 94)',
    description: 'System automatically qualified Paystack following 18-job hiring acceleration surge.',
    createdAt: '2026-08-24T08:10:00.000Z'
  }
];
