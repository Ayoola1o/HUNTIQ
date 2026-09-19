import React from 'react';
import { 
  Globe2, 
  Users, 
  Briefcase, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import type { OnboardingData } from '../../types/onboarding';

interface Step2ICPProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const availableIndustries = [
  'Technology & SaaS',
  'Financial Services & Fintech',
  'Healthcare & Life Sciences',
  'Cybersecurity',
  'E-Commerce & Retail',
  'Professional Services',
  'Logistics & Supply Chain',
  'Manufacturing & Industrial',
  'Telecommunications',
  'Education & EdTech'
];

const availableGeos = [
  'United States',
  'United Kingdom',
  'Nigeria / West Africa',
  'European Union',
  'Canada',
  'Australia & APAC',
  'Global / Remote'
];

const sizeOptions = [
  { label: '10 – 50 employees', desc: 'Seed & Early Stage' },
  { label: '50 – 500 employees', desc: 'Scaling Growth Companies' },
  { label: '500 – 2,000 employees', desc: 'Mid-Market Leaders' },
  { label: '2,000+ employees', desc: 'Large Enterprise' }
];

const revenueOptions = [
  '$1M – $10M ARR',
  '$10M – $50M ARR',
  '$50M – $200M ARR',
  '$200M+ ARR'
];

const traitOptions = [
  'Rapidly scaling (>20% YoY)',
  'Active hiring spikes (>15 open roles)',
  'Recently funded (Seed/Series A-C)',
  'Remote / Hybrid workforce',
  'Executive leadership change',
  'Expanding to new territories'
];

export const Step2ICP: React.FC<Step2ICPProps> = ({ data, onChange, onNext, onPrev }) => {
  const toggleIndustry = (ind: string) => {
    const next = data.industries.includes(ind)
      ? data.industries.filter((i) => i !== ind)
      : [...data.industries, ind];
    onChange({ industries: next });
  };

  const toggleGeo = (geo: string) => {
    const next = data.geographicMarkets.includes(geo)
      ? data.geographicMarkets.filter((g) => g !== geo)
      : [...data.geographicMarkets, geo];
    onChange({ geographicMarkets: next });
  };

  const toggleTrait = (trait: string) => {
    const next = data.preferredTraits.includes(trait)
      ? data.preferredTraits.filter((t) => t !== trait)
      : [...data.preferredTraits, trait];
    onChange({ preferredTraits: next });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#5c45fd',
          margin: '0 0 4px 0',
          fontFamily: 'var(--font-primary)'
        }}>
          2. Ideal Customer Profile (ICP)
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: 0
        }}>
          Specify the criteria of the businesses you want the AI to target and hunt.
        </p>
      </div>

      {/* Target Industries */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Briefcase size={18} color="#6366f1" />
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Target Industries <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>(Select all that apply)</span>
          </label>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {availableIndustries.map((ind) => {
            const isSelected = data.industries.includes(ind);
            return (
              <button
                key={ind}
                type="button"
                onClick={() => toggleIndustry(ind)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1.5px solid #6366f1' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#ede9fe' : '#ffffff',
                  color: isSelected ? '#4f46e5' : '#334155',
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                {isSelected && <Check size={14} strokeWidth={3} />}
                {ind}
              </button>
            );
          })}
        </div>
      </div>

      {/* Geographic Markets */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Globe2 size={18} color="#0284c7" />
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Geographic Markets & Regions
          </label>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {availableGeos.map((geo) => {
            const isSelected = data.geographicMarkets.includes(geo);
            return (
              <button
                key={geo}
                type="button"
                onClick={() => toggleGeo(geo)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#e0f2fe' : '#ffffff',
                  color: isSelected ? '#0369a1' : '#334155',
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                {isSelected && <Check size={14} strokeWidth={3} />}
                {geo}
              </button>
            );
          })}
        </div>
      </div>

      {/* Company Size Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Users size={18} color="#2563eb" />
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Target Company Size
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {sizeOptions.map((opt) => {
            const isSelected = data.companySize === opt.label;
            return (
              <div
                key={opt.label}
                onClick={() => onChange({ companySize: opt.label })}
                style={{
                  padding: '14px 12px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#1e40af' : '#0f172a', marginBottom: '4px' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {opt.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Range + Business Model */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Revenue Range */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Estimated Revenue Range
          </label>
          <select
            value={data.revenueRange}
            onChange={(e) => onChange({ revenueRange: e.target.value })}
            style={{
              width: '100%',
              height: '42px',
              padding: '0 12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              color: '#0f172a',
              outline: 'none',
              backgroundColor: '#ffffff',
              cursor: 'pointer'
            }}
          >
            {revenueOptions.map((rev) => (
              <option key={rev} value={rev}>{rev}</option>
            ))}
          </select>
        </div>

        {/* Business Type */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Business Model Focus
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['B2B', 'B2B2C', 'Enterprise'] as const).map((type) => {
              const isSelected = data.businessType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ businessType: type })}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #6366f1' : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? '#ede9fe' : '#ffffff',
                    color: isSelected ? '#4f46e5' : '#334155',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preferred Client Characteristics */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Sparkles size={18} color="#d97706" />
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Preferred Client Characteristics
          </label>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {traitOptions.map((trait) => {
            const isSelected = data.preferredTraits.includes(trait);
            return (
              <button
                key={trait}
                type="button"
                onClick={() => toggleTrait(trait)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#fef3c7' : '#ffffff',
                  color: isSelected ? '#92400e' : '#475569',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isSelected && <Check size={13} strokeWidth={3} />}
                {trait}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <button
          onClick={onPrev}
          style={{
            backgroundColor: '#ffffff',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '11px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          style={{
            backgroundColor: '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
          }}
        >
          <span>Save & Continue</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
