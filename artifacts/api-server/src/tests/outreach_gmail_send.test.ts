import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';

async function run() {
  process.env.DATABASE_URL = '';
  process.env.NODE_ENV = 'test';
  process.env.VERCEL = '0';
  const { outreachRouter } = await import('../routes/outreach');
  const { GmailService } = await import('../services/gmailService');
  const { GoogleAuthService } = await import('../services/googleAuthService');
  const deliveries: Parameters<typeof GmailService.sendEmail>[0][] = [];
  const original = GmailService.sendEmail;
  GmailService.sendEmail = async options => {
    deliveries.push(options);
    return {
      success: options.text !== 'reject this',
      messageId: `gmail-${deliveries.length}`,
      threadId: 'thread-1',
      fromEmail: 'sender@example.com',
      to: options.to,
      deliveredAt: new Date().toISOString()
    };
  };
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    Object.assign(req, { user: { id: 'test-user', workspaceId: 'outreach-test-workspace' } });
    next();
  });
  app.use('/api', outreachRouter);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const post = (path: string, body: object) => fetch(`http://127.0.0.1:${address.port}/api/outreach${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  try {
    const draft = { contactName: 'Contact', companyName: 'Example', subject: 'Hello', lastMessageSnippet: 'Initial email', channel: 'email' };
    assert.equal((await post('', draft)).status, 400);
    assert.equal(deliveries.length, 0);
    const unsafe = await post('', { ...draft, email: 'recipient@example.com' });
    assert.equal(unsafe.status, 409, 'syntactic but unverified addresses cannot be sent');
    assert.equal(deliveries.length, 0);

    const oldGetIntegration = GoogleAuthService.getIntegration;
    const oldGetToken = GoogleAuthService.getValidAccessToken;
    GoogleAuthService.getIntegration = async () => ({ workspaceId: 'test', provider: 'gmail', accountEmail: 'sender@example.com', accessToken: 'token', isActive: true, status: 'active' } as any);
    GoogleAuthService.getValidAccessToken = async () => 'token';
    GmailService.setTestFetchHandler(async () => new Response(JSON.stringify({ error: { message: 'Gmail rejected recipient' } }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
    try {
      GmailService.sendEmail = original;
      const rejected = await GmailService.sendEmail({ workspaceId: 'test', to: 'recipient@example.com', subject: 'Hello', text: 'Body' });
      assert.equal(rejected.success, false, 'Gmail rejection must not be reported as sent');
      assert.match(rejected.error || '', /rejected recipient/);
      GmailService.setTestFetchHandler(async () => { throw new Error('socket timed out'); });
      await assert.rejects(() => GmailService.sendEmail({ workspaceId: 'test', to: 'recipient@example.com', subject: 'Hello', text: 'Body' }), (error: any) => error.deliveryOutcomeUnknown === true);
    } finally {
      GoogleAuthService.getIntegration = oldGetIntegration;
      GoogleAuthService.getValidAccessToken = oldGetToken;
      GmailService.setTestFetchHandler(null);
    }
    console.log('Outreach missing recipient, unverified recipient, and Gmail rejection checks passed.');
  } finally {
    GmailService.sendEmail = original;
    server.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
