import assert from 'node:assert';
import { randomUUID } from 'crypto';
import { postgresPool, pool } from '../database/postgres';
import { ensureDatabaseMigrated } from '../database/migrate';
import { CampaignExecutionService, sanitizeDiagnosticError } from '../services/campaignExecutionService';
import { EmailDispatchService, type SendEmailOptions, type SendEmailResult } from '../services/emailDispatchService';
import type { TargetProspectItem } from '../types/campaign';

console.log('========================================================================');
console.log('🚀  HUNTIQ: CAMPAIGN EXECUTION RECOVERY & IDEMPOTENCY TEST SUITE');
console.log('========================================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name: string, fn: () => Promise<void>) {
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

// Database test fixtures helpers
async function setupWorkspaceAndCampaign(options?: {
  stepCount?: number;
  prospectCount?: number;
  delayDays?: number;
}) {
  const activePool = postgresPool || pool;
  if (!activePool) throw new Error('Database unavailable for integration tests');

  const workspaceId = randomUUID();
  const userId = randomUUID();
  const campaignId = randomUUID();

  // Create workspace & user
  await activePool.query(
    `INSERT INTO workspaces (id, name, slug, created_at, updated_at) 
     VALUES ($1, 'Test Workspace', $2, now(), now())`,
    [workspaceId, `test-ws-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`]
  );

  await activePool.query(
    `INSERT INTO users (id, workspace_id, email, password_hash, first_name, last_name, full_name, role, created_at, updated_at) 
     VALUES ($1, $2, $3, 'hash123', 'Test', 'User', 'Test User', 'owner', now(), now())`,
    [userId, workspaceId, `user-${Date.now()}@example.com`]
  );

  const steps = [];
  const count = options?.stepCount ?? 2;
  for (let i = 0; i < count; i++) {
    steps.push({
      id: `step-${i + 1}`,
      stepNumber: i + 1,
      channel: 'email',
      title: `Step ${i + 1}: Follow-up`,
      delayDays: options?.delayDays ?? 3,
      contentSnippet: `Hello, this is step ${i + 1} content.`
    });
  }

  const prospects: TargetProspectItem[] = [];
  const pCount = options?.prospectCount ?? 1;
  for (let i = 0; i < pCount; i++) {
    prospects.push({
      id: `prospect-${i + 1}`,
      contactName: `Prospect ${i + 1}`,
      contactRole: 'VP Sales',
      companyName: 'Acme Corp',
      email: `prospect${i + 1}-${Date.now()}@acme.com`,
      status: 'pending',
      currentStep: 0,
      nextStepAt: null,
      opportunityScore: 85,
      lastTouch: 'Campaign created'
    });
  }

  await activePool.query(
    `INSERT INTO campaigns (
       id, workspace_id, user_id, name, channel, status, 
       sequence_steps, target_prospects, target_count, sent_count, created_at, updated_at
     ) VALUES ($1, $2, $3, 'Q3 Outbound Sprint', 'email', 'active', $4, $5, $6, 0, now(), now())`,
    [campaignId, workspaceId, userId, JSON.stringify(steps), JSON.stringify(prospects), pCount]
  );

  return { workspaceId, userId, campaignId, prospects, steps };
}

async function getCampaign(workspaceId: string, campaignId: string) {
  const activePool = postgresPool || pool;
  const res = await activePool!.query(
    `SELECT * FROM campaigns WHERE id = $1 AND workspace_id = $2`,
    [campaignId, workspaceId]
  );
  return res.rows[0];
}

async function getStepExecution(workspaceId: string, campaignId: string, prospectId: string, step: number) {
  const activePool = postgresPool || pool;
  const res = await activePool!.query(
    `SELECT * FROM campaign_step_executions 
     WHERE workspace_id = $1 AND campaign_id = $2 AND prospect_id = $3 AND sequence_step = $4`,
    [workspaceId, campaignId, prospectId, step]
  );
  return res.rows[0] || null;
}

async function runAllTests() {
  await ensureDatabaseMigrated();

  // Test 1: Successful Dispatch
  await runTest('1. Successful Dispatch: claims under lock, dispatches via provider, advances step and sets nextStepAt', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign();
    const prospect = prospects[0];

    let dispatchCalled = 0;
    EmailDispatchService.setTestDispatchHandler(async (opts) => {
      dispatchCalled++;
      return {
        success: true,
        messageId: 'gmail-msg-test-1',
        threadId: 'gmail-thread-test-1',
        provider: 'gmail',
        status: 'sent',
        to: opts.to,
        deliveredAt: new Date().toISOString()
      };
    });

    const res = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id);
    assert.strictEqual(res.executed, true, 'Execution should succeed');
    assert.strictEqual(res.messageId, 'gmail-msg-test-1');
    assert.ok(res.nextStepAt, 'Upcoming next step should be scheduled');
    assert.strictEqual(dispatchCalled, 1, 'Provider dispatch should be called once');

    // Verify campaign row in PostgreSQL
    const campaign = await getCampaign(workspaceId, campaignId);
    assert.strictEqual(campaign.sent_count, 1, 'Campaign sent_count should be incremented');

    const updatedProspects: TargetProspectItem[] = typeof campaign.target_prospects === 'string'
      ? JSON.parse(campaign.target_prospects)
      : campaign.target_prospects;
    const updatedProspect = updatedProspects.find(p => p.id === prospect.id)!;
    assert.strictEqual(updatedProspect.status, 'delivered', 'Prospect status should be delivered');
    assert.strictEqual(updatedProspect.currentStep, 1, 'currentStep should advance from 0 to 1');
    assert.strictEqual(updatedProspect.claimedAt, null, 'claimedAt should be cleared');
    assert.strictEqual(updatedProspect.executionId, null, 'executionId should be cleared');

    // Verify campaign_step_executions record in PostgreSQL
    const execRow = await getStepExecution(workspaceId, campaignId, prospect.id, 0);
    assert.ok(execRow, 'Step execution record should exist in DB');
    assert.strictEqual(execRow.status, 'delivered');
    assert.strictEqual(execRow.provider_message_id, 'gmail-msg-test-1');
  });

  // Test 2: Provider Failure
  await runTest('2. Provider Failure: safely marks failed and sanitizes error without leaking secrets', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign();
    const prospect = prospects[0];

    EmailDispatchService.setTestDispatchHandler(async () => {
      return {
        success: false,
        messageId: 'err-test-2',
        provider: 'resend',
        status: 'failed',
        to: prospect.email!,
        deliveredAt: new Date().toISOString(),
        error: 'Resend API Error 401 with Bearer re_super_secret_token_12345 and postgres://user:secretpass@db.internal:5432/crm'
      };
    });

    const res = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id);
    assert.strictEqual(res.executed, false, 'Execution should report failure');

    const campaign = await getCampaign(workspaceId, campaignId);
    const updatedProspects: TargetProspectItem[] = typeof campaign.target_prospects === 'string'
      ? JSON.parse(campaign.target_prospects)
      : campaign.target_prospects;
    const updatedProspect = updatedProspects.find(p => p.id === prospect.id)!;

    assert.strictEqual(updatedProspect.status, 'failed', 'Prospect status should be failed');
    assert.strictEqual(updatedProspect.claimedAt, null, 'claimedAt should be cleared');
    assert.ok(updatedProspect.lastError, 'lastError should be populated');
    assert.ok(!updatedProspect.lastError?.includes('re_super_secret_token_12345'), 'Token must be redacted');
    assert.ok(!updatedProspect.lastError?.includes('secretpass'), 'Password must be redacted');

    const execRow = await getStepExecution(workspaceId, campaignId, prospect.id, 0);
    assert.ok(execRow, 'Step execution record should exist');
    assert.strictEqual(execRow.status, 'failed');
    assert.ok(!execRow.error_message?.includes('re_super_secret_token_12345'), 'Exec error message must be redacted');
  });

  // Test 3: Duplicate Scheduler Execution
  await runTest('3. Duplicate Scheduler Execution: prevents executing an already delivered step', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign();
    const prospect = prospects[0];

    let sendCount = 0;
    EmailDispatchService.setTestDispatchHandler(async () => {
      sendCount++;
      return {
        success: true,
        messageId: `msg-${sendCount}`,
        provider: 'gmail',
        status: 'sent',
        to: prospect.email!,
        deliveredAt: new Date().toISOString()
      };
    });

    // Run 1: Succeeds
    const res1 = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id);
    assert.strictEqual(res1.executed, true);
    assert.strictEqual(sendCount, 1);

    // Run 2: Immediately re-run scheduler on same prospect (nextStepAt is in the future)
    const res2 = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id);
    assert.strictEqual(res2.executed, false, 'Duplicate execution should be rejected');
    assert.strictEqual(sendCount, 1, 'Provider should NOT have been called a second time');
  });

  // Test 4: Concurrent Execution Attempts
  await runTest('4. Concurrent Execution Attempts: atomic claim ensures only one worker dispatches', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign();
    const prospect = prospects[0];

    let dispatchCalls = 0;
    EmailDispatchService.setTestDispatchHandler(async () => {
      dispatchCalls++;
      // Simulate network dispatch latency
      await new Promise(r => setTimeout(r, 60));
      return {
        success: true,
        messageId: 'msg-concurrent-test',
        provider: 'gmail',
        status: 'sent',
        to: prospect.email!,
        deliveredAt: new Date().toISOString()
      };
    });

    // Launch 3 simultaneous execution workers for the exact same prospect
    const results = await Promise.all([
      CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id),
      CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id),
      CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id)
    ]);

    const executedCount = results.filter(r => r.executed).length;
    assert.strictEqual(executedCount, 1, 'Exactly one concurrent worker must execute the step');
    assert.strictEqual(dispatchCalls, 1, 'Provider must only be called once');
  });

  // Test 5: Process / Retry after Sending (Stale in-flight recovery)
  await runTest('5. Process / Retry after Sending: stale sending state is cleanly handled', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign();
    const prospect = prospects[0];
    const activePool = postgresPool || pool;

    // Simulate process crash: prospect is left in 'sending' with old claimedAt timestamp (10 mins ago)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const staleProspects = [{
      ...prospect,
      status: 'sending',
      claimedAt: tenMinutesAgo,
      executionId: 'crashed-exec-id',
      currentStep: 0
    }];

    await activePool!.query(
      `UPDATE campaigns SET target_prospects = $1 WHERE id = $2 AND workspace_id = $3`,
      [JSON.stringify(staleProspects), campaignId, workspaceId]
    );

    // Stale timeout of 1000ms: isProspectEligibleForStep recognizes stale sending
    const isEligible = CampaignExecutionService.isProspectEligibleForStep(
      staleProspects[0] as any,
      'active',
      1000 // 1s timeout
    );
    assert.strictEqual(isEligible, true, 'Stale sending prospect should be eligible for recovery/execution');
  });

  // Test 6: Reply Arriving Before Dispatch (Safe Abort)
  await runTest('6. Reply Arriving Before Dispatch: aborts before provider call if prospect replied', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign();
    const prospect = prospects[0];

    // Pre-mark prospect as replied
    await CampaignExecutionService.haltProspectSequence(workspaceId, {
      campaignId,
      prospectId: prospect.id,
      contactEmail: prospect.email!,
      reason: 'Inbound Gmail reply detected'
    });

    let dispatchCalled = false;
    EmailDispatchService.setTestDispatchHandler(async () => {
      dispatchCalled = true;
      return null;
    });

    const res = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id);
    assert.strictEqual(res.executed, false, 'Execution should not proceed');
    assert.strictEqual(res.reason, 'INELIGIBLE_STATUS_REPLIED');
    assert.strictEqual(dispatchCalled, false, 'Provider must not be invoked');
  });

  // Test 7: Reply Arriving After Claim But Before Finalization
  await runTest('7. Reply Arriving After Claim But Before Finalization: preserves replied status and nextStepAt=null', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign();
    const prospect = prospects[0];

    EmailDispatchService.setTestDispatchHandler(async () => {
      // In the middle of provider call, an inbound reply arrives and halts sequence!
      await CampaignExecutionService.haltProspectSequence(workspaceId, {
        campaignId,
        prospectId: prospect.id,
        contactEmail: prospect.email!,
        reason: 'Inbound reply received while in-flight'
      });

      return {
        success: true,
        messageId: 'msg-reply-in-flight',
        provider: 'gmail',
        status: 'sent',
        to: prospect.email!,
        deliveredAt: new Date().toISOString()
      };
    });

    const res = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id);
    assert.strictEqual(res.executed, true);
    assert.strictEqual(res.nextStepAt, null, 'nextStepAt must remain null');
    assert.strictEqual(res.reason, 'DISPATCHED_BUT_REPLY_COMMITTED');

    // Confirm database row preserves replied
    const campaign = await getCampaign(workspaceId, campaignId);
    const updatedProspects: TargetProspectItem[] = typeof campaign.target_prospects === 'string'
      ? JSON.parse(campaign.target_prospects)
      : campaign.target_prospects;
    const finalProspect = updatedProspects.find(p => p.id === prospect.id)!;
    assert.strictEqual(finalProspect.status, 'replied', 'Status must remain replied and NEVER be overwritten to delivered');
    assert.strictEqual(finalProspect.nextStepAt, null, 'nextStepAt must remain null');
  });

  // Test 8: Same Execution ID Being Retried
  await runTest('8. Same Execution ID Retried: idempotent handling returns existing completion', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign();
    const prospect = prospects[0];
    const fixedExecutionId = randomUUID();

    let calls = 0;
    EmailDispatchService.setTestDispatchHandler(async () => {
      calls++;
      return {
        success: true,
        messageId: 'msg-fixed-id',
        provider: 'gmail',
        status: 'sent',
        to: prospect.email!,
        deliveredAt: new Date().toISOString()
      };
    });

    const res1 = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id, {
      forceExecutionId: fixedExecutionId
    });
    assert.strictEqual(res1.executed, true);
    assert.strictEqual(calls, 1);

    // Retry with exact same execution ID
    const res2 = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id, {
      forceExecutionId: fixedExecutionId
    });
    assert.strictEqual(res2.executed, false, 'Duplicate execution ID should not re-dispatch');
    assert.strictEqual(calls, 1, 'Provider call count must not increase');
  });

  // Test 9: Provider Message ID Persistence
  await runTest('9. Provider Message ID Persistence: saves provider ID to execution log and outreach threads', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign();
    const prospect = prospects[0];
    const testMessageId = `gmail-persist-${Date.now()}`;
    const testThreadId = `gmail-thread-${Date.now()}`;

    EmailDispatchService.setTestDispatchHandler(async () => {
      return {
        success: true,
        messageId: testMessageId,
        threadId: testThreadId,
        provider: 'gmail',
        status: 'sent',
        to: prospect.email!,
        deliveredAt: new Date().toISOString()
      };
    });

    await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id);

    // Verify campaign_step_executions has messageId
    const execRow = await getStepExecution(workspaceId, campaignId, prospect.id, 0);
    assert.strictEqual(execRow.provider_message_id, testMessageId);
    assert.strictEqual(execRow.provider_thread_id, testThreadId);

    // Verify outreach_threads has messageId
    const activePool = postgresPool || pool;
    const threadRes = await activePool!.query(
      `SELECT * FROM outreach_threads WHERE workspace_id = $1 AND campaign_id = $2 AND prospect_id = $3`,
      [workspaceId, campaignId, prospect.id]
    );
    assert.strictEqual(threadRes.rows.length, 1, 'Outreach thread should be linked');
    assert.strictEqual(threadRes.rows[0].provider_message_id, testMessageId);
  });

  // Test 10: Cross-Workspace Isolation
  await runTest('10. Cross-Workspace Isolation: execution operations strictly scoped to workspace_id', async () => {
    const { workspaceId: wsA, campaignId: campA, prospects } = await setupWorkspaceAndCampaign();
    const otherWorkspaceId = randomUUID();

    EmailDispatchService.setTestDispatchHandler(async () => {
      return {
        success: true,
        messageId: 'msg-iso',
        provider: 'gmail',
        status: 'sent',
        to: prospects[0].email!,
        deliveredAt: new Date().toISOString()
      };
    });

    // Attempt to execute Campaign in Workspace A using Workspace B
    const res = await CampaignExecutionService.executeNextStepForProspect(
      otherWorkspaceId,
      campA,
      prospects[0].id
    );
    assert.strictEqual(res.executed, false);
    assert.strictEqual(res.reason, 'CAMPAIGN_NOT_FOUND');
  });

  // Test 11: Campaign / Sequence Step Isolation
  await runTest('11. Campaign / Sequence Step Isolation: Step 0 and Step 1 have isolated unique execution records', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign({ delayDays: 0 });
    const prospect = prospects[0];

    let stepNum = 0;
    EmailDispatchService.setTestDispatchHandler(async () => {
      stepNum++;
      return {
        success: true,
        messageId: `msg-step-${stepNum}`,
        provider: 'gmail',
        status: 'sent',
        to: prospect.email!,
        deliveredAt: new Date().toISOString()
      };
    });

    // Execute Step 0
    const res1 = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id);
    assert.strictEqual(res1.executed, true);
    assert.strictEqual(res1.messageId, 'msg-step-1');

    // Make next step immediately due
    const activePool = postgresPool || pool;
    const camp1 = await getCampaign(workspaceId, campaignId);
    const pList = typeof camp1.target_prospects === 'string' ? JSON.parse(camp1.target_prospects) : camp1.target_prospects;
    pList[0].nextStepAt = new Date(Date.now() - 1000).toISOString();
    await activePool!.query(
      `UPDATE campaigns SET target_prospects = $1 WHERE id = $2 AND workspace_id = $3`,
      [JSON.stringify(pList), campaignId, workspaceId]
    );

    // Execute Step 1
    const res2 = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospect.id);
    assert.strictEqual(res2.executed, true);
    assert.strictEqual(res2.messageId, 'msg-step-2');

    // Verify both step execution records exist distinctly
    const execStep0 = await getStepExecution(workspaceId, campaignId, prospect.id, 0);
    const execStep1 = await getStepExecution(workspaceId, campaignId, prospect.id, 1);
    assert.ok(execStep0 && execStep1);
    assert.strictEqual(execStep0.provider_message_id, 'msg-step-1');
    assert.strictEqual(execStep1.provider_message_id, 'msg-step-2');
  });

  // Test 12: Stale Sending Recovery
  await runTest('12. Stale Sending Recovery: confirms delivered without resending, and surfaces ambiguity safely', async () => {
    const { workspaceId, campaignId, prospects } = await setupWorkspaceAndCampaign({ prospectCount: 2 });
    const activePool = postgresPool || pool;

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // Prospect 1: was sending, but step execution confirms delivery happened prior to crash
    const execId1 = randomUUID();
    await activePool!.query(
      `INSERT INTO campaign_step_executions (
         id, workspace_id, campaign_id, prospect_id, sequence_step,
         idempotency_key, status, provider_message_id, claimed_at, completed_at
       ) VALUES ($1, $2, $3, $4, 0, $5, 'delivered', 'msg-delivered-before-crash', $6, now())`,
      [execId1, workspaceId, campaignId, prospects[0].id, `idem-1-${randomUUID()}`, tenMinutesAgo]
    );

    // Prospect 2: was sending, but no provider record exists (ambiguous state)
    const execId2 = randomUUID();
    await activePool!.query(
      `INSERT INTO campaign_step_executions (
         id, workspace_id, campaign_id, prospect_id, sequence_step,
         idempotency_key, status, claimed_at
       ) VALUES ($1, $2, $3, $4, 0, $5, 'sending', $6)`,
      [execId2, workspaceId, campaignId, prospects[1].id, `idem-2-${randomUUID()}`, tenMinutesAgo]
    );

    const crashedProspects = [
      {
        ...prospects[0],
        status: 'sending',
        claimedAt: tenMinutesAgo,
        executionId: execId1,
        currentStep: 0
      },
      {
        ...prospects[1],
        status: 'sending',
        claimedAt: tenMinutesAgo,
        executionId: execId2,
        currentStep: 0
      }
    ];

    await activePool!.query(
      `UPDATE campaigns SET target_prospects = $1 WHERE id = $2 AND workspace_id = $3`,
      [JSON.stringify(crashedProspects), campaignId, workspaceId]
    );

    // Run recovery
    const recoveryRes = await CampaignExecutionService.recoverStaleSendingRecords(workspaceId, 5000);
    assert.strictEqual(recoveryRes.recoveredCount, 2, 'Both stale prospects must be processed');
    assert.strictEqual(recoveryRes.deliveredCount, 1, 'Prospect 1 recovered as delivered');
    assert.strictEqual(recoveryRes.ambiguousCount, 1, 'Prospect 2 marked needs_review due to ambiguity');

    // Verify Prospect 1 was advanced to delivered without duplicate dispatch
    const updatedCampaign = await getCampaign(workspaceId, campaignId);
    const updatedP: TargetProspectItem[] = typeof updatedCampaign.target_prospects === 'string'
      ? JSON.parse(updatedCampaign.target_prospects)
      : updatedCampaign.target_prospects;

    const p1 = updatedP.find(p => p.id === prospects[0].id)!;
    const p2 = updatedP.find(p => p.id === prospects[1].id)!;

    assert.strictEqual(p1.status, 'delivered', 'P1 should be recovered as delivered');
    assert.strictEqual(p1.currentStep, 1, 'P1 currentStep should be advanced to 1');
    assert.strictEqual(p2.status, 'needs_review', 'P2 should be marked needs_review to prevent double send');
    assert.strictEqual(p2.lastError, 'STALE_SENDING_AMBIGUOUS');
  });

  console.log('\n========================================================================');
  console.log(`🎉 ALL RECOVERY & IDEMPOTENCY TESTS PASSED (${passedTests}/${totalTests})`);
  console.log('========================================================================\n');
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
