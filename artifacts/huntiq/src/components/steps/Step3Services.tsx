import React, { useState } from 'react';
import { 
  Briefcase, 
  DollarSign, 
  UserCheck, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Plus,
  X,
  Check
} from 'lucide-react';
import type { OnboardingData } from '../../types/onboarding';

interface Step3ServicesProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const roleSuggestions = [
  'Head of People',
  'HR Director',
  'Chief People Officer (CPO)',
  'CEO / Founder',
  'Chief Operating Officer (COO)',
  'VP of Talent Acquisition',
  'VP Human Resources',
  'Chief Technology Officer (CTO)',
  'VP of Engineering',
  'VP of Sales / Revenue'
];

const dealPresets = [5000, 15000, 25000, 50000, 100000];

export const Step3Services: React.FC<Step3ServicesProps> = ({ data, onChange, onNext, onPrev }) => {
  const [newOffering, setNewOffering] = useState('');

  const addOffering = () => {
    if (newOffering.trim() && !data.offerings.includes(newOffering.trim())) {
      onChange({ offerings: [...data.offerings, newOffering.trim()] });
      setNewOffering('');
    }
  };

  const removeOffering = (item: string) => {
    onChange({ offerings: data.offerings.filter((o) => o !== item) });
  };

  const toggleRole = (role: string) => {
    const next = data.targetBuyerRoles.includes(role)
      ? data.targetBuyerRoles.filter((r) => r !== role)
      : [...data.targetBuyerRoles, role];
    onChange({ targetBuyerRoles: next });
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
          3. Services & Solutions
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: 0
        }}>
          Detail your offerings and buyer personas so our AI crafts high-converting, contextual outreach.
        </p>
      </div>

      {/* Offerings list */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Briefcase size={18} color="#7c3aed" />
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Products & Core Services Offered
          </label>
        </div>
        
        {/* Input to add */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input
            type="text"
            value={newOffering}
            onChange={(e) => setNewOffering(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addOffering();
              }
            }}
            placeholder="Add an offering (e.g. Org Design & Compensation Review)..."
            style={{
              flex: 1,
              height: '40px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              color: '#0f172a',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />
          <button
            type="button"
            onClick={addOffering}
            style={{
              backgroundColor: '#ede9fe',
              color: '#6d28d9',
              border: '1px solid #c4b5fd',
              borderRadius: '8px',
              padding: '0 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>

        {/* Offerings tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {data.offerings.map((item) => (
            <span
              key={item}
              style={{
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                color: '#6d28d9',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {item}
              <X
                size={14}
                style={{ cursor: 'pointer', opacity: 0.7 }}
                onClick={() => removeOffering(item)}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Average Deal Value */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color="#0284c7" />
            <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
              Average Deal Value / Contract Size
            </label>
          </div>
          <span style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#0369a1',
            backgroundColor: '#e0f2fe',
            padding: '2px 10px',
            borderRadius: '6px'
          }}>
            ${data.averageDealValue.toLocaleString()}
          </span>
        </div>

        {/* Range slider */}
        <input
          type="range"
          min={2000}
          max={150000}
          step={1000}
          value={data.averageDealValue}
          onChange={(e) => onChange({ averageDealValue: Number(e.target.value) })}
          style={{
            width: '100%',
            height: '6px',
            accentColor: '#6366f1',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        />

        {/* Quick Deal Presets */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {dealPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange({ averageDealValue: preset })}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: data.averageDealValue === preset ? 700 : 500,
                backgroundColor: data.averageDealValue === preset ? '#6366f1' : '#f1f5f9',
                color: data.averageDealValue === preset ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ${(preset / 1000).toFixed(0)}K
            </button>
          ))}
        </div>
      </div>

      {/* Target Buyer Roles */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <UserCheck size={18} color="#16a34a" />
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Target Buyer Personas & Decision Makers
          </label>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {roleSuggestions.map((role) => {
            const isSelected = data.targetBuyerRoles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#dcfce7' : '#ffffff',
                  color: isSelected ? '#15803d' : '#334155',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isSelected && <Check size={13} strokeWidth={3} />}
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Problems Solved */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <AlertCircle size={18} color="#e11d48" />
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Core Problems & Pain Points You Solve
          </label>
        </div>
        <textarea
          rows={2}
          value={data.problemsSolved}
          onChange={(e) => onChange({ problemsSolved: e.target.value })}
          placeholder="e.g. Scaling bottlenecks, talent retention problems, executive leadership alignment..."
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            color: '#0f172a',
            outline: 'none',
            resize: 'none',
            backgroundColor: '#ffffff'
          }}
        />
      </div>

      {/* Bottom Navigation */}
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
