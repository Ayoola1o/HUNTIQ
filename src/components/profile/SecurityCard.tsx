import React from 'react';
import type { UserSecurityData } from '../../types/profile';

interface SecurityCardProps {
  security: UserSecurityData;
  onChangePasswordClick: () => void;
  onManage2faClick: () => void;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({
  security,
  onChangePasswordClick,
  onManage2faClick
}) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #eaecf0',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Security
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
          Manage your password and account security settings.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {/* Password Row */}
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '8px' }}>
            Password
          </label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontSize: '16px', letterSpacing: '2px', color: '#101828', fontWeight: 600 }}>
              ••••••••••••••••••••
            </span>
            <button
              onClick={onChangePasswordClick}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0d5dd',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#344054',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication Row */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054' }}>
              Two-Factor Authentication
            </label>
            {security.twoFactorEnabled ? (
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#059669',
                backgroundColor: '#ecfdf5',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid #a7f3d0'
              }}>
                Enabled
              </span>
            ) : (
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid #fecaca'
              }}>
                Disabled
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              Your account is protected with authenticator app.
            </span>
            <button
              onClick={onManage2faClick}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0d5dd',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#344054',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              Manage 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
