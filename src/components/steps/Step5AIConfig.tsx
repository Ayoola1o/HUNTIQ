import React from 'react';
import { 
  Sliders, 
  Sparkles, 
  Search, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  Check
} from 'lucide-react';
import type { OnboardingData } from '../../types/onboarding';

interface Step5AIConfigProps {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step5AIConfig: React.FC<Step5AIConfigProps> = ({ data, onChange, onNext, onPrev }) => {
  const aggressivenessOptions = [
    {
      id: 'conservative',
      title: 'Conservative (High Precision)',
      desc: 'Only returns prospects with 90%+ confidence score. Zero false positives.',
    },
    {
      id: 'balanced',
      title: 'Balanced (Recommended)',
      desc: 'Optimal mix of volume and high intent. Evaluates 75%+ opportunities.',
    },
    {
      id: 'aggressive',
      title: 'Aggressive (Wide Net)',
      desc: 'Discovers early-stage emerging opportunities and nascent buying signals.',
    },
  ] as const;

  const toneOptions = [
    {
      id: 'consultative',
      title: 'Executive Consultative',
      desc: 'Advisory tone focusing on strategic ROI, organizational impact, and scaling.',
    },
    {
      id: 'direct_value',
      title: 'Value-First Direct',
      desc: 'Concise, punchy messaging focusing on immediate metrics and friction points.',
    },
    {
      id: 'narrative',
      title: 'Narrative Storytelling',
      desc: 'Case-study led outreach demonstrating past peer success and transformation.',
    },
  ] as const;

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
          5. AI Configuration & Tuning
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: 0
        }}>
          Fine-tune the intelligence algorithms for opportunity discovery, research depth, and outreach generation.
        </p>
      </div>

      {/* Prospect Discovery Aggressiveness */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Sliders size={18} color="#6366f1" />
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Prospect Discovery Aggressiveness
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {aggressivenessOptions.map((opt) => {
            const isSelected = data.discoveryAggressiveness === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onChange({ discoveryAggressiveness: opt.id })}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#f8f7ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#4f46e5' : '#0f172a' }}>
                    {opt.title}
                  </span>
                  {isSelected && <Check size={16} color="#6366f1" strokeWidth={3} />}
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
                  {opt.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Opportunity Scoring Threshold */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#d97706" />
            <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
              Minimum Opportunity Score Threshold
            </label>
          </div>
          <span style={{
            fontSize: '15px',
            fontWeight: 800,
            color: '#b45309',
            backgroundColor: '#fef3c7',
            padding: '2px 10px',
            borderRadius: '6px'
          }}>
            {data.scoringSensitivity} / 100
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={95}
          step={5}
          value={data.scoringSensitivity}
          onChange={(e) => onChange({ scoringSensitivity: Number(e.target.value) })}
          style={{
            width: '100%',
            height: '6px',
            accentColor: '#6366f1',
            cursor: 'pointer',
            marginBottom: '6px'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
          <span>50 (Broad Search)</span>
          <span>75 (Recommended)</span>
          <span>95 (Ultra-Strict)</span>
        </div>
      </div>

      {/* Research Depth */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Search size={18} color="#0284c7" />
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            AI Research Depth
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div
            onClick={() => onChange({ researchDepth: 'fast_brief' })}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: data.researchDepth === 'fast_brief' ? '2px solid #0284c7' : '1px solid #e2e8f0',
              backgroundColor: data.researchDepth === 'fast_brief' ? '#f0f9ff' : '#ffffff',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: data.researchDepth === 'fast_brief' ? '#0369a1' : '#0f172a', marginBottom: '4px' }}>
              ⚡ Fast Briefs (15s per company)
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Essential executive summary, top decision maker contacts, and primary buying triggers.
            </div>
          </div>

          <div
            onClick={() => onChange({ researchDepth: 'deep_dossier' })}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: data.researchDepth === 'deep_dossier' ? '2px solid #6366f1' : '1px solid #e2e8f0',
              backgroundColor: data.researchDepth === 'deep_dossier' ? '#ede9fe' : '#ffffff',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: data.researchDepth === 'deep_dossier' ? '#5b21b6' : '#0f172a', marginBottom: '4px' }}>
              🔬 Deep 360° Dossier (Comprehensive)
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Full company architecture, org chart mapping, historical trigger timeline, and pain point analysis.
            </div>
          </div>
        </div>
      </div>

      {/* Outreach Tone */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Mail size={18} color="#7c3aed" />
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Outreach Personalization Tone
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {toneOptions.map((tone) => {
            const isSelected = data.outreachTone === tone.id;
            return (
              <div
                key={tone.id}
                onClick={() => onChange({ outreachTone: tone.id })}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#faf5ff' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#6b21a8' : '#0f172a', marginBottom: '4px' }}>
                  {tone.title}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.35 }}>
                  {tone.desc}
                </div>
              </div>
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
          <span>Review & Finish</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
