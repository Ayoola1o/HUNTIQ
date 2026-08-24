import { db } from '../../db/memoryStore';
import type { DbCompany } from '../../db/types';

export interface CompanyResolutionRequest {
  name?: string;
  domain?: string;
  website?: string;
  sourceUrl?: string;
  boardToken?: string;
  industry?: string;
  city?: string;
  country?: string;
}

export interface CompanyResolutionResult {
  company: DbCompany;
  matchType: 'EXACT_DOMAIN' | 'ALIAS_MATCH' | 'FUZZY_NAME_MATCH' | 'AUTO_CREATED';
  confidence: number; // 0 - 100
  normalizedDomain: string;
  cleanName: string;
  isNew: boolean;
}

export class CompanyResolver {
  private static domainAliases: Record<string, string> = {
    'teamapt.com': 'moniepoint.com',
    'paystackpayments.com': 'paystack.com',
    'theflutterwave.com': 'flutterwave.com'
  };

  /**
   * Normalizes any input URL, email, or domain into a clean root domain.
   * e.g. "https://careers.paystack.com/jobs/101?ref=gh" -> "paystack.com"
   * e.g. "boards.greenhouse.io/flutterwave" -> "flutterwave.com"
   */
  public static normalizeDomain(input?: string): string {
    if (!input) return '';
    let d = input.toLowerCase().trim();

    // Handle greenhouse/lever ATS URLs
    if (d.includes('greenhouse.io/') || d.includes('lever.co/') || d.includes('ashbyhq.com/')) {
      const parts = d.split('/');
      const token = parts[parts.length - 1] || parts[parts.length - 2];
      if (token && !token.includes('.')) {
        return `${token}.com`;
      }
    }

    // Strip protocols
    d = d.replace(/^(https?:\/\/)?(www\.)?/, '');
    // Strip subdomains like careers., jobs., blog.
    d = d.replace(/^(careers|jobs|app|portal|work|join)\./, '');
    // Strip paths and query params
    d = d.split('/')[0].split('?')[0].split('#')[0].trim();

    // Check alias dictionary
    if (this.domainAliases[d]) {
      return this.domainAliases[d];
    }

    return d;
  }

  /**
   * Cleans company legal suffixes and punctuation.
   * e.g. "Paystack Payments Limited" -> "Paystack"
   * e.g. "Flutterwave Inc." -> "Flutterwave"
   */
  public static cleanCompanyName(name?: string): string {
    if (!name) return 'Target Account';

    let clean = name.trim();
    // Remove legal abbreviations
    clean = clean.replace(/\b(ltd|limited|inc|incorporated|llc|plc|corp|corporation|mfb|microfinance bank|technologies|group|holdings|services)\b/gi, '');
    // Strip trailing commas, periods, hyphens
    clean = clean.replace(/[.,\-_]/g, ' ').replace(/\s{2,}/g, ' ').trim();

    return clean || name;
  }

  /**
   * Calculates Levenshtein string similarity (0.0 to 1.0).
   */
  public static calculateSimilarity(s1: string, s2: string): number {
    const longer = s1.length >= s2.length ? s1.toLowerCase() : s2.toLowerCase();
    const shorter = s1.length < s2.length ? s1.toLowerCase() : s2.toLowerCase();

    if (longer.length === 0) return 1.0;
    if (longer.includes(shorter)) return 0.92;

    const costs = [];
    for (let i = 0; i <= longer.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[shorter.length] = lastValue;
    }

    return (longer.length - costs[shorter.length]) / longer.length;
  }

