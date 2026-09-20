import { apiClient } from './client';

export interface GoogleAuthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  accountEmail?: string;
  accountName?: string;
  accountPicture?: string;
  connectedAt?: string;
  scopes?: string[];
  clientId?: string;
}

export interface GoogleAuthUrlResponse {
  authUrl?: string;
  isConfigured: boolean;
  setupGuide?: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
  };
}

/**
 * Fetch current Google / Gmail connection status.
 */
export async function fetchGoogleAuthStatus(): Promise<GoogleAuthStatus> {
  try {
    const data = await apiClient.get<GoogleAuthStatus>('/api/v1/auth/google/status');
    return data;
  } catch (err) {
    console.warn('[GOOGLE_AUTH_API] Failed to fetch status:', err);
    return {
      isConfigured: false,
      isConnected: false
    };
  }
}

/**
 * Fetch Google OAuth 2.0 authorization consent URL.
 */
export async function fetchGoogleAuthUrl(returnUrl?: string): Promise<GoogleAuthUrlResponse> {
  const currentUrl = returnUrl || window.location.href;
  const res = await apiClient.get<GoogleAuthUrlResponse>('/api/v1/auth/google/url', {
    params: { returnUrl: currentUrl }
  });
  return res;
}

/**
 * Disconnect Google / Gmail integration for the current workspace.
 */
export async function disconnectGoogleAuth(): Promise<void> {
  await apiClient.post('/api/v1/auth/google/disconnect');
}

/**
 * Send a verification test email via the connected Gmail account.
 */
export async function sendGoogleTestEmail(toEmail: string): Promise<any> {
  return await apiClient.post('/api/v1/auth/google/test', { toEmail });
}
