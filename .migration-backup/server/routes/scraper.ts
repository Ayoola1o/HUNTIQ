import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import type { AuthenticatedRequest } from '../middleware/auth';
import {
  scrapeEmailRecordsFromUrl,
  scrapeEmailRecordsFromWebsite,
  ScrapedEmailRecord,
  CrawlProgress
} from '../engine/scraper';
import { db } from '../db/memoryStore';
import type { DbContact } from '../db/types';
import { validateSafeScrapeUrl } from '../utils/urlValidator';

export const scraperRouter = Router();

interface ActiveCrawlSession {
  id: string;
  workspaceId: string;
  url: string;
  status: 'running' | 'completed' | 'cancelled' | 'error';
  progress?: CrawlProgress;
  records: ScrapedEmailRecord[];
  pagesVisited: number;
  errors: number;
  startedAt: number;
  endedAt?: number;
  cancelled: boolean;
  listeners: Array<(event: string, data: any) => void>;
}

const activeCrawlJobs = new Map<string, ActiveCrawlSession>();

// Cleanup stale sessions (>1hr)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, job] of activeCrawlJobs.entries()) {
    if (job.endedAt && now - job.endedAt > 3600000) {
      activeCrawlJobs.delete(id);
    }
  }
}, 60000);
cleanupTimer.unref();

function broadcastEvent(job: ActiveCrawlSession, event: string, data: any) {
  for (const listener of job.listeners) {
    try {
      listener(event, data);
    } catch {
      // Ignore listener error
    }
  }
}

/**
 * POST /api/v1/scraper/page
 * Scrapes emails and contact details from a single webpage
 */
scraperRouter.post('/scraper/page', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { url, timeout = 12000, verifyMx = true } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_URL', message: 'Valid http or https URL is required' }
      });
    }

    const validation = await validateSafeScrapeUrl(url.trim());
    if (!validation.safe) {
      return res.status(400).json({
        success: false,
        error: { code: 'SSRF_RESTRICTION', message: validation.error }
      });
    }

    const result = await scrapeEmailRecordsFromUrl(url.trim(), { timeout }, Boolean(verifyMx));

    return res.json({
      success: true,
      data: {
        url: url.trim(),
        pageTitle: result.pageTitle,
        statusCode: result.statusCode,
        count: result.records.length,
        records: result.records
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SCRAPE_ERROR', message: err.message || 'Failed to scrape webpage' }
    });
  }
});

/**
 * POST /api/v1/scraper/crawl
 * Initiates an asynchronous domain crawl for contact discovery
 */
scraperRouter.post('/scraper/crawl', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      url,
      maxDepth = 2,
      maxPages = 20,
      sameDomainOnly = true,
      timeout = 10000,
      delayMs = 150,
      verifyMx = true
    } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_URL', message: 'Valid http or https URL is required' }
      });
    }

    const validation = await validateSafeScrapeUrl(url.trim());
    if (!validation.safe) {
      return res.status(400).json({
        success: false,
        error: { code: 'SSRF_RESTRICTION', message: validation.error }
      });
    }

    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }
    const jobId = `job-crawl-${Date.now()}-${randomUUID().substring(0, 6)}`;

    const job: ActiveCrawlSession = {
      id: jobId,
      workspaceId,
      url: url.trim(),
      status: 'running',
      records: [],
      pagesVisited: 0,
      errors: 0,
      startedAt: Date.now(),
      cancelled: false,
      listeners: []
    };

    activeCrawlJobs.set(jobId, job);

    // Asynchronous background crawl execution
    (async () => {
      try {
        const result = await scrapeEmailRecordsFromWebsite(
          job.url,
          {
            maxDepth: Math.min(3, parseInt(String(maxDepth), 10) || 2),
            maxPages: Math.min(50, parseInt(String(maxPages), 10) || 20),
            sameDomainOnly: Boolean(sameDomainOnly),
            timeout: parseInt(String(timeout), 10) || 10000,
            delayMs: parseInt(String(delayMs), 10) || 150,
            isCancelled: () => job.cancelled,
            onProgress: (progress) => {
              job.progress = progress;
              job.pagesVisited = progress.pagesVisited;
              broadcastEvent(job, 'progress', progress);
            },
            onRecordFound: (rec) => {
              job.records.push(rec);
              broadcastEvent(job, 'record', rec);
            },
            onError: (errUrl, err) => {
              job.errors++;
              broadcastEvent(job, 'crawler_error', { url: errUrl, message: err.message });
            }
          },
          Boolean(verifyMx)
        );

        job.status = job.cancelled ? 'cancelled' : 'completed';
        job.records = result.records;
        job.pagesVisited = result.pagesVisited;
        job.errors = result.errors;
        job.endedAt = Date.now();

        broadcastEvent(job, 'done', {
          jobId,
          status: job.status,
          totalRecords: job.records.length,
          pagesVisited: job.pagesVisited,
          errors: job.errors,
          durationMs: job.endedAt - job.startedAt,
          records: job.records
        });
      } catch (err: any) {
        job.status = 'error';
        job.endedAt = Date.now();
        broadcastEvent(job, 'error', { message: err.message });
      }
    })();

    res.json({
      success: true,
      data: {
        jobId,
        url: job.url,
        streamUrl: `/api/v1/scraper/crawl/stream/${jobId}`
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CRAWL_INIT_ERROR', message: err.message }
    });
  }
});

/**
 * GET /api/v1/scraper/crawl/stream/:jobId
 * SSE endpoint for live crawler telemetry
 */
