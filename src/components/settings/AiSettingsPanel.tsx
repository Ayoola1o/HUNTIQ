import React, { useState } from 'react';
import { Check } from 'lucide-react';

export const AiSettingsPanel: React.FC = () => {
  const [model, setModel] = useState('Gemini 2.5 Pro (High Reasoning)');
  const [researchDepth, setResearchDepth] = useState('Deep Multi-Source');
  const [tone, setTone] = useState('Executive & Direct');
  const [autoEnrich, setAutoEnrich] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          AI Copilot & Intelligence Engine
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
          Configure underlying AI models, research thoroughness, and communication synthesis parameters.
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
          gap: '14px'
        }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Primary AI Reasoning Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontFamily: 'inherit'
              }}
            >
              <option value="Gemini 2.5 Pro (High Reasoning)">Gemini 2.5 Pro (Optimal for Deep Research & Attribution)</option>
              <option value="Gemini 2.5 Flash (Ultra Fast)">Gemini 2.5 Flash (Ultra Fast / Low Latency)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Autonomous 360° Research Depth
            </label>
            <select
              value={researchDepth}
              onChange={(e) => setResearchDepth(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontFamily: 'inherit'
              }}
            >
              <option value="Deep Multi-Source">Deep Multi-Source (News, Registry, Hiring, Tech Stacks)</option>
              <option value="Standard">Standard (Quick Synthesis & Verification)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Executive Brief & Outreach Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontFamily: 'inherit'
              }}
            >
              <option value="Executive & Direct">Executive & Direct (Concise, ROI-focused)</option>
              <option value="Consultative">Consultative (Question-led, Diagnostic)</option>
              <option value="Warm & Engaging">Warm & Engaging (Relationship-building)</option>
            </select>
          </div>

          {/* Auto Enrich Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '10px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div>
              <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>Auto-Enrich Identified Companies</strong>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                Automatically runs background web research on companies with Opportunity Score {'>'} 80.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAutoEnrich(!autoEnrich)}
              style={{
                width: '42px',
                height: '22px',
                borderRadius: '12px',
                backgroundColor: autoEnrich ? '#4f46e5' : '#cbd5e1',
                position: 'relative',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                position: 'absolute',
                top: '3px',
                left: autoEnrich ? '22px' : '4px',
                transition: 'left 0.2s ease'
              }} />
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
            <span>Save AI Preferences</span>
          </button>

          {isSaved && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
              ✓ AI settings updated!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
