import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Plus, 
  Trash2 
} from 'lucide-react';
import type { ApiKeyItem } from '../../types/settings';

export const SecuritySettingsPanel: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { id: 'k1', name: 'Production CRM Webhook Key', keyPrefix: 'hnt_live_89f...4a1', createdAt: 'Aug 10, 2026', lastUsed: '5 mins ago' },
    { id: 'k2', name: 'Zapier Automation Integration', keyPrefix: 'hnt_live_32a...98e', createdAt: 'Aug 14, 2026', lastUsed: '1 hour ago' }
  ]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = () => {
    const newKey: ApiKeyItem = {
      id: `k-${Date.now()}`,
      name: 'New Custom Integration Key',
      keyPrefix: `hnt_live_${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 5)}`,
      createdAt: 'Just now',
      lastUsed: 'Never'
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
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
            {apiKeys.map((k) => (
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
                      onClick={() => handleCopy(k.id)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
