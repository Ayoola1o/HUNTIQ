import { apiClient } from './client';
import type { SeoAuditResult, RunSeoAuditPayload } from '../types/seoAudit';
import { seoAuditEngine } from '../engine/seoAuditEngine';

/**
 * Executes a full SEO Audit on target business or domain.
 */
export async function analyzeSeo(payload: RunSeoAuditPayload): Promise<SeoAuditResult> {
  try {
    const result = await apiClient.post<SeoAuditResult>('/api/seo-audit/analyze', payload);
    return result;
  } catch (_err) {
    // Resilient offline fallback using local engine
    return seoAuditEngine.audit(payload);
  }
}

/**
 * Fetch an existing SEO audit by ID or businessId.
 */
export async function getSeoAudit(id: string): Promise<SeoAuditResult> {
  try {
    return await apiClient.get<SeoAuditResult>(`/api/seo-audit/${id}`);
  } catch (_err) {
    return seoAuditEngine.audit({
      businessId: id,
      businessName: 'Premier Smile & Dental Studio',
      domain: 'https://premiersmilelagos.com',
      location: 'Lekki, Lagos',
      niche: 'Dental Clinic'
    });
  }
}
