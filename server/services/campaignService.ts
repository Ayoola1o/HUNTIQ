import type {
  CampaignItem,
  CampaignKpiSummary,
  CampaignStatus,
  CampaignChannel,
  CampaignSequenceStep,
  TargetProspectItem
} from '../../src/types/campaign';
import { db } from '../db/memoryStore';
import { outreachEngine } from '../../src/engine/outreachEngine';

export class CampaignService {
  private campaigns: CampaignItem[] = [];

  constructor() {
    this.seedCampaignsFromEngine();
  }

  /**
   * Populate initial campaigns driven dynamically by the Prospector, Signals, and Contacts database.
   */
  private seedCampaignsFromEngine() {
    const contacts = db.contacts;
    const companies = db.companies;
    const signals = db.signals;

    // Campaign 1: Lagos Tech Scaleup Sequence
    const techCompanies = companies.filter(c => 
      c.industry?.toLowerCase().includes('tech') || 
      c.industry?.toLowerCase().includes('software') || 
      c.industry?.toLowerCase().includes('saas')
    );
    const techCompanyIds = new Set(techCompanies.map(c => c.id));
    const techContacts = contacts.filter(c => techCompanyIds.has(c.companyId));

    const techProspects: TargetProspectItem[] = techContacts.slice(0, 8).map((cont, idx) => {
      const comp = companies.find(c => c.id === cont.companyId);
      const statuses: TargetProspectItem['status'][] = ['replied', 'opened', 'delivered', 'pending', 'converted'];
      return {
        id: `p-tech-${cont.id}`,
        contactName: cont.name,
        contactRole: cont.title || 'Decision Maker',
        companyName: comp?.name || 'Technology Company',
        domain: comp?.domain || '',
        email: cont.email || null,
        status: statuses[idx % statuses.length],
        opportunityScore: Math.min(99, 88 + (idx * 3) % 11),
        lastTouch: idx === 0 ? 'Replied yesterday' : idx === 1 ? 'Opened 2h ago' : 'Dispatched 1d ago'
      };
    });

    const techHiringSignal = signals.find(s => s.type?.toLowerCase().includes('hiring') || s.title?.toLowerCase().includes('hiring'));
    const techOutreach = outreachEngine.generateOutreach(
      'Acme Technologies',
      'Jane Smith',
      'Head of People',
      techHiringSignal?.title || 'Engineering & Operations Headcount Expansion',
      'Executive & Direct'
    );

    const techSequence: CampaignSequenceStep[] = [
      {
        id: 'sq-1',
        stepNumber: 1,
        channel: 'email',
        title: 'AI Signal-Based Value Intro',
        delayDays: 0,
        contentSnippet: techOutreach.email.body.substring(0, 150) + '...'
      },
      {
        id: 'sq-2',
        stepNumber: 2,
        channel: 'linkedin',
        title: 'LinkedIn InMail Touchpoint',
        delayDays: 3,
        contentSnippet: techOutreach.linkedin.inMailMessage.substring(0, 150) + '...'
      },
      {
        id: 'sq-3',
        stepNumber: 3,
        channel: 'call',
        title: 'Executive Discovery Call Script',
        delayDays: 6,
        contentSnippet: techOutreach.callScript.opening + ' ' + techOutreach.callScript.elevatorPitch
      }
    ];

    // Campaign 2: Pan-African FinTech Compliance Outreach
    const fintechCompanies = companies.filter(c => c.industry?.toLowerCase().includes('fintech') || c.industry?.toLowerCase().includes('pay'));
    const fintechCompanyIds = new Set(fintechCompanies.map(c => c.id));
    const fintechContacts = contacts.filter(c => fintechCompanyIds.has(c.companyId));

    const fintechProspects: TargetProspectItem[] = fintechContacts.slice(0, 6).map((cont, idx) => {
      const comp = companies.find(c => c.id === cont.companyId);
      const statuses: TargetProspectItem['status'][] = ['opened', 'replied', 'delivered', 'pending'];
      return {
        id: `p-fin-${cont.id}`,
        contactName: cont.name,
        contactRole: cont.title || 'Executive',
        companyName: comp?.name || 'FinTech Scaleup',
        domain: comp?.domain || 'fintech.com',
        email: cont.email || `contact@${comp?.domain || 'fintech.com'}`,
        status: statuses[idx % statuses.length],
        opportunityScore: Math.min(99, 90 + (idx * 2) % 9),
        lastTouch: idx === 0 ? 'Discovery meeting booked' : 'Delivered 4h ago'
      };
    });

    const fintechOutreach = outreachEngine.generateOutreach(
      'Flutterwave',
      'Oluwaseun Adewale',
      'VP People & Compliance',
      'Regional Regulatory Expansion & Hub Launch',
      'Consultative'
    );

    const fintechSequence: CampaignSequenceStep[] = [
      {
        id: 'sq-4',
        stepNumber: 1,
        channel: 'email',
        title: 'Cross-Border Compliance Scaling Intro',
        delayDays: 0,
        contentSnippet: fintechOutreach.email.body.substring(0, 150) + '...'
      },
      {
        id: 'sq-5',
        stepNumber: 2,
        channel: 'email',
        title: 'Case Study & Operational Playbook Sharing',
        delayDays: 4,
        contentSnippet: fintechOutreach.email.followUpBody || 'Here is how we helped a top regional payment scaleup cut compliance onboarding time.'
      }
    ];

    // Campaign 3: Enterprise Modernization & Operational Excellence
    const enterpriseProspects: TargetProspectItem[] = contacts.slice(4, 8).map((cont, idx) => {
      const comp = companies.find(c => c.id === cont.companyId);
      return {
        id: `p-ent-${cont.id}`,
        contactName: cont.name,
        contactRole: cont.title || 'Director of Operations',
        companyName: comp?.name || 'Commercial Enterprise',
        domain: comp?.domain || 'enterprise.com',
        email: cont.email || `director@${comp?.domain || 'enterprise.com'}`,
        status: 'pending' as const,
        opportunityScore: 88,
        lastTouch: 'Queued for campaign launch'
      };
    });

    this.campaigns = [
      {
        id: 'camp-1',
        name: 'Lagos Tech Hiring Surge Sequence',
        description: 'Outreach to HR & People leaders at high-growth tech scaleups expanding headcount by 20%+',
        channel: 'multichannel',
        status: 'active',
        targetAudienceName: 'Lagos Technology Growth Companies',
        audienceCount: Math.max(184, techProspects.length * 15),
        sentCount: 142,
        openRate: 68.4,
        replyRate: 9.2,
        opportunitiesCount: 12,
        expectedValue: 74000,
        createdAt: '3 days ago',
        lastActivity: '12 new multi-channel touches dispatched today',
        sequence: techSequence,
        prospects: techProspects
      },
      {
        id: 'camp-2',
        name: 'Pan-African FinTech Compliance Outreach',
        description: 'Engaging VP People & Chief Compliance Officers navigating multi-market central bank licenses.',
        channel: 'email',
        status: 'active',
        targetAudienceName: 'Pan-African FinTech Scaleups',
        audienceCount: Math.max(96, fintechProspects.length * 12),
        sentCount: 78,
        openRate: 72.1,
        replyRate: 8.5,
        opportunitiesCount: 8,
        expectedValue: 62000,
        createdAt: '5 days ago',
        lastActivity: 'Step 2 sent to 14 verified contacts',
        sequence: fintechSequence,
        prospects: fintechProspects
      },
      {
        id: 'camp-3',
        name: 'Enterprise Workflow Modernization & Automation',
        description: 'Advisory and org design outreach to executive leaders modernizing legacy ERP and operations.',
        channel: 'linkedin',
        status: 'paused',
        targetAudienceName: 'Regional Commercial Enterprises',
        audienceCount: 54,
        sentCount: 30,
        openRate: 54.0,
        replyRate: 4.8,
        opportunitiesCount: 4,
        expectedValue: 48000,
        createdAt: '1 week ago',
        lastActivity: 'Campaign paused by administrator',
        sequence: [
          {
            id: 'sq-6',
            stepNumber: 1,
            channel: 'linkedin',
            title: 'Executive InMail Introduction',
            delayDays: 0,
            contentSnippet: 'Connecting regarding enterprise workflow automation and operational scaling frameworks.'
          }
        ],
        prospects: enterpriseProspects
      }
    ];
  }

