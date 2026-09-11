/**
 * Configuration module for external Email Scraper integration.
 * Ensures environment variables are validated and never hardcoded.
 */

export interface EmailScraperConfig {
  apiUrl: string;
  apiKey?: string;
  timeoutMs: number;
  enabled: boolean;
}

export class EmailScraperConfigManager {
  public static getConfig(): EmailScraperConfig {
    const rawUrl = process.env.EMAIL_SCRAPER_API_URL || '';
    const rawKey = process.env.EMAIL_SCRAPER_API_KEY || '';
    const rawTimeout = process.env.EMAIL_SCRAPER_TIMEOUT_MS || '15000';
    const rawEnabled = process.env.EMAIL_SCRAPER_ENABLED;

    const enabled = rawEnabled !== undefined
      ? rawEnabled.toLowerCase() === 'true'
      : Boolean(rawUrl.trim());

    return {
      apiUrl: rawUrl.trim().replace(/\/+$/, ''),
      apiKey: rawKey.trim() || undefined,
      timeoutMs: parseInt(rawTimeout, 10) || 15000,
      enabled
    };
  }

  public static isConfigured(): boolean {
    const cfg = this.getConfig();
    return Boolean(cfg.enabled && cfg.apiUrl);
  }
}
