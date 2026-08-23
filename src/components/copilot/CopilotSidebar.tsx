import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  BrainCircuit 
} from 'lucide-react';

export interface ChatSession {
  id: string;
  title: string;
  category: 'today' | 'yesterday' | 'previous';
  timestamp: string;
  preview: string;
}

interface CopilotSidebarProps {
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat?: (id: string) => void;
}

export const CopilotSidebar: React.FC<CopilotSidebarProps> = ({
  currentChatId,
  onSelectChat,
  onNewChat
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const initialSessions: ChatSession[] = [
    {
      id: 'chat-1',
      title: "Today's hot opportunities",
      category: 'today',
      timestamp: '10:42 AM',
      preview: 'Found 7 high-priority opportunities in Lagos...'
    },
    {
      id: 'chat-2',
      title: 'Prospect research — FinServe',
      category: 'today',
      timestamp: '9:15 AM',
      preview: '360° intelligence brief generated for FinServe...'
    },
    {
      id: 'chat-3',
      title: 'Lagos HR prospects expansion',
      category: 'today',
      timestamp: '8:30 AM',
      preview: 'Created prospect search for 50 companies...'
    },
    {
      id: 'chat-4',
      title: 'Weekly market signal analysis',
      category: 'yesterday',
      timestamp: 'Yesterday',
      preview: 'Aggregated hiring and funding signals across Nigeria...'
    },
    {
      id: 'chat-5',
      title: 'Cybersecurity trigger search',
      category: 'yesterday',
      timestamp: 'Yesterday',
      preview: 'Identified 12 companies with tech migration triggers...'
    },
    {
      id: 'chat-6',
      title: 'Executive outreach templates',
      category: 'previous',
      timestamp: '3 days ago',
      preview: 'Drafted 5 consultative cold emails for CHROs...'
    },
    {
      id: 'chat-7',
      title: 'At-risk deals review',
      category: 'previous',
      timestamp: '5 days ago',
      preview: 'Audited pipeline for deals with >14d inactivity...'
    },
  ];

  const filteredSessions = initialSessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'previous', label: 'Previous 7 Days' },
  ] as const;

  return (
    <div style={{
      width: '260px',
      minWidth: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #eaecf0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Header with New Chat Button */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #f1f5f9' }}>
        <button
          onClick={onNewChat}
          style={{
            width: '100%',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
            transition: 'opacity 0.15s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.92')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        {/* Search input */}
        <div style={{
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0 8px',
          height: '32px'
        }}>
          <Search size={13} color="#94a3b8" style={{ marginRight: '6px' }} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '11.5px',
              color: '#0f172a',
              width: '100%',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {categories.map((cat) => {
          const list = filteredSessions.filter((s) => s.category === cat.id);
          if (list.length === 0) return null;

          return (
            <div key={cat.id} style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.5px',
                paddingLeft: '6px',
                marginBottom: '6px'
              }}>
                {cat.label.toUpperCase()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {list.map((session) => {
                  const isSelected = currentChatId === session.id;

                  return (
                    <div
                      key={session.id}
                      onClick={() => onSelectChat(session.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#f5f3ff' : 'transparent',
                        border: isSelected ? '1px solid #ddd6fe' : '1px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <MessageSquare size={13} color={isSelected ? '#6d28d9' : '#64748b'} />
                          <span style={{
                            fontSize: '12.5px',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#5b21b6' : '#1e293b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {session.title}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        fontSize: '11px',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        paddingLeft: '19px'
                      }}>
                        {session.preview}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Memory Status Card */}
      <div style={{
        padding: '12px 14px',
        backgroundColor: '#faf5ff',
        borderTop: '1px solid #f3e8ff',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px'
      }}>
        <div style={{ color: '#7c3aed', marginTop: '2px', flexShrink: 0 }}>
          <BrainCircuit size={15} />
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#6b21a8' }}>
            Personalization Memory Active
          </div>
          <div style={{ fontSize: '10.5px', color: '#7e22ce', lineHeight: 1.3, marginTop: '2px' }}>
            Target: Peak Consulting (HR Strategy, $25K deals, Lagos/US)
          </div>
        </div>
      </div>
    </div>
  );
};
