import React, { useState } from 'react';
import { Sparkles, Search, Loader2 } from 'lucide-react';

interface AiSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onImprove: () => void;
}

export const AiSearchInput: React.FC<AiSearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  onImprove
}) => {
  const [isImproving, setIsImproving] = useState(false);

  const handleImproveClick = () => {
    setIsImproving(true);
    setTimeout(() => {
      onImprove();
      setIsImproving(false);
    }, 600);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '24px 28px',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Title & Subtitle */}
      <div>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 4px 0'
        }}>
          Describe the type of client you're looking for
        </h2>
        <p style={{
          fontSize: '12.5px',
          color: '#64748b',
          margin: 0,
          lineHeight: 1.4
        }}>
          Tell HUNTIQ what you're looking for in natural language. Our AI will find and rank the best matches.
        </p>
      </div>

      {/* Large Textarea Container */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1.5px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'border-color 0.2s'
      }}>
        <textarea
          rows={3}
          maxLength={500}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Example: Find fast-growing technology companies in Lagos with 50-500 employees that are hiring and recently raised funding."
          style={{
            border: 'none',
            outline: 'none',
            resize: 'none',
            backgroundColor: 'transparent',
            fontSize: '13.5px',
            color: '#0f172a',
            lineHeight: 1.5,
            fontFamily: 'inherit'
          }}
        />

        {/* Bottom Bar: Improve with AI + Char Count + CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #edf2f7',
          paddingTop: '10px'
        }}>
          <button
            type="button"
            onClick={handleImproveClick}
            disabled={isImproving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #c7d2fe',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#4f46e5',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(79, 70, 229, 0.08)',
              transition: 'all 0.15s ease'
            }}
          >
            {isImproving ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            <span>Improve with AI</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
              {value.length} / 500
            </span>

            <button
              type="button"
              onClick={onSubmit}
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
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Search size={14} />
              <span>Find Prospects</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
