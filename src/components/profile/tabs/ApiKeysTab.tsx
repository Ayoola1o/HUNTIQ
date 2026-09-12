import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, Plus, Trash2, AlertCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { fetchUserApiKeys, createUserApiKey, deleteUserApiKey } from '../../../api/auth';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

export const ApiKeysTab: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserApiKeys();
      setKeys(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load API keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCopy = (text: string, identifier: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setNewKeyName('');
    setCreateError(null);
    setCreatedSecret(null);
    setNewKeyModal(true);
  };

  const handleCloseModal = () => {
    if (isCreating) return;
    setNewKeyModal(false);
    setCreatedSecret(null);
    setNewKeyName('');
    setCreateError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createUserApiKey(newKeyName.trim());
      const rawSecret = result?.secretKey || result?.apiKey || '';
      setCreatedSecret(rawSecret);

      // Prepend to local list
      setKeys(prev => [
        {
          id: result.id,
          name: result.name,
          keyPrefix: result.keyPrefix,
          createdAt: result.createdAt,
          lastUsedAt: null
        },
        ...prev
      ]);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to generate API key. Please check database connection.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      const success = await deleteUserApiKey(id);
      if (success) {
        setKeys(prev => prev.filter(k => k.id !== id));
      } else {
        alert('Failed to delete API key. It may have already been revoked.');
      }
    } catch {
      alert('An error occurred while deleting the API key.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return 'Never';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoStr;
    }
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
          onClick={handleOpenCreateModal}
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

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#991b1b',
          fontSize: '12.5px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Keys Table */}
      <div className="mobile-table-wrapper" style={{ overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
        <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>TOKEN NAME</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>KEY PREFIX</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>CREATED</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>LAST USED</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading API keys...</span>
                  </div>
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  <Key size={24} style={{ margin: '0 auto 8px auto', opacity: 0.4, display: 'block' }} />
                  <strong style={{ display: 'block', color: '#334155', marginBottom: '4px' }}>No active API keys</strong>
                  <span>Click "Generate New API Key" above to create an authentication token.</span>
                </td>
              </tr>
            ) : (
              keys.map((k) => (
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
                        {k.keyPrefix}••••••••
                      </code>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                    {formatDate(k.createdAt)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569' }}>
                    {k.lastUsedAt ? formatDate(k.lastUsedAt) : 'Never'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(k.id)}
                      disabled={deletingId === k.id}
                      title="Revoke API key"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: deletingId === k.id ? '#94a3b8' : '#ef4444',
                        cursor: deletingId === k.id ? 'not-allowed' : 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
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
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            {!createdSecret ? (
              <>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  Create Personal Access Token
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                  Give this token a descriptive label to track its usage.
                </p>

                {createError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#991b1b',
                    fontSize: '12px',
                    marginBottom: '14px'
                  }}>
                    <AlertCircle size={15} />
                    <span>{createError}</span>
                  </div>
                )}

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
                      Token Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Email Scraper Integration / Python Pipeline"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      required
                      autoFocus
                      disabled={isCreating}
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
                      onClick={handleCloseModal}
                      disabled={isCreating}
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
                      disabled={isCreating || !newKeyName.trim()}
                      style={{
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '7px',
                        padding: '6px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: isCreating ? 'not-allowed' : 'pointer',
                        opacity: isCreating ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isCreating && <Loader2 size={13} className="animate-spin" />}
                      <span>{isCreating ? 'Generating...' : 'Create Token'}</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <Check size={20} />
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  API Key Generated
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 16px 0' }}>
                  Please copy your secret key now. For security purposes, <strong>you will not be able to see it again</strong>.
                </p>

                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '14px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}>
                    <code style={{
                      fontSize: '12px',
                      wordBreak: 'break-all',
                      color: '#0f172a',
                      fontFamily: 'monospace'
                    }}>
                      {createdSecret}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdSecret, 'modal-secret')}
                      style={{
                        backgroundColor: copiedKey === 'modal-secret' ? '#059669' : '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0
                      }}
                    >
                      {copiedKey === 'modal-secret' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey === 'modal-secret' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  color: '#92400e',
                  fontSize: '11.5px',
                  marginBottom: '16px'
                }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>Store this key securely in your environment variables. Never expose it in client-side code or public repositories.</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '7px',
                      padding: '8px 20px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
