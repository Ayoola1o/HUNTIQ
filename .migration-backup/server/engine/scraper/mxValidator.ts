import { VerificationResult, ScrapedEmailRecord } from './types';

const mxCache = new Map<string, VerificationResult>();

// Known disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'mailinator.com', 'guerrillamail.com', '10minutemail.com',
  'throwawaymail.com', 'yopmail.com', 'trashmail.com', 'dispostable.com',
  'sharklasers.com', 'getairmail.com', 'fakemailgenerator.com'
]);

export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase().trim());
}

/**
 * Resolves MX records via DNS-over-HTTPS (DoH) with multi-provider fallback (Cloudflare -> Google).
 * Works universally without UDP port 53 firewall blocks or native dependencies.
 */
export async function verifyDomainMx(domain: string): Promise<VerificationResult> {
  const cleanDomain = domain.toLowerCase().trim();

  if (mxCache.has(cleanDomain)) {
    return mxCache.get(cleanDomain)!;
  }

  if (isDisposableDomain(cleanDomain)) {
    const res: VerificationResult = {
      status: 'disposable',
      mxRecords: []
    };
    mxCache.set(cleanDomain, res);
    return res;
  }

  // 1. Try Cloudflare DoH
  try {
    const cfUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=MX`;
    const cfRes = await fetch(cfUrl, {
      headers: { 'accept': 'application/dns-json' },
      signal: AbortSignal.timeout(4000)
    });

    if (cfRes.ok) {
      const data = (await cfRes.json()) as any;
      if (Array.isArray(data.Answer) && data.Answer.length > 0) {
        const mxList = data.Answer
          .filter((a: any) => a.type === 15 && a.data)
          .map((a: any) => String(a.data).trim());

        if (mxList.length > 0) {
          const result: VerificationResult = {
            status: 'deliverable',
            mxRecords: mxList
          };
          mxCache.set(cleanDomain, result);
          return result;
        }
      }
    }
  } catch {
    // Fallback to Google DoH
  }

  // 2. Try Google DoH
  try {
    const googleUrl = `https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=MX`;
    const gRes = await fetch(googleUrl, {
      headers: { 'accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });

    if (gRes.ok) {
      const data = (await gRes.json()) as any;
      if (Array.isArray(data.Answer) && data.Answer.length > 0) {
        const mxList = data.Answer
          .filter((a: any) => a.type === 15 && a.data)
          .map((a: any) => String(a.data).trim());

        if (mxList.length > 0) {
          const result: VerificationResult = {
            status: 'deliverable',
            mxRecords: mxList
          };
          mxCache.set(cleanDomain, result);
          return result;
        }
      }
    }
  } catch {
    // Both failed
  }

  const undeliverableResult: VerificationResult = {
    status: 'undeliverable',
    mxRecords: []
  };
  mxCache.set(cleanDomain, undeliverableResult);
  return undeliverableResult;
}

/**
 * Verifies MX deliverability for an array of ScrapedEmailRecord items.
 */
export async function verifyRecordsMx(records: ScrapedEmailRecord[]): Promise<ScrapedEmailRecord[]> {
  const domains = Array.from(new Set(records.map(r => r.domain.toLowerCase().trim())));
  const domainResults = new Map<string, VerificationResult>();

  await Promise.all(
    domains.map(async (d) => {
      try {
        const res = await verifyDomainMx(d);
        domainResults.set(d, res);
      } catch {
        domainResults.set(d, { status: 'undeliverable', mxRecords: [] });
      }
    })
  );

  return records.map(r => {
    const v = domainResults.get(r.domain.toLowerCase().trim());
    if (!v) return r;
    return {
      ...r,
      mxStatus: v.status,
      mxRecords: v.mxRecords
    };
  });
}
