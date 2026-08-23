import React, { useState } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';

interface OpportunityFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export const OpportunityFiltersModal: React.FC<OpportunityFiltersModalProps> = ({
  isOpen,
  onClose,
  onApply
}) => {
  const [minScore, setMinScore] = useState(70);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(['Technology', 'Financial Services']);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['Lagos', 'Abuja']);
  const [selectedSignals, setSelectedSignals] = useState<string[]>(['Hiring Surge', 'Expansion']);

  if (!isOpen) return null;

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const toggleSignal = (sig: string) => {
    setSelectedSignals((prev) =>
      prev.includes(sig) ? prev.filter((s) => s !== sig) : [...prev, sig]
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 15, 25, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '520px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} color="#818cf8" />
            <div style={{ fontSize: '15px', fontWeight: 800 }}>Opportunity Filters</div>
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
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '460px', overflowY: 'auto' }}>
          {/* Min Opportunity Score Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                Minimum Opportunity Score
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#4f46e5' }}>
                {minScore}+
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#4f46e5' }}
            />
          </div>

          {/* Industry filter */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Target Industries
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 'Energy'].map((ind) => {
                const isSelected = selectedIndustries.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleIndustry(ind)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      backgroundColor: isSelected ? '#ede9fe' : '#f1f5f9',
                      color: isSelected ? '#6d28d9' : '#475569',
                      border: isSelected ? '1px solid #c4b5fd' : '1px solid #e2e8f0',
                      cursor: 'pointer'
                    }}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location filter */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Location / Region
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Lagos', 'Abuja', 'Port Harcourt', 'Accra, Ghana', 'Nairobi, Kenya'].map((loc) => {
                const isSelected = selectedLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => toggleLocation(loc)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      backgroundColor: isSelected ? '#eff6ff' : '#f1f5f9',
                      color: isSelected ? '#1d4ed8' : '#475569',
                      border: isSelected ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                      cursor: 'pointer'
                    }}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Signal Types */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Signal Types
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Hiring Surge', 'Expansion', 'Leadership Change', 'New Funding', 'Product Launch'].map((sig) => {
                const isSelected = selectedSignals.includes(sig);
                return (
                  <button
                    key={sig}
                    type="button"
                    onClick={() => toggleSignal(sig)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      backgroundColor: isSelected ? '#ecfdf5' : '#f1f5f9',
                      color: isSelected ? '#047857' : '#475569',
                      border: isSelected ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      cursor: 'pointer'
                    }}
                  >
                    {sig}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #eaecf0',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => {
              setMinScore(0);
              setSelectedIndustries([]);
              setSelectedLocations([]);
              setSelectedSignals([]);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Reset Filters
          </button>

          <button
            onClick={() => {
              onApply({ minScore, selectedIndustries, selectedLocations, selectedSignals });
              onClose();
            }}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Check size={14} />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
