import React from 'react';
import { Shield } from 'lucide-react';
import type { UserProfileData } from '../../types/profile';

interface AccountSummaryCardProps {
  data: UserProfileData;
}

export const AccountSummaryCard: React.FC<AccountSummaryCardProps> = ({ data }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #eaecf0',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
        Account Summary
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Role */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#64748b' }}>Role</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: '#4f46e5' }}>
            <Shield size={13} />
            <span>{data.role}</span>
          </div>
        </div>

        {/* Member Since */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#64748b' }}>Member since</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{data.memberSince}</span>
        </div>

        {/* Last Active */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#64748b' }}>Last active</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{data.lastActive}</span>
        </div>

        {/* Account Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#64748b' }}>Account status</span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#059669',
            backgroundColor: '#ecfdf5',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid #a7f3d0'
          }}>
            ● {data.status}
          </span>
        </div>
      </div>
    </div>
  );
};
