import { config } from '../../config/env';
import {
  ApifyMapsProvider,
  MockApifyMapsProvider,
  MapProviderError,
  type MapsDiscoveryProvider
} from './apifyMapsProvider';

export * from './apifyMapsProvider';

/**
 * Factory for creating the appropriate Maps Discovery Provider.
 *
 * PRODUCTION SAFETY RULE:
 * Production must NEVER silently fall back to mock data.
 * If APIFY_API_TOKEN is missing in production, this factory throws MAP_PROVIDER_NOT_CONFIGURED.
 * Mock data is strictly restricted to development/test environments when HUNTIQ_MAPS_MOCK=true.
 */
export function createMapsProvider(): MapsDiscoveryProvider {
  const isProduction = config.nodeEnv === 'production' || process.env.NODE_ENV === 'production';
  const allowMock = config.huntiqMapsMock && !isProduction;

  if (config.apifyApiToken && config.apifyApiToken.trim() !== '') {
    return new ApifyMapsProvider(config.apifyApiToken.trim(), config.apifyActorId);
  }

  if (allowMock) {
    return new MockApifyMapsProvider();
  }

  // Production or Mock disabled without Apify token -> Fail safely
  throw new MapProviderError(
    'MAP_PROVIDER_NOT_CONFIGURED',
    'Maps discovery provider is not configured.',
    503
  );
}
