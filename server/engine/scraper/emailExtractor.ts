import { ScrapedEmailRecord } from './types';
import { isDisposableDomain } from './mxValidator';

/**
 * Common file extensions that frequently trigger false-positive regex matches in HTML/JS
 */
const ASSET_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico',
  'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'less', 'map',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'mp4', 'webm', 'ogg', 'mp3', 'wav',
  'json', 'xml', 'pdf', 'zip', 'tar', 'gz'
]);

/**
 * Common role-based email prefixes
 */
const ROLE_PREFIXES = new Set([
  'info', 'support', 'contact', 'contactus', 'sales', 'admin', 'administrator',
  'team', 'help', 'helpdesk', 'press', 'media', 'pr', 'billing', 'accounts',
  'careers', 'jobs', 'hr', 'recruiting', 'talent', 'privacy', 'legal',
  'compliance', 'security', 'hello', 'hi', 'office', 'inquiries', 'enquiries',
  'service', 'customer', 'feedback', 'marketing', 'media', 'investors',
  'general', 'mailbox', 'frontdesk', 'reception', 'newsletter', 'editor'
]);

/**
 * Comprehensive set of common global and ccTLDs
 */
const COMMON_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'io', 'ai', 'co', 'app', 'dev', 'tech', 'cloud', 'me', 'info', 'biz',
  'ng', 'uk', 'ca', 'de', 'fr', 'za', 'ke', 'gh', 'in', 'au', 'jp', 'cn', 'nl', 'br',
  'xyz', 'online', 'store', 'agency', 'site', 'global', 'media', 'africa'
]);

/**
 * Decodes HTML entities, URL encodings, and common obfuscation tricks
 */
export function decodeObfuscation(text: string): string {
  let decoded = text;

  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    decoded = decoded.replace(/%40/gi, '@').replace(/%2e/gi, '.');
  }

  // HTML numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => {
    try {
      return String.fromCharCode(parseInt(dec, 10));
    } catch {
      return _;
    }
  });
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return _;
    }
  });

  // Common HTML named entities
  decoded = decoded
    .replace(/&commat;/gi, '@')
    .replace(/&period;/gi, '.')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  // Explicit bracketed obfuscation: [at], (at), <at>, {at}, [dot], (dot)
  decoded = decoded.replace(/\s*[\(\[\{<]\s*(?:at|@)\s*[\)\]\}>]\s*/gi, '@');
  decoded = decoded.replace(/\s*[\(\[\{<]\s*(?:dot|\.)\s*[\)\]\}>]\s*/gi, '.');

  // Word-based obfuscation: "username at domain dot com"
  decoded = decoded.replace(/\b([a-zA-Z0-9._%+-]+)\s+at\s+([a-zA-Z0-9-]+)\s+dot\s+([a-zA-Z]{2,})\b/gi, '$1@$2.$3');

  return decoded;
}

/**
 * Validates TLD presence and integrity
 */
export function hasValidTld(email: string): boolean {
  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1].toLowerCase().trim();
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;

  const lastPart = domainParts[domainParts.length - 1];
  if (!lastPart || lastPart.length < 2 || lastPart.length > 24) return false;

  // Disallow common asset extensions as TLDs (e.g. icon@2x.png)
  if (ASSET_EXTENSIONS.has(lastPart)) return false;

  // If multi-part (e.g. co.uk, com.ng), check second-to-last
  if (domainParts.length >= 3) {
    const secondLast = domainParts[domainParts.length - 2];
    if (ASSET_EXTENSIONS.has(secondLast)) return false;
  }

  return true;
}

/**
 * Normalizes an email address to lowercase and trims surrounding whitespace/punctuation
 */