  /**
   * Calculate live KPI metrics across all campaigns.
   */
  public calculateKpiSummary(campaigns: CampaignItem[]): CampaignKpiSummary {
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalAudience = campaigns.reduce((acc, c) => acc + (c.audienceCount || 0), 0);
    const totalReplies = Math.round(campaigns.reduce((acc, c) => acc + (c.sentCount * ((c.replyRate || 0) / 100)), 0));
    const opportunitiesCreated = campaigns.reduce((acc, c) => acc + (c.opportunitiesCount || 0), 0);
    const pipelineGenerated = campaigns.reduce((acc, c) => acc + (c.expectedValue || 0), 0);

    return {
      activeCampaigns,
      totalAudience,
      totalReplies,
      opportunitiesCreated,
      pipelineGenerated
    };
  }

  /**
   * List campaigns with optional status, channel, and search filtering.
   */
  public list(params?: {
    status?: string;
    channel?: string;
    query?: string;
  }): { campaigns: CampaignItem[]; kpiSummary: CampaignKpiSummary } {
    let list = [...this.campaigns];

    if (params?.status && params.status !== 'all') {
      list = list.filter(c => c.status.toLowerCase() === params.status?.toLowerCase());
    }

    if (params?.channel && params.channel !== 'all') {
      list = list.filter(c => c.channel.toLowerCase() === params.channel?.toLowerCase());
    }

    if (params?.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.targetAudienceName.toLowerCase().includes(q)
      );
    }

