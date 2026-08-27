import { greenhouseAdapter } from './adapters/greenhouseAdapter';
import { leverAdapter } from './adapters/leverAdapter';
import { ashbyAdapter } from './adapters/ashbyAdapter';
import { SignalDetector } from './detectors/signalDetector';
import { LeadGenerator } from './leadGenerator';
import { db } from '../db/memoryStore';
import type { DbJob } from '../db/types';

export class IngestionEngine {
  public async syncCompanyJobs(companyId: string, workspaceId: string): Promise<{
    jobsCount: number;
    signalsGenerated: number;
    leadsGenerated: number;
  }> {
    const company = db.getCompanyById(companyId, workspaceId);
    if (!company) throw new Error(`Company ${companyId} not found`);

    // Determine adapter based on job sources or fallback to default
    const jobSource = db.jobSources.find(s => s.companyId === companyId);
    const provider = jobSource?.provider || 'GREENHOUSE';
    const identifier = jobSource?.companyIdentifier || company.domain.split('.')[0];

    let adapter = greenhouseAdapter;
    if (provider === 'LEVER') adapter = leverAdapter as any;
    if (provider === 'ASHBY') adapter = ashbyAdapter as any;

    const rawJobs = await adapter.fetchJobs(identifier);
    const normalized = rawJobs.map(r => adapter.normalizeJob(r));

    // Save jobs to database
    const dbJobs: DbJob[] = normalized.map(n => ({
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      companyId,
      sourceId: jobSource?.id,
      externalId: n.externalId,
      title: n.title,
      department: n.department,
      functionArea: n.functionArea,
      seniority: n.seniority,
      location: n.location,
      country: n.country,
      remote: n.remote,
      employmentType: n.employmentType,
      jobUrl: n.jobUrl,
      postedAt: n.postedAt,
      status: 'OPEN',
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    db.jobs.push(...dbJobs);

    // Run Signal Detection
    const detected = SignalDetector.detectFromJobs(company, dbJobs);
    let signalsGenerated = 0;

    for (const bundle of detected) {
      const signalId = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const signalRecord = {
        ...bundle.signal,
        id: signalId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.signals.push(signalRecord);
      signalsGenerated++;

      for (const ev of bundle.evidence) {
        db.evidence.push({
          ...ev,
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          signalId,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Run Lead Generation
    const companySignals = db.getSignalsByCompany(companyId, workspaceId);
    const companyContacts = db.getContactsByCompany(companyId, workspaceId);
    const lead = LeadGenerator.evaluateAndGenerate(company, companySignals, companyContacts);

    let leadsGenerated = 0;
    if (lead) {
      db.leads.push(lead);
      leadsGenerated++;
      db.logActivity({
        workspaceId,
        userId: 'usr-1',
        companyId,
        leadId: lead.id,
        type: 'LEAD_CREATED',
        title: `Autonomous Lead Generated for ${company.name} (Score ${lead.score})`,
        description: lead.reason
      });
    }

    return {
      jobsCount: dbJobs.length,
      signalsGenerated,
      leadsGenerated
    };
  }
}

export const ingestionEngine = new IngestionEngine();
export * from './adapters/types';
export * from './adapters/greenhouseAdapter';
export * from './adapters/leverAdapter';
export * from './adapters/ashbyAdapter';
export * from './normalizer/jobNormalizer';
export * from './detectors/signalDetector';
export * from './detectors/hiringSignalEngine';
export * from './leadGenerator';
export * from './resolution/companyResolver';
export * from './scoring/opportunityScoringEngine';
export * from './enrichment/contactEnrichmentEngine';