export function normalizeEmail(email: string): string {
  let cleaned = email.toLowerCase().trim();
  cleaned = cleaned.replace(/^[<(\[{'"]+/, '').replace(/[>\])}'",;.]+$/, '');
  return cleaned;
}

/**
 * Checks if an email is role-based
 */
export function isRoleBasedEmail(email: string): boolean {
  const localPart = email.split('@')[0]?.toLowerCase().trim() || '';
  if (ROLE_PREFIXES.has(localPart)) return true;
  const base = localPart.split(/[._\-+]/)[0];
  return ROLE_PREFIXES.has(base);
}

/**
 * Strips HTML tags
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts page title from HTML
 */
export function extractPageTitle(html: string): string {
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  const h1Match = /<h1[^>]*>([^<]+)<\/h1>/i.exec(html);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }
  return '';
}

/**
 * Finds text surrounding an occurrence of a string
 */
export function findContextSnippet(text: string, term: string, radius = 60): string {
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + term.length + radius);
  let snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

/**
 * Extracts phone numbers from HTML markup and plain text
 */
export function extractPhoneNumbersFromHtml(html: string): string[] {
  const phones = new Set<string>();

  // 1. tel: links
  const telRegex = /href=["']tel:([^"']+)["']/gi;
  let match;
  while ((match = telRegex.exec(html)) !== null) {
    const clean = match[1].trim().replace(/[^\d+]/g, '');
    if (clean.length >= 7) phones.add(match[1].trim());
  }

  // 2. International & local phone patterns (+1 (555) 839-2049, +234 802 345 6789)
  const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  while ((match = phonePattern.exec(html)) !== null) {
    const p = match[0].trim();
    if (!p.includes('@') && !p.startsWith('202') && p.length >= 10) {
      phones.add(p);
    }
  }

  return Array.from(phones);
}

/**
 * Extracts social media profile links (LinkedIn, Twitter/X, GitHub) from HTML
 */
export function extractSocialProfiles(html: string): { linkedin?: string; twitter?: string; github?: string } {
  const linkedinRegex = /https?:\/\/(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9._%-]+/i;
  const twitterRegex = /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+/i;
  const githubRegex = /https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9._%-]+/i;

  const linkedinMatch = linkedinRegex.exec(html);
  const twitterMatch = twitterRegex.exec(html);
  const githubMatch = githubRegex.exec(html);

  return {
    linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
    twitter: twitterMatch ? twitterMatch[0] : undefined,
    github: githubMatch ? githubMatch[0] : undefined
  };
}

/**
 * Detects executive and professional job titles from surrounding context
 */
export function detectJobTitle(snippet: string): string | undefined {
  if (!snippet) return undefined;
  const titlePatterns = [
    /\b(?:Chief Executive Officer|CEO)\b/i,
    /\b(?:Chief Technology Officer|CTO)\b/i,
    /\b(?:Chief Operating Officer|COO)\b/i,
    /\b(?:Chief Financial Officer|CFO)\b/i,
    /\b(?:VP|Vice President)(?:\s+of\s+[A-Za-z]+)?\b/i,
    /\b(?:Founder|Co-Founder)\b/i,
    /\b(?:President|Executive Director)\b/i,
    /\b(?:Head of\s+[A-Za-z]+)\b/i,
    /\b(?:Director(?:\s+of\s+[A-Za-z]+)?)\b/i,
    /\b(?:Engineering Lead|Team Lead|Tech Lead)\b/i,
    /\b(?:Senior\s+[A-Za-z]+\s+Engineer)\b/i,
    /\b(?:Software Engineer|Developer|Architect)\b/i,
    /\b(?:Marketing Manager|Product Manager|Project Manager)\b/i,
    /\b(?:Sales Representative|Account Executive)\b/i
  ];

  for (const pattern of titlePatterns) {
    const m = pattern.exec(snippet);
    if (m) return m[0];
  }
  return undefined;
}

/**
 * Infers personal name from the local-part of an email address (e.g. john.doe@ -> John Doe)
 */
export function inferNameFromEmail(email: string): string | undefined {
  if (!email || !email.includes('@')) return undefined;
  const localPart = email.split('@')[0];
  if (!localPart) return undefined;

  const parts = localPart.split(/[._\-+]+/).filter(Boolean);
  if (parts.length === 0) return undefined;

  const cleanParts = parts
    .map(p => p.replace(/\d+/g, '').trim())
    .filter(p => p.length >= 2);

  if (cleanParts.length === 0) return undefined;

  return cleanParts
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extracts raw email candidates from text
 */
export function extractEmails(text: string): Set<string> {
  const decoded = decodeObfuscation(text);
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = decoded.match(emailRegex);
  if (!matches) return new Set();

  const validEmails = matches.filter(hasValidTld);
  return new Set(validEmails);
}

/**
 * Extracts structured email records from HTML with context snippets, detected names, roles, phones, and socials
 */
export function extractEmailRecordsFromHtml(
  html: string,
  sourceUrl: string,
  pageTitle?: string,
  depth = 0
): ScrapedEmailRecord[] {
  const title = pageTitle || extractPageTitle(html);
  const decodedHtml = decodeObfuscation(html);

  const directEmails = new Map<string, { email: string; context: string }>();

  // 1. mailto: links
  const mailtoRegex = /href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})[^"']*["']/gi;
  let mailtoMatch;
  while ((mailtoMatch = mailtoRegex.exec(decodedHtml)) !== null) {
    const rawEmail = mailtoMatch[1];
    if (hasValidTld(rawEmail)) {
      const normalized = normalizeEmail(rawEmail);
      directEmails.set(normalized, {
        email: normalized,
        context: `mailto link on page`
      });
    }
  }

  // 2. Clean text occurrences & context snippets
  const cleanText = stripHtml(decodedHtml);
  const textEmails = extractEmails(cleanText);

  for (const email of textEmails) {
    const normalized = normalizeEmail(email);
    const snippet = findContextSnippet(cleanText, email);
    if (!directEmails.has(normalized)) {
      directEmails.set(normalized, {
        email: normalized,
        context: snippet
      });
    } else if (snippet && directEmails.get(normalized)?.context.includes('mailto link')) {
      directEmails.set(normalized, {
        email: normalized,
        context: snippet
      });
    }
  }

  // 3. Full document scan (metadata, json-ld)
  const fullDocEmails = extractEmails(decodedHtml);
  for (const email of fullDocEmails) {
    const normalized = normalizeEmail(email);
    if (!directEmails.has(normalized)) {
      const rawSnippet = findContextSnippet(decodedHtml, email, 40)
        .replace(/<[^>]+>/g, ' ')
        .replace(/&quot;/gi, '"')
        .replace(/\s+/g, ' ')
        .trim();
      directEmails.set(normalized, {
        email: normalized,
        context: rawSnippet || 'Embedded in page metadata/scripts'
      });
    }
  }

  // Extract page-level phones and socials
  const pagePhones = extractPhoneNumbersFromHtml(html);
  const pageSocials = extractSocialProfiles(html);

  const records: ScrapedEmailRecord[] = [];
  const now = new Date().toISOString();

  for (const [normEmail, data] of directEmails.entries()) {
    const parts = normEmail.split('@');
    const domain = parts[1] || '';
    const isRole = isRoleBasedEmail(normEmail);
    const context = data.context || '';

    const contextPhone = pagePhones.find(p => context.includes(p)) || pagePhones[0];
    const inferredName = isRole ? undefined : inferNameFromEmail(normEmail);
    const jobTitle = detectJobTitle(context) || detectJobTitle(html);

    records.push({
      email: normEmail,
      domain,
      type: isRole ? 'role' : 'personal',
      name: inferredName || undefined,
      jobTitle: jobTitle || undefined,
      phone: contextPhone || undefined,
      socials: pageSocials,
      mxStatus: 'unverified',
      sourceUrl,
      pageTitle: title || undefined,
      contextSnippet: context || undefined,
      depth,
      discoveredAt: now,
      validity: {
        syntax: true,
        tld: true,
        isDisposable: isDisposableDomain(domain)
      }
    });
  }

  return records;
}
