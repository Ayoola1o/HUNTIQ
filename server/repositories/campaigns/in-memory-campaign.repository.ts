import type { CampaignItem } from '../../../src/types/campaign';
import type { CampaignRepository, CampaignFilterOptions } from './campaign-repository';

export class InMemoryCampaignRepository implements CampaignRepository {
  private static campaignsByWorkspace = new Map<string, CampaignItem[]>();

  constructor() {
    // Seed default workspace if empty
    const defaultWs = 'ws-default-001';
    if (!InMemoryCampaignRepository.campaignsByWorkspace.has(defaultWs)) {
      InMemoryCampaignRepository.campaignsByWorkspace.set(defaultWs, [
        {
          id: 'camp-1',
          name: 'Lagos Tech Scaleup Sequence',
          description: 'Multi-touch outbound acquisition sequence targeting rapidly growing technology scaleups across Lagos.',
          channel: 'multichannel',
          status: 'active',
          targetAudienceName: 'Heads of People, VPs of Talent & Founders',
          audienceCount: 24,
          sentCount: 18,
          openRate: 66.7,
          replyRate: 16.7,
          opportunitiesCreated: 4,
          expectedValue: 145000,
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          lastActivity: '3 hours ago',
          sequence: [
            { id: 'step-1', stepNumber: 1, channel: 'email', title: 'Initial Executive Outreach', delayDays: 0, contentSnippet: 'HUNTIQ growth & headcount advisory' },
            { id: 'step-2', stepNumber: 2, channel: 'linkedin', title: 'LinkedIn Connect Hook', delayDays: 2, contentSnippet: 'Reference recent engineering expansion' }
          ],
          prospects: []
        }
      ]);
    }
  }

  public async list(workspaceId: string, filter?: CampaignFilterOptions): Promise<CampaignItem[]> {
    const list = InMemoryCampaignRepository.campaignsByWorkspace.get(workspaceId) || [];
    let filtered = [...list];

    if (filter?.status && filter.status !== 'all') {
      filtered = filtered.filter(c => c.status === filter.status);
    }
    if (filter?.channel && filter.channel !== 'all') {
      filtered = filtered.filter(c => c.channel === filter.channel);
    }
    if (filter?.query?.trim()) {
      const q = filter.query.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) ||
        c.targetAudienceName.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  public async getById(id: string, workspaceId: string): Promise<CampaignItem | undefined> {
    const list = InMemoryCampaignRepository.campaignsByWorkspace.get(workspaceId) || [];
    return list.find(c => c.id === id);
  }

  public async create(campaign: Partial<CampaignItem>, workspaceId: string, _userId?: string): Promise<CampaignItem> {
    const newItem: CampaignItem = {
      id: campaign.id || `camp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: campaign.name || 'Untitled Campaign',
      description: campaign.description || '',
      channel: campaign.channel || 'multichannel',
      status: campaign.status || 'draft',
      targetAudienceName: campaign.targetAudienceName || 'Target Audience',
      audienceCount: campaign.audienceCount || 0,
      sentCount: campaign.sentCount || 0,
      openRate: campaign.openRate || 0,
      replyRate: campaign.replyRate || 0,
      opportunitiesCreated: campaign.opportunitiesCreated || 0,
      expectedValue: campaign.expectedValue || 0,
      createdAt: new Date().toISOString(),
      lastActivity: 'Just created',
      sequence: campaign.sequence || [],
      prospects: campaign.prospects || []
    };

    const current = InMemoryCampaignRepository.campaignsByWorkspace.get(workspaceId) || [];
    current.unshift(newItem);
    InMemoryCampaignRepository.campaignsByWorkspace.set(workspaceId, current);

    return newItem;
  }

  public async update(id: string, partial: Partial<CampaignItem>, workspaceId: string): Promise<CampaignItem | undefined> {
    const list = InMemoryCampaignRepository.campaignsByWorkspace.get(workspaceId) || [];
    const index = list.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...list[index],
      ...partial,
      lastActivity: 'Updated recently'
    };
    list[index] = updated;
    return updated;
  }

  public async delete(id: string, workspaceId: string): Promise<boolean> {
    const list = InMemoryCampaignRepository.campaignsByWorkspace.get(workspaceId) || [];
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length === list.length) return false;

    InMemoryCampaignRepository.campaignsByWorkspace.set(workspaceId, filtered);
    return true;
  }
}
