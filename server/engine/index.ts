import { jobProviderRegistry, registerDefaultJobProviders } from '../providers/jobs';
import type { JobProviderName, JobSource, NormalizedJob } from '../providers/jobs/job-provider';
import { PostgresJobRepository, InMemoryJobRepository } from '../repositories/jobs';
import { PostgresSignalRepository, InMemorySignalRepository } from '../repositories/signals';
import { PostgresLeadRepository, InMemoryLeadRepository } from '../repositories/leads';
import { PostgresCompanyRepository, InMemoryCompanyRepository } from '../repositories/companies';
import { HiringSignalEngine } from './detectors/hiringSignalEngine';
import { LeadGenerator } from './leadGenerator';
import { db } from '../db/memoryStore';
import { pool } from '../database/postgres';
import { Logger } from '../services/logger';
import type { DbJob, DbCompany } from '../db/types';

// Initialize providers
registerDefaultJobProviders();

export class IngestionEngine {
  private jobRepo = pool ? new PostgresJobRepository(pool) : new InMemoryJobRepository();
  private signalRepo = pool ? new PostgresSignalRepository(pool) : new InMemorySignalRepository();
  private leadRepo = pool ? new PostgresLeadRepository(pool) : new InMemoryLeadRepository();
  private companyRepo = pool ? new PostgresCompanyRepository(pool) : new InMemoryCompanyRepository();

