import type { PipelineDealItem } from '../../../src/types/pipeline';
import type { PipelineRepository } from './pipeline-repository';

interface StoredDeal extends PipelineDealItem {
  userId: string;
  workspaceId: string;
}

export class InMemoryPipelineRepository implements PipelineRepository {
  private static deals: StoredDeal[] = [];

  constructor() {
    // Seed default demo deals once if empty
    if (InMemoryPipelineRepository.deals.length === 0) {
      InMemoryPipelineRepository.deals = [
        {
          id: 'deal-seed-001',
          userId: 'user-default-001',
          workspaceId: 'ws-default-001',
          company: 'PayApex Global',
          title: 'Enterprise Talent Scaling & Mgmt',
          dealValue: 65000,
          stage: 'Proposal',
          probability: 75,
          contactName: 'Chidi Okafor',
          contactRole: 'VP of Technology',
          contactEmail: 'c.okafor@payapex.io',
          expectedCloseDate: 'In 18 days',
          lastActivity: 'Product demo delivered to CTO & VP Eng',
          lastActivityType: 'email',
          nextAction: 'Send revised multi-entity proposal',
          nextActionDueDate: 'Tomorrow, 2 PM',
          priority: 'High',
          activities: []
        },
        {
          id: 'deal-seed-002',
          userId: 'user-default-001',
          workspaceId: 'ws-default-001',
          company: 'KoraHealth Labs',
          title: 'Regional Expansion Advisory',
          dealValue: 42000,
          stage: 'Negotiation',
          probability: 85,
          contactName: 'Dr. Amina Bello',
          contactRole: 'Chief Operating Officer',
          contactEmail: 'a.bello@korahealth.co',
          expectedCloseDate: 'In 9 days',
          lastActivity: 'MSA & SLA under legal review',
          lastActivityType: 'call',
          nextAction: 'Final terms confirmation',
          nextActionDueDate: 'Friday, 11 AM',
          priority: 'High',
          activities: []
        }
      ];
    }
  }

  public async listByUser(userId: string, workspaceId: string): Promise<PipelineDealItem[]> {
    return InMemoryPipelineRepository.deals
      .filter((d) => d.workspaceId === workspaceId && (d.userId === userId || !d.userId))
      .map(({ userId: _u, workspaceId: _w, ...deal }) => deal);
  }

  public async getById(id: string, userId: string, workspaceId: string): Promise<PipelineDealItem | null> {
    const item = InMemoryPipelineRepository.deals.find(
      (d) => d.id === id && d.workspaceId === workspaceId && (d.userId === userId || !d.userId)
    );
    if (!item) return null;
    const { userId: _u, workspaceId: _w, ...deal } = item;
    return deal;
  }

  public async create(userId: string, workspaceId: string, deal: Partial<PipelineDealItem>): Promise<PipelineDealItem> {
    const newDeal: StoredDeal = {
      id: deal.id || `deal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      workspaceId,
      company: deal.company || 'Enterprise Prospect',
      title: deal.title || `${deal.company || 'Enterprise'} Opportunity`,
      dealValue: deal.dealValue || 25000,
      stage: deal.stage || 'Discovery',
      probability: deal.probability || 50,
      priority: deal.priority || 'Medium',
      contactName: deal.contactName || 'Managing Director',
      contactRole: deal.contactRole || 'Owner',
      contactEmail: deal.contactEmail || 'contact@prospect.com',
      expectedCloseDate: deal.expectedCloseDate || 'In 30 days',
      lastActivity: deal.lastActivity || 'Created in Pipeline',
      lastActivityType: deal.lastActivityType || 'signal',
      nextAction: deal.nextAction || 'Initial Follow-up',
      nextActionDueDate: deal.nextActionDueDate || 'Tomorrow, 10 AM',
      notes: deal.notes || '',
      website: deal.website,
      revenue: deal.revenue,
      linkedInUrl: deal.linkedInUrl,
      source: deal.source || 'AI_RADAR',
      opportunityType: deal.opportunityType || 'HIGH_GROWTH',
      digitalGapScore: deal.digitalGapScore,
      digitalAudit: deal.digitalAudit,
      scoreFactors: deal.scoreFactors,
      signals: deal.signals || [],
      activities: deal.activities || []
    };
    InMemoryPipelineRepository.deals.unshift(newDeal);
    const { userId: _u, workspaceId: _w, ...created } = newDeal;
    return created;
  }

  public async update(id: string, userId: string, workspaceId: string, updates: Partial<PipelineDealItem>): Promise<PipelineDealItem | null> {
    const index = InMemoryPipelineRepository.deals.findIndex(
      (d) => d.id === id && d.workspaceId === workspaceId && (d.userId === userId || !d.userId)
    );
    if (index === -1) return null;
    InMemoryPipelineRepository.deals[index] = {
      ...InMemoryPipelineRepository.deals[index],
      ...updates
    };
    const { userId: _u, workspaceId: _w, ...updated } = InMemoryPipelineRepository.deals[index];
    return updated;
  }

  public async delete(id: string, userId: string, workspaceId: string): Promise<boolean> {
    const prevLen = InMemoryPipelineRepository.deals.length;
    InMemoryPipelineRepository.deals = InMemoryPipelineRepository.deals.filter(
      (d) => !(d.id === id && d.workspaceId === workspaceId && (d.userId === userId || !d.userId))
    );
    return InMemoryPipelineRepository.deals.length < prevLen;
  }
}
