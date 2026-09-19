import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Building2, 
  Globe, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';

interface NewResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteResearch: (companyName: string, domain: string) => void;
}

export const NewResearchModal: React.FC<NewResearchModalProps> = ({
  isOpen,
  onClose,
  onCompleteResearch
}) => {
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [depth, setDepth] = useState<'360' | 'fast'>('360');
  const [isResearching, setIsResearching] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const steps = [
    'Scraping company profile & registration filings',
    'Analyzing recent news & funding events',
    'Indexing executive leadership & decision makers',
    'Evaluating hiring surges & job postings',
    'Detecting active buying signals & intent anomalies',
    'Identifying tech stack & infrastructure migrations',
    'Formulating potential problems & service fit',
    'Synthesizing tactical outreach angle & AI brief'
  ];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isResearching) {
      if (progressStep < steps.length) {
        timer = setTimeout(() => {
          setProgressStep((prev) => prev + 1);
        }, 500);
      } else {
        timer = setTimeout(() => {
          setIsResearching(false);
          onCompleteResearch(companyName || 'Moniepoint', domain || 'moniepoint.com');
          onClose();
        }, 600);
      }
    }
    return () => clearTimeout(timer);
  }, [isResearching, progressStep, companyName, domain, onClose, onCompleteResearch, steps.length]);

  if (!isOpen) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setIsResearching(true);
    setProgressStep(0);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(5px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '560px',
        maxWidth: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Launch Company Research Agent
              </h3>
              <p style={{ fontSize: '11px', color: '#a5b4fc', margin: '2px 0 0 0' }}>
                Autonomous intelligence gathering & opportunity qualification
              </p>
            </div>
          </div>

          {!isResearching && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
            >
              <X size={18} color="#ffffff" />
            </button>
          )}
        </div>

        {/* Content */}
        {!isResearching ? (
          <form onSubmit={handleStart} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Company Name *
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px'
              }}>
                <Building2 size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="e.g. Flutterwave, Paystack, Moniepoint, Dangote"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    width: '100%',
                    color: '#0f172a',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Website or Domain (Optional)
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px'
              }}>
                <Globe size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="e.g. flutterwave.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    width: '100%',
                    color: '#0f172a',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Depth Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Research Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  onClick={() => setDepth('360')}
                  style={{
                    border: depth === '360' ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                    backgroundColor: depth === '360' ? '#f5f3ff' : '#f8fafc',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: depth === '360' ? '#4338ca' : '#0f172a' }}>
                    360° Intelligence Engine
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Comprehensive report with leadership, tech, pain points & outreach scripts.
                  </div>
                </div>

                <div
                  onClick={() => setDepth('fast')}
                  style={{
                    border: depth === 'fast' ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                    backgroundColor: depth === 'fast' ? '#f5f3ff' : '#f8fafc',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: depth === 'fast' ? '#4338ca' : '#0f172a' }}>
                    Fast Opportunity Brief
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Quick summary of buying signals and opportunity score.
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

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
                  padding: '8px 18px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                }}
              >
                <Sparkles size={14} />
                <span>Start Research →</span>
              </button>
            </div>
          </form>
        ) : (
          /* Live Progress State */
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#f5f3ff',
                border: '1.5px solid #ddd6fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <Loader2 size={24} color="#7c3aed" className="animate-spin" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Investigating {companyName || 'Company'}...
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                HUNTIQ Research Agent is compiling live sources and generating opportunity analysis
              </p>
            </div>

            {/* Steps Progress List */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {steps.map((stepText, idx) => {
                const isDone = idx < progressStep;
                const isCurrent = idx === progressStep;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '12px',
                      color: isDone ? '#059669' : isCurrent ? '#4338ca' : '#94a3b8',
                      fontWeight: isCurrent ? 700 : 500
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={15} color="#10b981" />
                    ) : isCurrent ? (
                      <Loader2 size={15} color="#6366f1" className="animate-spin" />
                    ) : (
                      <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '1.5px solid #cbd5e1' }} />
                    )}
                    <span>{stepText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
