import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Trash2, 
  ArrowRight, 
  Database, 
  Sliders, 
  List,
  Send,
  Loader2,
  Mail,
  AlertCircle
} from 'lucide-react';
import type { IntegrationItem, SyncConfig } from '../../types/integrations';
import { sendGoogleTestEmail, disconnectGoogleAuth } from '../../api/googleAuth';

interface ManageIntegrationModalProps {
  integration: IntegrationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateIntegration: (updated: IntegrationItem) => void;
  onDisconnect: (itemId: string) => void;
  onSyncNow: (itemId: string) => void;
}

export const ManageIntegrationModal: React.FC<ManageIntegrationModalProps> = ({
  integration,
  isOpen,
  onClose,
  onUpdateIntegration,
  onDisconnect,
  onSyncNow
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'mapping' | 'logs'>('config');
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(
    integration?.syncConfig || {
      emailActivity: true,
      contacts: true,
      calendar: true,
      deals: true,
      pushSignals: true
    }
  );

  // Gmail test email state
  const [testEmail, setTestEmail] = useState(integration?.connectedAccount || '');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isGmail = integration?.id === 'int-gmail';

  if (!isOpen || !integration) return null;

  const handleToggle = (key: keyof SyncConfig) => {
    const updatedConfig = { ...syncConfig, [key]: !syncConfig[key] };
    setSyncConfig(updatedConfig);
    onUpdateIntegration({
      ...integration,
      syncConfig: updatedConfig
    });
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim() || isSendingTest) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await sendGoogleTestEmail(testEmail.trim());
      if (res.success) {
        setTestResult({
          success: true,
          message: `Verification email sent via Gmail API! Message ID: ${res.data?.messageId || 'sent'}`
        });
      } else {
        setTestResult({
          success: false,
          message: res.error?.message || 'Failed to dispatch test email.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error communicating with Gmail API.'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleDisconnectItem = async () => {
    setIsDisconnecting(true);
    try {
      if (isGmail) {
        await disconnectGoogleAuth();
      }
      onDisconnect(integration.id);
      onClose();
    } catch (err) {
      console.error('Failed to disconnect integration:', err);
      onDisconnect(integration.id);
      onClose();
    } finally {
      setIsDisconnecting(false);
    }
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
        width: '720px',
        maxWidth: '100%',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: integration.bgColor,
              color: integration.brandColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 900
            }}>
              {integration.name[0]}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {integration.name}
                </h3>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  ● Healthy Connection
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: '#cbd5e1', margin: '2px 0 0 0' }}>
                Connected as {integration.connectedAccount || 'Workspace Admin'} • Last sync: {integration.lastSync}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onSyncNow(integration.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={12} />
              <span>Sync now</span>
            </button>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
            >
              <X size={18} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #eaecf0',
          padding: '0 24px',
          display: 'flex',
          gap: '8px'
        }}>
          {[
            { id: 'config', label: 'Sync Configuration', icon: <Sliders size={13} /> },
            { id: 'mapping', label: 'Field Mapping', icon: <Database size={13} /> },
            { id: 'logs', label: `Sync Activity Logs (${integration.activityLog.length})`, icon: <List size={13} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {/* TAB 1: Configuration */}
          {activeTab === 'config' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Gmail Specific Verification & Test Dispatcher */}
              {isGmail && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={16} color="#ea4335" />
                      <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>
                        Send Gmail API Verification Test
                      </strong>
                    </div>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      OAuth Scopes Active
                    </span>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Dispatch a real RFC 2822 multipart email directly through your authenticated Gmail API token to verify outbox deliverability.
                  </p>

                  <form onSubmit={handleSendTestEmail} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      required
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSendingTest || !testEmail.trim()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#ea4335',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: isSendingTest ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isSendingTest ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Send size={13} />
                      )}
                      <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
                    </button>
                  </form>

                  {testResult && (
                    <div style={{
                      backgroundColor: testResult.success ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${testResult.success ? '#bbf7d0' : '#fee2e2'}`,
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '11.5px',
                      color: testResult.success ? '#166534' : '#b91c1c',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {testResult.success ? (
                        <CheckCircle2 size={14} color="#16a34a" />
                      ) : (
                        <AlertCircle size={14} color="#dc2626" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                  Active Data Streams & Features
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'emailActivity' as const, title: isGmail ? 'Direct Gmail API Delivery' : 'Email & Thread Engagement', desc: isGmail ? 'Send campaigns directly from your authenticated Gmail address with authentic SPF/DKIM headers' : 'Sync prospect emails, opens and replies directly to HUNTIQ outreach' },
                    { key: 'contacts' as const, title: isGmail ? 'Prospect Reply & Bounce Tracking' : 'Contacts & Account Records', desc: isGmail ? 'Track prospect replies in real-time and automatically mark prospects as Replied' : 'Import decision-makers and synchronize updates bidirectionally' },
                    { key: 'calendar' as const, title: isGmail ? 'Stop Sequences on Reply' : 'Calendar & Meeting Scheduler', desc: isGmail ? 'Automatically halt follow-up steps as soon as a prospect answers from this inbox' : 'Sync scheduled discovery calls and automatically link pre-call briefs' },
                    { key: 'deals' as const, title: isGmail ? 'Sync to Gmail Sent Folder' : 'Pipeline Deals & Revenue Stages', desc: isGmail ? 'Automatically retain copies in your Gmail Sent mailbox for team transparency' : 'Mirror opportunity stages and won deals between systems' },
                    { key: 'pushSignals' as const, title: 'Push Verified Buying Signals', desc: 'Transmit detected hiring surges and expansions directly into CRM notes' }
                  ].map((stream) => {
                    const isEnabled = syncConfig[stream.key];

                    return (
                      <div
                        key={stream.key}
                        style={{
                          padding: '12px 14px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #eaecf0',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{stream.title}</strong>
                          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>{stream.desc}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggle(stream.key)}
                          style={{
                            width: '42px',
                            height: '22px',
                            borderRadius: '12px',
                            backgroundColor: isEnabled ? '#4f46e5' : '#cbd5e1',
                            position: 'relative',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            position: 'absolute',
                            top: '3px',
                            left: isEnabled ? '22px' : '4px',
                            transition: 'left 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Disconnect Row */}
              <div style={{
                marginTop: '12px',
                padding: '14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <strong style={{ fontSize: '12px', color: '#991b1b' }}>Disconnect Integration</strong>
                  <p style={{ fontSize: '11px', color: '#b91c1c', margin: '2px 0 0 0' }}>
                    Revokes API access and pauses two-way synchronization.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isDisconnecting}
                  onClick={handleDisconnectItem}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: isDisconnecting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isDisconnecting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Field Mapping */}
          {activeTab === 'mapping' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Schema & Field Attribute Mapping
                </h4>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Ensures properties match cleanly between {integration.name} and HUNTIQ records
                </p>
              </div>

              <div style={{ border: '1px solid #eaecf0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eaecf0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>{integration.name} Field</th>
                      <th style={{ padding: '10px 14px', width: '30px' }}></th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>HUNTIQ System Property</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {integration.fieldMappings.map((map, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                          <code>{map.externalField}</code>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>
                          <ArrowRight size={13} />
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#4f46e5' }}>
                          <code>{map.huntiqField}</code>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                            Matched
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Activity Logs */}
          {activeTab === 'logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {integration.activityLog.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #eaecf0',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={15} color="#059669" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        {log.message}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                        {log.timestamp}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                    {log.recordsCount} Records
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
