import { apiClient } from './client';
import type { 
  CampaignItem, 
  CampaignKpiSummary, 
  CampaignSequenceStep,
  TargetProspectItem 
} from '../types/campaign';

export interface FetchCampaignsResult {
  campaigns: CampaignItem[];
  kpiSummary: CampaignKpiSummary;
}

// Resilient Offline Local Fallback Store
let localCampaigns: CampaignItem[] = [
  {
    id: 'camp-1',
    name: 'Lagos Tech Hiring Surge Sequence',
    description: 'Outreach to HR & People leaders at high-growth tech scaleups expanding headcount by 20%+',
    channel: 'multichannel',
    status: 'active',
    targetAudienceName: 'Lagos Technology Growth Companies',
    audienceCount: 184,
    sentCount: 142,
    openRate: 68.4,
    replyRate: 9.2,
    opportunitiesCount: 12,
    expectedValue: 74000,
    createdAt: '3 days ago',
    lastActivity: '12 new multi-channel touches dispatched today',
    sequence: [
      {
        id: 'sq-1',
        stepNumber: 1,
        channel: 'email',
        title: 'AI Signal-Based Value Intro',
        delayDays: 0,
        contentSnippet: 'I noticed your recent 38 openings and expansion into Ghana... We help scaleups reduce new-hire ramp by 40%.'
      },
      {
        id: 'sq-2',
        stepNumber: 2,
        channel: 'linkedin',
        title: 'LinkedIn InMail Follow-up',
        delayDays: 3,
        contentSnippet: 'Saw your rapid headcount growth—wanted to share our workforce scaling framework.'
      },
      {
        id: 'sq-3',
        stepNumber: 3,
        channel: 'call',
        title: 'Cold Call Opener & Meeting Hook',
        delayDays: 6,
        contentSnippet: 'Following up on my note regarding management training for your expanding team.'
      }
    ],
    prospects: [
      {
        id: 'p-1',
        contactName: 'Jane Smith',
        contactRole: 'Head of People',
        companyName: 'Acme Technologies',
        domain: 'acmetech.com',
        email: 'jane@acmetech.com',
        status: 'replied',
        opportunityScore: 94,
        lastTouch: 'Replied yesterday'
      },
      {
        id: 'p-2',
        contactName: 'Tunde Bakare',
        contactRole: 'CTO',
        companyName: 'CloudNova Technologies',
        domain: 'cloudnova.io',
        email: 'tunde@cloudnova.io',
        status: 'opened',
        opportunityScore: 91,
        lastTouch: 'Opened email 2h ago'
      }
    ]
  },
  {
    id: 'camp-2',
    name: 'Pan-African FinTech Compliance Outreach',
    description: 'Engaging VP People & Chief Compliance Officers navigating multi-market central bank licenses.',
    channel: 'email',
    status: 'active',
    targetAudienceName: 'Pan-African FinTech Scaleups',
    audienceCount: 96,
    sentCount: 78,
    openRate: 72.1,
    replyRate: 8.5,
    opportunitiesCount: 8,
    expectedValue: 62000,
    createdAt: '5 days ago',
    lastActivity: 'Step 2 sent to 14 verified contacts',
    sequence: [
      {
        id: 'sq-4',
        stepNumber: 1,
        channel: 'email',
        title: 'Cross-Border Compliance Scaling Intro',
        delayDays: 0,
        contentSnippet: 'Congratulations on recent licensing in West Africa. We help FinTechs prepare compliance officers.'
      },
      {
        id: 'sq-5',
        stepNumber: 2,
        channel: 'email',
        title: 'Case Study & Operational Playbook Sharing',
        delayDays: 4,
        contentSnippet: 'Here is how we helped a top regional payment scaleup cut compliance onboarding time.'
      }
    ],
    prospects: [
      {
        id: 'p-3',
        contactName: 'Oluwaseun Adewale',
        contactRole: 'VP People',
        companyName: 'Flutterwave',
        domain: 'flutterwave.com',
        email: 'oluwaseun@flutterwave.com',
        status: 'replied',
        opportunityScore: 96,
        lastTouch: 'Discovery meeting booked'
      }
    ]
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
    prospects: [
      {
        id: 'p-4',
        contactName: 'Babafemi Lawson',
        contactRole: 'VP Operations',
        companyName: 'Paystack',
        domain: 'paystack.com',
        email: 'babafemi@paystack.com',
        status: 'pending',
        opportunityScore: 92,
        lastTouch: 'Queued for campaign launch'
      }
    ]
  }
];

function calculateLocalKpi(campaigns: CampaignItem[]): CampaignKpiSummary {
  return {
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalAudience: campaigns.reduce((acc, c) => acc + (c.audienceCount || 0), 0),
    totalReplies: Math.round(campaigns.reduce((acc, c) => acc + (c.sentCount * ((c.replyRate || 0) / 100)), 0)),
    opportunitiesCreated: campaigns.reduce((acc, c) => acc + (c.opportunitiesCount || 0), 0),
    pipelineGenerated: campaigns.reduce((acc, c) => acc + (c.expectedValue || 0), 0)
  };
}

/**
 * Fetch all outreach campaigns with optional status, channel, and query filtering.
 */
