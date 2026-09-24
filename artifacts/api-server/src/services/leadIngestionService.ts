import { randomUUID } from 'crypto';
import { db } from '../db/memoryStore';
import type { DbContact, DbCompany } from '../db/types';
import { CompanyResolver } from '../engine/resolution/companyResolver';
import { hasValidTld, normalizeEmail } from '../engine/scraper/emailExtractor';
import { discoveryJobRepository } from '../repositories/discovery-jobs';
import type {
  HuntIQSyncPayload,
  HuntIQSyncResponse,
  HuntIQContact
} from '../providers/emailScraper/emailScraperTypes';
import type { ContactEvidenceDto } from '../repositories/discovery-jobs/discovery-job-repository';

export interface ExternalLeadPayload {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  phone?: string;
  companyName?: string;
  domain?: string;
  website?: string;
  sourceUrl?: string;
  mxStatus?: 'deliverable' | 'undeliverable' | 'disposable' | 'unverified';
  socials?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  notes?: string;
  identitySource?: 'website' | 'inferred' | 'email_local_part';
}

export interface IngestLeadsOptions {
  source?: string;
  createOutreachDraft?: boolean;
  workspaceId: string;
  userId?: string;
}

export interface IngestLeadsResult {
  totalReceived: number;
  ingestedCount: number;
  duplicateCount: number;
  invalidCount: number;
  contacts: DbContact[];
  outreachDraftsCount: number;
  errors: Array<{ email: string; reason: string }>;
}

