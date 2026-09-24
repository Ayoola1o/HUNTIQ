Audit the CURRENT HUNTIQ Gmail OAuth lifecycle before changing anything.

Inspect:

- OAuth authorization endpoint
- OAuth callback
- OAuth state storage
- encrypted token storage
- Gmail integration repository
- disconnect endpoint/service
- token refresh service
- Gmail watch setup
- Gmail watch renewal
- Pub/Sub webhook
- workspace_integrations
- migrations
- frontend integration status handling
- existing tests

Do not redesign the UI.

### Objective

Make Gmail connection lifecycle production-safe:

CONNECT
→ AUTHORIZE
→ CALLBACK
→ STORE TOKENS
→ SETUP WATCH
→ REFRESH
→ RENEW WATCH
→ DISCONNECT
→ RECONNECT

### Disconnect requirements

When a workspace disconnects Gmail:

1. stop/disable the Gmail integration
2. stop or invalidate the Gmail watch state
3. remove or invalidate encrypted provider credentials according to existing security architecture
4. prevent future Gmail webhook processing for that disconnected integration
5. prevent automatic watch renewal
6. prevent outbound Gmail operations
7. preserve necessary historical CRM data without retaining unnecessary active credentials

Do not delete legitimate CRM email history merely because Gmail was disconnected.

### Reconnect requirements

After disconnecting and reconnecting:

- old OAuth state must not be reusable
- new tokens must be stored securely
- workspace binding must be verified
- watch must be recreated
- historyId/watch expiration must be updated
- duplicate webhook processing must remain prevented

### Token refresh

Verify that expired access tokens can be refreshed using the encrypted refresh token.

If refresh fails:

- mark integration appropriately
- do not repeatedly hammer Google
- return a safe actionable error
- never expose token data

### Workspace isolation

A Gmail integration from Workspace A must never:

- read Workspace B's tokens
- process Workspace B's webhook events
- modify Workspace B's campaigns
- send Workspace B's emails

### Error handling

OAuth callback responses must not expose raw provider errors, stack traces, token data, or internal implementation details.

Use safe user-facing errors and detailed server-side diagnostic logging without secrets.

### Tests

Add integration tests covering:

1. successful connect
2. invalid OAuth state
3. expired OAuth state
4. reused OAuth state
5. wrong workspace/state binding
6. successful disconnect
7. webhook after disconnect
8. watch renewal after disconnect
9. reconnect after disconnect
10. expired access-token refresh
11. failed refresh
12. cross-workspace access attempt

Tests must exercise real repository/service behavior where practical rather than only mocking final objects.

Run actual test/typecheck/build commands and report exact results.

Do not change unrelated product functionality.