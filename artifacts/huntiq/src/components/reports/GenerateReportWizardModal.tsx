import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';
import type { ReportItem, ReportType } from '../../types/reports';

interface GenerateReportWizardModalProps {
  isOpen: boolean;
  initialType?: ReportType;
  onClose: () => void;
  onReportGenerated: (report: ReportItem) => void;
}

export const GenerateReportWizardModal: React.FC<GenerateReportWizardModalProps> = ({
  isOpen,
  initialType = 'executive_brief',
  onClose,
  onReportGenerated
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportType, setReportType] = useState<ReportType>(initialType);
  const [period, setPeriod] = useState('Last 7 Days (Aug 17 – Aug 23)');
  const [scope, setScope] = useState('Entire Workspace');
  const [aiLevel, setAiLevel] = useState<'deep' | 'summary'>('deep');

  // Live generation simulation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  useEffect(() => {
    setReportType(initialType);
    setCurrentStep(1);
    setIsGenerating(false);
    setGenerationStep(0);
  }, [initialType, isOpen]);

  const generationStages = [
    'Aggregating verified prospects & contacts...',
    'Calculating CRM pipeline velocity & conversions...',
    'Analyzing buying signal attribution & trends...',
    'Synthesizing AI executive recommendations...',
    'Finalizing decision-ready report...'
  ];

  const handleStartGeneration = () => {
    setIsGenerating(true);
    setGenerationStep(0);

    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev >= generationStages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            const newReport: ReportItem = {
              id: `rep-${Date.now()}`,
              name: reportType === 'executive_brief' 
                ? `Executive Intelligence Brief (${period})` 
                : `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Performance Report`,
              type: reportType,
              period,
              createdAt: 'Just now',
              createdBy: 'Ayoola Ade',
              ownerAvatarBg: '#eff6ff',
              ownerAvatarColor: '#1d4ed8',
              status: 'ready',
              confidenceScore: 92,
              sourcesCount: 842,
              summary: 'Prospecting activity and pipeline conversion accelerated 24% over this period. Financial Services and Tech scaleups exhibited the highest buying signal density.',
              kpiMetrics: [
                { metric: 'Prospects Discovered', current: '1,284', previous: '1,031', change: '+24.5%', isPositive: true },
                { metric: 'Buying Signals Detected', current: '842', previous: '713', change: '+18.1%', isPositive: true },
                { metric: 'Qualified Opportunities', current: '73', previous: '61', change: '+19.7%', isPositive: true },
                { metric: 'Pipeline Generated', current: '$428,600', previous: '$381,000', change: '+12.3%', isPositive: true }
              ],
              topOpportunities: [
                { companyName: 'Acme Technologies', score: 94, value: 35000, signal: 'Hiring (+38 openings)' },
                { companyName: 'Flutterwave', score: 96, value: 32000, signal: 'Regional Expansion' },
                { companyName: 'Paystack', score: 92, value: 24000, signal: 'Leadership Addition' }
              ],
              signalAttribution: [
                { signal: 'Hiring Surge', oppCount: 31, pipelineValue: 184000 },
                { signal: 'Market Expansion', oppCount: 18, pipelineValue: 102000 },
                { signal: 'Leadership Change', oppCount: 9, pipelineValue: 61000 },
                { signal: 'Funding Raised', oppCount: 8, pipelineValue: 48000 }
              ],
              funnelStages: [
                { stage: 'Prospects Discovered', count: 1284, conversionPct: 100 },
                { stage: 'Decision Makers Contacted', count: 384, conversionPct: 29.9 },
                { stage: 'Conversations & Meetings', count: 73, conversionPct: 19.0 },
                { stage: 'Closed Won Pipeline', count: 12, conversionPct: 16.4 }
              ],
              recommendations: [
                { title: 'Prioritize FinTech ICP', detail: 'Financial services scaleups yielded 42% of high-fit pipeline.', actionText: 'Explore Opportunities', actionRoute: 'opportunities' },
                { title: 'Follow Up on 8 Stalled Deals', detail: 'Deals with proposals unread for >6 days require immediate touch.', actionText: 'Review Pipeline', actionRoute: 'pipeline' }
              ]
            };

            onReportGenerated(newReport);
            setIsGenerating(false);
            onClose();
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '600px',
        maxWidth: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
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
                Generate Intelligence Report
              </h3>
              <p style={{ fontSize: '11px', color: '#a5b4fc', margin: '2px 0 0 0' }}>
                Step {currentStep} of 3 • Custom AI Analysis & Attribution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <X size={18} color="#ffffff" />
          </button>
        </div>

        {/* Live Generation Progress View */}
        {isGenerating ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              animation: 'spin 2s linear infinite'
            }}>
              <Sparkles size={26} />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Synthesizing Intelligence Report...
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
              {generationStages[generationStep]}
            </p>

            <div style={{ width: '280px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: '24px', overflow: 'hidden' }}>
              <div style={{
                width: `${((generationStep + 1) / generationStages.length) * 100}%`,
                height: '100%',
                backgroundColor: '#4f46e5',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        ) : (
          /* Wizard Form */
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Step 1: Report Type */}
            {currentStep === 1 && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '10px' }}>
                  Select Report Focus
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { id: 'executive_brief', label: 'AI Executive Brief', desc: 'Holistic summary with wins, risks & actions' },
                    { id: 'sales', label: 'Sales Performance', desc: 'Meetings, win rates & revenue velocity' },
                    { id: 'market', label: 'Market Intelligence', desc: 'Signal shifts, trends & emerging hotspots' },
                    { id: 'pipeline', label: 'Pipeline & Forecast', desc: 'Stage movements & probability revenue' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setReportType(t.id as any)}
                      style={{
                        border: reportType === t.id ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                        backgroundColor: reportType === t.id ? '#f5f3ff' : '#ffffff',
                        padding: '12px',
                        borderRadius: '10px',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ fontSize: '12.5px', color: reportType === t.id ? '#4338ca' : '#1e293b', display: 'block' }}>
                        {t.label}
                      </strong>
                      <span style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Time Period & Scope */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Reporting Period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="Last 7 Days (Aug 17 – Aug 23)">Last 7 Days (Aug 17 – Aug 23)</option>
                    <option value="Last 30 Days (Jul 24 – Aug 23)">Last 30 Days (Jul 24 – Aug 23)</option>
                    <option value="This Month (August 2026)">This Month (August 2026)</option>
                    <option value="Q3 2026 to Date">Q3 2026 to Date</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Scope of Data
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="Entire Workspace">Entire Workspace (All Signals & Deals)</option>
                    <option value="West Africa FinTech Focus">West Africa FinTech Focus</option>
                    <option value="My Pipeline Only">My Pipeline Only</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: AI Depth */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'block' }}>
                  AI Analysis & Attribution Level
                </label>

                <button
                  type="button"
                  onClick={() => setAiLevel('deep')}
                  style={{
                    border: aiLevel === 'deep' ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                    backgroundColor: aiLevel === 'deep' ? '#f5f3ff' : '#ffffff',
                    padding: '14px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ fontSize: '13px', color: '#4338ca', display: 'block' }}>
                    Deep AI Attribution & Recommendations (Recommended)
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                    Includes signal-to-pipeline attribution matrix, stalled deal diagnostics, and actionable tactical next steps.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiLevel('summary')}
                  style={{
                    border: aiLevel === 'summary' ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                    backgroundColor: aiLevel === 'summary' ? '#f5f3ff' : '#ffffff',
                    padding: '14px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>
                    Standard Summary
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                    Generates executive overview and metric variance tables without deep diagnostics.
                  </span>
                </button>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: currentStep === 1 ? '#cbd5e1' : '#475569',
                  cursor: currentStep === 1 ? 'default' : 'pointer'
                }}
              >
                <ArrowLeft size={12} />
                <span>Back</span>
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <span>Next Step</span>
                  <ArrowRight size={12} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartGeneration}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 18px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  <Sparkles size={14} />
                  <span>Generate Report</span>
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
