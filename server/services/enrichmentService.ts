import { db } from '../db/memoryStore';
import type { DbContact, DbCompany } from '../db/types';
import { scrapeEmailRecordsFromWebsite } from '../engine/scraper/webScraper';
import { ScrapedEmailRecord } from '../engine/scraper/types';

export interface EnrichmentResult {
  company: DbCompany;
  emailPattern: string;
  contactsAdded: DbContact[];
  verifiedCount: number;
}

export class EnrichmentService {
  /**
   * Enriches a company by crawling its website to discover authentic emails,
   * decision-makers, phones, socials, and MX deliverability.
   * Zero synthetic contacts fabricated.
   */
  public async enrichCompanyContacts(companyId: string, workspaceId: string): Promise<EnrichmentResult> {
    const company = db.getCompanyById(companyId, workspaceId);
    if (!company) throw new Error(`Company '${companyId}' not found`);

    const domain = (company.domain || '').toLowerCase().trim();
    const websiteUrl = company.website || (domain ? `https://${domain}` : '');
    const pattern = domain ? `{first}.{last}@${domain}` : '';

    const added: DbContact[] = [];

    if (websiteUrl) {
      try {
        const crawlResult = await scrapeEmailRecordsFromWebsite(websiteUrl, {
          maxDepth: 1,
          maxPages: 8,
          sameDomainOnly: true,
          timeout: 8000
        }, true);

        for (const record of crawlResult.records) {
          // Check if contact already exists in workspace
          const existing = db.contacts.find(
            c => c.companyId === company.id && c.email.toLowerCase() === record.email.toLowerCase()
          );
          if (existing) continue;

          // Parse name
          let firstName = '';
          let lastName = '';
          if (record.name) {
            const nameParts = record.name.trim().split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          } else {
            const rawLocal = record.email.split('@')[0];
            firstName = rawLocal.charAt(0).toUpperCase() + rawLocal.slice(1);
          }

          const isDeliverable = record.mxStatus === 'deliverable';
          const newContact: DbContact = {
            id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            workspaceId,
            companyId: company.id,
            firstName,
            lastName,
            jobTitle: record.jobTitle || (record.type === 'role' ? 'Department Head / Inquiries' : 'Team Member'),
            department: record.type === 'role' ? 'Operations' : 'Executive',
            seniority: record.jobTitle?.match(/Chief|CEO|CTO|COO|CFO|VP|Director|Head|Founder/i) ? 'CXO' : 'MID',
            email: record.email,
            emailStatus: isDeliverable ? 'VALID' : 'UNVERIFIED',
            emailConfidence: isDeliverable ? 95 : 65,
            phone: record.phone || company.phone || undefined,
            linkedinUrl: record.socials?.linkedin || company.linkedinUrl || undefined,
            source: 'HUNTIQ_WEB_EMAIL_SCRAPER',
            sourceUrl: record.sourceUrl,
            firstSeenAt: new Date().toISOString(),
            lastVerifiedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          db.contacts.push(newContact);
          added.push(newContact);

          db.logActivity({
            workspaceId,
            userId: 'usr-1',
            companyId: company.id,
            contactId: newContact.id,
            type: 'CONTACT_ADDED',
            title: `Discovered Contact: ${newContact.firstName} ${newContact.lastName} (${newContact.jobTitle})`,
            description: `Scraped from ${record.sourceUrl} with MX status: ${record.mxStatus || 'unverified'}.`
          });
        }
      } catch (err: any) {
        console.warn(`[ENRICHMENT] Website crawl failed for ${company.name} (${websiteUrl}): ${err.message}`);
      }
    }

    return {
      company,
      emailPattern: pattern,
      contactsAdded: added,
      verifiedCount: added.filter(c => c.emailStatus === 'VALID').length
    };
  }
}

export const enrichmentService = new EnrichmentService();
