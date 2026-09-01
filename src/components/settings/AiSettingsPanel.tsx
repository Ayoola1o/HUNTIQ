import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Key, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { geminiService } from '../../services/geminiService';

export const AiSettingsPanel: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState<'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.0-flash'>('gemini-2.5-flash');
  const [researchDepth, setResearchDepth] = useState('Deep Multi-Source');
  const [tone, setTone] = useState('Executive & Direct');
  const [autoEnrich, setAutoEnrich] = useState(true);

  // Test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setApiKey(geminiService.getApiKey());
    setModel(geminiService.getModel());
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await geminiService.testConnection(apiKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    geminiService.setApiKey(apiKey);
    geminiService.setModel(model);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const isConfigured = Boolean(apiKey && apiKey.trim().length > 5);

  return (
    <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            AI Copilot & Intelligence Engine
          </h2>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: isConfigured ? '#ecfdf5' : '#f1f5f9',
            color: isConfigured ? '#059669' : '#64748b',
            border: isConfigured ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isConfigured ? '#10b981' : '#94a3b8'
            }} />
            {isConfigured ? 'Gemini Live' : 'Deterministic Mode'}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
          Configure Google Gemini reasoning models, live API credentials, and autonomous sales intelligence settings.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Gemini API Key Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Key size={16} />
              </div>
              <div>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Google Gemini API Key</strong>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '1px 0 0 0' }}>
                  Used to power deep Copilot reasoning, contextual research, and 1-click sales copywriting.
                </p>
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#4f46e5',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <span>Get API Key</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 40px 9px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '9px 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                cursor: !apiKey.trim() || isTesting ? 'not-allowed' : 'pointer',
                opacity: !apiKey.trim() ? 0.6 : 1
              }}
            >
              {isTesting ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} color="#6366f1" />}
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Test Feedback */}
          {testResult && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: testResult.success ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${testResult.success ? '#a7f3d0' : '#fecaca'}`,
              fontSize: '12px',
              color: testResult.success ? '#065f46' : '#991b1b'
            }}>
              {testResult.success ? (
                <CheckCircle2 size={16} color="#059669" style={{ marginTop: '1px', flexShrink: 0 }} />
              ) : (
                <AlertCircle size={16} color="#dc2626" style={{ marginTop: '1px', flexShrink: 0 }} />
              )}
              <span style={{ lineHeight: 1.4 }}>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Model & Reasoning Preferences */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #eaecf0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Primary AI Reasoning Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontFamily: 'inherit'
              }}
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Fast, Recommended for Copilot & Outreach)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Optimal for Deep Research & Attribution)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Low Latency / Lightweight)</option>
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
              ✓ Gemini AI settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

