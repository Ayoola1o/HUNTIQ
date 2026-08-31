import { GreenhouseJobProvider, LeverJobProvider, AshbyJobProvider } from '../providers/jobs';
import { InMemoryJobRepository } from '../repositories/jobs';
import { InMemorySignalRepository } from '../repositories/signals';
import { InMemoryLeadRepository } from '../repositories/leads';
import { CompanyResolver } from '../engine/resolution/companyResolver';
import { HiringSignalEngine } from '../engine/detectors/hiringSignalEngine';
import { ScoringEngine } from '../engine/scoringEngine';
import { LeadGenerator } from '../engine/leadGenerator';
import type { DbCompany, DbJob, DbSignal, DbContact } from '../db/types';

// Lightweight runner for TSX execution
const tests: Array<{ name: string; fn: () => Promise<void> | void }> = [];
const test = (name: string, fn: () => Promise<void> | void) => {
  tests.push({ name, fn });
};
const describe = (_suiteName: string, fn: () => void) => {
  fn();
};

const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
  },
  toEqual: (expected: any) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (typeof actual !== 'number' || actual <= expected) throw new Error(`Expected ${actual} > ${expected}`);
  },
  toBeGreaterThanOrEqual: (expected: number) => {
    if (typeof actual !== 'number' || actual < expected) throw new Error(`Expected ${actual} >= ${expected}`);
  },
  toBeDefined: () => {
    if (actual === undefined) throw new Error(`Expected value to be defined`);
  },
  toBeNull: () => {
    if (actual !== null) throw new Error(`Expected value to be null, got ${JSON.stringify(actual)}`);
  },
  not: {
    toBeNull: () => {
      if (actual === null) throw new Error(`Expected value not to be null`);
    },
    toBe: (expected: any) => {
      if (actual === expected) throw new Error(`Expected ${JSON.stringify(actual)} not to be ${JSON.stringify(expected)}`);
    }
  },
  toHaveProperty: (prop: string) => {
    if (actual === null || typeof actual !== 'object' || !(prop in actual)) {
      throw new Error(`Expected object to have property ${prop}`);
    }
  },
  toContain: (item: any) => {
    if (Array.isArray(actual) && !actual.includes(item)) {
      throw new Error(`Expected array to contain ${JSON.stringify(item)}`);
    } else if (typeof actual === 'string' && !actual.includes(item)) {
      throw new Error(`Expected string to contain "${item}"`);
    }
  }
});
  // Test 1 — Provider
  test('Test 1 — Provider returns jobs', async () => {
    const provider = new GreenhouseJobProvider();
    const source = {
      id: 'src-1',
      provider: 'greenhouse' as const,
      sourceUrl: 'https://boards.greenhouse.io/paystack',
      companyIdentifier: 'paystack',
      status: 'active' as const,
      lastSyncStatus: 'running' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const jobs = await provider.fetchJobs(source);
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
  });

  // Test 2 — Normalization
  test('Test 2 — Raw provider job normalized to canonical schema', async () => {
    const provider = new LeverJobProvider();
    const source = {
      id: 'src-2',
      provider: 'lever' as const,
      sourceUrl: 'https://jobs.lever.co/flutterwave',
      companyIdentifier: 'flutterwave',
      status: 'active' as const,
      lastSyncStatus: 'running' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const jobs = await provider.fetchJobs(source);
    expect(jobs[0]).toHaveProperty('externalId');
    expect(jobs[0]).toHaveProperty('title');
    expect(jobs[0]).toHaveProperty('jobUrl');
    expect(jobs[0]).toHaveProperty('department');
  });

  // Test 3 — Company resolution
  test('Test 3 — Company resolution matches known domain without guessing', async () => {
    const result = await CompanyResolver.resolve({
      name: 'Moniepoint MFB Limited',
      domain: 'moniepoint.com'
    });

    expect(result.company).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(85);
  });

  // Test 4 & 5 — Job Persistence & Deduplication
  test('Test 4 & 5 — Same external job synced twice produces exactly 1 record', async () => {
    const repo = new InMemoryJobRepository();
    const source = {
      id: 'src-dedup',
      provider: 'greenhouse' as const,
      sourceUrl: 'https://boards.greenhouse.io/test',
      status: 'active' as const,
      lastSyncStatus: 'succeeded' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const jobs = [
      {
        externalId: 'gh-job-101',
        title: 'Senior Backend Engineer',
        jobUrl: 'https://boards.greenhouse.io/test/101',
        rawPayload: {}
      }
    ];

    // First sync
    const sync1 = await repo.upsertOpenJobs(source, jobs, new Date().toISOString());
    expect(sync1.created).toBe(1);
    expect(sync1.updated).toBe(0);

    // Second sync (same external ID)
    const sync2 = await repo.upsertOpenJobs(source, jobs, new Date().toISOString());
    expect(sync2.created).toBe(0);
    expect(sync2.updated).toBe(1);
  });

  // Test 6 — Job Update
  test('Test 6 — Existing job updates fields on subsequent sync', async () => {
    const repo = new InMemoryJobRepository();
    const source = {
      id: 'src-update',
      provider: 'ashby' as const,
      sourceUrl: 'https://jobs.ashbyhq.com/test',
      status: 'active' as const,
      lastSyncStatus: 'succeeded' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const initialJobs = [
      { externalId: 'ash-1', title: 'Product Designer', jobUrl: 'https://test/1', rawPayload: {} }
    ];
    await repo.upsertOpenJobs(source, initialJobs, new Date().toISOString());

    const updatedJobs = [
      { externalId: 'ash-1', title: 'Lead Product Designer', jobUrl: 'https://test/1', rawPayload: {} }
    ];
    const updateResult = await repo.upsertOpenJobs(source, updatedJobs, new Date().toISOString());
    expect(updateResult.updated).toBe(1);
  });

  // Test 7 — Hiring Metrics Time Windows
  test('Test 7 — Multi-window velocity metrics calculates correct growth (+133%)', () => {
    const now = Date.now();
    const jobs: DbJob[] = [];

    // 14 jobs in current 7 days
    for (let i = 0; i < 14; i++) {
      jobs.push({
        id: `j-curr-${i}`,
        workspaceId: 'ws-1',
        companyId: 'c-1',
        externalId: `curr-${i}`,
        title: 'Software Engineer',
        department: 'Engineering',
        location: 'Lagos',
        country: 'Nigeria',
        remote: true,
        employmentType: 'Full-time',
        jobUrl: 'https://job.url',
        postedAt: new Date(now - i * 86400000 * 0.4).toISOString(), // within last 5.6 days
        status: 'OPEN',
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 6 jobs in previous 7 days (8-14 days ago)
    for (let i = 0; i < 6; i++) {
      jobs.push({
        id: `j-prev-${i}`,
        workspaceId: 'ws-1',
        companyId: 'c-1',
        externalId: `prev-${i}`,
        title: 'Sales Account Executive',
        department: 'Sales',
        location: 'Lagos',
        country: 'Nigeria',
        remote: false,
        employmentType: 'Full-time',
        jobUrl: 'https://job.url',
        postedAt: new Date(now - (8 + i) * 86400000).toISOString(),
        status: 'OPEN',
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const metrics = HiringSignalEngine.calculateHiringMetrics(jobs);
    expect(metrics.jobsLast7Days).toBe(14);
    expect(metrics.jobsPrev7Days).toBe(6);
    expect(metrics.acceleration7DaysPercent).toBe(133);
  });

  // Test 8 & 9 — Signal & Evidence Persistence
  test('Test 8 & 9 — Buying signal detects surge and attaches verifiable evidence', () => {
    const mockCompany: DbCompany = {
      id: 'comp-test',
      workspaceId: 'ws-1',
      name: 'Paystack',
      legalName: 'Paystack Payments Ltd',
      domain: 'paystack.com',
      industry: 'FinTech',
      status: 'ACTIVE',
      firstSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const jobs: DbJob[] = Array(6).fill(null).map((_, i) => ({
      id: `job-${i}`,
      workspaceId: 'ws-1',
      companyId: 'comp-test',
      externalId: `gh-${i}`,
      title: `Senior Engineer ${i}`,
      department: 'Engineering',
      location: 'Lagos',
      country: 'Nigeria',
      remote: true,
      employmentType: 'Full-time',
      jobUrl: `https://boards.greenhouse.io/paystack/${i}`,
      postedAt: new Date().toISOString(),
      status: 'OPEN',
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const bundles = HiringSignalEngine.generateSignals(mockCompany, jobs);
    expect(bundles.length).toBeGreaterThan(0);
    const top = bundles[0];
    expect(top.signal.type).toBe('HIRING_ACCELERATION');
    expect(top.evidence.length).toBeGreaterThan(0);
    expect(top.evidence[0].confidence).toBeGreaterThan(90);
  });

  // Test 10 — Scoring Engine
  test('Test 10 — Opportunity score calculates composite rating', () => {
    const engine = new ScoringEngine();
    const company: DbCompany = {
      id: 'c-1',
      workspaceId: 'ws-1',
      name: 'ScaleUp Corp',
      domain: 'scaleup.com',
      employeeCount: '250',
      industry: 'Technology',
      status: 'ACTIVE',
      firstSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const jobs: DbJob[] = Array(6).fill(null).map((_, i) => ({
      id: `j-${i}`,
      workspaceId: 'ws-1',
      companyId: 'c-1',
      externalId: `ext-${i}`,
      title: 'Engineer',
      department: 'Engineering',
      location: 'Lagos',
      country: 'Nigeria',
      remote: true,
      employmentType: 'Full-time',
      jobUrl: 'https://test/job',
      postedAt: new Date().toISOString(),
      status: 'OPEN',
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const signals: DbSignal[] = [
      {
        id: 's-1',
        workspaceId: 'ws-1',
        companyId: 'c-1',
        type: 'HIRING_ACCELERATION',
        title: 'Hiring Surge',
        strength: 'HIGH',
        confidence: 95,
        detectedAt: new Date().toISOString(),
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const contacts: DbContact[] = [
      {
        id: 'ct-1',
        workspaceId: 'ws-1',
        companyId: 'c-1',
        firstName: 'Tunde',
        lastName: 'Adeleke',
        jobTitle: 'VP of Engineering',
        department: 'Engineering',
        seniority: 'VP',
        email: 'tunde@scaleup.com',
        emailStatus: 'VALID',
        confidence: 95,
        isDecisionMaker: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const evalResult = engine.evaluate(company, jobs, signals, contacts);
    expect(evalResult.totalScore).toBeGreaterThanOrEqual(75);
    expect(evalResult.estimatedDealValue).toBeGreaterThan(0);
  });

  // Test 11 & 12 — Lead Generation & Deduplication
  test('Test 11 & 12 — Lead Generator evaluates ICP threshold and avoids duplicate leads', async () => {
    const leadRepo = new InMemoryLeadRepository();
    const company: DbCompany = {
      id: 'c-lead-test',
      workspaceId: 'ws-1',
      name: 'Moniepoint',
      domain: 'moniepoint.com',
      industry: 'FinTech',
      status: 'ACTIVE',
      firstSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const signals: DbSignal[] = [
      {
        id: 'sig-1',
        workspaceId: 'ws-1',
        companyId: 'c-lead-test',
        type: 'HIRING_ACCELERATION',
        title: 'High Velocity Growth',
        strength: 'HIGH',
        confidence: 95,
        detectedAt: new Date().toISOString(),
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const contacts: DbContact[] = [
      {
        id: 'ct-lead-1',
        workspaceId: 'ws-1',
        companyId: 'c-lead-test',
        firstName: 'Felix',
        lastName: 'Ike',
        jobTitle: 'Chief Technology Officer',
        department: 'Executive',
        seniority: 'CXO',
        email: 'felix@moniepoint.com',
        emailStatus: 'VALID',
        confidence: 96,
        isDecisionMaker: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const generated = LeadGenerator.evaluateAndGenerate(company, signals, contacts);
    expect(generated).not.toBeNull();
    expect(generated!.score).toBeGreaterThanOrEqual(75);

    // Test upsert deduplication
    const lead1 = await leadRepo.upsert({
      workspaceId: 'ws-1',
      companyId: company.id,
      contactId: contacts[0].id,
      signalId: signals[0].id,
      title: generated!.reason,
      score: generated!.score,
      tier: 'HOT',
      status: 'NEW',
      reason: generated!.reason,
      dealValue: 35000,
      conversionProbability: 85
    });

    const lead2 = await leadRepo.upsert({
      workspaceId: 'ws-1',
      companyId: company.id,
      contactId: contacts[0].id,
      signalId: signals[0].id,
      title: generated!.reason,
      score: 95,
      tier: 'HOT',
      status: 'NEW',
      reason: generated!.reason,
      dealValue: 35000,
      conversionProbability: 90
    });

    const list = await leadRepo.findByCompanyId(company.id);
    expect(list.length).toBe(1);
    expect(lead2.score).toBe(95);
  });

// Run all test suites
(async () => {
  console.log('🚀 Running HUNTIQ Data Pipeline Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      await t.fn();
      console.log(`  ✅ ${t.name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ ${t.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
})();
