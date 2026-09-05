import { ApifyMapsProvider, MockApifyMapsProvider, type MapsDiscoveryProvider } from './apifyMapsProvider';

export * from './apifyMapsProvider';

export function createMapsProvider(): MapsDiscoveryProvider {
  if (process.env.APIFY_API_TOKEN && process.env.APIFY_API_TOKEN.trim() !== '') {
    return new ApifyMapsProvider(process.env.APIFY_API_TOKEN.trim());
  }
  return new MockApifyMapsProvider();
}
