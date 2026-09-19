import React from 'react';
import { Lock, Key, ShieldCheck, ArrowRight } from 'lucide-react';
import type { ActivityLogItem } from '../../types/profile';

interface RecentActivityCardProps {
  activities: ActivityLogItem[];
  onViewAllClick?: () => void;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activities,
  onViewAllClick
}) => {
  const getIcon = (type: ActivityLogItem['type']) => {
    switch (type) {
      case 'login':
        return <Lock size={13} color="#475569" />;
      case 'password':
        return <Key size={13} color="#475569" />;
      case '2fa':
        return <ShieldCheck size={13} color="#475569" />;
      default:
        return <Lock size={13} color="#475569" />;
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #eaecf0',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Header with View All Link */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Recent Activity
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            Your recent account activity.
          </p>
        </div>

        <button
          onClick={onViewAllClick}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#4f46e5',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0
          }}
        >
          <span>View all activity</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Activity Table */}
      <div className="mobile-table-wrapper" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Activity
              </th>
              <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Location / IP
              </th>
              <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Device
              </th>
              <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '12px 10px', fontSize: '12px', color: '#101828' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getIcon(item.type)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.activity}</span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  </div>
                </td>
                <td style={{ padding: '12px 10px', fontSize: '11.5px', color: '#475569' }}>
                  {item.locationIp}
                </td>
                <td style={{ padding: '12px 10px', fontSize: '11.5px', color: '#475569' }}>
                  {item.device}
                </td>
                <td style={{ padding: '12px 10px', fontSize: '11.5px', color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {item.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
