import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { WorkspaceConfig } from '../../types/settings';

interface WorkspaceSettingsPanelProps {
  config: WorkspaceConfig;
  onSave: (updated: WorkspaceConfig) => void;
}

export const WorkspaceSettingsPanel: React.FC<WorkspaceSettingsPanelProps> = ({
  config,
  onSave
}) => {
  const [formData, setFormData] = useState<WorkspaceConfig>(config);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Workspace Settings
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
          Configure workspace identity, timezone, currency, and global prospecting defaults.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Workspace Identity */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Workspace Identity
          </h3>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Workspace Name
            </label>
            <input
              type="text"
              value={formData.workspaceName}
              onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Workspace Domain Slug
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <span style={{ padding: '8px 12px', fontSize: '12px', color: '#64748b', borderRight: '1px solid #cbd5e1' }}>
                huntiq.ai/app/
              </span>
              <input
                type="text"
                value={formData.workspaceSlug}
                onChange={(e) => setFormData({ ...formData, workspaceSlug: e.target.value })}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Regional & Financial Defaults */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Regional & Localization Defaults
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Default Currency
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="USD">USD ($) — US Dollar</option>
                <option value="NGN">NGN (₦) — Nigerian Naira</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="EUR">EUR (€) — Euro</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Workspace Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="Africa/Lagos">Africa/Lagos (GMT+1 / West Africa Time)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (GMT+3 / East Africa Time)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (GMT+2 / SAST)</option>
                <option value="Europe/London">Europe/London (GMT+0 / BST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Default Landing View
            </label>
            <select
              value={formData.defaultLandingView}
              onChange={(e) => setFormData({ ...formData, defaultLandingView: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontFamily: 'inherit'
              }}
            >
              <option value="dashboard">Dashboard (Executive Overview)</option>
              <option value="opportunities">Opportunities (Hot Leads & Buying Signals)</option>
              <option value="find-prospects">Find Prospects (AI Prospect Hunter)</option>
              <option value="pipeline">Pipeline (Deals Kanban)</option>
            </select>
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
            <span>Save Workspace Changes</span>
          </button>

          {isSaved && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
              ✓ Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