export class LeadIngestionService {
  /**
   * Processes structured contact discovery payload delivered by email-scraper.
   * Enforces idempotency, factual resolution, provenance persistence, and inferred/verified segregation.
   */
  public static async processScraperSync(
    payload: HuntIQSyncPayload,
    workspaceId: string
  ): Promise<HuntIQSyncResponse> {
    if (!workspaceId) {
      throw new Error('Workspace ID is strictly required for scraper sync processing');
    }

    // 1. Idempotency Check
    const existingResult = await discoveryJobRepository.getDiscoveryResultByRequestId(
      payload.requestId,
      workspaceId
    );
    if (existingResult) {
      return {
        success: true,
        requestId: payload.requestId,
        accepted: existingResult.acceptedCount,
        rejected: existingResult.rejectedCount,
        duplicates: existingResult.duplicateCount,
        errors: [],
        huntiqResponse: { idempotentReplay: true }
      };
    }

    const errors: string[] = [];
    let accepted = 0;
    let duplicates = 0;
    let rejected = 0;
    const evidenceToSave: ContactEvidenceDto[] = [];

    // Retrieve discovery job if linked to source
    let matchedJobId: string | null = null;
    let jobCompanyName: string | undefined = undefined;
    let jobCompanyId: string | null = null;
    let jobTargetDomain: string | null = null;
    let jobTargetWebsite: string | null = null;

    if (payload.source?.jobId) {
      const existingJob = await discoveryJobRepository.getJobById(payload.source.jobId, workspaceId);
      if (existingJob) {
        matchedJobId = existingJob.id;
        jobCompanyId = existingJob.companyId ?? null;
        jobCompanyName = existingJob.metadata?.companyName;
        jobTargetDomain = existingJob.targetDomain ?? null;
        jobTargetWebsite = existingJob.targetWebsite ?? null;
      }
    }

    // 2. Company Resolution (Grounded in verifiable facts without fabrication)
    let resolvedCompany: DbCompany | null = null;
    let resolutionStatus: 'RESOLVED' | 'UNRESOLVED' = 'UNRESOLVED';
    let matchType: 'EXACT_DOMAIN' | 'ALIAS_MATCH' | 'FUZZY_NAME_MATCH' | 'AUTO_CREATED' | 'JOB_LINKED_COMPANY' | undefined = undefined;

    if (jobCompanyId) {
      const direct = db.getCompaniesByWorkspace(workspaceId).find(c => c.id === jobCompanyId);
      if (direct) {
        resolvedCompany = direct;
        resolutionStatus = 'RESOLVED';
        matchType = 'JOB_LINKED_COMPANY';
      }
    }

    if (!resolvedCompany) {
      const companyRes = await CompanyResolver.resolve(
        {
          name: payload.company?.name || jobCompanyName || undefined,
          domain: payload.company?.domain || jobTargetDomain || undefined,
          website: payload.company?.website || jobTargetWebsite || undefined
        },
        workspaceId,
        { allowAutoCreate: false }
      );
      resolvedCompany = companyRes.company;
      resolutionStatus = companyRes.resolutionStatus;
      matchType = companyRes.matchType;
    }

    if (resolutionStatus === 'RESOLVED' && resolvedCompany) {
      await discoveryJobRepository.recordIntegrationEvent({
        workspaceId,
        eventType: 'COMPANY_RESOLVED',
        provider: 'email-scraper',
        payload: { companyId: resolvedCompany.id, companyName: resolvedCompany.name, matchType }
      });
    } else {
      await discoveryJobRepository.recordIntegrationEvent({
        workspaceId,
        eventType: 'COMPANY_UNRESOLVED',
        provider: 'email-scraper',
        payload: { domain: payload.company?.domain || jobTargetDomain, name: payload.company?.name || jobCompanyName }
      });
    }

    // 3. Contact Ingestion & Normalization
    for (const item of payload.contacts || []) {
      if (!item.email || typeof item.email !== 'string') {
        rejected++;
        errors.push('Missing or invalid email');
        continue;
      }

      const cleanEmail = normalizeEmail(item.email);
      if (!hasValidTld(cleanEmail)) {
        rejected++;
        errors.push(`Invalid email syntax or TLD: ${cleanEmail}`);
        continue;
      }

      // Check if contact already exists in workspace
      const existingContact = db.contacts.find(
        c => c.workspaceId === workspaceId && c.email?.toLowerCase() === cleanEmail
      );

      let targetContactId = existingContact?.id;

      if (existingContact) {
        duplicates++;
        await discoveryJobRepository.recordIntegrationEvent({
          workspaceId,
          eventType: 'CONTACT_DUPLICATE',
          provider: 'email-scraper',
          payload: { email: cleanEmail, contactId: existingContact.id }
        });

        // Non-destructive update: Only update missing verified fields, never overwrite high-confidence with inferred
        if (!existingContact.phone && item.phone) {
          existingContact.phone = item.phone;
        }
        if (!existingContact.linkedinUrl && item.socials?.linkedin) {
          existingContact.linkedinUrl = item.socials.linkedin;
        }
        if ((existingContact.emailStatus === 'UNKNOWN' || (existingContact.emailStatus as any) === 'UNVERIFIED') && item.emailStatus === 'VALIDATED') {
          existingContact.emailStatus = 'VALID';
          existingContact.emailConfidence = Math.max(existingContact.emailConfidence, 90);
        }
        existingContact.updatedAt = new Date().toISOString();
      } else {
        // New contact: Distinguish verified vs inferred data
        accepted++;
        targetContactId = `contact-scraped-${Date.now()}-${randomUUID().substring(0, 6)}`;

        let firstName = '';
        let lastName = '';
        let identitySource: 'WEBSITE' | 'EMAIL_LOCAL_PART' | 'INFERRED' = 'INFERRED';
        let confidence = item.confidence ? Math.round(item.confidence * 100) : 70;

        if (item.name && item.identitySource === 'website') {
          // Verified name from page
          identitySource = 'WEBSITE';
          const parts = item.name.trim().split(/\s+/);
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
          confidence = Math.max(confidence, 85);
        } else if (item.identityInference?.firstName) {
          // Inferred from email or surrounding pattern
          identitySource = 'EMAIL_LOCAL_PART';
          firstName = item.identityInference.firstName;
          lastName = item.identityInference.lastName || '';
          confidence = Math.min(confidence, 60);
        } else {
          // Default unverified local part
          identitySource = 'EMAIL_LOCAL_PART';
          const local = cleanEmail.split('@')[0];
          firstName = local.charAt(0).toUpperCase() + local.slice(1);
          confidence = Math.min(confidence, 50);
        }

        const emailStatus: 'UNKNOWN' | 'VALID' | 'INVALID' | 'RISKY' = item.emailStatus === 'VALIDATED' ? 'VALID' : 'UNKNOWN';

        const newContact: DbContact = {
          id: targetContactId,
          workspaceId,
          companyId: resolvedCompany?.id || null,
          firstName,
          lastName,
          jobTitle: item.jobTitle || 'Business Contact',
          department: 'Commercial',
          seniority: (item.jobTitle || '').match(/Chief|CEO|CTO|COO|CFO|VP|Director|Head|Founder/i) ? 'CXO' : 'MID',
          email: cleanEmail,
          emailStatus,
          emailConfidence: confidence,
          phone: item.phone || undefined,
          linkedinUrl: item.socials?.linkedin || undefined,
          source: 'EXTERNAL_EMAIL_SCRAPER' as any,
          sourceUrl: item.sourceUrl || undefined,
          firstSeenAt: new Date().toISOString(),
          lastVerifiedAt: item.emailStatus === 'VALIDATED' ? new Date().toISOString() : new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        db.contacts.push(newContact);

        await discoveryJobRepository.recordIntegrationEvent({
          workspaceId,
          eventType: 'CONTACT_DISCOVERED',
          provider: 'email-scraper',
          payload: { email: cleanEmail, contactId: newContact.id, identitySource }
        });
      }

      // 4. Contact Evidence & Provenance Recording
      if (targetContactId) {
        evidenceToSave.push({
          workspaceId,
          contactId: targetContactId,
          companyId: resolvedCompany?.id || undefined as any,
          discoveryJobId: matchedJobId,
          email: cleanEmail,
          emailType: item.emailType || 'UNKNOWN',
          emailStatus: item.emailStatus || 'UNVERIFIED',
          confidence: item.confidence ?? 0.70,
          sourceUrl: item.sourceUrl || null,
          sourceType: item.sourceType || 'WEBSITE',
          name: item.name || null,
          jobTitle: item.jobTitle || null,
          identitySource: (item.identitySource === 'website' ? 'WEBSITE' : 'EMAIL_LOCAL_PART'),
          identityInference: item.identityInference || null,
          phone: item.phone || null,
          socials: item.socials || {},
          contextSnippet: item.contextSnippet || null,
          discoveredAt: item.discoveredAt || new Date().toISOString()
        });
      }
    }

    // Persist all contact evidence records
    if (evidenceToSave.length > 0) {
      await discoveryJobRepository.saveContactEvidence(evidenceToSave);
    }

    // 5. Update Scrape Job Status if associated
    if (matchedJobId) {
      let finalStatus: 'COMPLETED' | 'PARTIAL' | 'FAILED' = 'COMPLETED';
      if (accepted === 0 && duplicates === 0 && rejected > 0) {
        finalStatus = 'FAILED';
      } else if (rejected > 0 && accepted > 0) {
        finalStatus = 'PARTIAL';
      } else {
        finalStatus = 'COMPLETED';
      }

      const totalFound = accepted + duplicates;
      await discoveryJobRepository.updateJobStatus(matchedJobId, workspaceId, finalStatus, {
        emailsFound: totalFound
      });

      await discoveryJobRepository.recordIntegrationEvent({
        workspaceId,
        jobId: matchedJobId,
        eventType: finalStatus === 'COMPLETED' ? 'EMAIL_DISCOVERY_COMPLETED' : finalStatus === 'PARTIAL' ? 'EMAIL_DISCOVERY_PARTIAL' : 'EMAIL_DISCOVERY_FAILED',
        provider: 'email-scraper',
        payload: { accepted, duplicates, rejected, totalFound }
      });
    }

    // 6. Save Discovery Result for Idempotency
    await discoveryJobRepository.saveDiscoveryResult({
      jobId: matchedJobId,
      workspaceId,
      companyId: resolvedCompany?.id || null,
      requestId: payload.requestId,
      rawPayload: payload as any,
      resolutionStatus,
      acceptedCount: accepted,
      rejectedCount: rejected,
      duplicateCount: duplicates
    });

    return {
      success: true,
      requestId: payload.requestId,
      accepted,
      rejected,
      duplicates,
      errors
    };
  }

  /**
   * Legacy lead ingestion endpoint adaptor with security and persistence fixes.
   */
  public static async ingestLeads(
    leads: ExternalLeadPayload[],
    options: IngestLeadsOptions
  ): Promise<IngestLeadsResult> {
    const {
      source = 'EXTERNAL_EMAIL_SCRAPER',
      createOutreachDraft = false, // Default to FALSE to eliminate hallucinated outreach
      workspaceId,
      userId
    } = options;

    if (!workspaceId) {
      throw new Error('Workspace ID is strictly required for lead ingestion');
    }

    const savedContacts: DbContact[] = [];
    const errors: Array<{ email: string; reason: string }> = [];
    let duplicateCount = 0;
    let invalidCount = 0;

    for (const item of leads) {
      if (!item.email || typeof item.email !== 'string') {
        invalidCount++;
        errors.push({ email: String(item.email || ''), reason: 'Missing email address' });
        continue;
      }

      const cleanEmail = normalizeEmail(item.email);
      if (!hasValidTld(cleanEmail)) {
        invalidCount++;
        errors.push({ email: cleanEmail, reason: 'Invalid email syntax or TLD' });
        continue;
      }

      // Check existing contact in workspace
      const existing = db.contacts.find(
        c => c.workspaceId === workspaceId && c.email?.toLowerCase() === cleanEmail
      );
      if (existing) {
        duplicateCount++;
        continue;
      }

      // Company resolution without fabrication
      const companyRes = await CompanyResolver.resolve(
        {
          name: item.companyName,
          domain: item.domain,
          website: item.website
        },
        workspaceId,
        { allowAutoCreate: false }
      );

      const resolvedCompany = companyRes.company;

      let firstName = item.firstName || '';
      let lastName = item.lastName || '';
      if (!firstName && !lastName && item.name) {
        const parts = item.name.trim().split(/\s+/);
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
      }
      if (!firstName) {
        const local = cleanEmail.split('@')[0];
        firstName = local.charAt(0).toUpperCase() + local.slice(1);
      }

      const isDeliverable = item.mxStatus === 'deliverable';
      const contactId = `contact-ingest-${Date.now()}-${randomUUID().substring(0, 6)}`;
      const jobTitle = item.jobTitle || 'Executive / Contact';

      const contactRecord: DbContact = {
        id: contactId,
        workspaceId,
        companyId: resolvedCompany?.id || null,
        firstName,
        lastName,
        jobTitle,
        department: 'Commercial',
        seniority: jobTitle.match(/Chief|CEO|CTO|COO|CFO|VP|Director|Head|Founder/i) ? 'CXO' : 'MID',
        email: cleanEmail,
        emailStatus: isDeliverable ? 'VALID' : 'UNKNOWN',
        emailConfidence: isDeliverable ? 90 : 65,
        phone: item.phone || resolvedCompany?.phone || undefined,
        linkedinUrl: item.socials?.linkedin || resolvedCompany?.linkedinUrl || undefined,
        source: source as any,
        sourceUrl: item.sourceUrl,
        firstSeenAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.contacts.push(contactRecord);
      savedContacts.push(contactRecord);

      if (userId) {
        db.logActivity({
          workspaceId,
          userId,
          companyId: contactRecord.companyId || undefined,
          contactId,
          type: 'CONTACT_ADDED',
          title: `Ingested Contact: ${firstName} ${lastName} (${jobTitle})`,
          description: `Imported via API from ${source}. Email: ${cleanEmail}.`
        });
      }
    }

    return {
      totalReceived: leads.length,
      ingestedCount: savedContacts.length,
      duplicateCount,
      invalidCount,
      contacts: savedContacts,
      outreachDraftsCount: 0,
      errors
    };
  }
}
