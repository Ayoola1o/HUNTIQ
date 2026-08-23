import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  Copy 
} from 'lucide-react';

interface CompanyResearchModalProps {
  companyName: string | null;
  onClose: () => void;
}

export const CompanyResearchModal: React.FC<CompanyResearchModalProps> = ({
  companyName,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'brief' | 'signals' | 'people' | 'outreach'>('brief');

  if (!companyName) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleEmail = `Subject: Supporting Acme's expansion into Abuja & scaling leadership

Hi Jane,

I noticed Acme Technologies recently posted 38 new openings and appointed a new COO to spearhead regional expansion. Congratulations on the massive growth!

As teams scale from 250 to 500+ employees, leadership alignment and rapid onboarding bottlenecks often become critical friction points. 

At Peak Consulting, we help high-growth tech leaders build agile management structures and retention frameworks that reduce new-hire ramp time by 40%.

Would you be open to a brief 15-minute introductory conversation this Thursday at 2:00 PM?

Best regards,
Ayoola Ade
Peak Consulting`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 15, 25, 0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '740px',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#1e1b4b',
              border: '1.5px solid #6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a5b4fc'
            }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                  {companyName}
                </h2>
                <span style={{
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  94/100 HOT OPPORTUNITY
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0 0' }}>
                Technology & SaaS • 250–500 employees • Lagos, Nigeria
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          backgroundColor: '#f8fafc'
        }}>
          {[
            { id: 'brief', label: 'Company Intelligence' },
            { id: 'signals', label: 'Buying Signals (3)' },
            { id: 'people', label: 'Decision Makers' },
            { id: 'outreach', label: 'AI Generated Outreach' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, maxHeight: '480px' }}>
          {activeTab === 'brief' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Company Overview
                </h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {companyName} is an enterprise cloud and software architecture provider serving financial institutions across West Africa. They recently secured $12M Series A funding to expand into enterprise infrastructure.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                backgroundColor: '#f8fafc',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ESTIMATED REVENUE</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>$15M – $25M ARR</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>BUYING INTENT</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#e11d48', marginTop: '2px' }}>🔥 Very High (94%)</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>AVG CONTRACT FIT</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>$25,000 – $40,000</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Identified Pain Points
                </h4>
                <ul style={{ fontSize: '13px', color: '#475569', paddingLeft: '20px', lineHeight: 1.6, margin: 0 }}>
                  <li>Rapid headcount scaling causing team fragmentation and management bottlenecks.</li>
                  <li>Need for structured performance frameworks across distributed regional offices.</li>
                  <li>C-Suite transition requiring executive alignment and leadership coaching.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'signals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                  🚀 1. Hiring Spike Detected (+38 Openings)
                </div>
                <div style={{ fontSize: '12px', color: '#15803d', marginTop: '3px' }}>
                  Posted 14 engineering roles, 10 sales roles, and 6 HR/people operations positions in the last 30 days.
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                  🌍 2. Geographic Expansion Announcement
                </div>
                <div style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '3px' }}>
                  Opening second engineering hub in Abuja and planning market launch in Ghana by Q3.
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#6b21a8' }}>
                  👔 3. Leadership & C-Suite Appointment
                </div>
                <div style={{ fontSize: '12px', color: '#7e22ce', marginTop: '3px' }}>
                  Appointed former Microsoft regional director as Chief Operating Officer (COO).
                </div>
              </div>
            </div>
          )}

          {activeTab === 'people' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Jane Smith', role: 'Head of People & Culture', confidence: '94%', reason: 'Primary buyer for organizational scaling and leadership coaching.' },
                { name: 'Emeka Okafor', role: 'Chief Operating Officer (COO)', confidence: '88%', reason: 'Overseeing company-wide regional expansion and infrastructure.' },
                { name: 'Tunde Adeleke', role: 'Chief Executive Officer (CEO)', confidence: '82%', reason: 'Final signer on strategic executive consulting engagements.' },
              ].map((p) => (
                <div key={p.name} style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                    <div style={{ fontSize: '11.5px', color: '#4f46e5', fontWeight: 600 }}>{p.role}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{p.reason}</div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {p.confidence} Match
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'outreach' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Personalized Email • Targeted to Jane Smith (Head of People)
                </span>
                <button
                  onClick={() => handleCopy(sampleEmail)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={12} />
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

              <pre style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '12.5px',
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                lineHeight: 1.55,
                margin: 0
              }}>
                {sampleEmail}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #eaecf0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Data verified via HUNTIQ Autonomous Intelligence Radar
          </span>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
