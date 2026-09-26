import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot 
} from 'lucide-react';

import { executeCopilotPrompt } from '../../api/copilot';

interface MessageItem {
  sender: 'user' | 'bot';
  text: string;
  retryQuery?: string;
  action?: { label: string; company: string };
}

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onInvestigateCompany?: (company: string) => void;
}

export const AiCopilotModal: React.FC<AiCopilotModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onInvestigateCompany
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      sender: 'bot',
      text: "Hello! I'm your HUNTIQ Autonomous Intelligence Engine. I can discover ICP-matching accounts, calculate live Opportunity Scores, investigate companies 360°, draft multi-channel outreach, and detect buying signals."
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || isTyping) return;

    const userMsg: MessageItem = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    try {
      const result = await executeCopilotPrompt(q);
      let action: { label: string; company: string } | undefined = undefined;

      const companies = result.results?.companies || result.companies;
      const researchData = result.results?.researchData || result.researchData;

      if (companies && companies.length > 0) {
        const top = companies[0];
        action = { label: `Investigate ${top.name} (${top.opportunityScore}/100) →`, company: top.name };
      } else if (researchData) {
        action = { label: `View ${researchData.company.name} Full Dossier →`, company: researchData.company.name };
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: result.message, action }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ **Unable to execute Copilot query**: ${err?.message || 'Server connection error'}. Please try again.`,
          retryQuery: q
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'Which prospects should I contact today?',
    'Summarize my pipeline metrics',
    'Show me expanding companies in my market',
    'What trigger events happened recently?'
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 15, 25, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '640px',
        maxHeight: '85vh',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(124, 58, 237, 0.5)'
            }}>
              <Bot size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>HUNTIQ AI Copilot</div>
              <div style={{ fontSize: '11px', color: '#a5b4fc' }}>Real-time Sales Intelligence & Hunting Agent</div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Body */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: '#f8fafc',
          maxHeight: '420px'
        }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '10px'
              }}
            >
              {msg.sender === 'bot' && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <Sparkles size={14} />
                </div>
              )}

              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: msg.sender === 'user' ? '#4f46e5' : '#ffffff',
                color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                border: msg.sender === 'user' ? 'none' : '1px solid #eaecf0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                fontSize: '13px',
                lineHeight: 1.45
              }}>
                <div dangerouslySetInnerHTML={{
                  __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />

                {msg.retryQuery && (
                  <button
                    onClick={() => handleSend(msg.retryQuery)}
                    disabled={isTyping}
                    style={{
                      marginTop: '10px',
                      backgroundColor: '#ede9fe',
                      border: '1px solid #c4b5fd',
                      color: '#6d28d9',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: isTyping ? 'default' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Retry Request</span>
                  </button>
                )}

                {msg.action && (
                  <button
                    onClick={() => {
                      onClose();
                      onInvestigateCompany?.(msg.action!.company);
                    }}
                    style={{
                      marginTop: '10px',
                      backgroundColor: '#ede9fe',
                      border: '1px solid #c4b5fd',
                      color: '#6d28d9',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{msg.action.label}</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b', fontSize: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366f1', animation: 'bounce 0.8s infinite' }} />
              <span>AI Copilot is analyzing market signals...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div style={{ padding: '10px 20px', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
            SUGGESTED QUERIES
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => !isTyping && handleSend(p)}
                disabled={isTyping}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  color: isTyping ? '#94a3b8' : '#475569',
                  cursor: isTyping ? 'default' : 'pointer',
                  fontWeight: 500
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #eaecf0',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={query}
            disabled={isTyping}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isTyping) handleSend();
            }}
            placeholder="Ask anything about prospects, buying signals, or outreach..."
            style={{
              flex: 1,
              height: '40px',
              padding: '0 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              outline: 'none',
              backgroundColor: isTyping ? '#f8fafc' : '#ffffff',
              color: isTyping ? '#64748b' : '#0f172a'
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || isTyping}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: !query.trim() || isTyping ? 'default' : 'pointer',
              opacity: !query.trim() || isTyping ? 0.6 : 1
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
