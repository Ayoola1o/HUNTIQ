import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Sparkles, 
  Building2, 
  Kanban, 
  Calendar 
} from 'lucide-react';
import type { OutreachItem } from '../../types/outreach';

interface OutreachConversationViewProps {
  conversations: OutreachItem[];
  activeConversationId: string | null;
  onSelectConversation: (item: OutreachItem) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onCreateDealFromOutreach: (item: OutreachItem) => void;
  onScheduleMeetingFromOutreach: (item: OutreachItem) => void;
  onNavigateToResearch: (companyName: string) => void;
}

export const OutreachConversationView: React.FC<OutreachConversationViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onCreateDealFromOutreach,
  onScheduleMeetingFromOutreach,
  onNavigateToResearch
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'replies' | 'due_today' | 'scheduled'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');

  const filteredList = conversations.filter((c) => {
    if (activeTab === 'replies' && c.status !== 'replied') return false;
    if (activeTab === 'due_today' && c.status !== 'due_today') return false;
    if (activeTab === 'scheduled' && c.status !== 'scheduled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.contactName.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0] || null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;
    onSendMessage(activeConversation.id, replyText);
    setReplyText('');
  };

  const handleApplyAiSuggestion = (suggestion: string) => {
    setReplyText(suggestion);
  };

  return (
    <div style={{
      margin: '0 32px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      display: 'grid',
      gridTemplateColumns: '380px 1fr',
      height: 'calc(100vh - 270px)',
      minHeight: '520px',
      overflow: 'hidden'
    }}>
      {/* Left List Pane */}
      <div style={{
        borderRight: '1px solid #eaecf0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafbfc'
      }}>
        {/* Filter Tabs */}
        <div style={{
          padding: '12px 14px',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          gap: '4px',
          backgroundColor: '#ffffff'
        }}>
          {[
            { id: 'inbox', label: 'All Inbox' },
            { id: 'replies', label: 'Replies' },
            { id: 'due_today', label: 'Due Today' },
            { id: 'scheduled', label: 'Scheduled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#eff6ff' : 'transparent',
                color: activeTab === tab.id ? '#2563eb' : '#64748b'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #eaecf0', backgroundColor: '#ffffff' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '6px 10px'
          }}>
            <Search size={13} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '11.5px',
                color: '#0f172a',
                width: '100%',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {filteredList.map((item) => {
            const isSelected = activeConversation?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectConversation(item)}
                style={{
                  padding: '14px',
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: item.avatarBg,
                      color: item.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {item.contactName.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                        {item.contactName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {item.companyName}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
                    {item.lastMessageTime}
                  </span>
                </div>

                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.subject}
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.lastMessageSnippet}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: item.status === 'replied' ? '#ecfdf5' : item.status === 'due_today' ? '#fef2f2' : '#f8fafc',
                    color: item.status === 'replied' ? '#047857' : item.status === 'due_today' ? '#b91c1c' : '#64748b'
                  }}>
                    {item.status === 'replied' ? 'Replied' : item.status === 'due_today' ? 'Due Today' : 'Scheduled'}
                  </span>

                  <span style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700 }}>
                    Opp {item.opportunityScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Conversation Thread Pane */}
      {activeConversation ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
          {/* Thread Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #eaecf0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: activeConversation.avatarBg,
                color: activeConversation.avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 800
              }}>
                {activeConversation.contactName.split(' ').map(n => n[0]).join('')}
              </div>

              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {activeConversation.contactName}
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', marginLeft: '6px' }}>
                    • {activeConversation.contactRole}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {activeConversation.companyName} ({activeConversation.email})
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onNavigateToResearch(activeConversation.companyName)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <Building2 size={12} />
                <span>360° Intel</span>
              </button>

              <button
                onClick={() => onScheduleMeetingFromOutreach(activeConversation)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#6d28d9',
                  cursor: 'pointer'
                }}
              >
                <Calendar size={12} />
                <span>Book Meeting</span>
              </button>

              <button
                onClick={() => onCreateDealFromOutreach(activeConversation)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Kanban size={12} />
                <span>+ Move to Pipeline</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeConversation.thread.map((msg) => {
              const isMe = msg.sender === 'me';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    fontSize: '10.5px',
                    color: '#94a3b8',
                    marginBottom: '4px',
                    fontWeight: 600
                  }}>
                    {msg.senderName} • {msg.timestamp}
                  </div>

                  <div style={{
                    backgroundColor: isMe ? '#4f46e5' : '#f1f5f9',
                    color: isMe ? '#ffffff' : '#0f172a',
                    padding: '12px 16px',
                    borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: '12.5px',
                    lineHeight: 1.5,
                    boxShadow: isMe ? '0 2px 6px rgba(79, 70, 229, 0.2)' : '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Response Suggestions Bar */}
          <div style={{
            padding: '8px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #eaecf0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto'
          }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} />
              <span>AI Copilot:</span>
            </span>

            <button
              onClick={() => handleApplyAiSuggestion('Thanks Jane! I would love to walk through the compliance ramp framework. How does Thursday at 2:00 PM West Africa Time look for a 20-min intro?')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #ddd6fe',
                color: '#4f46e5',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              📅 Propose Thursday 2:00 PM Meeting
            </button>

            <button
              onClick={() => handleApplyAiSuggestion('I understand timing is tight with the expansion. Here is a 1-page summary of how we saved 35 hours in manager onboarding last quarter.')}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#475569',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              📄 Share 1-Page Case Study
            </button>
          </div>

          {/* Reply Composer */}
          <form onSubmit={handleSend} style={{ padding: '14px 24px', borderTop: '1px solid #eaecf0', display: 'flex', gap: '10px' }}>
            <textarea
              rows={2}
              placeholder="Write a personalized reply or select an AI suggestion..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none'
              }}
            />

            <button
              type="submit"
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0 20px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          Select a conversation to view thread
        </div>
      )}
    </div>
  );
};
