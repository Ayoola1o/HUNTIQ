import type { DiscoveredPlaceBusiness } from '../providers/maps/apifyMapsProvider';

/**
 * Normalizes a website or URL to its root domain.
 */
export function extractRootDomain(url?: string | null): string {
  if (!url) return '';
  let cleaned = url.toLowerCase().trim();
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, '');
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0].trim();
  return cleaned;
}

/**
 * Normalizes a string for fuzzy identity comparison (strips punctuation and excess whitespace).
 */
export function normalizeStringForComparison(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a Google Maps URL, preserving the unique identifier (cid, place_id, or q).
 */
export function normalizeMapsUrl(url?: string | null): string {
  if (!url) return '';
  try {
    const parsed = new URL(url.toLowerCase().trim());
    const cid = parsed.searchParams.get('cid');
    const placeId = parsed.searchParams.get('place_id');
    const q = parsed.searchParams.get('q');
    const idParam = cid ? `cid=${cid}` : placeId ? `place_id=${placeId}` : q ? `q=${q}` : '';
    const basePath = parsed.pathname.replace(/\/+$/, '');
    return `${parsed.hostname}${basePath}${idParam ? '?' + idParam : ''}`;
  } catch {
    return url.toLowerCase().trim().replace(/\/+$/, '');
  }
}

/**
 * Deduplicates an array of DiscoveredPlaceBusiness using the deterministic identity hierarchy:
 * 1. placeId
 * 2. normalized googleMapsUrl
 * 3. normalized website domain
 * 4. normalized clean name + address
 */
export function deduplicateBusinesses(
  businesses: DiscoveredPlaceBusiness[]
): DiscoveredPlaceBusiness[] {
  const seenPlaceIds = new Set<string>();
  const seenMapsUrls = new Set<string>();
  const seenDomains = new Set<string>();
  const seenNameAddresses = new Set<string>();

  const unique: DiscoveredPlaceBusiness[] = [];

  for (const b of businesses) {
    // 1. Check Place ID
    if (b.placeId && b.placeId.trim() !== '') {
      const cleanPlaceId = b.placeId.trim();
      if (seenPlaceIds.has(cleanPlaceId)) {
        continue;
      }
      seenPlaceIds.add(cleanPlaceId);
    }

    // 2. Check Google Maps URL
    if (b.googleMapsUrl && b.googleMapsUrl.trim() !== '') {
      const cleanUrl = normalizeMapsUrl(b.googleMapsUrl);
      if (cleanUrl && seenMapsUrls.has(cleanUrl)) {
        continue;
      }
      if (cleanUrl) seenMapsUrls.add(cleanUrl);
    }

    // 3. Check Website Root Domain
    const domain = extractRootDomain(b.website);
    if (domain && !domain.includes('facebook.com') && !domain.includes('instagram.com') && !domain.includes('google.com')) {
      if (seenDomains.has(domain)) {
        continue;
      }
      seenDomains.add(domain);
    }

    // 4. Check Normalized Name + Address
    const cleanName = normalizeStringForComparison(b.name);
    const cleanAddress = normalizeStringForComparison(b.address);
    if (cleanName && cleanAddress) {
      const key = `${cleanName}|${cleanAddress}`;
      if (seenNameAddresses.has(key)) {
        continue;
      }
      seenNameAddresses.add(key);
    }

    unique.push(b);
  }

  return unique;
}

export const deduplicateDiscoveredPlaces = deduplicateBusinesses;