scraperRouter.get('/scraper/crawl/stream/:jobId', (req: AuthenticatedRequest, res: Response) => {
  const jobId = req.params.jobId;
  const job = activeCrawlJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: { code: 'JOB_NOT_FOUND', message: 'Crawl job not found' }
    });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Initial event
  res.write(`event: init\ndata: ${JSON.stringify({ jobId, status: job.status, url: job.url })}\n\n`);

  const listener = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  job.listeners.push(listener);

  if (job.status === 'completed' || job.status === 'cancelled' || job.status === 'error') {
    res.write(`event: done\ndata: ${JSON.stringify({
      jobId,
      status: job.status,
      totalRecords: job.records.length,
      pagesVisited: job.pagesVisited,
      durationMs: (job.endedAt || Date.now()) - job.startedAt,
      records: job.records
    })}\n\n`);
  }

  req.on('close', () => {
    job.listeners = job.listeners.filter(l => l !== listener);
  });
});

/**
 * POST /api/v1/scraper/crawl/cancel/:jobId
 * Cancels a running crawl session
 */
scraperRouter.post('/scraper/crawl/cancel/:jobId', (req: AuthenticatedRequest, res: Response) => {
  const jobId = req.params.jobId;
  const job = activeCrawlJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: { code: 'JOB_NOT_FOUND', message: 'Crawl job not found' }
    });
  }

  job.cancelled = true;
  job.status = 'cancelled';
  broadcastEvent(job, 'cancelled', { jobId });

  res.json({
    success: true,
    data: { jobId, status: 'cancelled' }
  });
});

/**
 * POST /api/v1/scraper/batch
 * Batch processes an array of URLs with delay intervals
 */
scraperRouter.post('/scraper/batch', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { urls, timeout = 10000, delayMs = 150, verifyMx = true } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_URLS', message: 'An array of URLs is required' }
      });
    }

    const cleanUrls = urls
      .map((u: string) => String(u).trim())
      .filter((u: string) => u.startsWith('http://') || u.startsWith('https://'))
      .slice(0, 20); // Cap at 20 per request

    const uniqueMap = new Map<string, ScrapedEmailRecord>();
    const summary: Array<{ url: string; success: boolean; count: number; error?: string }> = [];

    for (let i = 0; i < cleanUrls.length; i++) {
      const targetUrl = cleanUrls[i];
      if (i > 0 && delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }
      try {
        const { records } = await scrapeEmailRecordsFromUrl(targetUrl, { timeout }, Boolean(verifyMx));
        for (const rec of records) {
          if (!uniqueMap.has(rec.email.toLowerCase())) {
            uniqueMap.set(rec.email.toLowerCase(), rec);
          }
        }
        summary.push({ url: targetUrl, success: true, count: records.length });
      } catch (err: any) {
        summary.push({ url: targetUrl, success: false, count: 0, error: err.message });
      }
    }

    res.json({
      success: true,
      data: {
        totalProcessed: cleanUrls.length,
        uniqueEmailsFound: uniqueMap.size,
        summary,
        records: Array.from(uniqueMap.values())
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'BATCH_SCRAPE_ERROR', message: err.message }
    });
  }
});

/**
 * POST /api/v1/scraper/save-contacts
 * Converts scraped records into permanent HUNTIQ CRM contacts
 */
scraperRouter.post('/scraper/save-contacts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { records, companyId, companyName } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMPTY_RECORDS', message: 'No records provided to save' }
      });
    }

    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }
    const savedContacts: DbContact[] = [];

    for (const rec of records) {
      const email = (rec.email || '').toLowerCase().trim();
      if (!email) continue;

      // Deduplicate against existing workspace contacts
      const existing = db.contacts.find(
        c => c.workspaceId === workspaceId && c.email.toLowerCase() === email
      );
      if (existing) continue;

      let firstName = '';
      let lastName = '';
      if (rec.name) {
        const parts = rec.name.trim().split(' ');
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
      } else {
        const rawLocal = email.split('@')[0];
        firstName = rawLocal.charAt(0).toUpperCase() + rawLocal.slice(1);
      }

      const isDeliverable = rec.mxStatus === 'deliverable';
      const contact: DbContact = {
        id: `contact-scraped-${Date.now()}-${randomUUID().substring(0, 6)}`,
        workspaceId,
        companyId: companyId || undefined,
        firstName,
        lastName,
        jobTitle: rec.jobTitle || (rec.type === 'role' ? 'Inquiries / Operations' : 'Decision Maker'),
        department: rec.type === 'role' ? 'Operations' : 'Executive',
        seniority: rec.jobTitle?.match(/Chief|CEO|CTO|COO|CFO|VP|Director|Head|Founder/i) ? 'CXO' : 'MID',
        email,
        emailStatus: isDeliverable ? 'VALID' : 'UNVERIFIED',
        emailConfidence: isDeliverable ? 95 : 65,
        phone: rec.phone || undefined,
        linkedinUrl: rec.socials?.linkedin || undefined,
        source: 'HUNTIQ_WEB_EMAIL_SCRAPER',
        sourceUrl: rec.sourceUrl,
        firstSeenAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.contacts.push(contact);
      savedContacts.push(contact);

      db.logActivity({
        workspaceId,
        userId: req.user?.id || 'usr-1',
        companyId: companyId || undefined,
        contactId: contact.id,
        type: 'CONTACT_ADDED',
        title: `Captured Contact: ${contact.firstName} ${contact.lastName} (${contact.jobTitle})`,
        description: `Saved from Web Scraper (${rec.sourceUrl}) with MX deliverability: ${rec.mxStatus || 'unverified'}.`
      });
    }

    res.json({
      success: true,
      data: {
        savedCount: savedContacts.length,
        contacts: savedContacts
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SAVE_CONTACTS_ERROR', message: err.message }
    });
  }
});