    return {
      campaigns: list,
      kpiSummary: this.calculateKpiSummary(this.campaigns)
    };
  }

  /**
   * Get single campaign details by ID.
   */
  public getById(id: string): CampaignItem | undefined {
    return this.campaigns.find(c => c.id === id);
  }

  /**
   * Create a new campaign using engine-driven prospects and outreach generation.
   */
  public create(payload: Partial<CampaignItem>): CampaignItem {
    const audienceName = payload.targetAudienceName || 'Target Market Scaleups';
    const channel: CampaignChannel = payload.channel || 'multichannel';
    const targetCount = payload.audienceCount || 120;

    // Find engine contacts matching target companies
    const availableContacts = db.contacts;
    const availableCompanies = db.companies;

    const generatedProspects: TargetProspectItem[] = availableContacts.slice(0, 6).map((cont, idx) => {
      const comp = availableCompanies.find(c => c.id === cont.companyId);
      return {
        id: `p-new-${Date.now()}-${idx}`,
        contactName: cont.name,
        contactRole: cont.title || 'Decision Maker',
        companyName: comp?.name || 'Target Enterprise',
        domain: comp?.domain || '',
        email: cont.email || null,
        status: 'pending',
        opportunityScore: Math.min(98, 86 + idx * 2),
        lastTouch: 'Initialized for automated dispatch'
      };
    });

    const generatedOutreach = outreachEngine.generateOutreach(
      availableCompanies[0]?.name || 'Target Enterprise',
      availableContacts[0]?.name || 'Executive Lead',
      availableContacts[0]?.title || 'VP Growth',
      'Recent Market Momentum & Headcount Growth',
      'Executive & Direct'
    );

    const generatedSequence: CampaignSequenceStep[] = payload.sequence?.length 
      ? payload.sequence 
      : [
          {
            id: `sq-${Date.now()}-1`,
            stepNumber: 1,
            channel: 'email',
            title: 'AI Signal-Based Value Intro',
            delayDays: 0,
            contentSnippet: generatedOutreach.email.body.substring(0, 160) + '...'
          },
          {
            id: `sq-${Date.now()}-2`,
            stepNumber: 2,
            channel: channel === 'email' ? 'email' : 'linkedin',
            title: 'Executive Multi-Channel Follow-up',
            delayDays: 3,
            contentSnippet: generatedOutreach.linkedin.inMailMessage.substring(0, 160) + '...'
          },
          {
            id: `sq-${Date.now()}-3`,
            stepNumber: 3,
            channel: 'call',
            title: 'Discovery Call Opener',
            delayDays: 7,
            contentSnippet: generatedOutreach.callScript.opening + ' ' + generatedOutreach.callScript.elevatorPitch
          }
        ];

    const newCampaign: CampaignItem = {
      id: `camp-${Date.now()}`,
      name: payload.name || `Outreach Sequence ${new Date().toLocaleDateString()}`,
      description: payload.description || `Targeting decision makers in ${audienceName} with personalized AI outreach sequences.`,
      channel,
      status: payload.status || 'active',
      targetAudienceName: audienceName,
      audienceCount: targetCount,
      sentCount: payload.sentCount || 0,
      openRate: payload.openRate || 0,
      replyRate: payload.replyRate || 0,
      opportunitiesCount: payload.opportunitiesCount || 0,
      expectedValue: payload.expectedValue || (targetCount * 250),
      createdAt: 'Just now',
      lastActivity: 'Campaign initialized via Engine',
      sequence: generatedSequence,
      prospects: generatedProspects
    };

    this.campaigns.unshift(newCampaign);
    return newCampaign;
  }

  /**
   * Update campaign fields.
   */
  public update(id: string, updates: Partial<CampaignItem>): CampaignItem | undefined {
    const idx = this.campaigns.findIndex(c => c.id === id);
    if (idx === -1) return undefined;

    this.campaigns[idx] = {
      ...this.campaigns[idx],
      ...updates,
      lastActivity: updates.lastActivity || 'Campaign updated just now'
    };

    return this.campaigns[idx];
  }

  /**
   * Toggle campaign active/paused status.
   */
  public toggleStatus(id: string): CampaignItem | undefined {
    const campaign = this.getById(id);
    if (!campaign) return undefined;

    const nextStatus: CampaignStatus = campaign.status === 'active' ? 'paused' : 'active';
    const lastActivity = nextStatus === 'active' 
      ? 'Outreach queue resumed' 
      : 'Campaign paused by administrator';

    return this.update(id, { status: nextStatus, lastActivity });
  }

  /**
   * Delete a campaign by ID.
   */
  public delete(id: string): boolean {
    const initialLen = this.campaigns.length;
    this.campaigns = this.campaigns.filter(c => c.id !== id);
    return this.campaigns.length < initialLen;
  }
}

export const campaignService = new CampaignService();
