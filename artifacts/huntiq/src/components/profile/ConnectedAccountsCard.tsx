import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { ConnectedAccountItem } from '../../types/profile';

interface ConnectedAccountsCardProps {
  accounts: ConnectedAccountItem[];
  onManageConnectionsClick?: () => void;
}

export const ConnectedAccountsCard: React.FC<ConnectedAccountsCardProps> = ({
  accounts,
  onManageConnectionsClick
}) => {
  const getProviderIcon = (provider: ConnectedAccountItem['provider']) => {
    switch (provider) {
      case 'Google':
        return (
          <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
          </div>
        );
      case 'Microsoft':
        return (
          <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z"/>
              <path fill="#00a4ef" d="M1 13h10v10H1z"/>
              <path fill="#7fba00" d="M13 1h10v10H13z"/>
              <path fill="#ffb900" d="M13 13h10v10H13z"/>
            </svg>
          </div>
        );
      case 'Slack':
        return (
          <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
              <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
              <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/>
              <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #eaecf0',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
        Connected Accounts
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {accounts.map((acc) => (
          <div key={acc.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {getProviderIcon(acc.provider)}
              <div>
                <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>{acc.provider}</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{acc.emailOrUsername}</span>
              </div>
            </div>

            <span style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#059669',
              backgroundColor: '#ecfdf5',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid #a7f3d0'
            }}>
              + Connected
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
        <button
          onClick={onManageConnectionsClick}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#4f46e5',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0
          }}
        >
          <span>Manage connections</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