  public async syncCompanyJobs(companyId: string, workspaceId: string = '00000000-0000-0000-0000-000000000001'): Promise<{
    jobsCount: number;
    createdCount: number;
    updatedCount: number;
    signalsGenerated: number;
    leadsGenerated: number;
  }> {
    const startTime = Date.now();
    Logger.info('JOB_SYNC_STARTED', `Starting job sync for company ${companyId}`, { workspaceId, companyId });

    // 1. Resolve Company
    let company: DbCompany | null = null;
    try {
      company = (await this.companyRepo.findById(companyId)) as any;
    } catch (_e) {}

    if (!company) {
      company = db.getCompanyById(companyId, workspaceId) || null;
    }

    if (!company) {
      Logger.warn('COMPANY_UNRESOLVED', `Company ${companyId} could not be resolved`, { companyId });
      throw new Error(`Company ${companyId} not found in workspace`);
    }

    // 2. Identify Job Provider & Source
    let jobSourceRecord = db.jobSources.find(s => s.companyId === companyId);
    const providerName: JobProviderName = (jobSourceRecord?.provider?.toLowerCase() as JobProviderName) || 'greenhouse';
    const identifier = jobSourceRecord?.companyIdentifier || company.domain?.split('.')[0] || company.name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const provider = jobProviderRegistry.get(providerName) || jobProviderRegistry.get('greenhouse');
    if (!provider) {
      throw new Error(`No provider registered for ${providerName}`);
    }

    const sourceUrl = jobSourceRecord?.sourceUrl || `https://boards.greenhouse.io/${identifier}`;
    const sourceObj: JobSource = {
      id: jobSourceRecord?.id || `src-${companyId}`,
      provider: providerName,
      sourceUrl,
      companyIdentifier: identifier,
      status: 'active',
      lastSyncStatus: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 3. Fetch Jobs via Provider Adapter
    let normalizedJobs: NormalizedJob[] = [];
    try {
      normalizedJobs = await provider.fetchJobs(sourceObj);
    } catch (fetchErr) {
      Logger.error('JOB_SYNC_FAILED', `Provider fetch failed for ${identifier}`, fetchErr, { companyId, provider: providerName });
      throw fetchErr;
    }

    // 4. Upsert Jobs into Database (Atomic Upsert Deduplication)
    const seenAt = new Date().toISOString();
    let upsertResult = { created: 0, updated: 0 };

    try {
      upsertResult = await this.jobRepo.upsertOpenJobs(sourceObj, normalizedJobs, seenAt);
      Logger.info('JOB_CREATED', `Upserted ${normalizedJobs.length} jobs (Created: ${upsertResult.created}, Updated: ${upsertResult.updated})`, {
        companyId,
        provider: providerName,
        counts: normalizedJobs.length
      });
    } catch (_dbErr) {
      // Memory Store fallback if pool is offline
      normalizedJobs.forEach(nj => {
        const existing = db.jobs.find(j => j.sourceId === sourceObj.id && j.externalId === nj.externalId);
        if (existing) {
          existing.title = nj.title;
          existing.description = nj.description;
          existing.location = nj.location || existing.location;
          existing.lastSeenAt = seenAt;
          existing.updatedAt = seenAt;
          upsertResult.updated++;
        } else {
          db.jobs.push({
            id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            workspaceId,
            companyId,
            sourceId: sourceObj.id,
            externalId: nj.externalId,
            title: nj.title,
            department: nj.department || 'General',
            location: nj.location || 'Remote',
            country: nj.country || 'Nigeria',
            remote: nj.isRemote ?? true,
            employmentType: nj.employmentType || 'FULL_TIME',
            jobUrl: nj.jobUrl,
            postedAt: nj.postedAt || seenAt,
            status: 'OPEN',
            firstSeenAt: seenAt,
            lastSeenAt: seenAt,
            createdAt: seenAt,
            updatedAt: seenAt
          });
          upsertResult.created++;
        }
      });
    }

    // Map all open jobs for this company
    const activeCompanyJobs: DbJob[] = db.jobs.filter(j => j.companyId === companyId);

    // 5. Detect Hiring Signals & Multi-Window Velocity
    const signalBundles = HiringSignalEngine.generateSignals(company, activeCompanyJobs);
    let signalsGenerated = 0;

    for (const bundle of signalBundles) {
      try {
        await this.signalRepo.create({
          workspaceId,
          companyId,
          type: bundle.signal.type,
          title: bundle.signal.title,
          summary: bundle.signal.summary,
          strength: bundle.signal.strength.toLowerCase() as any,
          confidence: bundle.signal.confidence / 100,
          detectedAt: new Date(bundle.signal.detectedAt),
          metadata: {
            rationale: bundle.rationale,
            opportunityImpact: bundle.opportunityImpact,
            evidenceCount: bundle.evidence.length
          }
        });
        signalsGenerated++;
        Logger.info('SIGNAL_CREATED', `Created signal ${bundle.signal.type} for ${company.name}`, { companyId, type: bundle.signal.type });
      } catch (_e) {
        // Memory fallback
        db.signals.push({
          ...bundle.signal,
          id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: seenAt,
          updatedAt: seenAt
        });
        signalsGenerated++;
      }
    }

    // 6. Lead Generation & Deduplication
    const companySignals = db.getSignalsByCompany(companyId, workspaceId);
    const companyContacts = db.getContactsByCompany(companyId, workspaceId);
    const qualifiedLead = LeadGenerator.evaluateAndGenerate(company, companySignals, companyContacts);
    let leadsGenerated = 0;

    if (qualifiedLead) {
      try {
        await this.leadRepo.upsert({
          workspaceId,
          companyId,
          contactId: qualifiedLead.contactId,
          signalId: qualifiedLead.signalId,
          title: qualifiedLead.reason,
          score: qualifiedLead.score,
          tier: qualifiedLead.tier === 'Tier 1' ? 'HOT' : 'HIGH',
          status: 'NEW',
          reason: qualifiedLead.reason,
          summary: qualifiedLead.summary,
          dealValue: 25000,
          conversionProbability: Math.min(95, Math.round(qualifiedLead.score * 0.9))
        });
        leadsGenerated++;
        Logger.info('LEAD_CREATED', `Generated/Updated qualified lead for ${company.name} (Score: ${qualifiedLead.score})`, {
          companyId,
          score: qualifiedLead.score
        });
      } catch (_e) {
        db.leads.push(qualifiedLead);
        leadsGenerated++;
      }
    }

    const durationMs = Date.now() - startTime;
    Logger.info('JOB_SYNC_COMPLETED', `Completed sync for ${company.name} in ${durationMs}ms`, {
      companyId,
      counts: normalizedJobs.length,
      durationMs
    });

    return {
      jobsCount: normalizedJobs.length,
      createdCount: upsertResult.created,
      updatedCount: upsertResult.updated,
      signalsGenerated,
      leadsGenerated
    };
  }
}

export const ingestionEngine = new IngestionEngine();
export * from './detectors/signalDetector';
export * from './detectors/hiringSignalEngine';
export * from './leadGenerator';
export * from './resolution/companyResolver';
export * from './scoring/opportunityScoringEngine';
export * from './enrichment/contactEnrichmentEngine';
export * from './normalizer/jobNormalizer';
