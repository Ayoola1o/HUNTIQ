import React, { useState } from 'react';
import { X, ShieldCheck, QrCode, Copy, Check } from 'lucide-react';

interface Manage2faModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const Manage2faModal: React.FC<Manage2faModalProps> = ({
  isOpen,
  onClose,
  isEnabled,
  onToggle
}) => {
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const secretKey = 'HX79 J2KL 89PA 3MN9';

  const handleCopySecret = () => {
    navigator.clipboard?.writeText('HX79J2KL89PA3MN9');
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleConfirm = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onToggle(!isEnabled);
      onClose();
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Two-Factor Authentication (2FA)
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0 }}>
                {isEnabled ? 'Manage or disable authenticator app protection.' : 'Protect your HUNTIQ account with a TOTP app.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isEnabled ? (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #cbd5e1'
                }}>
                  <QrCode size={64} color="#0f172a" />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                    1. Scan with Authenticator App
                  </span>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 6px 0' }}>
                    Use Google Authenticator, 1Password, or Authy to scan this code.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <code style={{ fontSize: '11px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>
                      {secretKey}
                    </code>
                    <button
                      onClick={handleCopySecret}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedSecret ? '#059669' : '#4f46e5',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '10.5px',
                        fontWeight: 700
                      }}
                    >
                      {copiedSecret ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
                  2. Enter 6-digit verification code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d0d5dd',
                    fontSize: '18px',
                    letterSpacing: '6px',
                    textAlign: 'center',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </>
          ) : (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              padding: '16px',
              fontSize: '12.5px',
              color: '#065f46'
            }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>2FA is Currently Active</strong>
              <span>Your account is protected. Disabling 2FA reduces your account security level.</span>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0d5dd',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#344054',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isVerifying}
              style={{
                backgroundColor: isEnabled ? '#dc2626' : '#059669',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#ffffff',
                cursor: isVerifying ? 'not-allowed' : 'pointer'
              }}
            >
              {isVerifying ? 'Updating...' : (isEnabled ? 'Disable 2FA' : 'Enable 2FA')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
