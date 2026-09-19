import type { DbCompany, DbSignal, DbContact, DbLead } from '../db/types';

export class LeadGenerator {
  public static evaluateAndGenerate(
    company: DbCompany,
    signals: DbSignal[],
    contacts: DbContact[]
  ): DbLead | null {
    if (signals.length === 0) return null;

    // Calculate score
    let baseScore = 60;
    signals.forEach(s => {
      if (s.type === 'HIRING_ACCELERATION') baseScore += 18;
      if (s.type === 'LEADERSHIP_HIRING') baseScore += 16;
      if (s.type === 'EXPANSION') baseScore += 14;
    });

    const primaryContact = contacts.find(c => c.seniority === 'DIRECTOR' || c.seniority === 'VP') || contacts[0];
    if (primaryContact && primaryContact.emailStatus === 'VALID') {
      baseScore += 8;
    }

    const score = Math.min(99, baseScore);

    if (score < 75) return null; // Minimum qualification threshold

    const topSignal = signals[0];
    const tier: DbLead['tier'] = score >= 90 ? 'Tier 1' : 'Tier 2';

    return {
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspaceId: company.workspaceId,
      companyId: company.id,
      contactId: primaryContact?.id,
      signalId: topSignal.id,
      score,
      tier,
      status: 'NEW',
      source: 'AUTONOMOUS_ENGINE',
      reason: `${topSignal.title} • Verified decision maker: ${primaryContact ? `${primaryContact.firstName} ${primaryContact.lastName} (${primaryContact.jobTitle})` : 'Executive Search Active'}`,
      summary: `${company.name} shows high buying propensity based on active hiring velocity and verified executive structure.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
