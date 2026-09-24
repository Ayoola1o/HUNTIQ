import type { Request } from 'express';
import * as crypto from 'crypto';
import { config } from '../config/env';

export interface ValidatedPubSubPayload {
  emailAddress: string;
  historyId: string;
  rawPayload: any;
}

export interface WebhookAuthResult {
  authenticated: boolean;
  errorCode?: string;
  errorMessage?: string;
  claims?: any;
}

export interface GoogleJwk {
  kty: string;
  alg?: string;
  use?: string;
  kid: string;
  n: string;
  e: string;
}

export class PubSubAuthService {
  private static cachedJwks: Map<string, GoogleJwk> = new Map();
  private static jwksCacheExpiresAt = 0;
  private static testJwks: Map<string, GoogleJwk> = new Map();

  private static isProduction(): boolean {
    return config.nodeEnv === 'production' || process.env.VERCEL === '1';
  }

  /**
   * For testing: registers a mock or test JWK so tests can cryptographically sign
   * and verify tokens with real RSA keypairs without network calls.
   */
  public static setTestJwk(jwk: GoogleJwk): void {
    this.testJwks.set(jwk.kid, jwk);
  }

  /**
   * For testing: clears any registered test JWKs.
   */
  public static clearTestJwks(): void {
    this.testJwks.clear();
  }

  /**
   * Fetches Google's published public signing certificates / JWKS.
   * Caches results with TTL to minimize latency.
   */
  public static async fetchGoogleJwks(): Promise<Map<string, GoogleJwk>> {
    const now = Date.now();
    if (this.cachedJwks.size > 0 && now < this.jwksCacheExpiresAt) {
      return this.cachedJwks;
    }

    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/certs', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch Google JWKS: HTTP ${res.status}`);
      }

      const data: any = await res.json();
      const keys: GoogleJwk[] = data.keys || [];

      this.cachedJwks.clear();
      for (const key of keys) {
        if (key.kid) {
          this.cachedJwks.set(key.kid, key);
        }
      }

      // Read max-age from Cache-Control header if available, default to 1 hour
      const cacheControl = res.headers.get('cache-control') || '';
      const match = cacheControl.match(/max-age=(\d+)/);
      const maxAgeSec = match ? parseInt(match[1], 10) : 3600;
      this.jwksCacheExpiresAt = now + Math.max(maxAgeSec, 300) * 1000;

