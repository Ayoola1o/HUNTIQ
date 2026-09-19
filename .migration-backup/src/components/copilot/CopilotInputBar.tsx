import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic
} from 'lucide-react';

interface CopilotInputBarProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export const CopilotInputBar: React.FC<CopilotInputBarProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');

  const quickPills = [
    { label: '🔍 Find Prospects', prompt: 'Find 25 technology companies in Lagos that are hiring.' },
    { label: '⚡ Analyze Signals', prompt: 'What industries are showing the strongest buying signals this week?' },
    { label: '🎯 Today’s Leads', prompt: 'Which prospects should I contact today?' },
    { label: '✉️ Draft Outreach', prompt: 'Draft a personalized outreach email for Acme Technologies.' },
    { label: '📊 Pipeline Risk', prompt: 'Which deals in my pipeline are currently at risk?' },
  ];

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div style={{
      padding: '12px 24px 18px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #eaecf0',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Quick Action Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {quickPills.map((pill) => (
          <button
            key={pill.label}
            onClick={() => onSend(pill.prompt)}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              fontWeight: 600,
              color: '#475569',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ede9fe';
              e.currentTarget.style.color = '#5b21b6';
              e.currentTarget.style.borderColor = '#c4b5fd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Input Box Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#ffffff',
        border: '1.5px solid #cbd5e1',
        borderRadius: '12px',
        padding: '6px 10px 6px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      }}>
        <button
          type="button"
          title="Attach ICP, Playbook or Spreadsheet"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Paperclip size={18} />
        </button>

        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask anything about your prospects, request research, draft outreach, or update CRM..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '13.5px',
            color: '#0f172a',
            backgroundColor: 'transparent',
            lineHeight: 1.4,
            maxHeight: '100px'
          }}
        />

        <button
          type="button"
          title="Voice input"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Mic size={18} />
        </button>

        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          style={{
            background: text.trim()
              ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
              : '#f1f5f9',
            color: text.trim() ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '9px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: text.trim() ? 'pointer' : 'default',
            boxShadow: text.trim() ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Send size={16} />
        </button>
      </div>

      {/* Bottom Status Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#94a3b8',
        padding: '0 4px'
      }}>
        <span>HUNTIQ Autonomous Agent • Tool Execution Enabled</span>
        <span style={{ color: '#059669', fontWeight: 600 }}>● Connected to 1,429 Live Market Signals</span>
      </div>
    </div>
  );
};
