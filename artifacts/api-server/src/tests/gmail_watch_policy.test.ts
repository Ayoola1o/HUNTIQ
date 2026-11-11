import assert from 'node:assert/strict';
import { isGmailWatchRenewalDue } from '../services/gmailReplySyncService';

const now = Date.parse('2026-11-11T12:00:00Z');
const windowMs = 24 * 60 * 60 * 1000;
assert.equal(isGmailWatchRenewalDue(null, now, windowMs), true, 'missing watch should renew');
assert.equal(isGmailWatchRenewalDue('invalid', now, windowMs), true, 'invalid expiration should renew');
assert.equal(isGmailWatchRenewalDue('2026-11-11T18:00:00Z', now, windowMs), true, 'watches inside the renewal window renew');
assert.equal(isGmailWatchRenewalDue('2026-11-13T12:00:01Z', now, windowMs), false, 'healthy watches outside the renewal window are skipped');
console.log('Gmail daily watch-renewal policy checks passed.');
