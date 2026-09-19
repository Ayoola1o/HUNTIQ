import React, { useState } from 'react';
import type { SearchCriteria } from '../../types/prospectHunter';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Plus, 
  Search, 
  X
} from 'lucide-react';

interface AdvancedFilterFormProps {
  criteria: SearchCriteria;
  onChangeCriteria: (updates: Partial<SearchCriteria>) => void;
  onSubmit: () => void;
  onReset: () => void;
  onClearAll: () => void;
}

export const AdvancedFilterForm: React.FC<AdvancedFilterFormProps> = ({
  criteria,
  onChangeCriteria,
  onSubmit,
  onReset,
  onClearAll
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCustomSignalInput, setShowCustomSignalInput] = useState(false);
  const [customSignalText, setCustomSignalText] = useState('');

  const signalOptions = [
    { id: 'Hiring Activity', label: 'Hiring Activity' },
    { id: 'Funding Raised', label: 'Funding Raised' },
    { id: 'Expansion', label: 'Expansion' },
    { id: 'Leadership Change', label: 'Leadership Change' },
    { id: 'Technology Change', label: 'Technology Change' },
    { id: 'New Office', label: 'New Office' },
    { id: 'News Mentions', label: 'News Mentions' },
    { id: 'Compliance Events', label: 'Compliance Events' },
    { id: 'Poor Reviews', label: 'Poor Reviews' },
  ];

  const handleToggleSignal = (sigId: string) => {
    const current = criteria.signals;
    const next = current.includes(sigId)
      ? current.filter((s) => s !== sigId)
      : [...current, sigId];
    onChangeCriteria({ signals: next });
  };

  const handleAddCustomSignal = () => {
    if (customSignalText.trim()) {
      onChangeCriteria({ signals: [...criteria.signals, customSignalText.trim()] });
      setCustomSignalText('');
      setShowCustomSignalInput(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '24px 28px',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
            Advanced Filters
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Refine your search using specific criteria.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onClearAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#e11d48',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Clear all
          </button>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{isCollapsed ? 'Show filters' : 'Hide filters'}</span>
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* 2-Row Filter Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px'
          }}>
            {/* 1. Industry */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Industry
              </label>
              <select
                value={criteria.industries[0] || ''}
                onChange={(e) => onChangeCriteria({ industries: e.target.value ? [e.target.value] : [] })}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select industries</option>
                <option value="Technology">Technology & Software</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Professional Services">Professional Services</option>
              </select>
            </div>

            {/* 2. Location */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Location
              </label>
              <select
                value={criteria.locations[0] || ''}
                onChange={(e) => onChangeCriteria({ locations: e.target.value ? [e.target.value] : [] })}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select locations</option>
                <option value="Lagos, Nigeria">Lagos, Nigeria</option>
                <option value="Abuja, Nigeria">Abuja, Nigeria</option>
                <option value="Port Harcourt, Nigeria">Port Harcourt, Nigeria</option>
                <option value="Accra, Ghana">Accra, Ghana</option>
                <option value="Nairobi, Kenya">Nairobi, Kenya</option>
              </select>
            </div>

            {/* 3. Company Size */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Company Size
              </label>
              <select
                value={criteria.companySize}
                onChange={(e) => onChangeCriteria({ companySize: e.target.value })}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              >
                <option value="1 - 10 employees">1 - 10 employees</option>
                <option value="11 - 50 employees">11 - 50 employees</option>
                <option value="50 - 500 employees">50 - 500 employees</option>
                <option value="500 - 1,000 employees">500 - 1,000 employees</option>
                <option value="1,000+ employees">1,000+ employees</option>
              </select>
            </div>

            {/* 4. Revenue */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Revenue
              </label>
              <select
                value={criteria.revenue}
                onChange={(e) => onChangeCriteria({ revenue: e.target.value })}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              >
                <option value="$1M - $10M">$1M - $10M</option>
                <option value="$10M - $50M">$10M - $50M</option>
                <option value="$50M - $100M">$50M - $100M</option>
                <option value="$100M+">$100M+</option>
              </select>
            </div>

            {/* Row 2: 5. Business Type */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Business Type
              </label>
              <select
                value={criteria.businessType}
                onChange={(e) => onChangeCriteria({ businessType: e.target.value })}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              >
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
                <option value="B2B2C">B2B2C</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            {/* 6. Technologies */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Technologies
              </label>
              <select
                value={criteria.technologies[0] || ''}
                onChange={(e) => onChangeCriteria({ technologies: e.target.value ? [e.target.value] : [] })}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select technologies</option>
                <option value="AWS">Amazon Web Services (AWS)</option>
                <option value="Salesforce">Salesforce CRM</option>
                <option value="HubSpot">HubSpot</option>
                <option value="Workday">Workday HCM</option>
              </select>
            </div>

            {/* 7. Years in Business */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Years in Business
              </label>
              <select
                value={criteria.yearsInBusiness}
                onChange={(e) => onChangeCriteria({ yearsInBusiness: e.target.value })}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              >
                <option value="All">Select range</option>
                <option value="1 - 3 years">1 - 3 years (Startup)</option>
                <option value="3 - 10 years">3 - 10 years (Scaleup)</option>
                <option value="10+ years">10+ years (Established)</option>
              </select>
            </div>

            {/* 8. ICP Fit */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                ICP Fit
              </label>
              <select
                value={criteria.icpFit}
                onChange={(e) => onChangeCriteria({ icpFit: e.target.value })}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              >
                <option value="All">All</option>
                <option value="Excellent">Excellent (&gt;90%)</option>
                <option value="Strong">Strong (75-90%)</option>
                <option value="Moderate">Moderate (60-75%)</option>
              </select>
            </div>
          </div>

          {/* Signals & Buying Intent */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                Signals & Buying Intent
              </h4>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0 }}>
                Select the search that indicate a company might need your solution.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {signalOptions.map((sig) => {
                const isSelected = criteria.signals.includes(sig.id);

                return (
                  <button
                    key={sig.id}
                    type="button"
                    onClick={() => handleToggleSignal(sig.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                      border: isSelected ? '1.5px solid #a78bfa' : '1px solid #e2e8f0',
                      color: isSelected ? '#5b21b6' : '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{sig.label}</span>
                    {isSelected && <Check size={14} color="#7c3aed" />}
                  </button>
                );
              })}

              {/* Custom Signal Button */}
              {showCustomSignalInput ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="text"
                    placeholder="Enter custom signal..."
                    value={customSignalText}
                    onChange={(e) => setCustomSignalText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomSignal();
                    }}
                    style={{
                      height: '32px',
                      padding: '0 8px',
                      borderRadius: '6px',
                      border: '1px solid #6366f1',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSignal}
                    style={{
                      height: '32px',
                      padding: '0 10px',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomSignalInput(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomSignalInput(true)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={13} />
                  <span>Add Custom Signal</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '8px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '18px'
          }}>
            <button
              type="button"
              onClick={onSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 24px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Search size={14} />
              <span>Find Prospects</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
};
