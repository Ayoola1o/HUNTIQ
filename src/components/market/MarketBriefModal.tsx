import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Building2, 
  AlertTriangle,
  Send,
  Zap
} from 'lucide-react';

interface MarketBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToOutreach?: () => void;
}

export const MarketBriefModal: React.FC<MarketBriefModalProps> = ({
  isOpen,
  onClose,
  onNavigateToOutreach
}) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
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
        width: '780px',
        maxWidth: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
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
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(124, 58, 237, 0.5)'
            }}>
              <Sparkles size={18} color="#ffffff" />
            </div>

            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                HUNTIQ Executive Market Brief
              </h2>
              <p style={{ fontSize: '11.5px', color: '#a5b4fc', margin: '2px 0 0 0' }}>
                AI-Synthesized Market Intelligence • Target Universe: West & East Africa Scaleups
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11.5px',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Brief'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '4px'
              }}
            >
              <X size={18} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          fontFamily: 'inherit',
          color: '#1e293b',
          fontSize: '12.5px',
          lineHeight: 1.5
        }}>
          {/* Executive Summary */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <FileText size={15} color="#4f46e5" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                1. Executive Summary
              </span>
            </div>
            <p style={{ margin: 0, color: '#334155' }}>
              Across the monitored 30-day window, <strong>6,842 buying signals</strong> were detected across <strong>2,185 companies</strong> (up 23.6%). The market is characterized by aggressive fintech hiring, pan-African payment licensing expansions, and widespread cloud infrastructure modernization. High-intent opportunities are currently concentrated in <strong>Lagos (Index: 94)</strong> and <strong>Johannesburg (Index: 91)</strong>.
            </p>
          </div>

          {/* Top Opportunities */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Zap size={15} color="#d97706" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                2. Top Commercial Opportunities
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                <strong>FinTech Talent & Operational Scaling:</strong> 412 new roles posted across 87 companies in the last 14 days. Companies like <em>Flutterwave</em> and <em>Moniepoint</em> are scaling compliance and backend teams.
              </li>
              <li>
                <strong>Francophone & East Africa Expansion:</strong> <em>Paystack</em> and <em>OPay</em> opening regional subsidiaries in Abidjan and Nairobi, driving demand for multi-currency settlement and local legal/HR consulting.
              </li>
              <li>
                <strong>Cloud & Security Modernization:</strong> 36% spike in NDPR/compliance tooling procurement driven by central bank data localization regulations.
              </li>
            </ul>
          </div>

          {/* Key Industry Shifts */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Building2 size={15} color="#2563eb" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                3. Industry Dynamics
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Financial Services</div>
                <div style={{ color: '#059669', fontSize: '11px', fontWeight: 700 }}>+32% Growth (Index: 89)</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>High hiring and venture funding influx.</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Technology & SaaS</div>
                <div style={{ color: '#059669', fontSize: '11px', fontWeight: 700 }}>+28% Growth (Index: 94)</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>AI adoption and enterprise workflow automation.</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Healthcare & Bio</div>
                <div style={{ color: '#059669', fontSize: '11px', fontWeight: 700 }}>+24% Growth (Index: 82)</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Supply chain optimization & diagnostics scale.</div>
              </div>
            </div>
          </div>

          {/* Risk Radar */}
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '12px',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <AlertTriangle size={15} color="#d97706" />
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#92400e' }}>
                4. Market Risk & Headwinds
              </span>
            </div>
            <p style={{ margin: 0, color: '#78350f', fontSize: '11.5px' }}>
              FX volatility in Nigeria and Kenya is causing mid-market SaaS buyers to prefer local currency invoicing or quarterly contracts over annual USD commitments.
            </p>
          </div>

          {/* Recommended Sales Actions */}
          <div style={{
            backgroundColor: '#f5f3ff',
            border: '1px solid #ede9fe',
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={15} color="#7c3aed" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#4338ca' }}>
                5. Immediate Sales Execution Plan
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#3730a3' }}>
              <div>• Launch targeted outbound sequence to Heads of People / COOs at the top 27 hiring tech companies.</div>
              <div>• Offer multi-currency settlement case studies to expanding West African payments accounts.</div>
              <div>• Book 15 discovery calls with Series B & C funded scaleups within 7 days of funding announcements.</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #eaecf0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Generated with HUNTIQ AI Reasoning Engine • 94.2% Confidence
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleRegenerate}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              {isGenerating ? 'Synthesizing...' : 'Regenerate'}
            </button>

            <button
              onClick={() => {
                onClose();
                if (onNavigateToOutreach) onNavigateToOutreach();
              }}
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={13} />
              <span>Convert to Outreach Campaign</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