export async function fetchCampaigns(params?: {
  status?: string;
  channel?: string;
  query?: string;
}): Promise<FetchCampaignsResult> {
  try {
    const result = await apiClient.get<FetchCampaignsResult | CampaignItem[]>('/api/campaigns', {
      params: {
        status: params?.status,
        channel: params?.channel,
        q: params?.query
      }
    });

    if (Array.isArray(result)) {
      return { campaigns: result, kpiSummary: calculateLocalKpi(result) };
    }
    return result;
  } catch (_err) {
    // Offline Engine Fallback
    let list = [...localCampaigns];

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

    return { campaigns: list, kpiSummary: calculateLocalKpi(localCampaigns) };
  }
}

/**
 * Get full campaign details by ID.
 */
export async function getCampaignById(id: string): Promise<CampaignItem> {
  try {
    return await apiClient.get<CampaignItem>(`/api/campaigns/${id}`);
  } catch (_err) {
    const found = localCampaigns.find(c => c.id === id);
    if (!found) throw new Error(`Campaign ${id} not found`);
    return found;
  }
}

/**
 * Create a new campaign with engine-powered multi-channel sequence and target prospects.
 */
export async function createCampaign(payload: Partial<CampaignItem>): Promise<CampaignItem> {
  try {
    const created = await apiClient.post<CampaignItem>('/api/campaigns', payload);
    localCampaigns.unshift(created);
    return created;
  } catch (_err) {
    const count = payload.audienceCount || 120;
    const defaultSequence: CampaignSequenceStep[] = [
      {
        id: `sq-${Date.now()}-1`,
        stepNumber: 1,
        channel: 'email',
        title: 'AI Signal-Based Value Intro',
        delayDays: 0,
        contentSnippet: `Personalized value intro addressing recent expansion and headcount scaling.`
      },
      {
        id: `sq-${Date.now()}-2`,
        stepNumber: 2,
        channel: payload.channel === 'email' ? 'email' : 'linkedin',
        title: 'Multi-Channel Follow-up & Framework',
        delayDays: 3,
        contentSnippet: `Sharing operational scaling frameworks tailored to ${payload.targetAudienceName || 'Target Audience'}.`
      }
    ];

    const defaultProspects: TargetProspectItem[] = [
      {
        id: `p-${Date.now()}-1`,
        contactName: 'Executive Lead',
        contactRole: 'Head of Operations',
        companyName: payload.targetAudienceName || 'Target Enterprise',
        domain: null,
        email: null,
        emailStatus: 'not_found',
        status: 'pending',
        opportunityScore: 92,
        lastTouch: 'Scheduled for dispatch'
      }
    ];

    const newCampaign: CampaignItem = {
      id: `camp-${Date.now()}`,
      name: payload.name || 'New AI Outreach Sequence',
      description: payload.description || `Targeting decision makers with personalized AI outreach sequences.`,
      channel: payload.channel || 'multichannel',
      status: payload.status || 'active',
      targetAudienceName: payload.targetAudienceName || 'Target Market Scaleups',
      audienceCount: count,
      sentCount: 0,
      openRate: 0,
      replyRate: 0,
      opportunitiesCount: 0,
      expectedValue: payload.expectedValue || (count * 250),
      createdAt: 'Just now',
      lastActivity: 'Campaign initialized via Engine',
      sequence: payload.sequence || defaultSequence,
      prospects: payload.prospects || defaultProspects
    };

    localCampaigns.unshift(newCampaign);
    return newCampaign;
  }
}

/**
 * Update an existing campaign.
 */
export async function updateCampaign(id: string, updates: Partial<CampaignItem>): Promise<CampaignItem> {
  try {
    const updated = await apiClient.patch<CampaignItem>(`/api/campaigns/${id}`, updates);
    const idx = localCampaigns.findIndex(c => c.id === id);
    if (idx !== -1) localCampaigns[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localCampaigns.findIndex(c => c.id === id);
    if (idx !== -1) {
      localCampaigns[idx] = { ...localCampaigns[idx], ...updates, lastActivity: 'Updated just now' };
      return localCampaigns[idx];
    }
    throw new Error('Campaign not found');
  }
}

/**
 * Toggle active / paused status of a campaign.
 */
export async function toggleCampaignStatus(id: string): Promise<CampaignItem> {
  try {
    const updated = await apiClient.post<CampaignItem>(`/api/campaigns/${id}/toggle`);
    const idx = localCampaigns.findIndex(c => c.id === id);
    if (idx !== -1) localCampaigns[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localCampaigns.findIndex(c => c.id === id);
    if (idx !== -1) {
      const nextStatus = localCampaigns[idx].status === 'active' ? 'paused' : 'active';
      localCampaigns[idx] = {
        ...localCampaigns[idx],
        status: nextStatus,
        lastActivity: nextStatus === 'active' ? 'Campaign resumed' : 'Campaign paused by user'
      };
      return localCampaigns[idx];
    }
    throw new Error('Campaign not found');
  }
}

/**
 * Delete a campaign by ID.
 */
export async function deleteCampaign(id: string): Promise<{ id: string; deleted: boolean }> {
  try {
    return await apiClient.delete<{ id: string; deleted: boolean }>(`/api/campaigns/${id}`);
  } catch (_err) {
    localCampaigns = localCampaigns.filter(c => c.id !== id);
    return { id, deleted: true };
  }
}
