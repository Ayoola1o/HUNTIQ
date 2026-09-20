import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  Mail
} from 'lucide-react';
import type { IntegrationItem } from '../../types/integrations';
import { 
  fetchGoogleAuthStatus, 
  fetchGoogleAuthUrl, 
  type GoogleAuthStatus 
} from '../../api/googleAuth';

interface ConnectIntegrationModalProps {
  integration: IntegrationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConnected: (updatedItem: IntegrationItem) => void;
}

export const ConnectIntegrationModal: React.FC<ConnectIntegrationModalProps> = ({
  integration,
  isOpen,
  onClose,
  onConnected
}) => {
  const [syncDirection, setSyncDirection] = useState<'two_way' | 'import' | 'export'>('two_way');
  const [syncFrequency, setSyncFrequency] = useState('Real-time (Webhooks)');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState(0);

  // Gmail-specific OAuth state
  const [googleStatus, setGoogleStatus] = useState<GoogleAuthStatus | null>(null);
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(false);
  const [isRedirectingToGoogle, setIsRedirectingToGoogle] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const isGmail = integration?.id === 'int-gmail';

  useEffect(() => {
    if (isOpen && isGmail) {
      checkGoogleStatus();
    }
  }, [isOpen, isGmail]);

  const checkGoogleStatus = async () => {
    setIsCheckingGoogle(true);
    setGoogleError(null);
    try {
      const status = await fetchGoogleAuthStatus();
      setGoogleStatus(status);
    } catch (err: any) {
      console.warn('Failed to query Google Auth status:', err);
    } finally {
      setIsCheckingGoogle(false);
    }
  };

  const handleConnectWithGoogle = async () => {
    setIsRedirectingToGoogle(true);
    setGoogleError(null);
    try {
      const res = await fetchGoogleAuthUrl(window.location.href);
      if (res.isConfigured && res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        setGoogleError('Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are not set in the server .env file.');
        setIsRedirectingToGoogle(false);
      }
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to initiate Google OAuth consent flow.');
      setIsRedirectingToGoogle(false);
    }
  };

  const handleCopyEnvSnippet = () => {
    const callbackUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.origin}/api/v1/auth/google/callback`
      : `http://localhost:${3000 + 1}/api/v1/auth/google/callback`;
    const snippet = `GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com\nGOOGLE_CLIENT_SECRET=your_client_secret\nGOOGLE_REDIRECT_URI=${callbackUrl}`;
    navigator.clipboard.writeText(snippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  if (!isOpen || !integration) return null;

  const authStages = [
    'Authorizing OAuth 2.0 connection securely...',
    'Validating least-privilege API scopes...',
    'Scanning schema & matching identity records...',
    'Resolving duplicates & establishing data pipeline...',
    'Initial sync complete! 1,248 records ingested.'
  ];

  const handleStartAuth = () => {
    setIsAuthenticating(true);
    setAuthStep(0);

    const interval = setInterval(() => {
      setAuthStep((prev) => {
        if (prev >= authStages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            const updated: IntegrationItem = {
              ...integration,
              status: 'connected',
              connectedAccount: 'ayoola@huntiq.ai',
              lastSync: 'Just now',
              recordsProcessed: 1248,
              syncDirection,
              syncFrequency,
              activityLog: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: 'Just now',
                  message: `Initial synchronization established. 1,248 records ingested via ${syncDirection} pipeline.`,
                  type: 'success',
                  recordsCount: 1248
                },
                ...integration.activityLog
              ]
            };
            onConnected(updated);
            setIsAuthenticating(false);
            onClose();
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '560px',
        maxWidth: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              backgroundColor: integration.bgColor,
              color: integration.brandColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 900
            }}>
              {integration.name[0]}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Connect {integration.name}
              </h3>
              <p style={{ fontSize: '11px', color: '#a5b4fc', margin: '2px 0 0 0' }}>
                Secure OAuth 2.0 synchronization layer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isAuthenticating}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <X size={18} color="#ffffff" />
          </button>
        </div>

        {/* Progress or Setup */}
        {isAuthenticating ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              animation: 'spin 2s linear infinite'
            }}>
              <RefreshCw size={24} />
            </div>

            <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Authenticating & Syncing {integration.name}...
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              {authStages[authStep]}
            </p>

            <div style={{ width: '260px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: '20px', overflow: 'hidden' }}>
              <div style={{
                width: `${((authStep + 1) / authStages.length) * 100}%`,
                height: '100%',
                backgroundColor: '#4f46e5',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        ) : isGmail ? (
          /* Specialized Real Google / Gmail OAuth View */
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* OAuth 2.0 Security Banner */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '12.5px', color: '#0f172a', display: 'block' }}>
                  Official Google OAuth 2.0 Integration
                </strong>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                  Connect your personal Gmail or Google Workspace inbox. HUNTIQ uses the official Google REST API to send authentic, personalized outreach directly from your email address with maximum deliverability, SPF, and DKIM verification.
                </p>
              </div>
            </div>

            {/* Error Message if any */}
            {googleError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '12px',
                color: '#b91c1c'
              }}>
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{googleError}</span>
              </div>
            )}

            {/* If Google OAuth credentials are not configured on the server */}
            {googleStatus && !googleStatus.isConfigured && !isCheckingGoogle && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} color="#d97706" />
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#92400e', margin: 0 }}>
                    Google OAuth Credentials Required in .env
                  </h4>
                </div>
                <p style={{ fontSize: '11.5px', color: '#78350f', margin: 0, lineHeight: 1.45 }}>
                  To authorize real Gmail accounts, provide your Google Cloud OAuth Client ID and Secret in your server environment:
                </p>

                <div style={{
                  backgroundColor: '#0f172a',
                  color: '#e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  position: 'relative',
                  overflowX: 'auto'
                }}>
                  <div>GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com</div>
                  <div>GOOGLE_CLIENT_SECRET=your_client_secret</div>
                  <div>GOOGLE_REDIRECT_URI={typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? `${window.location.origin}/api/v1/auth/google/callback` : `http://localhost:${3000 + 1}/api/v1/auth/google/callback`}</div>

                  <button
                    onClick={handleCopyEnvSnippet}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      border: 'none',
                      borderRadius: '5px',
                      color: '#ffffff',
                      padding: '3px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedEnv ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
                    <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '2px' }}>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11.5px',
                      color: '#b45309',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <span>Google Cloud Console</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    onClick={checkGoogleStatus}
                    disabled={isCheckingGoogle}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d97706',
                      color: '#92400e',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={11} className={isCheckingGoogle ? 'animate-spin' : ''} />
                    <span>Re-check .env</span>
                  </button>
                </div>
              </div>
            )}

            {/* Requested API Scopes */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                Required Gmail API Scopes:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#334155' }}>
                  <CheckCircle2 size={14} color="#059669" />
                  <span><strong>https://www.googleapis.com/auth/gmail.send</strong> — Dispatch outreach emails from your mailbox</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#334155' }}>
                  <CheckCircle2 size={14} color="#059669" />
                  <span><strong>https://www.googleapis.com/auth/userinfo.email</strong> — View your email address for sender mapping</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#334155' }}>
                  <CheckCircle2 size={14} color="#059669" />
                  <span><strong>offline_access</strong> — Secure refresh token for automated follow-up sequences</span>
                </div>
              </div>
            </div>

            {/* Sync Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Delivery Mode
                </label>
                <select
                  value={syncDirection}
                  onChange={(e) => setSyncDirection(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="two_way">Direct Send & Reply Tracking</option>
                  <option value="export">Send Only (Outbound Delivery)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Follow-up Logic
                </label>
                <select
                  value={syncFrequency}
                  onChange={(e) => setSyncFrequency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="Real-time (Webhooks)">Stop sequence on reply (Recommended)</option>
                  <option value="Every 5 minutes">Continue regardless</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Optional Developer Sandbox Mode button if not configured */}
                {googleStatus && !googleStatus.isConfigured && (
                  <button
                    type="button"
                    onClick={handleStartAuth}
                    title="Connect in simulation mode for UI testing"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <span>Developer Demo Mode</span>
                  </button>
                )}

                {/* Primary Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleConnectWithGoogle}
                  disabled={isRedirectingToGoogle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isRedirectingToGoogle ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isRedirectingToGoogle ? (
                    <Loader2 size={16} className="animate-spin" color="#ea4335" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  )}
                  <span>{isRedirectingToGoogle ? 'Redirecting to Google...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Standard Connector for other integrations */
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Least Privilege Security Banner */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>
                  Least-Privilege Authorization
                </strong>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                  HUNTIQ only requests metadata & contact activity required to map engagement. Raw credentials and unencrypted tokens are never exposed.
                </p>
              </div>
            </div>

            {/* Requested Permissions */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Requested API Scopes:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#334155' }}>
                  <CheckCircle2 size={13} color="#059669" />
                  <span>Read email & meeting metadata to track timeline engagement</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#334155' }}>
                  <CheckCircle2 size={13} color="#059669" />
                  <span>Synchronize verified contacts and company records</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#334155' }}>
                  <CheckCircle2 size={13} color="#059669" />
                  <span>Push opportunity milestones into pipeline records</span>
                </div>
              </div>
            </div>

            {/* Sync Direction & Frequency */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Sync Direction
                </label>
                <select
                  value={syncDirection}
                  onChange={(e) => setSyncDirection(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="two_way">Two-Way Sync (Recommended)</option>
                  <option value="import">Import Only ({integration.name} → HUNTIQ)</option>
                  <option value="export">Export Only (HUNTIQ → {integration.name})</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Frequency
                </label>
                <select
                  value={syncFrequency}
                  onChange={(e) => setSyncFrequency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="Real-time (Webhooks)">Real-time (Webhooks)</option>
                  <option value="Every 5 minutes">Every 5 minutes</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Manual on-demand">Manual on-demand</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartAuth}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                }}
              >
                <span>Authorize & Connect</span>
                <ArrowRight size={13} />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
