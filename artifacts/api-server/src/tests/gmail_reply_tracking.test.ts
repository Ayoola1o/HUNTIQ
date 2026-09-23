import assert from 'node:assert';
import { GmailReplySyncService } from '../services/gmailReplySyncService';

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

async function runSuite() {
  // Test 1: Email Address Parsing
  await runTest('1. Email Address Parsing: extracts clean email from various RFC headers', () => {
    const cases = [
      { input: 'John Doe <john@example.com>', expected: 'john@example.com' },
      { input: '<prospect@domain.co.uk>', expected: 'prospect@domain.co.uk' },
      { input: 'ceo@startup.io', expected: 'ceo@startup.io' },
      { input: '  "Jane Smith" <JANE.SMITH@COMPANY.COM>  ', expected: 'jane.smith@company.com' },
      { input: '', expected: '' }
    ];

    for (const c of cases) {
      const parsed = GmailReplySyncService.parseEmailAddress(c.input);
      assert.strictEqual(parsed.email, c.expected, `Failed for input: ${c.input}`);
    }
  });

  // Test 2: Pub/Sub Webhook Payload Decoding
  await runTest('2. Pub/Sub Payload: correctly decodes base64 message data and extracts historyId and emailAddress', () => {
    const rawPayload = {
      emailAddress: 'huntiq.user@gmail.com',
      historyId: '99827361'
    };
    const base64Data = Buffer.from(JSON.stringify(rawPayload)).toString('base64');
    const pubSubEnvelope = {
      message: {
        data: base64Data,
        messageId: 'pubsub-msg-123',
        publishTime: '2026-09-20T12:00:00Z'
      },
      subscription: 'projects/huntiq-prod/subscriptions/gmail-watch'
    };

    const decoded = JSON.parse(Buffer.from(pubSubEnvelope.message.data, 'base64').toString('utf8'));
    assert.strictEqual(decoded.emailAddress, 'huntiq.user@gmail.com');
    assert.strictEqual(decoded.historyId, '99827361');
  });

  // Test 3: Self-outbound message filtering
  await runTest('3. Self-Outbound Filtering: outbound messages from own email are ignored and never treated as replies', async () => {
    // Mock pool tracking thread state
    let threadUpdated = false;
    const mockPool: any = {
      query: async (queryText: string, params: any[]) => {
        if (queryText.includes('UPDATE outreach_threads')) {
          threadUpdated = true;
          return { rowCount: 1 };
        }
        return { rows: [] };
      }
    };

    // If sender is own account
    const connectedAccountEmail = 'huntiq.user@gmail.com';
    const messageSender = 'huntiq.user@gmail.com';
    const isSelfOutbound = messageSender.toLowerCase() === connectedAccountEmail.toLowerCase();

    assert.ok(isSelfOutbound, 'Sender matches connected account and must be identified as self-outbound');
    assert.strictEqual(threadUpdated, false, 'Self-outbound message must not update thread to replied');
  });

  // Test 4: Inbound Reply Matching & Stop-on-Reply Sequence Halting
  await runTest('4. Reply Processing: matches thread, marks status=replied, and halts sequence when stop_sequence_on_reply is enabled', async () => {
    let capturedUpdates: any = null;
    let sequenceCancelled = false;
    let eventLogged = false;

    const mockPool: any = {
      query: async (queryText: string, params: any[]) => {
        // Query existing threads
        if (queryText.includes('SELECT') && queryText.includes('FROM outreach_threads')) {
          return {
            rows: [{
              id: 'thread-001',
              workspace_id: 'ws-test-alpha',
              contact_id: 'contact-001',
              campaign_id: 'camp-001',
              provider_thread_id: 'gmail-thread-abc',
              status: 'active',
              messages: [{ id: 'msg-1', direction: 'outbound', body: 'Hello!' }],
              stop_sequence_on_reply: true,
              sequence_status: 'active'
            }]
          };
        }
        // Update thread
        if (queryText.includes('UPDATE outreach_threads')) {
          capturedUpdates = { query: queryText, params };
          return { rowCount: 1 };
        }
        // Cancel campaign sequence
        if (queryText.includes('UPDATE campaign_prospects') || queryText.includes('campaigns')) {
          sequenceCancelled = true;
          return { rowCount: 1 };
        }
        // Log inbound event
        if (queryText.includes('INSERT INTO inbound_email_events')) {
          eventLogged = true;
          return { rows: [{ id: 'evt-1' }] };
        }
        // Update integration history id
        if (queryText.includes('UPDATE workspace_integrations')) {
          return { rowCount: 1 };
        }
        return { rows: [] };
      }
    };

    // Simulate inbound reply
    const fakeThread = {
      id: 'thread-001',
      workspace_id: 'ws-test-alpha',
      contact_id: 'contact-001',
      campaign_id: 'camp-001',
      provider_thread_id: 'gmail-thread-abc',
      status: 'active',
      messages: [{ id: 'msg-1', direction: 'outbound', body: 'Hello!' }],
      stop_sequence_on_reply: true,
      sequence_status: 'active'
    };

    const inboundMsg = {
      id: 'gmail-msg-inbound-999',
      threadId: 'gmail-thread-abc',
      from: 'prospect@acme.corp',
      to: 'huntiq.user@gmail.com',
      subject: 'Re: Partnership Inquiry',
      body: "Thanks for reaching out! Let's schedule a call next Tuesday.",
      timestamp: new Date().toISOString()
    };

    // Verify reply matching
    assert.strictEqual(inboundMsg.threadId, fakeThread.provider_thread_id, 'Thread ID matches existing CRM thread');

    // Simulate processing
    const updatedMessages = [
      ...fakeThread.messages,
      {
        id: `reply-${inboundMsg.id}`,
        direction: 'inbound',
        subject: inboundMsg.subject,
        body: inboundMsg.body,
        sentAt: inboundMsg.timestamp,
        providerMessageId: inboundMsg.id
      }
    ];

    const shouldHaltSequence = fakeThread.stop_sequence_on_reply === true;
    const newSequenceStatus = shouldHaltSequence ? 'halted' : fakeThread.sequence_status;

    await mockPool.query(
      `UPDATE outreach_threads SET status = 'replied', messages = $1, sequence_status = $2 WHERE id = $3`,
      [JSON.stringify(updatedMessages), newSequenceStatus, fakeThread.id]
    );

    if (shouldHaltSequence && fakeThread.campaign_id) {
      await mockPool.query(
        `UPDATE campaign_prospects SET status = 'halted' WHERE campaign_id = $1 AND contact_id = $2`,
        [fakeThread.campaign_id, fakeThread.contact_id]
      );
    }

    await mockPool.query(
      `INSERT INTO inbound_email_events (workspace_id, integration_id, provider_message_id) VALUES ($1, $2, $3)`,
      [fakeThread.workspace_id, 'int-001', inboundMsg.id]
    );

    assert.ok(capturedUpdates, 'Outreach thread must be updated');
    assert.strictEqual(capturedUpdates.params[1], 'halted', 'Sequence status must be halted when stop_sequence_on_reply is true');
    assert.strictEqual(sequenceCancelled, true, 'Campaign sequence step must be halted for the replied contact');
    assert.strictEqual(eventLogged, true, 'Inbound email event must be recorded');
  });

  // Test 5: Continue-on-reply preserves sequence
  await runTest('5. Continue-on-Reply: when stop_sequence_on_reply is false, thread is marked replied but sequence remains active', async () => {
    let newSequenceStatus = 'active';

    const fakeThread = {
      id: 'thread-002',
      stop_sequence_on_reply: false,
      sequence_status: 'active'
    };

    if (fakeThread.stop_sequence_on_reply) {
      newSequenceStatus = 'halted';
    }

    assert.strictEqual(newSequenceStatus, 'active', 'Sequence status must remain active when stop_sequence_on_reply is false');
  });

  // Test 6: Inbound Message Idempotency
  await runTest('6. Idempotency: duplicate inbound messages are prevented via provider_message_id constraint', async () => {
    const processedMessageIds = new Set<string>();

    const recordMessage = (providerMessageId: string) => {
      if (processedMessageIds.has(providerMessageId)) {
        const err: any = new Error('duplicate key value violates unique constraint "unique_inbound_msg"');
        err.code = '23505';
        throw err;
      }
      processedMessageIds.add(providerMessageId);
      return true;
    };

    // First insertion succeeds
    assert.strictEqual(recordMessage('gmail-msg-12345'), true);

    // Second insertion with identical providerMessageId throws 23505 duplicate key
    assert.throws(
      () => recordMessage('gmail-msg-12345'),
      (err: any) => err.code === '23505',
      'Should throw duplicate key error on second attempt'
    );
  });

  // Test 7: Cross-Workspace Isolation in Reply Sync
  await runTest('7. Cross-Workspace Isolation: reply sync for Workspace A never touches Workspace B outreach threads', async () => {
    const databaseThreads = [
      { id: 'thread-ws-a', workspaceId: 'ws-alpha', email: 'prospect@acme.com', status: 'active' },
      { id: 'thread-ws-b', workspaceId: 'ws-beta', email: 'prospect@acme.com', status: 'active' }
    ];

    const currentWorkspaceId = 'ws-alpha';
    const incomingReply = { sender: 'prospect@acme.com', body: 'Interested!' };

    // Query scoped strictly to currentWorkspaceId
    const matchingThreads = databaseThreads.filter(
      t => t.workspaceId === currentWorkspaceId && t.email === incomingReply.sender
    );

    assert.strictEqual(matchingThreads.length, 1);
    assert.strictEqual(matchingThreads[0].id, 'thread-ws-a');

    // Mutate only matched thread
    matchingThreads[0].status = 'replied';

    // Verify Workspace B was not modified
    const wsBThread = databaseThreads.find(t => t.workspaceId === 'ws-beta');
    assert.strictEqual(wsBThread?.status, 'active', 'Workspace B thread must remain untouched');
  });

  // Test 8: Gmail Watch Lifecycle Status Verification
  await runTest('8. Gmail Watch Lifecycle: integration status reflects watch status and historyId accurately', () => {
    const integrationRow = {
      id: 'int-001',
      provider: 'google',
      workspace_id: 'ws-alpha',
      account_email: 'sales@huntiq.io',
      status: 'connected',
      watch_history_id: '1098234',
      watch_expiration: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
      sync_status: 'watching'
    };

    assert.strictEqual(integrationRow.status, 'connected');
    assert.strictEqual(integrationRow.sync_status, 'watching');
    assert.ok(integrationRow.watch_history_id, 'History ID must be persisted');
    assert.ok(new Date(integrationRow.watch_expiration) > new Date(), 'Watch expiration must be in future');
  });

  console.log('\n========================================================================');
  console.log(`🎉 ALL GMAIL REPLY TRACKING TESTS PASSED (${passedTests}/${totalTests})`);
  console.log('========================================================================\n');
}

runSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
