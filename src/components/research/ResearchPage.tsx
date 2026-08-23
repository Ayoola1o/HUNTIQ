import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { ResearchKpiCards } from './ResearchKpiCards';
import { RecentResearchTable } from './RecentResearchTable';
import { ResearchReportView } from './ResearchReportView';
import { NewResearchModal } from './NewResearchModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { CompanyResearchReport, ResearchKpiSummary } from '../../types/research';
import { 
  Compass, 
  Sparkles, 
  Search, 
  ArrowRight,
  Plus
} from 'lucide-react';

interface ResearchPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const ResearchPage: React.FC<ResearchPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [selectedReport, setSelectedReport] = useState<CompanyResearchReport | null>(null);
  const [isNewResearchModalOpen, setIsNewResearchModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Mock Researched Companies
  const [reports, setReports] = useState<CompanyResearchReport[]>([
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
          '38 new job openings indexed across engineering, product and sales.',
          'New Chief Operating Officer appointed to execute regional scaleup.',
          'Physical operational expansion into Accra and Nairobi.'
        ],
        aiConclusion: 'The company is transitioning from single-market product-market fit to multi-country enterprise execution. Leadership enablement and HR infrastructure are at peak buying readiness.'
      },
      signalsTimeline: [
        { id: 's1', date: 'May 16', type: 'hiring', title: 'Hiring Surge (38 Open Roles)', detail: 'Heavy hiring in engineering & regional account management.', iconBg: '#eff6ff', iconColor: '#2563eb' },
        { id: 's2', date: 'May 12', type: 'expansion', title: 'Regional Office Established in Accra', detail: 'Formal launch of Ghana corporate operations.', iconBg: '#ecfdf5', iconColor: '#059669' },
        { id: 's3', date: 'May 08', type: 'leadership', title: 'New COO Appointed', detail: 'Former Senior VP joins executive team.', iconBg: '#f5f3ff', iconColor: '#7c3aed' }
      ],
      decisionMakers: [
        {
          id: 'dm-1',
          name: 'Jane Smith',
          role: 'Head of People & Culture',
          avatarBg: '#fbcfe8',
          avatarColor: '#9d174d',
          influence: 'High',
          relevance: 96,
          isBestContact: true,
          reasonForContact: 'Directly owns HR infrastructure, onboarding, and leadership development across all regional branches.'
        },
        {
          id: 'dm-2',
          name: 'Michael Okoro',
          role: 'Chief Operating Officer',
          avatarBg: '#dbeafe',
          avatarColor: '#1e40af',
          influence: 'High',
          relevance: 92,
          isBestContact: false,
          reasonForContact: 'Key budget stakeholder driving operational expansion and cross-border team productivity.'
        },
        {
          id: 'dm-3',
          name: 'David Jonah',
          role: 'Chief Technology Officer',
          avatarBg: '#ede9fe',
          avatarColor: '#5b21b6',
          influence: 'Medium',
          relevance: 78,
          isBestContact: false,
          reasonForContact: 'Leads technical architecture migration to AWS and technical talent recruitment.'
        }
      ],
      recommendedApproach: {
        headline: 'Lead with workforce scaling frameworks and middle-management coaching rather than a generic HR pitch.',
        openingAngle: 'Rapid headcount scaling & multi-hub operational alignment',
        relevantServices: 'Workforce Scaling Strategy + Executive Coaching',
        targetPerson: 'Jane Smith (Head of People)',
        timingReason: 'Recent hiring surge & COO appointment provide immediate commercial urgency'
      },
      outreachScripts: {
        email: {
          subject: 'Supporting Acme’s expansion into Ghana & scaling management layer',
          body: `Hi Jane,\n\nI noticed Acme Technologies recently posted 38 new openings and appointed a new COO to spearhead regional expansion across West Africa. Congratulations on the phenomenal momentum!\n\nAs organizations scale past 250 employees across multiple jurisdictions, cross-border onboarding friction and management ramp time often become major operational bottlenecks.\n\nAt Peak Consulting, we partner with high-growth tech scaleups to deploy structured workforce scaling frameworks that reduce new-hire time-to-productivity by 40%.\n\nWould you be open to a 15-minute introductory conversation this Thursday at 2:00 PM?\n\nBest regards,\nAyoola Ade\nPeak Consulting`
        },
        linkedIn: {
          text: `Hi Jane, saw Acme's rapid hiring surge and expansion into Accra—exciting times! We help scaling West African tech leaders build agile onboarding and management retention frameworks. Would love to share how we helped similar scaleups cut ramp time by 40%. Open to connecting?`
        },
        callScript: {
          intro: `Hi Jane, Ayoola here from Peak Consulting. The reason for my call is I noticed Acme's recent 38 new job postings following your expansion announcement into Ghana.`,
          valueHook: `We specialize in helping high-growth tech executives build onboarding and management alignment frameworks so expanding teams hit full productivity in half the time.`,
          close: `I’d love to share a brief 15-minute case study with you this Thursday. How does 2:00 PM look on your calendar?`
        },
        whatsApp: {
          text: `Hello Jane, Ayoola from Peak Consulting here. Huge congratulations on Acme's regional expansion into Ghana! I’d love to share some insights on workforce scaling and onboarding frameworks we developed for high-growth tech teams. Let me know if you’re open to a brief chat!`
        }
      },
      sources: [
        { id: 'src-1', sourceType: 'website', title: 'Acme Careers Portal', sourceUrl: 'https://acmetech.com/careers', publishedAt: '2d ago', retrievedAt: '10m ago', claimReference: '38 Active Job Listings', confidence: 98 },
        { id: 'src-2', sourceType: 'linkedin', title: 'LinkedIn Talent Insights', sourceUrl: 'https://linkedin.com/company/acme-technologies', publishedAt: '1w ago', retrievedAt: '10m ago', claimReference: 'Headcount Growth +18.4%', confidence: 94 },
        { id: 'src-3', sourceType: 'press', title: 'TechCabal Press Announcement', sourceUrl: 'https://techcabal.com', publishedAt: 'May 08, 2025', retrievedAt: '10m ago', claimReference: 'New COO Appointment', confidence: 96 }
      ]
    },
    {
      id: 'res-2',
      companyId: 'comp-2',
      companyName: 'Flutterwave',
      domain: 'flutterwave.com',
      industry: 'Financial Services',
      location: 'Lagos, Nigeria',
      logoBg: '#f59e0b',
      logoColor: '#ffffff',
      logoInitial: 'F',
      employees: '500 – 1,000',
      revenue: '$100M+',
      founded: '2016',
      status: 'complete',
      lastUpdated: '32m ago',
      opportunityScore: 96,
      opportunityLevel: 'Very High',
      buyingIntent: 'Very High',
      relationship: 'New Prospect',
      executiveSummary: 'Flutterwave is scaling enterprise payment processing rails across 30+ African countries. Recent licensing approvals in Ghana and Kenya and 45 newly opened engineering and regulatory compliance roles signal heavy procurement for operational risk and executive training.',
      companyOverview: 'Global payments technology provider enabling businesses across Africa and globally to accept, process and disburse payments across multiple channels.',
      businessModel: {
        whatTheySell: 'Payment gateway API, treasury multi-currency accounts, enterprise payment orchestration.',
        howTheyMakeMoney: 'Transaction processing interchange fees (1.4% – 2.9%) + currency conversion margins.',
        targetCustomers: 'Global enterprises (Uber, Microsoft), African e-commerce merchants, and digital marketplaces.',
        revenueModel: 'Usage-based transactional volume fees.'
      },
      currentSituation: [
        'Scaling compliance teams to support cross-border money transfer licensing.',
        'Hiring 45+ technical roles in cloud security and fraud prevention.',
        'Opening regional office in Abidjan to serve Francophone market.'
      ],
      growth: {
        employeeGrowth: '+24.1% YoY',
        hiringCount: '45 open roles',
        expansionLocations: 'Côte d’Ivoire, Egypt & UK',
        fundingStage: 'Series D ($250M)',
        revenueTrend: '+58% processing volume'
      },
      technologies: [
        { name: 'AWS Cloud', category: 'Cloud Infrastructure', confidence: 'Verified', lastDetected: '1d ago' },
        { name: 'Kubernetes', category: 'DevOps', confidence: 'Verified', lastDetected: '3d ago' },
        { name: 'Salesforce', category: 'Enterprise CRM', confidence: 'High', lastDetected: '1w ago' }
      ],
      competitors: [
        { id: 'c1', name: 'Paystack', marketPosition: 'Stripe-owned Payments Gateway', productOverlap: 'Core payment processing', relationship: 'Direct Competitor' },
        { id: 'c2', name: 'OPay', marketPosition: 'Consumer & Merchant Wallet', productOverlap: 'POS and offline agent payment', relationship: 'Adjacent Solution' }
      ],
      potentialProblems: [
        { title: 'Regulatory Compliance Bottlenecks', description: 'Expanding across 30+ distinct central bank regulatory frameworks requires specialized talent training.', severity: 'High' }
      ],
      potentialOpportunities: [
        { serviceName: 'Compliance Leadership Training', relevance: 'High', reason: 'High demand for preparing regulatory officers across new markets.' }
      ],
      whyNow: {
        headline: '45 new roles and licensing expansions announced this week',
        signalCount: 2,
        signals: [
          '45 open technical & compliance positions opened.',
          'Francophone West Africa licensing secured.'
        ],
        aiConclusion: 'Operational compliance infrastructure at highest priority.'
      },
      signalsTimeline: [
        { id: 's1', date: 'May 16', type: 'hiring', title: 'Hiring Surge (45 Roles)', detail: '45 open compliance & engineering listings.', iconBg: '#eff6ff', iconColor: '#2563eb' }
      ],
      decisionMakers: [
        { id: 'dm-1', name: 'Oluwaseun Adewale', role: 'VP of People Operations', avatarBg: '#ede9fe', avatarColor: '#5b21b6', influence: 'High', relevance: 95, isBestContact: true, reasonForContact: 'Oversees talent strategy and employee development for all African hubs.' }
      ],
      recommendedApproach: {
        headline: 'Position cross-border regulatory training and people operations infrastructure.',
        openingAngle: 'Cross-border compliance scaling',
        relevantServices: 'Compliance Leadership Training',
        targetPerson: 'Oluwaseun Adewale',
        timingReason: 'Immediate response to 45 new compliance and technical roles'
      },
      outreachScripts: {
        email: { subject: 'Scaling Flutterwave’s cross-border compliance team', body: `Hi Oluwaseun,\n\nNoticed Flutterwave's recent 45 openings in regulatory compliance and regional expansion. Would love to share how we help FinTechs ramp compliance teams 40% faster.\n\nBest,\nAyoola Ade` },
        linkedIn: { text: `Hi Oluwaseun, congrats on the recent licensing milestones at Flutterwave! Would love to connect and share insights on scaling cross-border compliance talent.` },
        callScript: { intro: `Hi Oluwaseun, calling regarding Flutterwave's recent compliance hiring surge.`, valueHook: `We help payment scaleups optimize compliance training frameworks.`, close: `Could we connect for 10 minutes this week?` },
        whatsApp: { text: `Hello Oluwaseun, Ayoola from Peak Consulting. Congrats on Flutterwave's new market expansions!` }
      },
      sources: [
        { id: 'src-1', sourceType: 'website', title: 'Flutterwave Portal', sourceUrl: 'https://flutterwave.com', publishedAt: '1d ago', retrievedAt: '32m ago', claimReference: '45 Open Positions', confidence: 96 }
      ]
    },
    {
      id: 'res-3',
      companyId: 'comp-3',
      companyName: 'Paystack',
      domain: 'paystack.com',
      industry: 'Financial Services',
      location: 'Lagos, Nigeria',
      logoBg: '#0ea5e9',
      logoColor: '#ffffff',
      logoInitial: 'P',
      employees: '250 – 500',
      revenue: '$50M – $100M',
      founded: '2015',
      status: 'complete',
      lastUpdated: '1h ago',
      opportunityScore: 92,
      opportunityLevel: 'Very High',
      buyingIntent: 'Very High',
      relationship: 'New Prospect',
      executiveSummary: 'Paystack (a Stripe company) is accelerating Pan-African expansion into Côte d’Ivoire, Egypt, and South Africa. Their expansion creates immediate opportunities for regional team onboarding and localized management frameworks.',
      companyOverview: 'Modern online and offline payments platform designed for African creators, developers and scaleups.',
      businessModel: {
        whatTheySell: 'Payment APIs, POS terminals, store checkout portals.',
        howTheyMakeMoney: 'Transaction fees (1.5% local, 3.9% international).',
        targetCustomers: 'E-commerce merchants, SMEs, and digital scaleups.',
        revenueModel: 'Transaction revenue.'
      },
      currentSituation: [
        'Opened regional operations in Abidjan and Nairobi.',
        'Hiring 25 regional sales managers across 4 countries.'
      ],
      growth: {
        employeeGrowth: '+16.5% YoY',
        hiringCount: '25 open roles',
        expansionLocations: 'Côte d’Ivoire & Kenya',
        fundingStage: 'Acquired by Stripe',
        revenueTrend: '+35% merchant volume'
      },
      technologies: [
        { name: 'AWS Cloud', category: 'Infrastructure', confidence: 'Verified', lastDetected: '2d ago' },
        { name: 'Node.js', category: 'Backend', confidence: 'Verified', lastDetected: '1w ago' }
      ],
      competitors: [
        { id: 'c1', name: 'Flutterwave', marketPosition: 'Direct Competitor', productOverlap: 'Payment Gateway', relationship: 'Direct Competitor' }
      ],
      potentialProblems: [
        { title: 'Regional Sales Manager Alignment', description: 'Onboarding distributed sales leads in Francophone Africa requires standardized sales enablement.', severity: 'High' }
      ],
      potentialOpportunities: [
        { serviceName: 'Sales Enablement & Coaching', relevance: 'High', reason: 'High impact for accelerating merchant acquisition in new markets.' }
      ],
      whyNow: {
        headline: 'Pan-African expansion into 2 new countries underway',
        signalCount: 2,
        signals: ['Expansion into Abidjan and Nairobi', '25 Regional Sales Manager positions opened'],
        aiConclusion: 'Sales enablement and regional onboarding are in high demand.'
      },
      signalsTimeline: [
        { id: 's1', date: 'May 14', type: 'expansion', title: 'Abidjan Office Opened', detail: 'Formal launch of Francophone payment operations.', iconBg: '#ecfdf5', iconColor: '#059669' }
      ],
      decisionMakers: [
        { id: 'dm-1', name: 'Bisi Daniels', role: 'Head of Sales Enablement', avatarBg: '#fef3c7', avatarColor: '#b45309', influence: 'High', relevance: 94, isBestContact: true, reasonForContact: 'Directly responsible for regional sales rep performance and training.' }
      ],
      recommendedApproach: {
        headline: 'Pitch localized sales enablement frameworks for new regional managers.',
        openingAngle: 'Regional sales acceleration',
        relevantServices: 'Sales Enablement & Coaching',
        targetPerson: 'Bisi Daniels',
        timingReason: 'Expansion into Abidjan and Nairobi active this month'
      },
      outreachScripts: {
        email: { subject: 'Accelerating Paystack’s new regional sales reps in Abidjan & Nairobi', body: `Hi Bisi,\n\nCongratulations on Paystack's expansion into Abidjan and Nairobi! We help high-growth tech companies build localized sales enablement frameworks to shorten new-rep quota attainment by 45%.\n\nBest,\nAyoola Ade` },
        linkedIn: { text: `Hi Bisi, congrats on Paystack's new market launches! Would love to share insights on regional sales enablement frameworks.` },
        callScript: { intro: `Hi Bisi, calling regarding Paystack's new regional sales expansion.`, valueHook: `We help fast-scaling teams accelerate quota attainment for new regional sales reps.`, close: `Could we chat for 15 minutes this Thursday?` },
        whatsApp: { text: `Hello Bisi, Ayoola here. Congrats on the new Paystack market launches!` }
      },
      sources: [
        { id: 'src-1', sourceType: 'press', title: 'Paystack Blog', sourceUrl: 'https://paystack.com/blog', publishedAt: '3d ago', retrievedAt: '1h ago', claimReference: 'Abidjan Launch', confidence: 99 }
      ]
    }
  ]);

  const kpiSummary: ResearchKpiSummary = {
    totalReports: reports.length,
    inProgress: reports.filter(r => r.status === 'researching').length,
    updatedThisWeek: reports.filter(r => r.status === 'complete').length,
    highOpportunity: reports.filter(r => r.opportunityScore >= 90).length
  };

  const handleStartSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = reports.find(r => r.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    if (match) {
      setSelectedReport(match);
    } else {
      setIsNewResearchModalOpen(true);
    }
  };

  const handleCompleteNewResearch = (name: string, domain: string) => {
    const newReport: CompanyResearchReport = {
      id: `res-${Date.now()}`,
      companyId: `comp-${Date.now()}`,
      companyName: name,
      domain: domain,
      industry: 'Technology & FinTech',
      location: 'Lagos, Nigeria',
      logoBg: '#6366f1',
      logoColor: '#ffffff',
      logoInitial: name[0].toUpperCase(),
      employees: '100 – 250',
      revenue: '$10M – $25M',
      founded: '2019',
      status: 'complete',
      lastUpdated: 'Just now',
      opportunityScore: 91,
      opportunityLevel: 'Very High',
      buyingIntent: 'High',
      relationship: 'New Prospect',
      executiveSummary: `${name} is demonstrating strong market momentum with active hiring in tech and sales operations. High potential fit for enterprise consulting and growth services.`,
      companyOverview: `${name} provides specialized digital solutions and digital services in West Africa.`,
      businessModel: {
        whatTheySell: 'Digital platforms & enterprise services.',
        howTheyMakeMoney: 'B2B subscription and transactional fees.',
        targetCustomers: 'Mid-market & enterprise companies.',
        revenueModel: 'Recurring SaaS & Service Contracts.'
      },
      currentSituation: ['Recently raised growth capital', 'Scaling headcount across engineering and sales'],
      growth: { employeeGrowth: '+22% YoY', hiringCount: '18 open roles', expansionLocations: 'Lagos, Abuja', fundingStage: 'Series A', revenueTrend: '+30%' },
      technologies: [{ name: 'AWS Cloud', category: 'Infrastructure', confidence: 'Verified', lastDetected: 'Today' }],
      competitors: [{ id: 'c1', name: 'Legacy Solutions', marketPosition: 'Incumbent', productOverlap: 'General services', relationship: 'Direct Competitor' }],
      potentialProblems: [{ title: 'Rapid Scaling Bottlenecks', description: 'Fast growth creates operational and organizational friction.', severity: 'High' }],
      potentialOpportunities: [{ serviceName: 'Organizational Design & Training', relevance: 'High', reason: 'High impact on scaling teams.' }],
      whyNow: {
        headline: 'Active hiring surge detected this week',
        signalCount: 2,
        signals: ['18 new positions opened', 'New office in Abuja'],
        aiConclusion: 'High intent window for growth consulting.'
      },
      signalsTimeline: [{ id: 's1', date: 'Today', type: 'hiring', title: 'Hiring Surge (18 Roles)', detail: 'Openings indexed across key functions.', iconBg: '#eff6ff', iconColor: '#2563eb' }],
      decisionMakers: [{ id: 'dm-1', name: 'Chief People Officer', role: 'Head of People', avatarBg: '#ede9fe', avatarColor: '#5b21b6', influence: 'High', relevance: 92, isBestContact: true, reasonForContact: 'Directly oversees organizational development.' }],
      recommendedApproach: { headline: 'Lead with workforce scaling and management training.', openingAngle: 'Headcount expansion enablement', relevantServices: 'Workforce Strategy', targetPerson: 'Head of People', timingReason: 'Active growth phase' },
      outreachScripts: {
        email: { subject: `Supporting ${name}'s expansion and team scaling`, body: `Hi,\n\nNoticed ${name}'s rapid hiring surge and recent expansion. Would love to share how we help scaling teams cut onboarding ramp time by 40%.\n\nBest,\nAyoola Ade` },
        linkedIn: { text: `Hi, saw ${name}'s exciting growth! Would love to connect and share insights on scaling organizational frameworks.` },
        callScript: { intro: `Hi, calling regarding ${name}'s recent hiring announcements.`, valueHook: `We help fast-scaling teams build agile management frameworks.`, close: `Could we chat for 10 minutes this Thursday?` },
        whatsApp: { text: `Hello, Ayoola here. Congrats on ${name}'s recent milestones!` }
      },
      sources: [{ id: 'src-1', sourceType: 'website', title: `${name} Official Website`, sourceUrl: `https://${domain}`, publishedAt: 'Today', retrievedAt: 'Just now', claimReference: 'Company Profile & Signals', confidence: 95 }]
    };

    setReports([newReport, ...reports]);
    setSelectedReport(newReport);
  };

  const handleRefreshReport = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, lastUpdated: 'Just now' } : r));
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
        activeNav="research"
        onSelectNav={onNavigate}
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
        {selectedReport ? (
          /* Individual 360° Company Intelligence Report View */
          <ResearchReportView
            report={selectedReport}
            onBack={() => setSelectedReport(null)}
            onRefresh={handleRefreshReport}
            onNavigateToContacts={() => onNavigate('contacts')}
            onNavigateToOutreach={() => onNavigate('campaigns')}
          />
        ) : (
          /* Research Dashboard & Listing View */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            paddingBottom: '40px'
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
                  <Compass size={16} color="#2563eb" />
                </div>
                <div>
                  <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Company Research Intelligence
                  </h1>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                    Investigate companies, uncover buying signals, and understand your next best opportunity
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
                  onClick={() => setIsNewResearchModalOpen(true)}
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
                  <span>+ New Research</span>
                </button>
              </div>
            </header>

            {/* Hero Research Search Banner */}
            <div style={{
              margin: '24px 32px 20px 32px',
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Research a Company in Real-Time
                </h2>
                <p style={{ fontSize: '12px', color: '#a5b4fc', margin: '4px 0 0 0' }}>
                  Enter any company name or domain. HUNTIQ will gather hiring surges, leadership changes, tech stack signals and generate actionable outreach.
                </p>
              </div>

              <form onSubmit={handleStartSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '8px 16px'
                }}>
                  <Search size={16} color="#cbd5e1" />
                  <input
                    type="text"
                    placeholder="Search company name, website or domain (e.g. Acme Technologies, Flutterwave, Moniepoint)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      outline: 'none',
                      fontSize: '13px',
                      color: '#ffffff',
                      width: '100%',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(124, 58, 237, 0.4)'
                  }}
                >
                  <span>Research Company</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>

            {/* KPI Cards */}
            <div style={{ marginBottom: '20px' }}>
              <ResearchKpiCards
                summary={kpiSummary}
                activeFilter={activeKpiFilter}
                onSelectFilter={setActiveKpiFilter}
              />
            </div>

            {/* Recent Research Table */}
            <RecentResearchTable
              reports={reports}
              selectedReportId={selectedReport ? (selectedReport as CompanyResearchReport).id : null}
              onSelectReport={(rep) => setSelectedReport(rep)}
              onRefreshReport={handleRefreshReport}
              onStartNewResearch={() => setIsNewResearchModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* New Research Agent Modal */}
      <NewResearchModal
        isOpen={isNewResearchModalOpen}
        onClose={() => setIsNewResearchModalOpen(false)}
        onCompleteResearch={handleCompleteNewResearch}
      />

      {/* AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={(comp) => {
          const found = reports.find(r => r.companyName.toLowerCase().includes(comp.toLowerCase()));
          if (found) setSelectedReport(found);
          else handleCompleteNewResearch(comp, `${comp.toLowerCase().replace(/\s+/g, '')}.com`);
        }}
      />
    </div>
  );
};
