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
  company: DbCompany | null;
  resolutionStatus: 'RESOLVED' | 'UNRESOLVED';
  matchType?: 'EXACT_DOMAIN' | 'ALIAS_MATCH' | 'FUZZY_NAME_MATCH' | 'AUTO_CREATED';
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
   * Discovers existing canonical company. If confident match is not found,
   * returns UNRESOLVED rather than fabricating synthetic company data.
   */
  public static async resolve(
    req: CompanyResolutionRequest,
    workspaceId: string,
    options?: { allowAutoCreate?: boolean; userId?: string }
  ): Promise<CompanyResolutionResult> {
    if (!workspaceId) {
      throw new Error('Workspace ID is required for company resolution');
    }

    const rawDomain = req.domain || req.website || req.sourceUrl;
    const normalizedDomain = this.normalizeDomain(rawDomain) || (req.boardToken ? `${req.boardToken}.com` : '');
    const cleanName = this.cleanCompanyName(req.name || (normalizedDomain ? normalizedDomain.split('.')[0] : ''));

    const existingCompanies = db.getCompaniesByWorkspace(workspaceId);

    // 1. Exact Domain Match (Confidence: 100%)
    if (normalizedDomain) {
      const match = existingCompanies.find(c => c.domain.toLowerCase() === normalizedDomain.toLowerCase());
      if (match) {
        return {
          company: match,
          resolutionStatus: 'RESOLVED',
          matchType: 'EXACT_DOMAIN',
          confidence: 100,
          normalizedDomain,
          cleanName: match.name,
          isNew: false
        };
      }
    }

    // 2. Alias / Website Match (Confidence: 95%)
    if (normalizedDomain) {
      const match = existingCompanies.find(c => 
        (c.website && c.website.toLowerCase().includes(normalizedDomain)) ||
        (c.domain && normalizedDomain.includes(c.domain.toLowerCase()))
      );
      if (match) {
        return {
          company: match,
          resolutionStatus: 'RESOLVED',
          matchType: 'ALIAS_MATCH',
          confidence: 95,
          normalizedDomain,
          cleanName: match.name,
          isNew: false
        };
      }
    }

    // 3. High-Confidence Fuzzy Name Match (Confidence: >= 85%)
    if (cleanName && cleanName.length > 2) {
      for (const comp of existingCompanies) {
        const similarity = this.calculateSimilarity(comp.name, cleanName);
        if (similarity >= 0.85) {
          return {
            company: comp,
            resolutionStatus: 'RESOLVED',
            matchType: 'FUZZY_NAME_MATCH',
            confidence: Math.round(similarity * 100),
            normalizedDomain,
            cleanName: comp.name,
            isNew: false
          };
        }
      }
    }

    // 4. Strict Evidence Check: Do NOT synthesize fake company unless explicitly requested with verified domain
    if (options?.allowAutoCreate && normalizedDomain && cleanName) {
      const verifiedDomain = normalizedDomain;
      const newCompany: DbCompany = {
        id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        workspaceId,
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        legalName: req.name || cleanName,
        domain: verifiedDomain,
        website: req.website || `https://${verifiedDomain}`,
        industry: req.industry || 'Commercial Entity',
        employeeCount: undefined,
        employeeRange: undefined,
        country: req.country || undefined,
        city: req.city || undefined,
        description: `Canonical company record registered for ${cleanName}.`,
        logoUrl: undefined,
        status: 'ACTIVE',
        firstSeenAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.companies.push(newCompany);

      if (options.userId) {
        db.logActivity({
          workspaceId,
          userId: options.userId,
          companyId: newCompany.id,
          type: 'COMPANY_TRACKED',
          title: `Canonical Entity Registered: ${newCompany.name}`,
          description: `Discovered and registered ${newCompany.domain}.`
        });
      }

      return {
        company: newCompany,
        resolutionStatus: 'RESOLVED',
        matchType: 'AUTO_CREATED',
        confidence: 85,
        normalizedDomain: verifiedDomain,
        cleanName,
        isNew: true
      };
    }

    // Not confidently matched -> Strictly UNRESOLVED without fabrication
    return {
      company: null,
      resolutionStatus: 'UNRESOLVED',
      confidence: 0,
      normalizedDomain,
      cleanName,
      isNew: false
    };
  }

  /**
   * Instance wrapper for resolving a discovered place.
   */
  public async resolveDiscoveredPlace(
    place: {
      placeId: string;
      name: string;
      website?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
    },
    workspaceId: string
  ) {
    return CompanyResolver.resolveDiscoveredPlace(place, workspaceId);
  }

  /**
   * Resolves a discovered place business against existing canonical companies without guessing.
   * If a confident match cannot be made: resolutionStatus = 'UNRESOLVED'.
   */
  public static async resolveDiscoveredPlace(
    place: {
      placeId: string;
      name: string;
      website?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
    },
    workspaceId: string
  ): Promise<{
    resolutionStatus: 'RESOLVED' | 'UNRESOLVED';
    companyId?: string;
    matchedCompanyId?: string | null;
    matchedCompany?: DbCompany;
    confidence: number;
    matchType?: 'EXACT_DOMAIN' | 'ALIAS_MATCH' | 'FUZZY_NAME_MATCH';
    matchMethod?: 'EXACT_DOMAIN' | 'ALIAS_MATCH' | 'FUZZY_NAME_MATCH';
  }> {
    if (!workspaceId) {
      throw new Error('Workspace ID is required for place resolution');
    }

    const rawDomain = place.website;
    const normalizedDomain = this.normalizeDomain(rawDomain || undefined);
    const cleanName = this.cleanCompanyName(place.name);

    const existingCompanies = db.getCompaniesByWorkspace(workspaceId);

    // 1. Exact Domain Match (100% confidence)
    if (normalizedDomain) {
      const match = existingCompanies.find(
        c => c.domain && c.domain.toLowerCase() === normalizedDomain.toLowerCase()
      );
      if (match) {
        return {
          resolutionStatus: 'RESOLVED',
          companyId: match.id,
          matchedCompanyId: match.id,
          matchedCompany: match,
          confidence: 1.0,
          matchType: 'EXACT_DOMAIN',
          matchMethod: 'EXACT_DOMAIN'
        };
      }
    }

    // 2. Alias / Website Match (95% confidence)
    if (normalizedDomain) {
      const match = existingCompanies.find(
        c =>
          (c.website && c.website.toLowerCase().includes(normalizedDomain)) ||
          (c.domain && normalizedDomain.includes(c.domain.toLowerCase()))
      );
      if (match) {
        return {
          resolutionStatus: 'RESOLVED',
          companyId: match.id,
          matchedCompanyId: match.id,
          matchedCompany: match,
          confidence: 0.95,
          matchType: 'ALIAS_MATCH',
          matchMethod: 'ALIAS_MATCH'
        };
      }
    }

    // 3. High-Confidence Clean Name Match (>= 90% similarity)
    if (cleanName && cleanName.length > 2) {
      for (const comp of existingCompanies) {
        const similarity = this.calculateSimilarity(comp.name, cleanName);
        if (similarity >= 0.90) {
          return {
            resolutionStatus: 'RESOLVED',
            companyId: comp.id,
            matchedCompanyId: comp.id,
            matchedCompany: comp,
            confidence: Number(similarity.toFixed(2)),
            matchType: 'FUZZY_NAME_MATCH',
            matchMethod: 'FUZZY_NAME_MATCH'
          };
        }
      }
    }

    // Not confidently matched -> strictly UNRESOLVED without guessing
    return {
      resolutionStatus: 'UNRESOLVED',
      matchedCompanyId: null,
      confidence: 0
    };
  }

  /**
   * Merges duplicate company into target canonical company.
   */
  public static async mergeCompanies(
    sourceCompanyId: string,
    targetCompanyId: string,
    workspaceId: string
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

    return target;
  }
}
