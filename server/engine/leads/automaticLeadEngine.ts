import { db } from '../../db/memoryStore';
import type { DbCompany, DbLead, DbContact, DbSignal } from '../../db/types';
import { serverScoringEngine } from '../scoringEngine';
import { pipelineDealsDb } from '../../routes/pipeline';
import type { PipelineDealItem } from '../../../src/types/pipeline';

export interface AutoQualificationResult {
  qualifiedCount: number;
  newLeads: DbLead[];
  newPipelineDeals: PipelineDealItem[];
  evaluatedCompaniesCount: number;
}

export class AutomaticLeadEngine {
  /**
   * Evaluates all companies in the workspace, identifies high-intent accounts,
   * generates qualified DbLead records, and synchronizes them directly into the CRM pipeline.
   */
  public static async runAutoQualification(workspaceId: string = 'ws-main'): Promise<AutoQualificationResult> {
    const companies = db.getCompaniesByWorkspace(workspaceId);
    const newLeads: DbLead[] = [];
    const newPipelineDeals: PipelineDealItem[] = [];

    for (const comp of companies) {
      // Check if lead already exists for this company
      const existingLead = db.leads.find(l => l.companyId === comp.id && l.workspaceId === workspaceId);
      if (existingLead) continue;

      const jobs = db.getJobsByCompany(comp.id, workspaceId);
      const signals = db.getSignalsByCompany(comp.id, workspaceId);
      const contacts = db.getContactsByCompany(comp.id, workspaceId);

      // Compute multi-factor live score
      const evalResult = serverScoringEngine.evaluate(comp, jobs, signals, contacts);

      // Threshold qualification: totalScore >= 75
      if (evalResult.totalScore >= 75) {
        const topSignal = signals.find(s => s.status === 'ACTIVE') || signals[0];
        const primaryContact = contacts.find(c => 
          (c.seniority === 'DIRECTOR' || c.seniority === 'VP' || c.seniority === 'CXO') &&
          c.emailStatus === 'VALID'
        ) || contacts[0];

        const leadId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newLead: DbLead = {
          id: leadId,
          workspaceId,
          companyId: comp.id,
          contactId: primaryContact?.id,
          signalId: topSignal?.id,
          score: evalResult.totalScore,
          tier: evalResult.tier,
          status: 'NEW',
          source: 'AUTONOMOUS_INTENT_RADAR',
          reason: evalResult.keyDrivers.join(' • '),
          summary: `${comp.name} scored ${evalResult.totalScore}/100. ${evalResult.recommendedAction}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        db.leads.push(newLead);
        newLeads.push(newLead);

        // Automatically sync into CRM Pipeline Deals
        const dealId = `deal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const serviceTitle = topSignal?.type === 'HIRING_ACCELERATION'
          ? 'Enterprise Talent Scaling Suite'
          : topSignal?.type === 'LEADERSHIP_HIRING'
          ? 'Executive Search & Onboarding Advisory'
          : 'Strategic Growth & Expansion Consulting';

        const pipelineDeal: PipelineDealItem = {
          id: dealId,
          companyName: comp.name,
          domain: comp.domain,
          dealTitle: `${comp.name} - ${serviceTitle}`,
          serviceName: serviceTitle,
          dealValue: evalResult.estimatedDealValue,
          probability: evalResult.conversionProbability,
          opportunityScore: evalResult.totalScore,
          stage: 'contacted',
          stageEnteredAt: 'Just now',
          expectedCloseDate: 'In 30 days',
          ownerName: 'Ayoola Ade',
          contactName: primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName}` : 'Executive Decision Maker',
          contactRole: primaryContact ? primaryContact.jobTitle : 'Leadership Team',
          contactAvatarBg: '#eff6ff',
          contactAvatarColor: '#1d4ed8',
          lastActivity: `Auto-qualified by HUNTIQ Radar (${topSignal?.title || 'High-Intent Surge'})`,
          nextAction: evalResult.recommendedAction,
          nextActionDueDate: 'Tomorrow, 10:00 AM',
          priority: evalResult.totalScore >= 88 ? 'High' : 'Medium',
          activities: []
        };

        pipelineDealsDb.unshift(pipelineDeal);
        newPipelineDeals.push(pipelineDeal);

        // Log audit event
        db.logActivity({
          workspaceId,
          userId: 'usr-1',
          companyId: comp.id,
          leadId: newLead.id,
          type: 'LEAD_CREATED',
          title: `Autonomous Lead Qualified & Pushed to Pipeline: ${comp.name}`,
          description: `Score: ${newLead.score} (${newLead.tier}). Deal Value: $${pipelineDeal.dealValue.toLocaleString()}. Contact: ${pipelineDeal.contactName}.`
        });
      }
    }

    return {
      qualifiedCount: newLeads.length,
      newLeads,
      newPipelineDeals,
      evaluatedCompaniesCount: companies.length
    };
  }

  /**
   * Promotes an existing lead directly to an active deal in the pipeline.
   */
  public static async promoteLeadToPipeline(
    leadId: string,
    workspaceId: string = 'ws-main',
    customDealValue?: number
  ): Promise<PipelineDealItem> {
    const lead = db.leads.find(l => l.id === leadId && l.workspaceId === workspaceId);
    if (!lead) throw new Error(`Lead '${leadId}' not found`);

    const company = db.getCompanyById(lead.companyId, workspaceId);
    if (!company) throw new Error(`Company '${lead.companyId}' not found`);

    const contact = lead.contactId ? db.contacts.find(c => c.id === lead.contactId) : undefined;
    const signal = lead.signalId ? db.signals.find(s => s.id === lead.signalId) : undefined;

    lead.status = 'IN_PIPELINE';
    lead.updatedAt = new Date().toISOString();

    const deal: PipelineDealItem = {
      id: `deal-${Date.now()}`,
      companyName: company.name,
      domain: company.domain,
      dealTitle: `${company.name} Strategic Advisory Engagement`,
      serviceName: 'Executive Advisory Suite',
      dealValue: customDealValue || 28000,
      probability: 70,
      opportunityScore: lead.score,
      stage: 'meeting',
      stageEnteredAt: 'Just now',
      expectedCloseDate: 'In 30 days',
      ownerName: 'Ayoola Ade',
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : 'Key Decision Maker',
      contactRole: contact ? contact.jobTitle : 'Executive Sponsor',
      contactAvatarBg: '#eff6ff',
      contactAvatarColor: '#1d4ed8',
      lastActivity: `Promoted from Qualified Leads (${signal?.title || 'Signal Surge'})`,
      nextAction: 'Prepare Discovery Scoping Agenda',
      nextActionDueDate: 'Tomorrow, 2:00 PM',
      priority: 'High',
      activities: []
    };

    pipelineDealsDb.unshift(deal);

    db.logActivity({
      workspaceId,
      userId: 'usr-1',
      companyId: company.id,
      leadId: lead.id,
      type: 'LEAD_CREATED',
      title: `Lead Promoted to Active Pipeline: ${company.name}`,
      description: `Deal value set to $${deal.dealValue.toLocaleString()} in Stage 'Discovery Meeting'.`
    });

    return deal;
  }
}
