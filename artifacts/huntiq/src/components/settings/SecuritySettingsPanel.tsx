import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Plus, 
  Trash2 
} from 'lucide-react';

import type { ApiKeyItem } from '../../types/settings';
import { fetchUserApiKeys, createUserApiKey, deleteUserApiKey } from '../../api/auth';

export const SecuritySettingsPanel: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const keys = await fetchUserApiKeys();
      if (keys && keys.length > 0) {
        setApiKeys(keys.map((k: any) => ({
          id: k.id,
          name: k.name,
          keyPrefix: k.keyPrefix,
          createdAt: k.createdAt ? new Date(k.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          lastUsed: k.lastUsed || 'Never'
        })));
      } else {
        setApiKeys([]);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadKeys());
  }, []);

  const handleCopy = (id: string, textToCopy?: string) => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = async () => {
    const keyName = window.prompt('Enter a label for this API key (e.g. "Zapier Webhook Key"):', 'Custom Integration Key');
    if (!keyName) return;

    try {
      const created = await createUserApiKey(keyName);
      if (created?.secretKey) {
        setNewlyCreatedKey(created.secretKey);
      }
      await loadKeys();
    } catch (err: any) {
      alert(err.message || 'Failed to generate key.');
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this API key? Applications using it will lose access immediately.')) {
      return;
    }
    try {
      await deleteUserApiKey(id);
      await loadKeys();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke key.');
    }
  };


  return (
    <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Security, Authentication & API Keys
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
          Manage two-factor authentication, active login sessions, and programmatic API credentials.
        </p>
      </div>

      {/* 2FA Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #eaecf0',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>Two-Factor Authentication (2FA)</strong>
            <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
              Enforce TOTP authenticator app verification for all workspace logins.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          style={{
            width: '42px',
            height: '22px',
            borderRadius: '12px',
            backgroundColor: twoFactorEnabled ? '#059669' : '#cbd5e1',
            position: 'relative',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: '3px',
            left: twoFactorEnabled ? '22px' : '4px',
            transition: 'left 0.2s ease'
          }} />
        </button>
      </div>

      {/* Newly Created Key Banner */}
      {newlyCreatedKey && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#065f46' }}>
              🔑 API Key Generated! Copy your secret key now:
            </span>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
            >
              Dismiss
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <code style={{ flex: 1, backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1fae5', fontSize: '12px', color: '#0f172a', wordBreak: 'break-all' }}>
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => handleCopy('new-secret', newlyCreatedKey)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {copiedId === 'new-secret' ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedId === 'new-secret' ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>
      )}

      {/* API Keys Table Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #eaecf0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              REST API Access Keys
            </h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
              Secret keys granting secure programmatic access to HUNTIQ endpoints.
            </p>
          </div>

          <button
            onClick={handleCreateKey}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={12} />
            <span>Generate New Key</span>
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eaecf0', color: '#64748b', fontSize: '10.5px', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 16px', fontWeight: 700 }}>Key Label</th>
              <th style={{ padding: '10px 16px', fontWeight: 700 }}>Token Prefix</th>
              <th style={{ padding: '10px 16px', fontWeight: 700 }}>Created</th>
              <th style={{ padding: '10px 16px', fontWeight: 700 }}>Last Used</th>
              <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  {isLoading ? 'Loading programmatic credentials...' : 'No active API keys found. Click "Generate New Key" to create your first key.'}
                </td>
              </tr>
            ) : (
              apiKeys.map((k) => (
                <tr key={k.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{k.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>
                      {k.keyPrefix}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{k.createdAt}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{k.lastUsed}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => handleCopy(k.id, k.keyPrefix)}
                        style={{
                          background: 'none',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          cursor: 'pointer',
                          color: copiedId === k.id ? '#059669' : '#64748b'
                        }}
                      >
                        {copiedId === k.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>

                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
