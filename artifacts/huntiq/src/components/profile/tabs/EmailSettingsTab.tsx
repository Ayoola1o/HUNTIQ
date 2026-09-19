import React, { useState } from 'react';
import { Check } from 'lucide-react';

export const EmailSettingsTab: React.FC = () => {
  const [senderName, setSenderName] = useState('Ayoola Ade');
  const [senderEmail, setSenderEmail] = useState('ayoola.ade@huntiq.com');
  const [signature, setSignature] = useState(
`Best regards,

Ayoola Ade
Growth & Strategy Lead | HUNTIQ
Lagos, Nigeria • +234 801 234 5678
https://huntiq.ai • linkedin.com/in/ayoola-ade`
  );
  const [autoBcc, setAutoBcc] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
            Outreach Email & Signature Settings
          </h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
            Customize how your cold outreach campaigns, executive follow-ups, and email signatures appear to prospects.
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
          <span>{saved ? 'Email Settings Saved' : 'Save Email Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* 2-Col Sender Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
              Sender Display Name
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
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

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
              From Email Address
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
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
        </div>

        {/* Email Signature */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054' }}>
              Custom Outreach Signature
            </label>
            <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600 }}>
              Appended to cold emails & Copilot drafts
            </span>
          </div>
          <textarea
            rows={5}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #d0d5dd',
              fontSize: '12px',
              fontFamily: 'monospace',
              lineHeight: 1.5,
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
        </div>

        {/* BCC CRM Logging Checkbox */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <input
            type="checkbox"
            id="autoBcc"
            checked={autoBcc}
            onChange={(e) => setAutoBcc(e.target.checked)}
            style={{ accentColor: '#4f46e5', width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="autoBcc" style={{ fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
            <strong>Automatically BCC HUNTIQ Logging Address</strong> (<code>crm+log@huntiq.ai</code>) to record outreach history on prospect dossiers.
          </label>
        </div>
      </form>
    </div>
  );
};
