import React, { useState } from 'react';
import { Key, Copy, Check, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface PersonalApiKey {
  id: string;
  name: string;
  keyMasked: string;
  keyFull: string;
  created: string;
  lastUsed: string;
  calls: string;
}

export const ApiKeysTab: React.FC = () => {
  const [keys, setKeys] = useState<PersonalApiKey[]>([
    {
      id: 'key-1',
      name: 'Default Personal Scraper CLI',
      keyMasked: 'hnt_live_••••••••••••••••8f7a',
      keyFull: 'hnt_live_98a7fbc20e98124976cba9818f7a',
      created: 'May 12, 2026',
      lastUsed: 'Just now',
      calls: '1,240 requests'
    },
    {
      id: 'key-2',
      name: 'Zapier / Make Automation Webhook',
      keyMasked: 'hnt_live_••••••••••••••••3d19',
      keyFull: 'hnt_live_55a298bc6719a00812df09a43d19',
      created: 'Aug 04, 2026',
      lastUsed: 'Yesterday',
      calls: '480 requests'
    }
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleCopy = (id: string, full: string) => {
    navigator.clipboard?.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const newKey: PersonalApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      keyMasked: 'hnt_live_••••••••••••••••' + Math.random().toString(36).substring(2, 6),
      keyFull: 'hnt_live_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      created: 'Just now',
      lastUsed: 'Never',
      calls: '0 requests'
    };

    setKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
    setNewKeyModal(false);
  };

  const handleDelete = (id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #eaecf0',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Personal Access Tokens & API Keys
          </h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
            Authenticate direct CLI queries, Python pipelines, and AI scraping agents with your personal credentials.
          </p>
        </div>

        <button
          onClick={() => setNewKeyModal(true)}
          style={{
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
          }}
        >
          <Plus size={13} />
          <span>Generate New API Key</span>
        </button>
      </div>

      {/* Keys Table */}
      <div className="mobile-table-wrapper" style={{ overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
        <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>TOKEN NAME</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>SECRET TOKEN</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>CREATED</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>USAGE</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      backgroundColor: '#f5f3ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7c3aed'
                    }}>
                      <Key size={13} />
                    </div>
                    <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{k.name}</strong>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{
                      fontSize: '11.5px',
                      backgroundColor: '#f1f5f9',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      color: '#334155',
                      fontFamily: 'monospace'
                    }}>
                      {revealedId === k.id ? k.keyFull : k.keyMasked}
                    </code>
                    <button
                      onClick={() => setRevealedId(revealedId === k.id ? null : k.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px' }}
                    >
                      {revealedId === k.id ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      onClick={() => handleCopy(k.id, k.keyFull)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === k.id ? '#059669' : '#4f46e5', padding: '2px' }}
                    >
                      {copiedId === k.id ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                  {k.created}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569' }}>
                  <span>{k.calls}</span>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block' }}>Last: {k.lastUsed}</span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(k.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Key Modal */}
      {newKeyModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '400px',
            padding: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Create Personal Access Token
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
              Give this token a descriptive label to track its usage.
            </p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
                  Token Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. VS Code Extension / Python Scraper"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d0d5dd',
                    fontSize: '12.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNewKeyModal(false)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0d5dd',
                    borderRadius: '7px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '6px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Create Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
