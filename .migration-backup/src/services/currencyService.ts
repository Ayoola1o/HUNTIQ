/**
 * Live Multi-Currency & FX Exchange Rate Service
 * Fetches real-time spot exchange rates with 1-hour local caching and resilient fallbacks.
 */

export type CurrencyCode = 'USD' | 'NGN' | 'GBP' | 'EUR' | 'CAD' | 'KES' | 'ZAR';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', flag: '🇺🇸' },
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', locale: 'en-NG', flag: '🇳🇬' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', flag: '🇬🇧' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', flag: '🇪🇺' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA', flag: '🇨🇦' },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', locale: 'en-KE', flag: '🇰🇪' },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA', flag: '🇿🇦' },
};

// Resilient default baseline rates (USD base = 1.0)
const DEFAULT_FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  NGN: 1540.0,
  GBP: 0.78,
  EUR: 0.92,
  CAD: 1.38,
  KES: 129.5,
  ZAR: 18.25,
};

const CACHE_KEY = 'huntiq_fx_rates_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour TTL

interface CachedRates {
  timestamp: number;
  rates: Record<string, number>;
}

class CurrencyService {
  private rates: Record<string, number> = { ...DEFAULT_FALLBACK_RATES };
  private isFetching = false;
  private lastFetchTime = 0;

  constructor() {
    this.loadFromCache();
    // Non-blocking background fetch
    this.refreshRates().catch(() => {});
  }

  private loadFromCache() {
    try {
      if (typeof window === 'undefined') return;
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedRates = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          this.rates = { ...DEFAULT_FALLBACK_RATES, ...parsed.rates };
          this.lastFetchTime = parsed.timestamp;
        }
      }
    } catch {
      // Fallback rates will be used
    }
  }

  /**
   * Fetch live FX rates from a public exchange-rate feed.
   */
  public async refreshRates(): Promise<Record<string, number>> {
    if (this.isFetching) return this.rates;
    if (Date.now() - this.lastFetchTime < CACHE_TTL_MS && Object.keys(this.rates).length > 5) {
      return this.rates;
    }

    this.isFetching = true;
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates) {
          this.rates = {
            ...DEFAULT_FALLBACK_RATES,
            ...data.rates,
          };
          this.lastFetchTime = Date.now();
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ timestamp: this.lastFetchTime, rates: this.rates })
            );
          }
        }
      }
    } catch {
      // Gracefully maintain cached or baseline fallback rates
    } finally {
      this.isFetching = false;
    }
    return this.rates;
  }

  /**
   * Get the current conversion rate for a target currency against USD base.
   */
  public getRate(currency: CurrencyCode): number {
    return this.rates[currency] ?? DEFAULT_FALLBACK_RATES[currency] ?? 1.0;
  }

  /**
   * Convert an amount in USD to the target currency.
   */
  public convertUsdTo(amountInUsd: number, targetCurrency: CurrencyCode): number {
    const rate = this.getRate(targetCurrency);
    return Math.round(amountInUsd * rate);
  }

  /**
   * Format a USD-based amount into a localized string with proper symbol and formatting.
   */
  public format(
    amountInUsd: number,
    targetCurrency: CurrencyCode = 'USD',
    options?: { compact?: boolean; precision?: number }
  ): string {
    const converted = this.convertUsdTo(amountInUsd, targetCurrency);
    const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.USD;

    if (options?.compact) {
      if (Math.abs(converted) >= 1_000_000_000) {
        return `${config.symbol}${(converted / 1_000_000_000).toFixed(1)}B`;
      }
      if (Math.abs(converted) >= 1_000_000) {
        return `${config.symbol}${(converted / 1_000_000).toFixed(1)}M`;
      }
      if (Math.abs(converted) >= 10_000) {
        return `${config.symbol}${(converted / 1_000).toFixed(0)}k`;
      }
    }

    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        maximumFractionDigits: options?.precision ?? 0,
        minimumFractionDigits: options?.precision ?? 0,
      }).format(converted);
    } catch {
      return `${config.symbol}${converted.toLocaleString()}`;
    }
  }
}

export const currencyService = new CurrencyService();
