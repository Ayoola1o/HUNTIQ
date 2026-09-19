import React, { useState } from 'react';
import type { SearchCriteria } from '../../types/prospectHunter';
import { X, Bookmark, Check } from 'lucide-react';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: SearchCriteria;
  onSave: (searchName: string, autoAlert: boolean) => void;
}

export const SaveSearchModal: React.FC<SaveSearchModalProps> = ({
  isOpen,
  onClose,
  criteria,
  onSave
}) => {
  const [searchName, setSearchName] = useState('Lagos Tech & HR Scaleups');
  const [autoAlert, setAutoAlert] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchName.trim()) {
      onSave(searchName.trim(), autoAlert);
      onClose();
    }
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
        width: '480px',
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
            <Bookmark size={16} color="#818cf8" />
            <div style={{ fontSize: '15px', fontWeight: 800 }}>Save Prospect Search</div>
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
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Search Name *
            </label>
            <input
              type="text"
              required
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g. Lagos HR Growth Companies"
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#475569',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>Active Criteria Snapshot:</div>
            <div>• Locations: {criteria.locations.join(', ') || 'Lagos, Nigeria'}</div>
            <div>• Size: {criteria.companySize}</div>
            <div>• Signals: {criteria.signals.slice(0, 3).join(', ')}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="alert-toggle"
              checked={autoAlert}
              onChange={(e) => setAutoAlert(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="alert-toggle" style={{ fontSize: '12.5px', color: '#334155', cursor: 'pointer' }}>
              <strong>Automated Signal Radar:</strong> Notify me whenever new companies matching this profile emerge.
            </label>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '6px',
            borderTop: '1px solid #eaecf0',
            paddingTop: '16px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={14} />
              <span>Save to Saved Searches</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
