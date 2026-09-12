import {
  ScrapedEmailRecord,
  HttpScraperOptions,
  WebsiteCrawlerOptions,
  CrawlProgress
} from './types';
import {
  extractEmailRecordsFromHtml,
  extractPageTitle
} from './emailExtractor';
import { verifyRecordsMx } from './mxValidator';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Normalizes a URL, resolving relative paths against the baseUrl and stripping fragments/assets
 */
function normalizeUrl(url: string, baseUrl: string): string | null {
  try {
    const base = new URL(baseUrl);
    const resolved = new URL(url, base);
    resolved.hash = '';

    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
      return null;
    }

    const pathname = resolved.pathname.toLowerCase();
    if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf|pdf|zip|mp4|webm)$/)) {
      return null;
    }

    return resolved.href;
  } catch {
    return null;
  }
}

/**
 * Extracts links from HTML markup
 */
function extractLinks(html: string, baseUrl: string): Set<string> {
  const links = new Set<string>();
  const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim();
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }
    const normalized = normalizeUrl(href, baseUrl);
    if (normalized) {
      links.add(normalized);
    }
  }

  return links;
}

/**
 * Scrapes detailed email records with page title and context snippets from a single webpage
 */
export async function scrapeEmailRecordsFromUrl(
  url: string,
  options: HttpScraperOptions = {},
  verifyMx = true
): Promise<{ records: ScrapedEmailRecord[]; pageTitle: string; statusCode: number }> {
  const {
    timeout = 10000,
    headers = {},
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  } = options;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...headers
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const pageTitle = extractPageTitle(html);
    let records = extractEmailRecordsFromHtml(html, url, pageTitle);

    if (verifyMx && records.length > 0) {
      records = await verifyRecordsMx(records);
    }

    return { records, pageTitle, statusCode: response.status };
  } catch (error: any) {
    throw new Error(`Failed to scrape ${url}: ${error.message}`);
  }
}

/**
 * Recursively crawls a website up to maxDepth and maxPages to extract contacts
 */
export async function scrapeEmailRecordsFromWebsite(
  startUrl: string,
  options: WebsiteCrawlerOptions = {},
  verifyMx = true
): Promise<{
  records: ScrapedEmailRecord[];
  pagesVisited: number;
  errors: number;
}> {
  const {
    maxDepth = 2,
    maxPages = 25,
    sameDomainOnly = true,
    timeout = 10000,
    delayMs = 150,
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    onProgress,
    onRecordFound,
    onError,
    isCancelled
  } = options;

  const startDomain = new URL(startUrl).hostname.toLowerCase();
  const visited = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
  const uniqueRecordsMap = new Map<string, ScrapedEmailRecord>();
  let errorCount = 0;

  while (queue.length > 0 && visited.size < maxPages) {
    if (isCancelled && isCancelled()) {
      break;
    }

    const current = queue.shift()!;
    if (visited.has(current.url)) continue;
    visited.add(current.url);

    if (visited.size > 1 && delayMs > 0) {
      await sleep(delayMs);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(current.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const pageTitle = extractPageTitle(html);
      const pageRecords = extractEmailRecordsFromHtml(html, current.url, pageTitle, current.depth);

      let foundOnThisPage = 0;
      for (const rec of pageRecords) {
        if (!uniqueRecordsMap.has(rec.email)) {
          uniqueRecordsMap.set(rec.email, rec);
          foundOnThisPage++;
          if (onRecordFound) onRecordFound(rec);
        }
      }

      if (onProgress) {
        onProgress({
          url: current.url,
          depth: current.depth,
          pagesVisited: visited.size,
          maxPages,
          queueLength: queue.length,
          emailsFoundOnPage: foundOnThisPage,
          totalUniqueEmails: uniqueRecordsMap.size,
          pageTitle,
          statusCode: response.status
        });
      }

      // Discover new links if within depth limit
      if (current.depth < maxDepth) {
        const links = extractLinks(html, current.url);
        for (const link of links) {
          if (visited.has(link)) continue;
          if (queue.some(q => q.url === link)) continue;

          if (sameDomainOnly) {
            try {
              const linkDomain = new URL(link).hostname.toLowerCase();
              if (linkDomain !== startDomain && !linkDomain.endsWith(`.${startDomain}`)) {
                continue;
              }
            } catch {
              continue;
            }
          }

          // Prioritize contact, team, leadership, and about pages
          const lPath = link.toLowerCase();
          const isHighPriority = lPath.includes('contact') || lPath.includes('about') || lPath.includes('team') || lPath.includes('leadership') || lPath.includes('people') || lPath.includes('staff');

          if (isHighPriority) {
            queue.unshift({ url: link, depth: current.depth + 1 });
          } else {
            queue.push({ url: link, depth: current.depth + 1 });
          }
        }
      }
    } catch (err: any) {
      errorCount++;
      if (onError) onError(current.url, err);
    }
  }

  let finalRecords = Array.from(uniqueRecordsMap.values());
  if (verifyMx && finalRecords.length > 0) {
    finalRecords = await verifyRecordsMx(finalRecords);
  }

  return {
    records: finalRecords,
    pagesVisited: visited.size,
    errors: errorCount
  };
}
