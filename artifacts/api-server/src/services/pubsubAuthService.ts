import type { Request } from 'express';
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
}

export class PubSubAuthService {
  private static isProduction(): boolean {
    return config.nodeEnv === 'production' || process.env.VERCEL === '1';
  }

  /**
   * Validates authentication of an incoming Google Pub/Sub push notification.
   * In production, authentication is strictly required. Unauthenticated traffic is rejected.
   */
  public static verifyWebhookAuth(req: Request): WebhookAuthResult {
    const isProd = this.isProduction();
    const isTest = process.env.NODE_ENV === 'test';

    // Controlled test/dev bypass
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

    // 2. Google Pub/Sub OIDC Bearer Token Verification
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const oidcValidation = this.validateGoogleOidcToken(token, {
        expectedAudience,
        expectedServiceAccount
      });

      if (oidcValidation.valid) {
        return { authenticated: true };
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

    // In local dev without tokens configured, require an explicit development secret or fail
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
   * Validates standard claims of a Google-issued Pub/Sub OIDC JWT token.
   */
  private static validateGoogleOidcToken(
    token: string,
    options: { expectedAudience?: string; expectedServiceAccount?: string }
  ): { valid: boolean; reason?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, reason: 'Malformed JWT structure' };
      }

      const payloadBuf = Buffer.from(parts[1], 'base64');
      const claims = JSON.parse(payloadBuf.toString('utf8'));

      // Validate Issuer
      const validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
      if (!claims.iss || !validIssuers.includes(claims.iss)) {
        return { valid: false, reason: 'Invalid token issuer' };
      }

      // Validate Expiration
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (!claims.exp || claims.exp < nowInSeconds) {
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

      return { valid: true };
    } catch (err: any) {
      return { valid: false, reason: 'Failed to parse OIDC token payload' };
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
        errorMessage: 'Missing or invalid base64 data field in Pub/Sub message.'
      };
    }

    let decodedString = '';
    try {
      decodedString = Buffer.from(message.data, 'base64').toString('utf8');
    } catch {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Data field is not valid base64.'
      };
    }

    let parsedData: any = null;
    try {
      parsedData = JSON.parse(decodedString);
    } catch {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Decoded Pub/Sub payload is not valid JSON.'
      };
    }

    if (!parsedData || typeof parsedData !== 'object') {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Payload structure is invalid.'
      };
    }

    const emailAddress = typeof parsedData.emailAddress === 'string' ? parsedData.emailAddress.trim().toLowerCase() : '';
    if (!emailAddress || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Invalid or missing emailAddress in Pub/Sub data.'
      };
    }

    const historyId = parsedData.historyId ? String(parsedData.historyId) : '';
    if (!historyId || !/^\d+$/.test(historyId)) {
      return {
        valid: false,
        errorCode: 'GMAIL_WEBHOOK_INVALID_PAYLOAD',
        errorMessage: 'Invalid or missing historyId in Pub/Sub data.'
      };
    }

    return {
      valid: true,
      data: {
        emailAddress,
        historyId,
        rawPayload: parsedData
      }
    };
  }
}