  /**
   * Core Entity Resolution Algorithm.
   * Discovers existing canonical company or automatically creates & indexes a new one.
   */
  public static async resolve(
    req: CompanyResolutionRequest,
    workspaceId: string = 'ws-main'
  ): Promise<CompanyResolutionResult> {
    const rawDomain = req.domain || req.website || req.sourceUrl;
    const normalizedDomain = this.normalizeDomain(rawDomain) || (req.boardToken ? `${req.boardToken}.com` : '');
    const cleanName = this.cleanCompanyName(req.name || (normalizedDomain ? normalizedDomain.split('.')[0] : 'Target Account'));

    const existingCompanies = db.getCompaniesByWorkspace(workspaceId);

    // 1. Exact Domain Match (Confidence: 100%)
    if (normalizedDomain) {
      const match = existingCompanies.find(c => c.domain.toLowerCase() === normalizedDomain.toLowerCase());
      if (match) {
        return {
          company: match,
          matchType: 'EXACT_DOMAIN',
          confidence: 100,
          normalizedDomain,
          cleanName,
          isNew: false
        };
      }
    }

    // 2. Alias / Website Match (Confidence: 95%)
    if (normalizedDomain) {
      const match = existingCompanies.find(c => 
        c.website?.toLowerCase().includes(normalizedDomain) ||
        normalizedDomain.includes(c.domain.toLowerCase())
      );
      if (match) {
        return {
          company: match,
          matchType: 'ALIAS_MATCH',
          confidence: 95,
          normalizedDomain,
          cleanName,
          isNew: false
        };
      }
    }

    // 3. Fuzzy Name Match (Confidence: 85% - 94%)
    if (cleanName && cleanName.length > 2) {
      for (const comp of existingCompanies) {
        const similarity = this.calculateSimilarity(comp.name, cleanName);
        if (similarity >= 0.85) {
          return {
            company: comp,
            matchType: 'FUZZY_NAME_MATCH',
            confidence: Math.round(similarity * 100),
            normalizedDomain,
            cleanName,
            isNew: false
          };
        }
      }
    }

    // 4. Auto-Create & Index New Canonical Company
    const fallbackDomain = normalizedDomain || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const newCompany: DbCompany = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      legalName: req.name || cleanName,
      domain: fallbackDomain,
      website: req.website || `https://${fallbackDomain}`,
      industry: req.industry || 'Technology & FinTech',
      employeeCount: '150',
      employeeRange: '100-250',
      country: req.country || 'Nigeria',
      city: req.city || 'Lagos',
      description: `Canonical company record auto-indexed by HUNTIQ Resolution Engine for ${cleanName}.`,
      logoUrl: `https://${fallbackDomain}/favicon.ico`,
      status: 'ACTIVE',
      firstSeenAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.companies.push(newCompany);

    db.logActivity({
      workspaceId,
      userId: 'usr-1',
      companyId: newCompany.id,
      type: 'COMPANY_TRACKED',
      title: `Canonical Entity Resolved & Indexed: ${newCompany.name}`,
      description: `Discovered and registered ${newCompany.domain} in ${newCompany.city}.`
    });

    return {
      company: newCompany,
      matchType: 'AUTO_CREATED',
      confidence: 90,
      normalizedDomain: fallbackDomain,
      cleanName,
      isNew: true
    };
  }

  /**
   * Merges duplicate company into target canonical company.
   */
  public static async mergeCompanies(
    sourceCompanyId: string,
    targetCompanyId: string,
    workspaceId: string = 'ws-main'
  ): Promise<DbCompany> {
    const source = db.getCompanyById(sourceCompanyId, workspaceId);
    const target = db.getCompanyById(targetCompanyId, workspaceId);

    if (!source || !target) throw new Error('Source or Target company not found');

    // Re-link jobs
    db.jobs.forEach(j => {
      if (j.companyId === sourceCompanyId) j.companyId = targetCompanyId;
    });

    // Re-link contacts
    db.contacts.forEach(c => {
      if (c.companyId === sourceCompanyId) c.companyId = targetCompanyId;
    });

    // Re-link signals & evidence
    db.signals.forEach(s => {
      if (s.companyId === sourceCompanyId) s.companyId = targetCompanyId;
    });
    db.evidence.forEach(e => {
      if (e.companyId === sourceCompanyId) e.companyId = targetCompanyId;
    });

    // Re-link leads
    db.leads.forEach(l => {
      if (l.companyId === sourceCompanyId) l.companyId = targetCompanyId;
    });

    // Archive source
    source.status = 'ARCHIVED';

    db.logActivity({
      workspaceId,
      userId: 'usr-1',
      companyId: target.id,
      type: 'COMPANY_TRACKED',
      title: `Merged Duplicate: ${source.name} into ${target.name}`,
      description: `Consolidated all jobs, signals, contacts, and leads under canonical domain ${target.domain}.`
    });

    return target;
  }
}
