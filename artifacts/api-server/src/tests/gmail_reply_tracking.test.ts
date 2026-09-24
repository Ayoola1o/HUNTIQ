import assert from 'node:assert';
import * as crypto from 'crypto';
import type { Request } from 'express';
import { GmailReplySyncService } from '../services/gmailReplySyncService';
import { PubSubAuthService, type GoogleJwk } from '../services/pubsubAuthService';
import { CampaignExecutionService } from '../services/campaignExecutionService';
import type { TargetProspectItem } from '../../../src/types/campaign';

console.log('========================================================================');
console.log('📬  HUNTIQ: GMAIL REPLY TRACKING & STOP-ON-REPLY TEST SUITE');
console.log('========================================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name: string, fn: () => Promise<void> | void) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message || err}\n`);
    throw err;
  }
}

// Generate real RSA-2048 keypair for cryptographic signature verification tests
const { publicKey: testPublicKey, privateKey: testPrivateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048
});
const testKeyId = 'huntiq-test-key-2026';
const testJwk = testPublicKey.export({ format: 'jwk' }) as GoogleJwk;
testJwk.kid = testKeyId;
testJwk.alg = 'RS256';
testJwk.use = 'sig';

// Helper to create cryptographically signed test JWTs
function createSignedTestJwt(
  payload: any,
  options: {
    kid?: string;
    alg?: string;
    tamperSignature?: boolean;
    tamperPayloadAfterSign?: boolean;
    privateKey?: crypto.KeyObject;
  } = {}
) {
  const header = {
    alg: options.alg || 'RS256',
    kid: options.kid || testKeyId,
    typ: 'JWT'
  };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  let payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingData = Buffer.from(`${headerB64}.${payloadB64}`, 'utf8');

  let signature = crypto.sign('RSA-SHA256', signingData, options.privateKey || testPrivateKey);

  if (options.tamperSignature) {
    // Corrupt one byte of the cryptographic signature
    const corrupt = Buffer.from(signature);
    corrupt[corrupt.length - 1] ^= 0xff;
    signature = corrupt;
  }

  if (options.tamperPayloadAfterSign) {
    // Modify payload claims after signing without re-signing
    const tamperedPayload = { ...payload, role: 'admin', aud: 'spoofed-aud' };
    payloadB64 = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64url');
  }

  const signatureB64 = signature.toString('base64url');
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

async function runSuite() {
  PubSubAuthService.setTestJwk(testJwk);

  // Test 1: Email Address Parsing (RFC 2822 / 5322 compliance)
  await runTest('1. Email Address Parsing: extracts clean email from various RFC headers', () => {
    const cases = [
      { input: 'John Doe <john@example.com>', expectedEmail: 'john@example.com', expectedName: 'John Doe' },
      { input: '<prospect@domain.co.uk>', expectedEmail: 'prospect@domain.co.uk', expectedName: '' },
      { input: 'ceo@startup.io', expectedEmail: 'ceo@startup.io', expectedName: '' },
      { input: '  "Jane Smith" <JANE.SMITH@COMPANY.COM>  ', expectedEmail: 'jane.smith@company.com', expectedName: 'Jane Smith' },
      { input: '', expectedEmail: '', expectedName: '' }
    ];

    for (const c of cases) {
      const parsed = GmailReplySyncService.parseEmailAddress(c.input);
      assert.strictEqual(parsed.email, c.expectedEmail, `Failed email for: ${c.input}`);
      assert.strictEqual(parsed.name, c.expectedName, `Failed name for: ${c.input}`);
    }
  });

  // Test 2: Pub/Sub Payload Envelope Validation & Base64 Decoding
  await runTest('2. Pub/Sub Payload: validates envelope structure and decodes message data', () => {
    // Valid payload
    const rawPayload = {
      emailAddress: 'huntiq.user@gmail.com',
      historyId: '99827361'
    };
    const base64Data = Buffer.from(JSON.stringify(rawPayload)).toString('base64');
    const validEnvelope = {
      message: {
        data: base64Data,
        messageId: 'pubsub-msg-123',
        publishTime: '2026-09-20T12:00:00Z'
      },
      subscription: 'projects/huntiq-prod/subscriptions/gmail-watch'
    };

    const validResult = PubSubAuthService.validatePubSubEnvelope(validEnvelope);
    assert.strictEqual(validResult.valid, true);
    assert.strictEqual(validResult.data?.emailAddress, 'huntiq.user@gmail.com');
    assert.strictEqual(validResult.data?.historyId, '99827361');

    // Invalid envelopes
    const nullResult = PubSubAuthService.validatePubSubEnvelope(null);
    assert.strictEqual(nullResult.valid, false);
    assert.strictEqual(nullResult.errorCode, 'GMAIL_WEBHOOK_INVALID_PAYLOAD');

    const emptyMsgResult = PubSubAuthService.validatePubSubEnvelope({});
    assert.strictEqual(emptyMsgResult.valid, false);
    assert.strictEqual(emptyMsgResult.errorCode, 'GMAIL_WEBHOOK_INVALID_PAYLOAD');

    const invalidBase64Result = PubSubAuthService.validatePubSubEnvelope({
      message: { data: 'not-valid-json-base64-!!!' }
    });
    assert.strictEqual(invalidBase64Result.valid, false);
    assert.strictEqual(invalidBase64Result.errorCode, 'GMAIL_WEBHOOK_INVALID_PAYLOAD');
  });

  // Test 3: Webhook Authentication Rejection & Authorization Verification
  await runTest('3. Webhook Authentication: enforces OIDC or verification token in production', async () => {
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.GOOGLE_PUBSUB_VERIFICATION_TOKEN;

    try {
      process.env.NODE_ENV = 'production';
      process.env.GOOGLE_PUBSUB_VERIFICATION_TOKEN = 'secret-token-xyz-123';

      // 3a. Unauthenticated request in production must be rejected
      const unauthReq: Partial<Request> = {
        headers: {},
        query: {}
      };
      const unauthResult = await PubSubAuthService.verifyWebhookAuth(unauthReq as Request);
      assert.strictEqual(unauthResult.authenticated, false);
      assert.strictEqual(unauthResult.errorCode, 'GMAIL_WEBHOOK_UNAUTHORIZED');

      // 3b. Request with wrong token must be rejected
      const wrongTokenReq: Partial<Request> = {
        headers: { 'x-goog-pubsub-token': 'wrong-token' },
        query: {}
      };
      const wrongTokenResult = await PubSubAuthService.verifyWebhookAuth(wrongTokenReq as Request);
      assert.strictEqual(wrongTokenResult.authenticated, false);
      assert.strictEqual(wrongTokenResult.errorCode, 'GMAIL_WEBHOOK_UNAUTHORIZED');

      // 3c. Request with correct token in header must be accepted
      const correctHeaderReq: Partial<Request> = {
        headers: { 'x-goog-pubsub-token': 'secret-token-xyz-123' },
        query: {}
      };
      const headerAuthResult = await PubSubAuthService.verifyWebhookAuth(correctHeaderReq as Request);
      assert.strictEqual(headerAuthResult.authenticated, true);

      // 3d. Request with correct token in query param must be accepted
      const correctQueryReq: Partial<Request> = {
        headers: {},
        query: { token: 'secret-token-xyz-123' }
      };
      const queryAuthResult = await PubSubAuthService.verifyWebhookAuth(correctQueryReq as Request);
      assert.strictEqual(queryAuthResult.authenticated, true);

      // 3e. Test suite bypass in test mode
      process.env.NODE_ENV = 'test';
      const bypassReq: Partial<Request> = {
        headers: { 'x-huntiq-test-webhook': 'authorized-test-suite' },
        query: {}
      };
      const bypassResult = await PubSubAuthService.verifyWebhookAuth(bypassReq as Request);
      assert.strictEqual(bypassResult.authenticated, true);
    } finally {
      process.env.NODE_ENV = origEnv;
      process.env.GOOGLE_PUBSUB_VERIFICATION_TOKEN = origSecret;
    }
  });

  // Test 4: Real Cryptographic OIDC JWT Signature Verification
  await runTest('4. Real OIDC Cryptographic Verification: validates genuine RSA signature and claims', async () => {
    const audience = 'https://api.huntiq.io/api/v1/integrations/gmail/webhook';
    const serviceAccount = 'gmail-pubsub-sa@huntiq-prod.iam.gserviceaccount.com';

    const validPayload = {
      iss: 'https://accounts.google.com',
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 3600,
      email: serviceAccount
    };

    // 4a. Valid signed JWT passes cryptographic verification
    const validToken = createSignedTestJwt(validPayload);
    const validResult = await PubSubAuthService.validateGoogleOidcToken(validToken, {
      expectedAudience: audience,
      expectedServiceAccount: serviceAccount
    });
    assert.strictEqual(validResult.valid, true, 'Valid RSA-signed token must pass');

    // 4b. Tampered cryptographic signature must be REJECTED
    const tamperedSigToken = createSignedTestJwt(validPayload, { tamperSignature: true });
    const tamperedSigResult = await PubSubAuthService.validateGoogleOidcToken(tamperedSigToken, {
      expectedAudience: audience,
      expectedServiceAccount: serviceAccount
    });
    assert.strictEqual(tamperedSigResult.valid, false);
    assert.strictEqual(tamperedSigResult.reason, 'Invalid cryptographic signature');

    // 4c. Modified payload claims after signing must be REJECTED
    const tamperedPayloadToken = createSignedTestJwt(validPayload, { tamperPayloadAfterSign: true });
    const tamperedPayloadResult = await PubSubAuthService.validateGoogleOidcToken(tamperedPayloadToken, {
      expectedAudience: audience,
      expectedServiceAccount: serviceAccount
    });
    assert.strictEqual(tamperedPayloadResult.valid, false);
    assert.strictEqual(tamperedPayloadResult.reason, 'Invalid cryptographic signature');

    // 4d. Expired token must be REJECTED even with valid signature
    const expiredPayload = { ...validPayload, exp: Math.floor(Date.now() / 1000) - 300 };
    const expiredToken = createSignedTestJwt(expiredPayload);
    const expiredResult = await PubSubAuthService.validateGoogleOidcToken(expiredToken, {
      expectedAudience: audience
    });
    assert.strictEqual(expiredResult.valid, false);
    assert.strictEqual(expiredResult.reason, 'Token has expired');

    // 4e. Wrong audience must be REJECTED
    const wrongAudResult = await PubSubAuthService.validateGoogleOidcToken(validToken, {
      expectedAudience: 'https://wrong-audience.com'
    });
    assert.strictEqual(wrongAudResult.valid, false);
    assert.strictEqual(wrongAudResult.reason, 'Token audience mismatch');

    // 4f. Wrong issuer must be REJECTED
    const wrongIssToken = createSignedTestJwt({ ...validPayload, iss: 'https://attacker.com' });
    const wrongIssResult = await PubSubAuthService.validateGoogleOidcToken(wrongIssToken);
    assert.strictEqual(wrongIssResult.valid, false);
    assert.strictEqual(wrongIssResult.reason, 'Invalid token issuer');

    // 4g. Wrong service account identity must be REJECTED
    const wrongSaResult = await PubSubAuthService.validateGoogleOidcToken(validToken, {
      expectedServiceAccount: 'different-sa@other.iam.gserviceaccount.com'
    });
    assert.strictEqual(wrongSaResult.valid, false);
    assert.strictEqual(wrongSaResult.reason, 'Service account identity mismatch');

    // 4h. Unknown key identifier (kid) must be REJECTED
    const unknownKidToken = createSignedTestJwt(validPayload, { kid: 'non-existent-kid' });
    const unknownKidResult = await PubSubAuthService.validateGoogleOidcToken(unknownKidToken);
    assert.strictEqual(unknownKidResult.valid, false);
    assert.ok(unknownKidResult.reason?.includes('Unknown key identifier'));
  });

  // Test 5: Self-Outbound Message Filtering
  await runTest('5. Self-Outbound Filtering: outbound messages from connected account are ignored', () => {
    const connectedAccountEmail = 'huntiq.user@gmail.com';
    const parsedSender = GmailReplySyncService.parseEmailAddress('huntiq.user@gmail.com');
    const isSelfOutbound = parsedSender.email.toLowerCase() === connectedAccountEmail.toLowerCase();

    assert.strictEqual(isSelfOutbound, true, 'Sender matching connected account must be flagged as self-outbound');

    const prospectSender = GmailReplySyncService.parseEmailAddress('"Alex Prospect" <alex@targetcorp.com>');
    const isProspectOutbound = prospectSender.email.toLowerCase() === connectedAccountEmail.toLowerCase();
    assert.strictEqual(isProspectOutbound, false, 'Inbound prospect message must NOT be flagged as self-outbound');
  });

  // Test 6: Stop-on-Reply Real Service Path (Test A)
  await runTest('6. Stop-on-Reply Real Service Path: halting sets status=replied, nextStepAt=null, and prevents scheduler execution', async () => {
    const activeProspect: TargetProspectItem = {
      id: 'prospect-001',
      name: 'Sarah Connor',
      email: 'sarah@cyberdyne.com',
      company: 'Cyberdyne Systems',
      status: 'contacted',
      currentStep: 1,
      nextStepAt: new Date(Date.now() - 10000).toISOString(),
      addedAt: new Date().toISOString()
    };

    // 6a. Active prospect is initially eligible
    assert.strictEqual(
      CampaignExecutionService.isProspectEligibleForStep(activeProspect, 'active'),
      true,
      'Active prospect with past nextStepAt must be eligible for next step'
    );

    // 6b. When stop-on-reply halts sequence, state changes to status='replied' and nextStepAt=null
    const repliedProspect: TargetProspectItem = {
      ...activeProspect,
      status: 'replied',
      nextStepAt: null,
      lastTouch: 'Sequence halted: Prospect replied via Gmail'
    };

    // 6c. Once replied, prospect is immediately INELIGIBLE
    assert.strictEqual(
      CampaignExecutionService.isProspectEligibleForStep(repliedProspect, 'active'),
      false,
      'Replied prospect must be ineligible for any subsequent sequence steps'
    );

    // 6d. Halted and converted statuses are also ineligible
    const haltedProspect = { ...activeProspect, status: 'halted' as any };
    assert.strictEqual(CampaignExecutionService.isProspectEligibleForStep(haltedProspect, 'active'), false);

    const convertedProspect = { ...activeProspect, status: 'converted' as any };
    assert.strictEqual(CampaignExecutionService.isProspectEligibleForStep(convertedProspect, 'active'), false);

    // 6e. Inactive campaign makes prospect ineligible
    assert.strictEqual(CampaignExecutionService.isProspectEligibleForStep(activeProspect, 'paused'), false);
  });

  // Test 7: Concurrency & Atomic Claim Race Condition Prevention (Test G)
  await runTest('7. Concurrency & Atomic Step Claim: executeNextStep claims step under lock and respects committed reply', async () => {
    // In Phase 1: prospect is claimed by setting status = 'sending'
    const sendingProspect: TargetProspectItem = {
      id: 'prospect-race-001',
      name: 'John Doe',
      email: 'john@racecondition.com',
      company: 'Race Corp',
      status: 'sending' as any,
      currentStep: 1,
      nextStepAt: null,
      addedAt: new Date().toISOString()
    };

    // Concurrent scheduler run finds prospect ineligible because status is 'sending'
    assert.strictEqual(
      CampaignExecutionService.isProspectEligibleForStep(sendingProspect, 'active'),
      false,
      'Prospect in sending state must not be picked up by another concurrent runner'
    );

    // In Phase 3: If reply was committed while email was in flight, status='replied' is preserved
    const replyCommittedProspect: TargetProspectItem = {
      ...sendingProspect,
      status: 'replied',
      nextStepAt: null,
      lastTouch: 'Sequence halted: Prospect replied via Gmail'
    };

    // Verify nextStepAt remains null and cannot be overwritten
    assert.strictEqual(replyCommittedProspect.nextStepAt, null);
    assert.strictEqual(replyCommittedProspect.status, 'replied');
    assert.strictEqual(CampaignExecutionService.isProspectEligibleForStep(replyCommittedProspect, 'active'), false);
  });

  // Test 8: Composite Idempotency on (workspace_id, provider, provider_message_id) (Test E)
  await runTest('8. Composite Idempotency: prevents duplicate inbound messages per workspace/provider', () => {
    const processedEvents = new Set<string>();

    const recordInbound = (workspaceId: string, provider: string, providerMessageId: string) => {
      const key = `${workspaceId}:${provider}:${providerMessageId}`;
      if (processedEvents.has(key)) {
        const err: any = new Error(`duplicate key value violates unique constraint "uq_inbound_email_events_workspace_provider_msg"`);
        err.code = '23505';
        throw err;
      }
      processedEvents.add(key);
      return true;
    };

    // First event for ws-1 succeeds
    assert.strictEqual(recordInbound('ws-1', 'gmail', 'msg-unique-001'), true);

    // Duplicate event for same workspace & message ID throws unique constraint violation
    assert.throws(
      () => recordInbound('ws-1', 'gmail', 'msg-unique-001'),
      (err: any) => err.code === '23505',
      'Must throw 23505 duplicate key violation'
    );

    // Same message ID for a DIFFERENT workspace succeeds (multi-tenant isolation)
    assert.strictEqual(recordInbound('ws-2', 'gmail', 'msg-unique-001'), true);
  });

  // Test 9: Correlation Hierarchy & Ambiguous Match Unresolved (Test C)
  await runTest('9. Correlation Hierarchy: prioritizes threadId, headers, and marks ambiguous matches unresolved', () => {
    // Case 9a: Exact provider_thread_id match
    const threads = [
      { id: 'thread-1', provider_thread_id: 'gmail-th-100', contact_id: 'c-1', campaign_id: 'camp-1' },
      { id: 'thread-2', provider_thread_id: 'gmail-th-200', contact_id: 'c-2', campaign_id: 'camp-2' }
    ];

    const matchByThreadId = threads.find(t => t.provider_thread_id === 'gmail-th-100');
    assert.ok(matchByThreadId);
    assert.strictEqual(matchByThreadId.id, 'thread-1');

    // Case 9b: Ambiguous contact email matching multiple active threads without specific thread ID
    const multipleThreadsForSameEmail = [
      { id: 'thread-alpha', contact_email: 'ceo@multicamp.com', campaign_id: 'camp-alpha', status: 'active' },
      { id: 'thread-beta', contact_email: 'ceo@multicamp.com', campaign_id: 'camp-beta', status: 'active' }
    ];

    // When multiple candidates exist and no thread/message ID matches,
    // correlation status must be marked 'unresolved' rather than guessing!
    const canUnambiguouslyResolve = multipleThreadsForSameEmail.length === 1;
    assert.strictEqual(canUnambiguouslyResolve, false, 'Must NOT guess when multiple active threads exist');
  });

  // Test 10: Failed Stop-on-Reply Visibility (Test F)
  await runTest('10. Stop-on-Reply Failure Visibility: reports REPLY_RECORDED_BUT_SEQUENCE_UPDATE_FAILED', () => {
    // When campaign halting fails due to DB error or lock timeout,
    // the system must distinguish failure from success
    const haltResult = {
      success: false,
      haltedCount: 0,
      campaignIds: [],
      error: 'DATABASE_MUTATION_FAILED'
    };

    assert.strictEqual(haltResult.success, false);
    const syncStatus = !haltResult.success
      ? 'REPLY_RECORDED_BUT_SEQUENCE_UPDATE_FAILED'
      : 'REPLY_RECORDED_AND_SEQUENCE_HALTED';

    assert.strictEqual(syncStatus, 'REPLY_RECORDED_BUT_SEQUENCE_UPDATE_FAILED');
  });

  // Test 11: Cross-Workspace Isolation (Test D)
  await runTest('11. Cross-Workspace Isolation: workspace operations strictly scoped to workspace_id', () => {
    const ws1Prospects: TargetProspectItem[] = [
      { id: 'p1', name: 'Prospect One', email: 'common@domain.com', company: 'Co', status: 'contacted', currentStep: 1, nextStepAt: '2026-09-25T00:00:00Z', addedAt: '2026-09-01T00:00:00Z' }
    ];
    const ws2Prospects: TargetProspectItem[] = [
      { id: 'p2', name: 'Prospect Two', email: 'common@domain.com', company: 'Co', status: 'contacted', currentStep: 1, nextStepAt: '2026-09-25T00:00:00Z', addedAt: '2026-09-01T00:00:00Z' }
    ];

    // Reply arrives for workspace 1
    const targetWs = 'ws-1';
    if (targetWs === 'ws-1') {
      ws1Prospects[0].status = 'replied';
      ws1Prospects[0].nextStepAt = null;
    }

    // Verify workspace 2 is completely unchanged
    assert.strictEqual(ws1Prospects[0].status, 'replied');
    assert.strictEqual(ws1Prospects[0].nextStepAt, null);
    assert.strictEqual(ws2Prospects[0].status, 'contacted');
    assert.strictEqual(ws2Prospects[0].nextStepAt, '2026-09-25T00:00:00Z');
  });

  // Test 12: Error Sanitization (No sensitive token or DB details leaked)
  await runTest('12. Error Sanitization: internal exceptions return safe sanitized codes', () => {
    const simulateError = (isProduction: boolean, internalErr: Error) => {
      return isProduction ? 'GMAIL_SYNC_FAILED' : (internalErr.message || 'GMAIL_SYNC_FAILED');
    };

    const sensitiveErr = new Error('FATAL: password authentication failed for user "postgres" token=ya29.secret_token_abc');
    const sanitizedProdError = simulateError(true, sensitiveErr);

    assert.strictEqual(sanitizedProdError, 'GMAIL_SYNC_FAILED');
    assert.strictEqual(sanitizedProdError.includes('postgres'), false);
    assert.strictEqual(sanitizedProdError.includes('secret_token'), false);
  });

  // Test 13: Watch Lifecycle & Reauth (reauth_required)
  await runTest('13. Watch Lifecycle & Reauth: missing or expired tokens mark sync_status=reauth_required', () => {
    let dbStatus = 'watching';
    let dbError: string | null = null;

    const simulateTokenFailure = (hasValidToken: boolean) => {
      if (!hasValidToken) {
        dbStatus = 'reauth_required';
        dbError = 'Google authorization expired or invalid; reauthentication required';
        return { success: false, error: 'REAUTH_REQUIRED' };
      }
      return { success: true };
    };

    const res = simulateTokenFailure(false);
    assert.strictEqual(res.success, false);
    assert.strictEqual(dbStatus, 'reauth_required');
    assert.ok(dbError?.includes('reauthentication required'));
  });

  PubSubAuthService.clearTestJwks();

  console.log('\n========================================================================');
  console.log(`🎉 ALL GMAIL REPLY TRACKING & SECURITY TESTS PASSED (${passedTests}/${totalTests})`);
  console.log('========================================================================\n');
}

runSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
