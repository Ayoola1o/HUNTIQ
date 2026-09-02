import React from 'react';
import type { UserPreferencesData } from '../../types/profile';
import { useHuntiq } from '../../context/HuntiqContext';
import type { CurrencyCode } from '../../services/currencyService';

interface PreferencesCardProps {
  data: UserPreferencesData;
  onChange: (updates: Partial<UserPreferencesData>) => void;
}

export const PreferencesCard: React.FC<PreferencesCardProps> = ({
  data,
  onChange
}) => {
  const { currency, setCurrency } = useHuntiq();
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
          Preferences
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
          Configure your personal preferences and default settings.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px 16px'
      }}>
        {/* Language */}
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
            Language
          </label>
          <select
            value={data.language}
            onChange={(e) => onChange({ language: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d0d5dd',
              fontSize: '12.5px',
              color: '#101828',
              backgroundColor: '#ffffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="English">English</option>
            <option value="French">Français (French)</option>
            <option value="Spanish">Español (Spanish)</option>
            <option value="German">Deutsch (German)</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
            Timezone
          </label>
          <select
            value={data.timezone}
            onChange={(e) => onChange({ timezone: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d0d5dd',
              fontSize: '12.5px',
              color: '#101828',
              backgroundColor: '#ffffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="(GMT+01:00) Lagos, Nigeria">(GMT+01:00) Lagos, Nigeria</option>
            <option value="(GMT+00:00) London, United Kingdom">(GMT+00:00) London, United Kingdom</option>
            <option value="(GMT+03:00) Nairobi, Kenya">(GMT+03:00) Nairobi, Kenya</option>
            <option value="(GMT+02:00) Johannesburg, South Africa">(GMT+02:00) Johannesburg, South Africa</option>
            <option value="(GMT-05:00) New York, USA">(GMT-05:00) New York, USA</option>
            <option value="(GMT-08:00) San Francisco, USA">(GMT-08:00) San Francisco, USA</option>
          </select>
        </div>

        {/* Date Format */}
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
            Date Format
          </label>
          <select
            value={data.dateFormat}
            onChange={(e) => onChange({ dateFormat: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d0d5dd',
              fontSize: '12.5px',
              color: '#101828',
              backgroundColor: '#ffffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="DD MMM YYYY">DD MMM YYYY (e.g. 24 Aug 2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/24/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-24)</option>
          </select>
        </div>

        {/* Time Format */}
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
            Time Format
          </label>
          <select
            value={data.timeFormat}
            onChange={(e) => onChange({ timeFormat: e.target.value as '12 Hour' | '24 Hour' })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d0d5dd',
              fontSize: '12.5px',
              color: '#101828',
              backgroundColor: '#ffffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="24 Hour">24 Hour (e.g. 14:30)</option>
            <option value="12 Hour">12 Hour (e.g. 02:30 PM)</option>
          </select>
        </div>

        {/* Default Landing Page */}
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
            Default Landing Page
          </label>
          <select
            value={data.defaultLandingPage}
            onChange={(e) => onChange({ defaultLandingPage: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d0d5dd',
              fontSize: '12.5px',
              color: '#101828',
              backgroundColor: '#ffffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Dashboard">Dashboard</option>
            <option value="AI Copilot">AI Copilot</option>
            <option value="Opportunities">Opportunities</option>
            <option value="Signals">Signals</option>
            <option value="Find Prospects">Find Prospects</option>
            <option value="Companies">Companies</option>
            <option value="Pipeline">Pipeline</option>
            <option value="Market Intelligence">Market Intelligence</option>
          </select>
        </div>

        {/* Default Currency */}
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
            Default Currency
          </label>
          <select
            value={currency === 'NGN' ? 'NGN - Nigerian Naira' : currency === 'GBP' ? 'GBP - British Pound' : currency === 'EUR' ? 'EUR - Euro' : 'USD - US Dollar'}
            onChange={(e) => {
              const val = e.target.value;
              const code: CurrencyCode = val.startsWith('NGN') ? 'NGN' : val.startsWith('GBP') ? 'GBP' : val.startsWith('EUR') ? 'EUR' : 'USD';
              onChange({ defaultCurrency: val });
              setCurrency(code);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d0d5dd',
              fontSize: '12.5px',
              color: '#101828',
              backgroundColor: '#ffffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="USD - US Dollar">USD - US Dollar ($)</option>
            <option value="NGN - Nigerian Naira">NGN - Nigerian Naira (₦)</option>
            <option value="GBP - British Pound">GBP - British Pound (£)</option>
            <option value="EUR - Euro">EUR - Euro (€)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