      return this.cachedJwks;
    } catch (err: any) {
      console.warn('[PUBSUB_AUTH] Failed to refresh Google JWKS:', err.message);
      return this.cachedJwks;
    }
  }

  /**
   * Validates authentication of an incoming Google Pub/Sub push notification.
   * In production, authentication is strictly required. Unauthenticated traffic is rejected.
   */
  public static async verifyWebhookAuth(req: Request): Promise<WebhookAuthResult> {
    const isProd = this.isProduction();
    const isTest = process.env.NODE_ENV === 'test';

    // Controlled test bypass for synthetic environment tests
    const testBypassHeader = req.headers['x-huntiq-test-webhook'];
    if ((isTest || !isProd) && testBypassHeader === 'authorized-test-suite') {
      return { authenticated: true };
    }

    const verificationTokenConfigured = process.env.GOOGLE_PUBSUB_VERIFICATION_TOKEN?.trim() ||
      process.env.GMAIL_WEBHOOK_SECRET?.trim();
    const expectedAudience = process.env.GOOGLE_PUBSUB_AUDIENCE?.trim() ||
      process.env.GCP_PUBSUB_AUDIENCE?.trim();
    const expectedServiceAccount = process.env.GOOGLE_PUBSUB_SERVICE_ACCOUNT?.trim();

    // 1. Shared secret token verification (query or custom header)
    if (verificationTokenConfigured) {
      const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
      const headerToken = (req.headers['x-goog-pubsub-token'] || req.headers['x-webhook-token']) as string | undefined;

      if (queryToken === verificationTokenConfigured || headerToken === verificationTokenConfigured) {
        return { authenticated: true };
      }
    }

    // 2. Google Pub/Sub OIDC Bearer Token Verification with cryptographic signature verification
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const oidcValidation = await this.validateGoogleOidcToken(token, {
        expectedAudience,
        expectedServiceAccount
      });

      if (oidcValidation.valid) {
        return { authenticated: true, claims: oidcValidation.claims };
      } else {
        return {
          authenticated: false,
          errorCode: 'GMAIL_WEBHOOK_UNAUTHORIZED',
          errorMessage: oidcValidation.reason || 'Invalid Google Pub/Sub OIDC token'
        };
      }
    }

    // In production, unauthenticated webhooks are strictly prohibited
    if (isProd) {
      return {
        authenticated: false,
        errorCode: 'GMAIL_WEBHOOK_UNAUTHORIZED',
        errorMessage: 'Webhook authentication required in production.'
      };
    }

    // In local dev without tokens configured, allow only if NODE_ENV is strictly development
    if (!verificationTokenConfigured && !expectedAudience) {
      if (process.env.NODE_ENV === 'development') {
        return { authenticated: true };
      }
    }

    return {
      authenticated: false,
      errorCode: 'GMAIL_WEBHOOK_UNAUTHORIZED',
      errorMessage: 'Missing required Pub/Sub authentication credentials.'
    };
  }

  /**
   * Cryptographically verifies the signature and validates standard claims
   * of a Google-issued Pub/Sub OIDC JWT token.
   */
  public static async validateGoogleOidcToken(
    token: string,
    options: { expectedAudience?: string; expectedServiceAccount?: string } = {}
  ): Promise<{ valid: boolean; reason?: string; claims?: any }> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, reason: 'Malformed JWT structure' };
      }

      const [headerB64, payloadB64, signatureB64] = parts;

      // 1. Parse and validate header
      let header: any;
      try {
        header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
      } catch {
        return { valid: false, reason: 'Malformed JWT header' };
      }

      if (!header || typeof header !== 'object') {
        return { valid: false, reason: 'Invalid JWT header object' };
      }

      if (header.alg !== 'RS256') {
        return { valid: false, reason: 'Unsupported JWT algorithm; only RS256 is accepted' };
      }

      if (!header.kid || typeof header.kid !== 'string') {
        return { valid: false, reason: 'Missing kid (Key ID) in JWT header' };
      }

      // 2. Locate signing public key (test JWK or Google published JWK)
      let jwk = this.testJwks.get(header.kid);
      if (!jwk) {
        let googleJwks = await this.fetchGoogleJwks();
        jwk = googleJwks.get(header.kid);

        // If not in cache, force refetch once in case keys were rotated
        if (!jwk) {
          this.cachedJwks.clear();
          this.jwksCacheExpiresAt = 0;
          googleJwks = await this.fetchGoogleJwks();
          jwk = googleJwks.get(header.kid);
        }
      }

      if (!jwk) {
        return { valid: false, reason: `Unknown key identifier (kid: ${header.kid})` };
      }

      // 3. Cryptographically verify signature using Node crypto
      let publicKey: crypto.KeyObject;
      try {
        publicKey = crypto.createPublicKey({ key: jwk as any, format: 'jwk' });
      } catch (err: any) {
        return { valid: false, reason: `Failed to construct public key from JWK: ${err.message}` };
      }

      const dataToVerify = Buffer.from(`${headerB64}.${payloadB64}`, 'utf8');
      let signatureBuffer: Buffer;
      try {
        signatureBuffer = Buffer.from(signatureB64, 'base64url');
      } catch {
        return { valid: false, reason: 'Malformed JWT signature encoding' };
      }

      const isSignatureValid = crypto.verify('RSA-SHA256', dataToVerify, publicKey, signatureBuffer);
      if (!isSignatureValid) {
        return { valid: false, reason: 'Invalid cryptographic signature' };
      }

      // 4. ONLY AFTER signature is verified: decode and inspect claims
      let claims: any;
      try {
        claims = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      } catch {
        return { valid: false, reason: 'Malformed JWT payload' };
      }

      if (!claims || typeof claims !== 'object') {
        return { valid: false, reason: 'Invalid JWT claims object' };
      }

      // Validate Issuer
      const validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
      if (!claims.iss || !validIssuers.includes(claims.iss)) {
        return { valid: false, reason: 'Invalid token issuer' };
      }

      // Validate Expiration
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (typeof claims.exp !== 'number' || claims.exp < nowInSeconds) {
        return { valid: false, reason: 'Token has expired' };
      }

      // Validate Audience if configured
      if (options.expectedAudience && claims.aud !== options.expectedAudience) {
        return { valid: false, reason: 'Token audience mismatch' };
      }

      // Validate Service Account if configured
      if (options.expectedServiceAccount && claims.email !== options.expectedServiceAccount) {
        return { valid: false, reason: 'Service account identity mismatch' };
      }

      return { valid: true, claims };
    } catch (err: any) {
      return { valid: false, reason: `Failed to verify OIDC token: ${err.message}` };
    }
  }

  /**
   * Validates Pub/Sub envelope and extracts safe decoded payload.
   */
  public static validatePubSubEnvelope(body: any): {
    valid: boolean;
    data?: ValidatedPubSubPayload;
    errorCode?: string;
    errorMessage?: string;
  } {
    if (!body || typeof body !== 'object') {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Request body must be a JSON object.'
      };
    }

    const message = body.message;
    if (!message || typeof message !== 'object') {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Missing required Pub/Sub message envelope.'
      };
    }

    if (!message.data || typeof message.data !== 'string') {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Pub/Sub message data field must be a base64 encoded string.'
      };
    }

    let decodedString: string;
    try {
      decodedString = Buffer.from(message.data, 'base64').toString('utf8');
    } catch {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Failed to decode base64 message data.'
      };
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(decodedString);
    } catch {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Pub/Sub data must contain a valid JSON object.'
      };
    }

    if (!parsedData || typeof parsedData !== 'object') {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Decoded Pub/Sub payload is not a valid object.'
      };
    }

    const { emailAddress, historyId } = parsedData;

    if (!emailAddress || typeof emailAddress !== 'string') {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Pub/Sub payload is missing required emailAddress.'
      };
    }

    // Basic email sanity check (RFC format)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress.trim())) {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'emailAddress in Pub/Sub payload is not a valid email address.'
      };
    }

    // Validate historyId is a valid non-empty numeric string if present
    if (historyId !== undefined && historyId !== null) {
      const historyStr = String(historyId).trim();
      if (!/^\d+$/.test(historyStr)) {
        return {
          valid: false,
          errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
          errorMessage: 'historyId in Pub/Sub payload must be a numeric identifier.'
        };
      }
    }

    return {
      valid: true,
      data: {
        emailAddress: emailAddress.trim().toLowerCase(),
        historyId: historyId ? String(historyId).trim() : '',
        rawPayload: parsedData
      }
    };
  }
}
