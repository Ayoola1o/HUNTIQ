import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';

async function run() {
  // Keep this test isolated from any configured database or email provider.
  process.env.DATABASE_URL = '';
  process.env.VERCEL = '0';
  process.env.NODE_ENV = 'test';
  const { campaignsRouter } = await import('../routes/campaigns');
  const { createContactRepository } = await import('../repositories/contacts');
  const contacts = createContactRepository();
  const user = { id: 'campaign-test-user', workspaceId: 'campaign-test-workspace' };
  const contact = await contacts.create(user.id, user.workspaceId, {
    name: 'Draft Recipient', companyName: 'Test Company', email: 'recipient@example.com'
  });
  const foreignContact = await contacts.create('other-user', 'other-workspace', {
    name: 'Other Recipient', email: 'other@example.com'
  });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    Object.assign(req as AuthenticatedRequest, { user });
    next();
  });
  app.use('/api', campaignsRouter);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const endpoint = `http://127.0.0.1:${address.port}/api/campaigns`;
  const call = (path: string, method: string, body: object) => fetch(endpoint + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  try {
    const empty = await fetch(endpoint);
    const emptyBody = await empty.json();
    assert.equal(empty.status, 200, JSON.stringify(emptyBody));
    assert.deepEqual(emptyBody.data.campaigns, []);
    const draft = { name: 'Real draft', subject: 'Hello', body: 'A message', contactIds: [contact.id] };
    assert.equal((await call('', 'POST', { ...draft, contactIds: [foreignContact.id] })).status, 400);
    const response = await call('', 'POST', { ...draft, audienceCount: 184, status: 'active' });
    assert.equal(response.status, 201);
    const { data } = await response.json();
    assert.equal(data.status, 'draft');
    assert.equal(data.audienceCount, 1);
    assert.equal(data.prospects[0].email, 'recipient@example.com');
    assert.equal(data.sequence[0].contentSnippet, 'A message');
    const retrieved = await fetch(endpoint + '/' + data.id);
    assert.equal((await retrieved.json()).data.prospects[0].id, contact.id);
    const queue = await call('/' + data.id + '/status', 'PATCH', { status: 'active' });
    assert.equal(queue.status, 409);
    assert.equal((await queue.json()).error.code, 'DELIVERY_UNAVAILABLE');
    console.log('Campaign draft, audience isolation, and live-provider guard passed.');
  } finally {
    server.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
