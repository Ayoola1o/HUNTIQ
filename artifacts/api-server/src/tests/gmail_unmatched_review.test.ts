import assert from 'node:assert/strict';
import { linkUnmatchedInbound } from '../services/gmailReplySyncService';

async function run() {
  const event = { id: 'event-1', sender_email: 'reply@example.com', sender_name: 'Casey', subject: 'Re: Question', body_text: 'Full readable reply', provider_message_id: 'gmail-in-1', provider_thread_id: 'gmail-thread-1', message_date: '2026-11-11T09:00:00Z' };
  const thread = { id: 'thread-1', email: 'other@example.com', contact_name: 'Casey', company_id: 'company-1', lead_id: 'lead-1', messages: [] as any[] };
  let activityWrites = 0;
  let reviewed = false;
  const fakePool = { async connect() { return {
    async query(sql: string, values?: any[]) {
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rowCount: 0, rows: [] };
      if (sql.includes('FROM inbound_email_events')) return reviewed ? { rowCount: 0, rows: [] } : { rowCount: 1, rows: [event] };
      if (sql.includes('FROM outreach_threads')) return { rowCount: 1, rows: [thread] };
      if (sql.includes('UPDATE outreach_threads SET messages=')) thread.messages = JSON.parse(values![0]);
      if (sql.includes('UPDATE inbound_email_events SET correlation_status')) reviewed = true;
      if (sql.includes('INSERT INTO activities')) activityWrites++;
      return { rowCount: 1, rows: [] };
    }, release() {}
  }; } };
  await assert.rejects(() => linkUnmatchedInbound(fakePool, 'workspace-1', 'event-1', 'thread-1'), /sender address does not match/);
  thread.email = 'reply@example.com';
  await linkUnmatchedInbound(fakePool, 'workspace-1', 'event-1', 'thread-1');
  await assert.rejects(() => linkUnmatchedInbound(fakePool, 'workspace-1', 'event-1', 'thread-1'), /not found/);
  assert.equal(thread.messages.length, 1, 'manual linking never duplicates the email in the conversation');
  assert.equal(thread.messages[0].content, 'Full readable reply');
  assert.equal(activityWrites, 1, 'review action keeps lead activity synchronized');
  console.log('Unmatched inbox sender verification, full reply, and duplicate-link checks passed.');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
