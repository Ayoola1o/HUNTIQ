import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Mail, 
  Loader2, 
  Unlink, 
  Send, 
  Copy, 
  Check, 
  AlertCircle,
  X,
  HelpCircle
} from 'lucide-react';
import { 
  fetchGoogleAuthStatus, 
  fetchGoogleAuthUrl, 
  disconnectGoogleAuth, 
  sendGoogleTestEmail,
  type GoogleAuthStatus 
} from '../../api/googleAuth';

interface GmailConnectionBadgeProps {
  onStatusChange?: (status: GoogleAuthStatus) => void;
  className?: string;
}

export const GmailConnectionBadge: React.FC<GmailConnectionBadgeProps> = ({
  onStatusChange
}) => {
  const [status, setStatus] = useState<GoogleAuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadStatus = async () => {
    try {
      const data = await fetchGoogleAuthStatus();
      setStatus(data);
      if (onStatusChange) onStatusChange(data);
      if (data.accountEmail && !testEmail) {
        setTestEmail(data.accountEmail);
      }
    } catch (err) {
      console.error('Failed to check Google Auth status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnectClick = async () => {
    setIsConnecting(true);
    try {
      const res = await fetchGoogleAuthUrl();
      if (res.isConfigured && res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        setIsSetupModalOpen(true);
      }
    } catch (err: any) {
      console.error('Failed to initiate Google OAuth:', err);
      setIsSetupModalOpen(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGoogleAuth();
      await loadStatus();
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Failed to disconnect Google:', err);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim() || isSendingTest) return;

    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendGoogleTestEmail(testEmail.trim());
      if (res.success) {
        setTestResult({
          success: true,
          message: `Verification email sent! ID: ${res.data?.messageId || 'ok'}`
        });
      } else {
        setTestResult({
          success: false,
          message: res.error?.message || 'Failed to send test email.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Delivery error'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleCopyEnv = () => {
    const callbackUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.origin}/api/v1/auth/google/callback`
      : `http://localhost:${3000 + 1}/api/v1/auth/google/callback`;
    const envSnippet = `GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com\nGOOGLE_CLIENT_SECRET=your_client_secret\nGOOGLE_REDIRECT_URI=${callbackUrl}`;
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        fontSize: '11px',
        color: '#94a3b8'
      }}>
        <Loader2 size={12} className="animate-spin" />
        <span>Checking Gmail...</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {status?.isConnected ? (
        // Connected State Pill
        <button
          onClick={() => setIsDropdownOpen(prev => !prev)}
          title="Gmail connected via OAuth 2.0 — Click to manage"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            color: '#166534'
          }}
        >
          {/* Live indicator pulsing dot */}
          <span style={{
            position: 'relative',
            display: 'flex',
            height: '8px',
            width: '8px'
          }}>
            <span style={{
              position: 'absolute',
              display: 'inline-flex',
              height: '100%',
              width: '100%',
              borderRadius: '9999px',
              backgroundColor: '#4ade80',
              opacity: 0.75,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <span style={{
              position: 'relative',
              display: 'inline-flex',
              borderRadius: '9999px',
              height: '8px',
              width: '8px',
              backgroundColor: '#16a34a'
            }} />
          </span>

          <Mail size={13} color="#ea4335" />
          <span style={{ fontSize: '11.5px', fontWeight: 700 }}>
            Gmail: <span style={{ fontWeight: 600, color: '#15803d' }}>{status.accountEmail}</span>
          </span>
        </button>
      ) : (
        // Not Connected State Button
        <button
          onClick={handleConnectClick}
          disabled={isConnecting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '6px 13px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#334155'
          }}
        >
          {isConnecting ? (
            <Loader2 size={13} className="animate-spin" color="#ea4335" />
          ) : (
            // Google G Brand Icon
            <svg width="13" height="13" viewBox="0 0 24 24">
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
          <span>Connect Gmail</span>
        </button>
      )}

      {/* Connected Account Popover Dropdown */}
      {isDropdownOpen && status?.isConnected && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '320px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          zIndex: 50,
          fontFamily: 'sans-serif'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fee2e2'
              }}>
                <Mail size={16} color="#ea4335" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {status.accountName || 'Google Account'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {status.accountEmail}
                </div>
              </div>
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              padding: '1px 6px',
              borderRadius: '4px'
            }}>
              ACTIVE
            </span>
          </div>

          <div style={{
            fontSize: '11px',
            color: '#475569',
            backgroundColor: '#f8fafc',
            padding: '8px 10px',
            borderRadius: '6px',
            marginBottom: '14px',
            lineHeight: 1.4
          }}>
            ⚡ <strong>Direct Gmail Delivery Active:</strong> Outbound outreach emails are sent through your official Gmail account via OAuth 2.0. Inbound reply tracking requires Google Cloud Pub/Sub configuration.
          </div>

          {/* Test Send Form */}
          <form onSubmit={handleSendTest} style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Send Test Email
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="recipient@example.com"
                required
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '11px'
                }}
              />
              <button
                type="submit"
                disabled={isSendingTest}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: isSendingTest ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isSendingTest ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                <span>Test</span>
              </button>
            </div>

            {testResult && (
              <div style={{
                marginTop: '6px',
                fontSize: '10.5px',
                fontWeight: 600,
                color: testResult.success ? '#16a34a' : '#dc2626'
              }}>
                {testResult.message}
              </div>
            )}
          </form>

          {/* Disconnect Button */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
              OAuth 2.0 Token Active
            </span>
            <button
              onClick={handleDisconnect}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '4px'
              }}
            >
              <Unlink size={12} />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}

      {/* Setup Guide Modal (When credentials are not in .env) */}
      {isSetupModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #fee2e2'
                }}>
                  <Mail size={18} color="#ea4335" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Connect Google Gmail API
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    OAuth 2.0 Setup for Official Gmail Sending
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSetupModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '18px',
                fontSize: '12.5px',
                color: '#1e40af',
                lineHeight: 1.5
              }}>
                To send outreach emails directly from your personal or Google Workspace Gmail account, add your Google Cloud OAuth Client credentials to your <strong>.env</strong> file.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>1</span>
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    Open <a href="https://console.cloud.google.com/apis/library/gmail.googleapis.com" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline' }}>Google Cloud Console <ExternalLink size={10} style={{ display: 'inline' }} /></a> and <strong>Enable the Gmail API</strong>.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>2</span>
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    Go to <strong>APIs & Services → Credentials</strong> and create an <strong>OAuth 2.0 Client ID</strong> with application type <em>Web application</em>.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>3</span>
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    Under <strong>Authorized redirect URIs</strong>, add:
                    <div style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      marginTop: '6px',
                      fontFamily: 'monospace',
                      fontSize: '11.5px',
                      color: '#0f172a',
                      fontWeight: 600
                    }}>
                      http://localhost:3001/api/v1/auth/google/callback
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>4</span>
                  <div style={{ fontSize: '12px', color: '#334155', width: '100%' }}>
                    Add the Client ID and Client Secret to your <strong>.env</strong> file:
                    <div style={{
                      position: 'relative',
                      backgroundColor: '#0f172a',
                      color: '#e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '6px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      lineHeight: 1.5
                    }}>
                      <div>GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com</div>
                      <div>GOOGLE_CLIENT_SECRET=your_client_secret</div>
                      <div>GOOGLE_REDIRECT_URI={typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? `${window.location.origin}/api/v1/auth/google/callback` : `http://localhost:${3000 + 1}/api/v1/auth/google/callback`}</div>

                      <button
                        onClick={handleCopyEnv}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: '#1e293b',
                          color: '#ffffff',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '10px',
                          fontWeight: 600,
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
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '11.5px',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={15} color="#d97706" style={{ flexShrink: 0 }} />
                <span>After saving `.env`, click "Connect Gmail" to authorize your account in one click!</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={() => setIsSetupModalOpen(false)}
                style={{
                  padding: '7px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={handleConnectClick}
                style={{
                  padding: '7px 18px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Mail size={13} />
                <span>Try Connect Again</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
