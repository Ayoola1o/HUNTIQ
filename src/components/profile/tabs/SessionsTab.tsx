import React, { useState } from 'react';
import { Laptop, Smartphone, Monitor, LogOut, Check } from 'lucide-react';

interface SessionItem {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  type: 'laptop' | 'mobile' | 'desktop';
}

export const SessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<SessionItem[]>([
    {
      id: 'sess-1',
      device: 'MacBook Pro 16"',
      browser: 'Chrome 128.0',
      ip: '197.210.45.12',
      location: 'Lagos, Nigeria',
      lastActive: 'Active right now',
      isCurrent: true,
      type: 'laptop'
    },
    {
      id: 'sess-2',
      device: 'iPhone 15 Pro',
      browser: 'Mobile Safari 17.5',
      ip: '105.112.33.8',
      location: 'Lagos, Nigeria',
      lastActive: '2 hours ago',
      isCurrent: false,
      type: 'mobile'
    },
    {
      id: 'sess-3',
      device: 'Windows Desktop Workstation',
      browser: 'HUNTIQ Electron Client',
      ip: '197.210.45.12',
      location: 'Lagos, Nigeria',
      lastActive: 'Yesterday, 06:14 PM',
      isCurrent: false,
      type: 'desktop'
    }
  ]);

  const [revokedToast, setRevokedToast] = useState(false);

  const handleRevoke = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setRevokedToast(true);
    setTimeout(() => setRevokedToast(false), 2500);
  };

  const handleRevokeAllOthers = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    setRevokedToast(true);
    setTimeout(() => setRevokedToast(false), 2500);
  };

  const getDeviceIcon = (type: SessionItem['type']) => {
    switch (type) {
      case 'mobile':
        return <Smartphone size={18} color="#4f46e5" />;
      case 'desktop':
        return <Monitor size={18} color="#4f46e5" />;
      default:
        return <Laptop size={18} color="#4f46e5" />;
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
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Active Login Sessions
          </h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
            Review and manage all devices currently authorized to access your HUNTIQ account.
          </p>
        </div>

        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAllOthers}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(220, 38, 38, 0.05)'
            }}
          >
            <LogOut size={13} />
            <span>Sign Out All Other Sessions</span>
          </button>
        )}
      </div>

      {revokedToast && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#065f46',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={14} />
          <span>Session has been successfully revoked. Token invalidated.</span>
        </div>
      )}

      {/* Sessions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sessions.map((sess) => (
          <div
            key={sess.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '10px',
              border: sess.isCurrent ? '1.5px solid #c7d2fe' : '1px solid #e2e8f0',
              backgroundColor: sess.isCurrent ? '#f5f3ff' : '#ffffff',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: sess.isCurrent ? '#ffffff' : '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
              }}>
                {getDeviceIcon(sess.type)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{sess.device}</strong>
                  {sess.isCurrent && (
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#059669',
                      backgroundColor: '#ecfdf5',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      border: '1px solid #a7f3d0'
                    }}>
                      ● Current Session
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                  {sess.browser} • IP: {sess.ip} • {sess.location} • <span style={{ color: '#475569', fontWeight: 600 }}>{sess.lastActive}</span>
                </p>
              </div>
            </div>

            {!sess.isCurrent && (
              <button
                onClick={() => handleRevoke(sess.id)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d0d5dd',
                  color: '#475569',
                  borderRadius: '7px',
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Revoke Session
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
