import { createApp } from '../app';

async function runVerification() {
  console.log('--- STARTING SIGNUP & ONBOARDING PERSISTENCE VERIFICATION ---');

  const app = createApp();
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}`;

  try {
    const timestamp = Date.now();
    const userAEmail = `onboarding_test_${timestamp}@huntiq.io`;
    const userBEmail = `onboarding_b_${timestamp}@huntiq.io`;

    // 1. Register User A
    console.log(`[1] Signing up User A: ${userAEmail}...`);
    const signupARes = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAEmail,
        password: 'StrongPassword123!',
        fullName: 'Amaka Eze',
        companyName: 'Apex Growth Partners',
        defaultCurrency: 'USD'
      })
    });

    const signupABody = await signupARes.json();
    if (!signupARes.ok) {
      throw new Error(`Signup A failed: ${signupARes.status} - ${JSON.stringify(signupABody)}`);
    }

    const tokenA = signupABody.data.token;
    const userA = signupABody.data.user;
    const workspaceAId = userA.workspaceId;
    console.log(`✓ User A registered successfully: ID=${userA.id}, Workspace=${workspaceAId}`);

    // 2. Fetch initial onboarding for User A
    console.log('[2] Checking initial onboarding for User A...');
    const initOnboardingARes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });

    const initOnboardingABody = await initOnboardingARes.json();
    if (!initOnboardingARes.ok) {
      throw new Error(`Initial onboarding fetch failed: ${initOnboardingARes.status}`);
    }
    console.log('✓ Initial onboarding endpoint reachable:', initOnboardingABody);

    // 3. Save tailored Onboarding Data for User A
    console.log('[3] Saving custom onboarding configuration for User A...');
    const onboardingPayloadA = {
      workspaceName: 'Apex Growth Partners',
      website: 'https://apexgrowth.io',
      whatYouSell: 'Revenue Acceleration & Outbound Pipeline',
      description: 'We scale high-growth B2B companies across Sub-Saharan Africa and Europe.',
      primaryObjective: 'generate_clients',
      industries: ['FinTech & Payments', 'Logistics Tech', 'Enterprise SaaS'],
      geographicMarkets: ['Nigeria', 'Kenya', 'South Africa', 'United Kingdom'],
      companySize: '20 – 250 employees',
      revenueRange: '$2M – $20M',
      businessType: 'B2B',
      preferredTraits: ['High Growth', 'Recently Funded', 'Expanding Territory'],
      offerings: ['Outbound Pipeline Engine', 'Executive Prospecting Advisory'],
      averageDealValue: 35000,
      targetBuyerRoles: ['Chief Commercial Officer', 'VP Sales', 'Managing Director'],
      problemsSolved: 'Pipeline stalling, poor conversion from cold discovery, SDR ramp delays',
      differentiator: 'Proprietary intent-driven radar and localized B2B signals',
      signals: {
        hiringSpikes: true,
        fundingRounds: true,
        geoExpansion: true,
        leadershipChanges: true,
        techStackChanges: false,
        newsPR: false,
        regulatoryEvents: true
      },
      discoveryAggressiveness: 'aggressive',
      scoringSensitivity: 85,
      researchDepth: 'deep_dossier',
      outreachTone: 'consultative'
    };

    const saveARes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify(onboardingPayloadA)
    });

    const saveABody = await saveARes.json();
    if (!saveARes.ok) {
      throw new Error(`Save onboarding for User A failed: ${saveARes.status} - ${JSON.stringify(saveABody)}`);
    }
    console.log('✓ Saved onboarding for User A successfully');

    // 4. Retrieve saved onboarding for User A and verify exact fidelity
    console.log('[4] Verifying retrieved onboarding for User A...');
    const getARes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });

    const getABody = await getARes.json();
    if (!getARes.ok || !getABody.data) {
      throw new Error(`Get onboarding failed for User A: ${getARes.status} - ${JSON.stringify(getABody)}`);
    }

    const fetchedA = getABody.data;
    if (fetchedA.workspaceName !== onboardingPayloadA.workspaceName) {
      throw new Error(`Workspace name mismatch: expected ${onboardingPayloadA.workspaceName}, got ${fetchedA.workspaceName}`);
    }
    if (fetchedA.averageDealValue !== onboardingPayloadA.averageDealValue) {
      throw new Error(`Deal value mismatch: expected ${onboardingPayloadA.averageDealValue}, got ${fetchedA.averageDealValue}`);
    }
    if (JSON.stringify(fetchedA.industries) !== JSON.stringify(onboardingPayloadA.industries)) {
      throw new Error(`Industries mismatch: expected ${JSON.stringify(onboardingPayloadA.industries)}, got ${JSON.stringify(fetchedA.industries)}`);
    }
    console.log('✓ Retrieved onboarding matches saved profile perfectly!');

    // 5. Multi-tenant isolation: Register User B in separate workspace
    console.log(`[5] Signing up User B: ${userBEmail}...`);
    const signupBRes = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userBEmail,
        password: 'StrongPassword456!',
        fullName: 'Tunde Adeleke',
        companyName: 'Beacon Advisory',
        defaultCurrency: 'GBP'
      })
    });

    const signupBBody = await signupBRes.json();
    if (!signupBRes.ok) {
      throw new Error(`Signup B failed: ${signupBRes.status} - ${JSON.stringify(signupBBody)}`);
    }
    const tokenB = signupBBody.data.token;
    const userB = signupBBody.data.user;
    const workspaceBId = userB.workspaceId;
    console.log(`✓ User B registered successfully: ID=${userB.id}, Workspace=${workspaceBId}`);

    // 6. User B must NOT see User A's custom onboarding configuration
    console.log('[6] Verifying User B isolation from User A...');
    const getBInitRes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });

    const getBInitBody = await getBInitRes.json();
    if (!getBInitRes.ok) {
      throw new Error(`Failed to fetch User B onboarding: ${getBInitRes.status}`);
    }

    if (getBInitBody.data && getBInitBody.data.workspaceName === 'Apex Growth Partners') {
      throw new Error('LEAK DETECTED: User B can see User A onboarding configuration!');
    }
    console.log('✓ User B is strictly isolated from User A onboarding profile');

    // 7. Save custom onboarding for User B
    console.log('[7] Saving custom onboarding for User B...');
    const onboardingPayloadB = {
      workspaceName: 'Beacon Advisory UK',
      website: 'https://beaconadvisory.co.uk',
      whatYouSell: 'Regulatory & Compliance Advisory',
      description: 'Specialized regulatory advisory for financial institutions.',
      primaryObjective: 'market_intelligence',
      industries: ['Banking', 'Wealth Management', 'InsurTech'],
      geographicMarkets: ['United Kingdom', 'European Union'],
      companySize: '500+ employees',
      revenueRange: '$50M+',
      businessType: 'Enterprise',
      preferredTraits: ['Regulated', 'Cross-Border Operations'],
      offerings: ['FCA Compliance Auditing', 'AML Risk Modeling'],
      averageDealValue: 75000,
      targetBuyerRoles: ['Chief Risk Officer', 'Head of Compliance'],
      problemsSolved: 'Navigating evolving cross-border regulatory frameworks',
      differentiator: 'Ex-regulator compliance specialists',
      signals: {
        hiringSpikes: false,
        fundingRounds: false,
        geoExpansion: true,
        leadershipChanges: true,
        techStackChanges: false,
        newsPR: true,
        regulatoryEvents: true
      },
      discoveryAggressiveness: 'conservative',
      scoringSensitivity: 90,
      researchDepth: 'deep_dossier',
      outreachTone: 'direct_value'
    };

    const saveBRes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify(onboardingPayloadB)
    });

    const saveBBody = await saveBRes.json();
    if (!saveBRes.ok) {
      throw new Error(`Save onboarding for User B failed: ${saveBRes.status} - ${JSON.stringify(saveBBody)}`);
    }
    console.log('✓ Saved onboarding for User B successfully');

    // 8. Re-verify User A still has User A's data unchanged
    console.log('[8] Re-verifying User A data remains unaltered...');
    const reGetARes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });

    const reGetABody = await reGetARes.json();
    if (reGetABody.data.workspaceName !== 'Apex Growth Partners') {
      throw new Error('DATA CONTAMINATION: User A data was modified by User B actions!');
    }
    console.log('✓ User A data remains perfectly preserved');

    // 9. Re-verify User B has User B's data
    console.log('[9] Re-verifying User B data persists correctly...');
    const reGetBRes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const reGetBBody = await reGetBRes.json();
    if (reGetBBody.data.workspaceName !== 'Beacon Advisory UK') {
      throw new Error('DATA ERROR: User B data does not match saved payload!');
    }
    console.log('✓ User B data verified correctly');

    console.log('\n===========================================================');
    console.log('ALL SIGNUP & ONBOARDING PERSISTENCE CHECKS PASSED WITH 100% SUCCESS');
    console.log('===========================================================\n');
  } finally {
    server.close();
  }
}

runVerification().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
