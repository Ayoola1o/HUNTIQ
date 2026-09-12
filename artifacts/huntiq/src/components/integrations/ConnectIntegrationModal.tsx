import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw 
} from 'lucide-react';
import type { IntegrationItem } from '../../types/integrations';

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
        ) : (
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
