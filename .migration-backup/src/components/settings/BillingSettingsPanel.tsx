import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const BillingSettingsPanel: React.FC = () => {
  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Plan, Subscriptions & Credit Usage
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
          Manage your workspace subscription tier, invoices, and AI enrichment quota.
        </p>
      </div>

      {/* Plan Card */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{
              fontSize: '10.5px',
              fontWeight: 800,
              backgroundColor: 'rgba(99, 102, 241, 0.3)',
              color: '#c7d2fe',
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              Current Plan
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 900, margin: '6px 0 0 0', color: '#ffffff' }}>
              Scale & Growth Enterprise
            </h3>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff' }}>
              $249<span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>/month</span>
            </div>
            <span style={{ fontSize: '11px', color: '#a5b4fc' }}>Renews on Sep 1, 2026</span>
          </div>
        </div>

        {/* AI Credit Usage Progress Bar */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#e2e8f0' }}>AI Enrichment & Sourcing Credits</span>
            <strong style={{ color: '#ffffff' }}>8,420 / 10,000 used (84%)</strong>
          </div>

          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '84%', height: '100%', backgroundColor: '#6366f1', borderRadius: '3px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            border: 'none',
            borderRadius: '8px',
            padding: '7px 16px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}>
            <span>Upgrade Plan</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
