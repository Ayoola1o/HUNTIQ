import assert from 'node:assert/strict';
import { fetchGmailHistoryPages, fetchGmailInboxBackfill, recoverOutboundAttempt } from '../services/gmailReplySyncService';

async function run() {
  const urls: string[] = [];
  const responseData = [
    { historyId: '200', nextPageToken: 'page-2', history: [{ id: '1', messagesAdded: [{ message: { id: 'mail-1' } }] }] },
    { historyId: '205', history: [{ id: '2', messagesAdded: [{ message: { id: 'mail-1' } }, { message: { id: 'mail-2' } }] }] }
  ];
  const result = await fetchGmailHistoryPages('access', '100', async (input, init) => {
    urls.push(String(input));
    assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer access');
    return new Response(JSON.stringify(responseData.shift()), { status: 200 });
  });
  assert.equal(urls.length, 2, 'every Gmail history page is consumed');
  assert.equal(new URL(urls[1]).searchParams.get('pageToken'), 'page-2');
  assert.equal(result.historyId, '205', 'latest history cursor is returned only after all pages');
  assert.deepEqual(result.history.flatMap(item => item.messagesAdded.map((entry: any) => entry.message.id)), ['mail-1', 'mail-2'], 'duplicate notification messages are deduplicated');

  await assert.rejects(() => fetchGmailHistoryPages('access', '100', async () => new Response('{}', { status: 404 })), (error: any) => error.code === 'HISTORY_CURSOR_EXPIRED');
  const backfillUrls: string[] = [];
  const backfillData = [
    { nextPageToken: 'next', messages: [{ id: 'old-1', threadId: 't-1' }] },
    { messages: [{ id: 'old-1', threadId: 't-1' }, { id: 'old-2', threadId: 't-2' }] }
  ];
  const backfill = await fetchGmailInboxBackfill('access', new Date('2026-11-01T00:00:00Z'), async input => {
    backfillUrls.push(String(input)); return new Response(JSON.stringify(backfillData.shift()), { status: 200 });
  });
  assert.equal(backfill.length, 2, 'expired history cursor triggers paged inbox reconciliation');
  assert.equal(new URL(backfillUrls[0]).searchParams.get('labelIds'), 'INBOX');
  assert.match(new URL(backfillUrls[0]).searchParams.get('q') || '', /^after:\d+$/);
  const storedMessages: any[] = [];
  const attempts: any[] = [];
  const fakePool = { async connect() { return {
    async query(sql: string, values?: any[]) {
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rowCount: 0, rows: [] };
      if (sql.includes('SELECT outreach_thread_id')) return { rowCount: 1, rows: [{ outreach_thread_id: 'thread-crm' }] };
      if (sql.includes('FROM outreach_threads WHERE id=')) return { rowCount: 1, rows: [{ messages: storedMessages, lead_id: 'lead-1', company_id: 'company-1' }] };
      if (sql.includes('INSERT INTO activities')) return { rowCount: 1, rows: [] };
      if (sql.includes('UPDATE outreach_threads SET messages=')) storedMessages.splice(0, storedMessages.length, ...JSON.parse(values![0]));
      if (sql.includes('UPDATE outbound_email_attempts SET state=')) attempts.push(values);
      return { rowCount: 1, rows: [] };
    }, release() {}
  }; } };
  const recovered = { requestId: 'request-1', messageId: 'gmail-message-1', threadId: 'gmail-thread-1', rfcMessageId: '<mail@example.com>', senderName: 'Sales', recipientEmail: 'lead@example.com', subject: 'Evidence-based intro', body: 'Saved email body', timestamp: '2026-11-11T09:00:00Z' };
  assert.equal(await recoverOutboundAttempt(fakePool, 'workspace-1', recovered), true);
  assert.equal(await recoverOutboundAttempt(fakePool, 'workspace-1', recovered), true);
  assert.equal(storedMessages.length, 1, 'reconciling a Gmail-accepted send is idempotent');
  assert.equal(storedMessages[0].deliveryStatus, 'sent');
  assert.equal(attempts.length, 2, 'attempt is marked sent on recovery');
  console.log('Gmail history pagination, duplicate messages, expired cursor, and sent-attempt recovery checks passed.');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
