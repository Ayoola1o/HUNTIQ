import React, { useState } from 'react';
import { 
  Video, 
  Sparkles, 
  Search, 
  Plus, 
  ChevronRight 
} from 'lucide-react';
import type { MeetingItem, MeetingType } from '../../types/meetings';

interface MeetingsListProps {
  meetings: MeetingItem[];
  selectedMeetingId: string | null;
  onSelectMeeting: (meeting: MeetingItem) => void;
  onScheduleMeeting: () => void;
  onNavigateToPipeline?: () => void;
}

export const MeetingsList: React.FC<MeetingsListProps> = ({
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  onScheduleMeeting
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeetings = meetings.filter((m) => {
    if (activeTab === 'upcoming' && m.status !== 'upcoming') return false;
    if (activeTab === 'completed' && m.status !== 'completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.companyName.toLowerCase().includes(q) ||
        m.contactName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getMeetingTypeBadge = (t: MeetingType) => {
    switch (t) {
      case 'discovery':
        return { label: 'Discovery Call', color: '#2563eb', bg: '#eff6ff', border: '#dbeafe' };
      case 'demo':
        return { label: 'Demo / Pitch', color: '#7c3aed', bg: '#f5f3ff', border: '#ede9fe' };
      case 'negotiation':
        return { label: 'Negotiation', color: '#ea580c', bg: '#fff7ed', border: '#ffedd5' };
      default:
        return { label: 'Proposal Review', color: '#059669', bg: '#ecfdf5', border: '#d1fae5' };
    }
  };

  return (
    <div style={{
      margin: '0 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'upcoming', label: 'Upcoming Calls', count: meetings.filter(m => m.status === 'upcoming').length },
            { id: 'all', label: 'All Scheduled', count: meetings.length },
            { id: 'completed', label: 'Completed', count: meetings.filter(m => m.status === 'completed').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '10px',
                backgroundColor: activeTab === tab.id ? '#eff6ff' : '#eaecf0',
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right Search + Schedule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: '8px',
            padding: '6px 12px',
            width: '260px'
          }}>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search meetings, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '12px',
                color: '#0f172a',
                width: '100%',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            onClick={onScheduleMeeting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Plus size={13} />
            <span>+ Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Meeting Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredMeetings.map((m) => {
          const typeBadge = getMeetingTypeBadge(m.meetingType);
          const isSelected = selectedMeetingId === m.id;

          return (
            <div
              key={m.id}
              onClick={() => onSelectMeeting(m)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: isSelected ? '1.5px solid #6366f1' : '1px solid #eaecf0',
                padding: '18px 20px',
                boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: '240px 1fr 200px',
                gap: '20px',
                alignItems: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = '#c7d2fe';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = '#eaecf0';
              }}
            >
              {/* Left Column: Time & Company */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: typeBadge.color,
                    backgroundColor: typeBadge.bg,
                    border: `1px solid ${typeBadge.border}`,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {typeBadge.label}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                    {m.durationMinutes} mins
                  </span>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {m.scheduledTime}
                </div>

                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  {m.companyName} • {m.contactName}
                </div>
              </div>

              {/* Middle Column: AI Brief & Objective */}
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  {m.title}
                </div>

                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <Sparkles size={14} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9' }}>
                      AI Prep Insight:
                    </span>
                    <p style={{ fontSize: '11.5px', color: '#475569', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                      {m.aiPrepBrief.keyTakeaway}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#059669' }}>
                  ${m.dealValue.toLocaleString()}
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, marginLeft: '4px' }}>
                    Opp {m.opportunityScore}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <a
                    href={m.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <Video size={12} />
                    <span>Join Call</span>
                  </a>

                  <button
                    onClick={() => onSelectMeeting(m)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#f5f3ff',
                      border: '1px solid #ddd6fe',
                      color: '#6d28d9',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <span>Brief & Agenda</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
