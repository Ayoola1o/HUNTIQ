import { randomUUID } from 'crypto';
import { db } from '../db/memoryStore';
import type { DbContact, DbCompany } from '../db/types';
import { outreachRepository } from '../repositories/outreach';
import { hasValidTld, normalizeEmail } from '../engine/scraper/emailExtractor';

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
   * Ingests an array of leads from an external scraper app into HUNTIQ Contacts and Outreach queue.
   */
  public static async ingestLeads(
    leads: ExternalLeadPayload[],
    options: IngestLeadsOptions
  ): Promise<IngestLeadsResult> {
    const {
      source = 'EXTERNAL_EMAIL_SCRAPER',
      createOutreachDraft = true,
      workspaceId,
      userId = 'usr-1'
    } = options;

    const savedContacts: DbContact[] = [];
    const errors: Array<{ email: string; reason: string }> = [];
    let duplicateCount = 0;
    let invalidCount = 0;
    let draftsCreated = 0;

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

      // Check if contact already exists in this workspace
      const existing = db.contacts.find(
        c => c.workspaceId === workspaceId && c.email.toLowerCase() === cleanEmail
      );
      if (existing) {
        duplicateCount++;
        continue;
      }

      // Resolve company
      const emailDomain = cleanEmail.split('@')[1];
      const targetDomain = item.domain || (item.website ? item.website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] : emailDomain);
      const targetCompanyName = item.companyName || targetDomain.split('.')[0].toUpperCase();

      let company = db.companies.find(
        c => c.workspaceId === workspaceId && (
          (c.domain && c.domain.toLowerCase() === targetDomain.toLowerCase()) ||
          (c.name && c.name.toLowerCase() === targetCompanyName.toLowerCase())
        )
      );

      if (!company) {
        // Create company record
        company = {
          id: `comp-scraped-${Date.now()}-${randomUUID().substring(0, 5)}`,
          workspaceId,
          name: targetCompanyName,
          domain: targetDomain,
          website: item.website || `https://${targetDomain}`,
          industry: 'Commercial Entity',
          status: 'ACTIVE',
          phone: item.phone,
          linkedinUrl: item.socials?.linkedin,
          firstSeenAt: new Date().toISOString(),
          lastVerifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.companies.push(company);
      }

      // Parse name
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
        companyId: company.id,
        firstName,
        lastName,
        jobTitle,
        department: 'Commercial',
        seniority: jobTitle.match(/Chief|CEO|CTO|COO|CFO|VP|Director|Head|Founder/i) ? 'CXO' : 'MID',
        email: cleanEmail,
        emailStatus: isDeliverable ? 'VALID' : 'UNVERIFIED',
        emailConfidence: isDeliverable ? 95 : 70,
        phone: item.phone || company.phone || undefined,
        linkedinUrl: item.socials?.linkedin || company.linkedinUrl || undefined,
        source: source as any,
        sourceUrl: item.sourceUrl,
        firstSeenAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.contacts.push(contactRecord);
      savedContacts.push(contactRecord);

      // Create an Outreach Draft ready for review in HUNTIQ Outreach UI
      if (createOutreachDraft) {
        try {
          const threadId = `outreach-ingest-${Date.now()}-${randomUUID().substring(0, 5)}`;
          const subject = `Modernizing ${company.name}'s digital infrastructure & growth`;
          const pitchSnippet = `Hi ${firstName},\n\nI noticed ${company.name}'s recent developments and wanted to reach out regarding our growth & intelligence infrastructure at HUNTIQ.\n\nWould you have 10 minutes for a brief introductory conversation this week?`;

          await outreachRepository.create({
            id: threadId,
            companyName: company.name,
            contactName: `${firstName} ${lastName}`.trim(),
            contactRole: jobTitle,
            email: cleanEmail,
            emailStatus: isDeliverable ? 'verified' : 'unverified',
            avatarBg: '#eff6ff',
            avatarColor: '#2563eb',
            subject,
            lastMessageSnippet: pitchSnippet.slice(0, 90) + '...',
            lastMessageTime: 'Ready for Review',
            status: 'draft',
            channel: 'email',
            campaignName: `Ingested from ${source}`,
            opportunityScore: 85,
            unread: true,
            thread: [
              {
                id: `msg-draft-${Date.now()}`,
                sender: 'me',
                senderName: 'Sales Director',
                content: pitchSnippet,
                timestamp: 'Drafted just now',
                channel: 'email',
                status: 'draft'
              }
            ]
          }, workspaceId);

          draftsCreated++;
        } catch (err: any) {
          console.warn(`[INGEST] Failed to create outreach draft for ${cleanEmail}: ${err.message}`);
        }
      }

      // Log Activity
      db.logActivity({
        workspaceId,
        userId,
        companyId: company.id,
        contactId,
        type: 'CONTACT_ADDED',
        title: `Ingested Contact: ${firstName} ${lastName} (${jobTitle})`,
        description: `Imported via API from ${source}. Email: ${cleanEmail}.`
      });
    }

    return {
      totalReceived: leads.length,
      ingestedCount: savedContacts.length,
      duplicateCount,
      invalidCount,
      contacts: savedContacts,
      outreachDraftsCount: draftsCreated,
      errors
    };
  }
}
