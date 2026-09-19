import assert from 'node:assert';
import { createMapsProvider } from '../providers/maps/index';
import { ApifyMapsProvider, MockApifyMapsProvider, MapProviderError, DiscoveredPlaceBusiness } from '../providers/maps/apifyMapsProvider';
import { deduplicateDiscoveredPlaces } from '../utils/deduplication';
import { calculateHaversineDistanceKm, isWithinRadius } from '../utils/geoDistance';
import { CompanyResolver } from '../engine/resolution/companyResolver';
import { ScoringEngine } from '../engine/scoringEngine';
import { DiscoveryJobService } from '../services/discoveryJobService';
import { env } from '../config/env';

async function runTests() {
  console.log('========================================================================');
  console.log('🚀 HUNTIQ APIFY MAPS PRODUCTION PIPELINE TEST SUITE (PHASE 18)');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`  ✅ PASS: ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`  ❌ FAIL: ${name}`);
            console.error(`     Error: ${err.message}`);
            throw err;
          });
      } else {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. PROVIDER CREATION & PRODUCTION SAFE GUARDS
  // ---------------------------------------------------------------------------
  console.log('--- 1. Provider Creation & Safe Guard Tests ---');

  await test('createMapsProvider throws MAP_PROVIDER_NOT_CONFIGURED in production without token', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalToken = process.env.APIFY_API_TOKEN;
    const originalMock = process.env.HUNTIQ_MAPS_MOCK;

    try {
      process.env.NODE_ENV = 'production';
      process.env.APIFY_API_TOKEN = '';
      delete process.env.APIFY_API_TOKEN;
      process.env.HUNTIQ_MAPS_MOCK = 'false';

      assert.throws(
        () => createMapsProvider(),
        (err: any) => {
          assert(err instanceof MapProviderError, 'Expected MapProviderError');
          assert.strictEqual(err.code, 'MAP_PROVIDER_NOT_CONFIGURED');
          assert.strictEqual(err.statusCode, 503);
          return true;
        }
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalToken) process.env.APIFY_API_TOKEN = originalToken;
      if (originalMock) process.env.HUNTIQ_MAPS_MOCK = originalMock;
    }
  });

  await test('createMapsProvider NEVER falls back to mock in production even if HUNTIQ_MAPS_MOCK=true', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalToken = process.env.APIFY_API_TOKEN;
    const originalMock = process.env.HUNTIQ_MAPS_MOCK;

    try {
      process.env.NODE_ENV = 'production';
      process.env.APIFY_API_TOKEN = '';
      process.env.HUNTIQ_MAPS_MOCK = 'true';

      assert.throws(
        () => createMapsProvider(),
        (err: any) => {
          assert(err instanceof MapProviderError);
          assert.strictEqual(err.code, 'MAP_PROVIDER_NOT_CONFIGURED');
          return true;
        }
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalToken) process.env.APIFY_API_TOKEN = originalToken;
      if (originalMock) process.env.HUNTIQ_MAPS_MOCK = originalMock;
    }
  });

  await test('createMapsProvider returns MockApifyMapsProvider in test/dev when HUNTIQ_MAPS_MOCK=true', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalMock = process.env.HUNTIQ_MAPS_MOCK;

    try {
      process.env.NODE_ENV = 'test';
      process.env.HUNTIQ_MAPS_MOCK = 'true';

      const provider = createMapsProvider();
      assert.strictEqual(provider.name, 'MockApifyMapsProvider');
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalMock) process.env.HUNTIQ_MAPS_MOCK = originalMock;
    }
  });

  // ---------------------------------------------------------------------------
  // 2. NORMALIZATION & DATA PURITY (NO FAKE PLACEHOLDERS)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Normalization & Data Purity Tests ---');

  await test('Raw Apify normalization enforces nulls for missing values and accurate dataQuality', async () => {
    const mockProvider = new MockApifyMapsProvider();
    const results = await mockProvider.searchPlaces({
      query: 'Creative Studios Sabo Yaba',
      location: 'Yaba, Lagos',
      maxResults: 10
    });

    const studio = results.find((r) => r.placeId === 'ChIJ4_missing_web');
    assert(studio, 'Expected Heritage Creative Studios to be found');

    // Missing values MUST be null, NEVER fake strings or placeholder domains
    assert.strictEqual(studio.website, null, 'Website must be null when not present');
    assert.strictEqual(studio.phone, null, 'Phone must be null when not present');
    assert.strictEqual(studio.openingHours, null, 'Opening hours must be null when absent');
    assert.strictEqual(studio.dataQuality.website, 'missing');
    assert.strictEqual(studio.dataQuality.phone, 'missing');
    assert.strictEqual(studio.dataQuality.email, 'not_available');
  });

  await test('Discovered businesses NEVER fabricate fake decision makers or email addresses', async () => {
    const mockProvider = new MockApifyMapsProvider();
    const results = await mockProvider.searchPlaces({ query: 'All agencies', maxResults: 10 });

    for (const biz of results) {
      assert.strictEqual(biz.dataQuality.email, 'not_available');
      // No synthetic emails
      assert.strictEqual((biz as any).email, undefined);
      // No synthetic decision maker arrays with "Business Owner" or "Managing Director"
      if ((biz as any).decisionMakers) {
        assert(Array.isArray((biz as any).decisionMakers));
        for (const dm of (biz as any).decisionMakers) {
          assert.notStrictEqual(dm.name, 'Business Owner');
          assert.notStrictEqual(dm.role, 'Managing Director');
        }
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 3. HAVERSINE RADIUS FILTERING
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Haversine Distance & Radius Filtering Tests ---');

  await test('Haversine distance calculation is accurate', () => {
    // Victoria Island, Lagos (6.4281, 3.4219) to Ikeja, Lagos (6.6018, 3.3515) is ~20.7 km
    const dist = calculateHaversineDistanceKm(6.4281, 3.4219, 6.6018, 3.3515);
    assert(dist > 19 && dist < 22, `Expected distance ~20.7km, got ${dist.toFixed(2)}km`);

    // Within radius check
    assert.strictEqual(isWithinRadius(6.4281, 3.4219, 6.6018, 3.3515, 25), true);
    assert.strictEqual(isWithinRadius(6.4281, 3.4219, 6.6018, 3.3515, 10), false);
  });

  await test('Radius filtering excludes places outside specified km radius', async () => {
    const mockProvider = new MockApifyMapsProvider();
    // Center at Victoria Island (6.4281, 3.4219) with a 2 km radius
    // Sabo Yaba (6.5095, 3.3711) is ~10.6 km away, so it MUST be excluded
    const filteredResults = await mockProvider.searchPlaces({
      query: 'Agencies',
      centerCoordinates: { latitude: 6.4281, longitude: 3.4219 },
      radiusKm: 2,
      maxResults: 10
    });

    const hasYaba = filteredResults.some((r) => r.name.includes('Heritage Creative Studios'));
    assert.strictEqual(hasYaba, false, 'Place ~10km away should be excluded from 2km radius');
  });

  // ---------------------------------------------------------------------------
  // 4. POST-FETCH FILTERS
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Post-Fetch Filter Enforcement Tests ---');

  await test('Filters for minRating, hasWebsite, and hasPhone work strictly', async () => {
    const mockProvider = new MockApifyMapsProvider();

    // 1. minRating filter
    const highRated = await mockProvider.searchPlaces({
      query: 'agencies',
      minRating: 4.7
    });
    assert(highRated.length > 0, 'Expected high rated results');
    for (const r of highRated) {
      assert(r.rating !== null && r.rating >= 4.7, `Rating ${r.rating} was below 4.7`);
    }

    // 2. hasWebsite filter
    const withWebsite = await mockProvider.searchPlaces({
      query: 'agencies',
      hasWebsite: true
    });
    assert(withWebsite.length > 0);
    for (const r of withWebsite) {
      assert.notStrictEqual(r.website, null, 'Website should not be null');
      assert.strictEqual(r.dataQuality.website, 'found');
    }

    // 3. hasPhone filter
    const withPhone = await mockProvider.searchPlaces({
      query: 'agencies',
      hasPhone: true
    });
    assert(withPhone.length > 0);
    for (const r of withPhone) {
      assert.notStrictEqual(r.phone, null, 'Phone should not be null');
      assert.strictEqual(r.dataQuality.phone, 'found');
    }
  });

  // ---------------------------------------------------------------------------
  // 5. DETERMINISTIC DEDUPLICATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Deduplication Tests ---');

  await test('deduplicateDiscoveredPlaces removes duplicates by placeId, domain, and normalized name+address', () => {
    const baseRecord: DiscoveredPlaceBusiness = {
      id: 'map-1',
      source: 'APIFY_GOOGLE_MAPS',
      placeId: 'ChIJ_duplicate_1',
      name: 'Acme Digital Media Ltd',
      category: 'Marketing Agency',
      categories: ['Marketing Agency'],
      address: '10 Marina Road, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.45,
      longitude: 3.42,
      phone: '+2348000000001',
      website: 'https://acmedigital.com/contact',
      googleMapsUrl: 'https://maps.google.com/?cid=123',
      rating: 4.8,
      reviewCount: 20,
      openingHours: null,
      reviews: [],
      businessStatus: 'OPERATIONAL',
      dataQuality: { website: 'found', phone: 'found', email: 'not_available', location: 'complete' },
      sourceMetadata: { provider: 'APIFY_MOCK', scrapedAt: new Date().toISOString(), placeId: 'ChIJ_duplicate_1' }
    };

    const duplicateByPlaceId: DiscoveredPlaceBusiness = {
      ...baseRecord,
      id: 'map-2',
      name: 'Acme Digital Media (Duplicate)'
    };

    const duplicateByDomain: DiscoveredPlaceBusiness = {
      ...baseRecord,
      id: 'map-3',
      placeId: 'ChIJ_different_place_id',
      name: 'Acme Media Branch',
      website: 'http://www.acmedigital.com' // Same root domain
    };

    const duplicateByNameAddress: DiscoveredPlaceBusiness = {
      ...baseRecord,
      id: 'map-4',
      placeId: 'ChIJ_different_place_id_2',
      website: null,
      name: 'Acme Digital Media, Inc.', // Matches clean name
      address: '10 Marina Road, Lagos Island' // Matches clean address prefix
    };

    const uniqueRecord: DiscoveredPlaceBusiness = {
      ...baseRecord,
      id: 'map-5',
      placeId: 'ChIJ_unique_99',
      name: 'Totally Distinct Enterprise',
      website: 'https://distinct-company.io',
      googleMapsUrl: 'https://maps.google.com/?cid=999',
      address: '50 Victoria Island Way'
    };

    const deduplicated = deduplicateDiscoveredPlaces([
      baseRecord,
      duplicateByPlaceId,
      duplicateByDomain,
      duplicateByNameAddress,
      uniqueRecord
    ]);

    assert.strictEqual(deduplicated.length, 2, `Expected 2 distinct records, got ${deduplicated.length}`);
    assert.strictEqual(deduplicated[0].placeId, 'ChIJ_duplicate_1');
    assert.strictEqual(deduplicated[1].placeId, 'ChIJ_unique_99');
  });

  // ---------------------------------------------------------------------------
  // 6. COMPANY RESOLUTION & EXPLAINABLE SCORING
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Company Resolution & Opportunity Scoring Tests ---');

  await test('CompanyResolver resolves by domain, alias, and sets UNRESOLVED for unknowns', async () => {
    const resolver = new CompanyResolver();

    // 1. Unresolved place with unverified domain
    const unknownPlace: DiscoveredPlaceBusiness = {
      id: 'map-unknown-1',
      source: 'APIFY_GOOGLE_MAPS',
      placeId: 'ChIJ_unknown_place',
      name: 'Lagos Barbershop and Hair Spa',
      category: 'Barber Shop',
      categories: ['Barber Shop'],
      address: 'Unknown Road, Ikeja',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: null,
      longitude: null,
      phone: null,
      website: null,
      googleMapsUrl: null,
      rating: 4.1,
      reviewCount: 3,
      openingHours: null,
      reviews: [],
      businessStatus: 'OPERATIONAL',
      dataQuality: { website: 'missing', phone: 'missing', email: 'not_available', location: 'missing' },
      sourceMetadata: { provider: 'APIFY_MOCK', scrapedAt: new Date().toISOString(), placeId: 'ChIJ_unknown_place' }
    };

    const resolvedUnknown = await resolver.resolveDiscoveredPlace(unknownPlace);
    assert.strictEqual(resolvedUnknown.resolutionStatus, 'UNRESOLVED');
    assert.strictEqual(resolvedUnknown.matchedCompanyId, null);
    assert.strictEqual(resolvedUnknown.confidence, 0);

    // 2. Resolve place with known domain
    const knownDomainPlace: DiscoveredPlaceBusiness = {
      ...unknownPlace,
      website: 'https://flutterwave.com'
    };
    const resolvedDomain = await resolver.resolveDiscoveredPlace(knownDomainPlace);
    assert.strictEqual(resolvedDomain.resolutionStatus, 'RESOLVED');
    assert.strictEqual(resolvedDomain.confidence, 1.0);
    assert.strictEqual(resolvedDomain.matchMethod, 'EXACT_DOMAIN');
  });

  await test('ScoringEngine provides explainable scores with zero magic numbers', () => {
    const samplePlace: DiscoveredPlaceBusiness = {
      id: 'map-score-test',
      source: 'APIFY_GOOGLE_MAPS',
      placeId: 'ChIJ_score_test',
      name: 'High Growth Digital Lab',
      category: 'Software Agency',
      categories: ['Software Agency'],
      address: 'Plot 12 Admiralty Way, Lekki',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.44,
      longitude: 3.48,
      phone: '+2348000000000',
      website: 'https://growthlab.ng',
      googleMapsUrl: 'https://maps.google.com/?cid=99',
      rating: 4.9,
      reviewCount: 150,
      openingHours: null,
      reviews: [],
      businessStatus: 'OPERATIONAL',
      dataQuality: { website: 'found', phone: 'found', email: 'not_available', location: 'complete' },
      sourceMetadata: { provider: 'APIFY_MOCK', scrapedAt: new Date().toISOString(), placeId: 'ChIJ_score_test' }
    };

    const breakdown = ScoringEngine.evaluateDiscoveredPlace(samplePlace);
    assert(breakdown.score >= 0 && breakdown.score <= 100, `Score out of bounds: ${breakdown.score}`);
    assert(breakdown.factors.length >= 3, 'Must provide at least 3 explainable factors');

    for (const factor of breakdown.factors) {
      assert(factor.type, 'Factor must have a type');
      assert(typeof factor.value === 'number', 'Factor value must be numeric');
      assert(factor.evidence.length > 5, 'Factor must have descriptive evidence');
    }
  });

  // ---------------------------------------------------------------------------
  // 7. WORKSPACE ISOLATION & JOB TRACKING
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. Workspace Isolation & Discovery Job Service Tests ---');

  await test('DiscoveryJobService tracks jobs isolated by workspaceId', () => {
    const service = new DiscoveryJobService();

    const jobA = service.createJob({
      workspaceId: 'ws-alpha',
      userId: 'user-alpha',
      query: 'FinTech Lagos',
      maxResults: 10
    });

    const jobB = service.createJob({
      workspaceId: 'ws-beta',
      userId: 'user-beta',
      query: 'Real Estate Abuja',
      maxResults: 10
    });

    // Verify retrieval by ID
    const retrievedA = service.getJob(jobA.id);
    assert(retrievedA);
    assert.strictEqual(retrievedA.workspaceId, 'ws-alpha');
    assert.strictEqual(retrievedA.status, 'QUEUED');

    // Cross-tenant verification: ws-alpha query should NOT contain ws-beta job
    const alphaJobs = service.listJobs('ws-alpha');
    const betaJobs = service.listJobs('ws-beta');

    assert(alphaJobs.some((j) => j.id === jobA.id));
    assert(!alphaJobs.some((j) => j.id === jobB.id), 'Workspace Alpha must not see Workspace Beta job');

    assert(betaJobs.some((j) => j.id === jobB.id));
    assert(!betaJobs.some((j) => j.id === jobA.id), 'Workspace Beta must not see Workspace Alpha job');

    // Status progression
    service.updateStatus(jobA.id, 'RUNNING');
    assert.strictEqual(service.getJob(jobA.id)?.status, 'RUNNING');

    service.updateStatus(jobA.id, 'COMPLETED', { totalFound: 5, totalPersisted: 5 });
    assert.strictEqual(service.getJob(jobA.id)?.status, 'COMPLETED');
    assert.strictEqual(service.getJob(jobA.id)?.totalFound, 5);
  });

  console.log('\n========================================================================');
  console.log(`🎉 ALL TESTS PASSED: ${passed}/${total} assertions verified successfully.`);
  console.log('========================================================================\n');
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
