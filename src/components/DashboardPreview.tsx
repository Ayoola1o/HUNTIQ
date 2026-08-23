import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Sparkles, 
  Target, 
  Mail, 
  DollarSign, 
  Search
} from 'lucide-react';
import type { OnboardingData } from '../types/onboarding';

interface DashboardPreviewProps {
  data: OnboardingData;
  onBackToOnboarding: () => void;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ data, onBackToOnboarding }) => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#0b0f19',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        gap: '24px'
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#818cf8'
          }}>
            <Radar size={32} />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0' }}>
            Initializing Hunting Radar for {data.workspaceName}...
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Scanning signals across {data.industries.length > 0 ? data.industries.join(', ') : 'target markets'}...
          </p>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const kpis = [
    { label: 'Prospects Discovered', value: '1,284', change: '+18% this wk', icon: <Search size={18} color="#6366f1" /> },
    { label: 'High-Intent Prospects', value: '184', change: '+24 new today', icon: <Sparkles size={18} color="#e11d48" /> },
    { label: 'New Opportunities', value: '47', change: '+6 trigger events', icon: <Target size={18} color="#d97706" /> },
    { label: 'Outreach Sent', value: '632', change: '84 replies (13.3%)', icon: <Mail size={18} color="#0284c7" /> },
    { label: 'Pipeline Value', value: '$284,000', change: '12.8% win rate', icon: <DollarSign size={18} color="#16a34a" /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f6fa', overflow: 'hidden' }}>
      {/* Mini Sidebar */}
      <aside style={{
        width: '240px',
        backgroundColor: '#0b0f19',
        color: '#ffffff',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', paddingLeft: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Radar size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>HUNTIQ</span>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Command Center', active: true },
              { label: 'Prospect Hunter', active: false },
              { label: 'Company Intelligence', active: false },
              { label: 'Decision Makers', active: false },
              { label: 'Market Radar (Signals)', active: false },
              { label: 'CRM Pipeline', active: false },
              { label: 'AI Copilot', active: false },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: item.active ? 700 : 500,
                  backgroundColor: item.active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: item.active ? '#a5b4fc' : '#94a3b8',
                  border: item.active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* Workspace pill */}
        <div style={{
          backgroundColor: '#111827',
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ACTIVE WORKSPACE</div>
          <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>
            {data.workspaceName}
          </div>
          <button
            onClick={onBackToOnboarding}
            style={{
              marginTop: '8px',
              width: '100%',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#c7d2fe',
              padding: '6px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Back to Onboarding
          </button>
        </div>
      </aside>

      {/* Main Command Center Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Top Header */}
        <header style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Sales Command Center
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Targeting: {data.whatYouSell}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              backgroundColor: '#ecfdf5',
              color: '#059669',
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              Autonomous Radar Active
            </span>
            <button
              onClick={onBackToOnboarding}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Reconfigure Onboarding
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #eaecf0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{kpi.label}</span>
                  {kpi.icon}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
                  {kpi.change}
                </div>
              </div>
            ))}
          </div>

          {/* Intelligence Live Feed & Top Opportunities */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            {/* Left Feed Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                    🔥 Live Buying Signal Feed
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Ranked by opportunity score & timing urgency
                  </span>
                </div>
              </div>

              {/* Feed Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Item 1 */}
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#faf5ff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#f3e8ff',
                        color: '#7c3aed',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        marginRight: '8px'
                      }}>
                        HOT SIGNAL (94/100)
                      </span>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>TechCorp International</strong>
                    </div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>12 mins ago</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#334155', margin: '4px 0 8px 0', lineHeight: 1.4 }}>
                    Recently posted <strong>14 new job openings</strong> across finance, sales, and operations after closing $12M Series A.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600 }}>
                      ⚡ Recommended Action: Contact Head of People with Scaling & HR Strategy pitch
                    </span>
                    <button style={{
                      backgroundColor: '#6366f1',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Investigate →
                    </button>
                  </div>
                </div>

                {/* Item 2 */}
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f0f9ff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        marginRight: '8px'
                      }}>
                        NEW TRIGGER (89/100)
                      </span>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>Apex Financial Holdings</strong>
                    </div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>45 mins ago</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#334155', margin: '4px 0 8px 0', lineHeight: 1.4 }}>
                    Announced expansion into 3 regional hubs. Appointed new Chief Operating Officer.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>
                      ⚡ Recommended Action: Lead with executive leadership coaching & org design
                    </span>
                    <button style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Generate Outreach →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Actions & Top Targets */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                🎯 Top Discovered Targets
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Vanguard Systems', match: '96%', location: 'Lagos & London', fit: 'Hiring spike' },
                  { name: 'CloudScale AI', match: '92%', location: 'San Francisco, CA', fit: 'Leadership shift' },
                  { name: 'OmniHealth Labs', match: '88%', location: 'New York, NY', fit: 'Series B funding' },
                ].map((target) => (
                  <div
                    key={target.name}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #f1f5f9',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{target.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{target.location} • {target.fit}</div>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#059669',
                      backgroundColor: '#d1fae5',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {target.match}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
