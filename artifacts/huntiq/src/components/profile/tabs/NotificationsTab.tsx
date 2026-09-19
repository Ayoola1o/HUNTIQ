import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Check } from 'lucide-react';

interface NotificationsTabProps {
  onSaveToast?: () => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ onSaveToast }) => {
  const [prefs, setPrefs] = useState({
    highScoreSignals: { inApp: true, email: true, slack: true },
    decisionMakerVerified: { inApp: true, email: false, slack: true },
    dealStageChange: { inApp: true, email: true, slack: false },
    meetingReminders: { inApp: true, email: true, slack: true },
    dailyDigest: { inApp: false, email: true, slack: false },
    weeklyReport: { inApp: false, email: true, slack: false }
  });

  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof prefs, channel: 'inApp' | 'email' | 'slack') => {
    setPrefs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [channel]: !prev[key][channel]
      }
    }));
  };

  const handleSave = () => {
    setSaved(true);
    onSaveToast?.();
    setTimeout(() => setSaved(false), 2500);
  };

  const notificationRows = [
    {
      key: 'highScoreSignals' as const,
      title: 'High-Intent Buying Signals (>85 Fit)',
      desc: 'Instant alert when a target account triggers a high-confidence expansion or hiring surge.'
    },
    {
      key: 'decisionMakerVerified' as const,
      title: 'Decision-Maker Contact Discovery',
      desc: 'Notification when verified direct email or mobile number is resolved for a C-level executive.'
    },
    {
      key: 'dealStageChange' as const,
      title: 'Pipeline & Deal Velocity Updates',
      desc: 'Alerts when deals move across stages, contracts are viewed, or proposals are opened.'
    },
    {
      key: 'meetingReminders' as const,
      title: 'Meeting & Task Due Dates',
      desc: '15-minute advance reminder before executive discovery calls and outreach tasks.'
    },
    {
      key: 'dailyDigest' as const,
      title: 'Daily AI Market Intelligence Digest',
      desc: 'Morning summary of top industry movements, funding rounds, and recommended targets.'
    },
    {
      key: 'weeklyReport' as const,
      title: 'Weekly Conversion & Pipeline Performance',
      desc: 'End-of-week executive breakdown of outreach sent, meetings held, and pipeline value.'
    }
  ];

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
            Notification Preferences
          </h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
            Choose which buying signals, pipeline alerts, and intelligence digests you receive and where.
          </p>
        </div>

        <button
          onClick={handleSave}
          style={{
            backgroundColor: saved ? '#059669' : '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '7px 16px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          {saved && <Check size={13} strokeWidth={3} />}
          <span>{saved ? 'Preferences Saved' : 'Save Notification Rules'}</span>
        </button>
      </div>

      {/* Notification Matrix Table */}
      <div className="mobile-table-wrapper" style={{ overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
        <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', width: '55%' }}>
                NOTIFICATION EVENT
              </th>
              <th style={{ padding: '12px 10px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textAlign: 'center', width: '15%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Bell size={13} />
                  <span>In-App</span>
                </div>
              </th>
              <th style={{ padding: '12px 10px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textAlign: 'center', width: '15%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Mail size={13} />
                  <span>Email</span>
                </div>
              </th>
              <th style={{ padding: '12px 10px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textAlign: 'center', width: '15%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <MessageSquare size={13} />
                  <span>Slack</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {notificationRows.map((row, idx) => (
              <tr key={row.key} style={{ borderBottom: idx < notificationRows.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '14px 16px' }}>
                  <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{row.title}</strong>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>{row.desc}</span>
                </td>
                <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={prefs[row.key].inApp}
                    onChange={() => toggle(row.key, 'inApp')}
                    style={{ accentColor: '#4f46e5', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={prefs[row.key].email}
                    onChange={() => toggle(row.key, 'email')}
                    style={{ accentColor: '#4f46e5', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={prefs[row.key].slack}
                    onChange={() => toggle(row.key, 'slack')}
                    style={{ accentColor: '#4f46e5', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
