import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { IcpConfig } from '../../types/settings';

interface IcpSettingsPanelProps {
  config: IcpConfig;
  onSave: (updated: IcpConfig) => void;
}

export const IcpSettingsPanel: React.FC<IcpSettingsPanelProps> = ({
  config,
  onSave
}) => {
  const [formData, setFormData] = useState<IcpConfig>(config);
  const [newIndustry, setNewIndustry] = useState('');
  const [newRole, setNewRole] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleAddIndustry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndustry.trim()) return;
    setFormData({
      ...formData,
      targetIndustries: [...formData.targetIndustries, newIndustry.trim()]
    });
    setNewIndustry('');
  };

  const handleRemoveIndustry = (idx: number) => {
    setFormData({
      ...formData,
      targetIndustries: formData.targetIndustries.filter((_, i) => i !== idx)
    });
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    setFormData({
      ...formData,
      decisionMakerRoles: [...formData.decisionMakerRoles, newRole.trim()]
    });
    setNewRole('');
  };

  const handleRemoveRole = (idx: number) => {
    setFormData({
      ...formData,
      decisionMakerRoles: formData.decisionMakerRoles.filter((_, i) => i !== idx)
    });
  };

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
          Ideal Customer Profile (ICP) Definition
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
          Defines the algorithms and weights HUNTIQ uses to score companies and discover high-intent prospects.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Target Industries */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #eaecf0', padding: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
            Target Industries & Sectors
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {formData.targetIndustries.map((ind, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                <span>{ind}</span>
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveIndustry(idx)} />
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Add industry (e.g. HealthTech, Logistics)..."
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              style={{
                flex: 1,
                padding: '7px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px'
              }}
            />
            <button
              type="button"
              onClick={handleAddIndustry}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Company Headcount Range */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #eaecf0', padding: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
            Target Company Headcount
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Minimum Headcount</span>
              <input
                type="number"
                value={formData.companySizeMin}
                onChange={(e) => setFormData({ ...formData, companySizeMin: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginTop: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Maximum Headcount</span>
              <input
                type="number"
                value={formData.companySizeMax}
                onChange={(e) => setFormData({ ...formData, companySizeMax: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginTop: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Decision Maker Personas */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #eaecf0', padding: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
            Target Decision-Maker Job Titles
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {formData.decisionMakerRoles.map((role, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f5f3ff',
                  color: '#6d28d9',
                  border: '1px solid #ddd6fe',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                <span>{role}</span>
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveRole(idx)} />
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Add job role (e.g. VP People, Chief Executive Officer)..."
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{
                flex: 1,
                padding: '7px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px'
              }}
            />
            <button
              type="button"
              onClick={handleAddRole}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
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
            <span>Save ICP Profile</span>
          </button>

          {isSaved && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
              ✓ ICP configuration saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
