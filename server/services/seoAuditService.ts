import type { SeoAuditResult, RunSeoAuditPayload } from '../../src/types/seoAudit';
import { seoAuditEngine } from '../../src/engine/seoAuditEngine';

export class SeoAuditService {
  private cache: Map<string, SeoAuditResult> = new Map();

  constructor() {
    // Seed with benchmark audit
    const initial = seoAuditEngine.audit({
      businessId: 'disc-loc-1',
      businessName: 'Premier Smile & Dental Studio',
      domain: 'https://premiersmilelagos.com',
      location: 'Lekki, Lagos',
      niche: 'Dental Clinic'
    });
    this.cache.set(initial.id, initial);
    this.cache.set(initial.businessId, initial);
  }

  /**
   * Run full SEO Audit on business or domain.
   */
  public analyze(payload: RunSeoAuditPayload): SeoAuditResult {
    const result = seoAuditEngine.audit(payload);
    this.cache.set(result.id, result);
    if (result.businessId) {
      this.cache.set(result.businessId, result);
    }
    return result;
  }

  /**
   * Retrieve an audit result by audit ID or business ID.
   */
  public getById(id: string): SeoAuditResult | undefined {
    return this.cache.get(id);
  }
}

export const seoAuditService = new SeoAuditService();
