import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { ScoringWeights } from '../../types/settings';

interface ScoringSettingsPanelProps {
  weights: ScoringWeights;
  onSave: (updated: ScoringWeights) => void;
}

export const ScoringSettingsPanel: React.FC<ScoringSettingsPanelProps> = ({
  weights,
  onSave
}) => {
  const [formData, setFormData] = useState<ScoringWeights>(weights);
  const [isSaved, setIsSaved] = useState(false);

  const total = formData.buyingSignalsWeight + formData.icpFitWeight + formData.hiringSurgeWeight + formData.decisionMakerWeight;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Opportunity Scoring Weights
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
          Tune how HUNTIQ calculates the 0-100 Opportunity Score across every monitored account.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Buying Signals Weight */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>Buying Signals Recency & Velocity</strong>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5' }}>{formData.buyingSignalsWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={formData.buyingSignalsWeight}
              onChange={(e) => setFormData({ ...formData, buyingSignalsWeight: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#4f46e5' }}
            />
          </div>

          {/* ICP Fit Weight */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>Industry & Headcount ICP Match</strong>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5' }}>{formData.icpFitWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={formData.icpFitWeight}
              onChange={(e) => setFormData({ ...formData, icpFitWeight: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#4f46e5' }}
            />
          </div>

          {/* Hiring Surge Weight */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>Hiring & Job Posting Surge Volume</strong>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5' }}>{formData.hiringSurgeWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={formData.hiringSurgeWeight}
              onChange={(e) => setFormData({ ...formData, hiringSurgeWeight: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#4f46e5' }}
            />
          </div>

          {/* Decision Maker Weight */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>Verified Decision-Maker Availability</strong>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5' }}>{formData.decisionMakerWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={formData.decisionMakerWeight}
              onChange={(e) => setFormData({ ...formData, decisionMakerWeight: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#4f46e5' }}
            />
          </div>

          {/* Total Sum indicator */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Total Model Weight:</span>
            <strong style={{ fontSize: '13px', color: total === 100 ? '#059669' : '#dc2626' }}>
              {total}% {total === 100 ? '(Balanced)' : '(Should equal 100%)'}
            </strong>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 20px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Check size={14} />
            <span>Update Scoring Weights</span>
          </button>

          {isSaved && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
              ✓ Weights calibrated!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
