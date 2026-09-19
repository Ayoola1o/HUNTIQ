import { createApp } from '../app';

async function runTest() {
  console.log('Testing in-process API endpoints for Profile Avatar & Onboarding...');
  const app = createApp();
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Login with demo user
    console.log('\n1. Logging in as demo@huntiq.io...');
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@huntiq.io', password: 'password123' })
    });
    const loginBody = await loginRes.json();
    if (!loginRes.ok) throw new Error('Login failed: ' + JSON.stringify(loginBody));
    const token = loginBody.data.token;
    const user = loginBody.data.user;
    console.log('✓ Login successful. User ID:', user.id, 'Workspace:', user.workspaceId);

    // 2. Upload a custom avatar
    console.log('\n2. Testing Avatar Upload...');
    const sampleAvatar = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...sampleCustomAvatarDataUrl';
    const avatarRes = await fetch(`${baseUrl}/api/v1/auth/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ avatarUrl: sampleAvatar })
    });
    const avatarBody = await avatarRes.json();
    if (!avatarRes.ok) throw new Error('Avatar upload failed: ' + JSON.stringify(avatarBody));
    console.log('✓ Avatar uploaded successfully:', avatarBody.data.avatarUrl.slice(0, 40) + '...');

    // Verify avatar in GET /api/v1/auth/me
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meBody = await meRes.json();
    if (meBody.data.avatarUrl !== sampleAvatar) {
      throw new Error('Avatar did not persist in user profile!');
    }
    console.log('✓ Verified GET /api/v1/auth/me contains new avatarUrl');

    // 3. Update Profile Data (name, jobTitle, bio, defaultCurrency)
    console.log('\n3. Testing Profile Updates...');
    const profileRes = await fetch(`${baseUrl}/api/v1/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fullName: 'Ayoola Ade',
        jobTitle: 'Head of Growth Engineering',
        phone: '+234 801 999 8888',
        bio: 'Leading autonomous B2B intelligence hunting at HUNTIQ.',
        defaultCurrency: 'NGN'
      })
    });
    const profileBody = await profileRes.json();
    if (!profileRes.ok) throw new Error('Profile update failed: ' + JSON.stringify(profileBody));
    console.log('✓ Profile updated:', {
      fullName: profileBody.data.fullName,
      jobTitle: profileBody.data.jobTitle,
      currency: profileBody.data.defaultCurrency
    });

    // 4. Test Save Workspace Onboarding
    console.log('\n4. Testing Onboarding Persistence...');
    const onboardingPayload = {
      workspaceName: 'Acme Enterprise Ventures',
      businessModel: 'B2B Enterprise',
      icpTarget: {
        industries: ['Fintech', 'SaaS', 'Healthtech'],
        locations: ['Nigeria', 'Kenya', 'United Kingdom'],
        companySizes: ['50-200', '201-500']
      },
      signals: {
        hiringSpikes: true,
        geoExpansion: true,
        techStackChanges: true
      },
      aiHuntingSpeed: 'aggressive'
    };

    const saveOnboardRes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(onboardingPayload)
    });
    const saveOnboardBody = await saveOnboardRes.json();
    if (!saveOnboardRes.ok) throw new Error('Onboarding save failed: ' + JSON.stringify(saveOnboardBody));
    console.log('✓ Onboarding saved to workspace:', saveOnboardBody.data.workspaceName);

    // 5. Test Fetch Workspace Onboarding
    const getOnboardRes = await fetch(`${baseUrl}/api/v1/auth/onboarding`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getOnboardBody = await getOnboardRes.json();
    if (!getOnboardRes.ok) throw new Error('Onboarding fetch failed: ' + JSON.stringify(getOnboardBody));
    if (getOnboardBody.data.workspaceName !== 'Acme Enterprise Ventures') {
      throw new Error('Onboarding data did not match saved payload!');
    }
    console.log('✓ Verified GET /api/v1/auth/onboarding matches saved configuration.');

    console.log('\nALL PROFILE & ONBOARDING TESTS PASSED!');
  } finally {
    server.close();
  }
}

runTest().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
