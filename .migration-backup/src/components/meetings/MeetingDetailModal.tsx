import React from 'react';
import { 
  X, 
  Sparkles, 
  Video, 
  Kanban, 
  CheckCircle2 
} from 'lucide-react';
import type { MeetingItem } from '../../types/meetings';

interface MeetingDetailModalProps {
  meeting: MeetingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPipeline: () => void;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  meeting,
  isOpen,
  onClose,
  onNavigateToPipeline
}) => {
  if (!isOpen || !meeting) return null;

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
        width: '840px',
        maxWidth: '100%',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11.5px', color: '#a5b4fc', fontWeight: 600 }}>
                {meeting.companyName}
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
              <span style={{ fontSize: '11px', color: '#cbd5e1' }}>{meeting.scheduledTime} ({meeting.durationMinutes} mins)</span>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: '#ffffff' }}>
              {meeting.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href={meeting.meetingUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Video size={13} />
              <span>Launch Video Call</span>
            </a>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
            >
              <X size={20} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* AI Prep Intelligence Brief */}
          <div style={{
            backgroundColor: '#f5f3ff',
            border: '1px solid #ddd6fe',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={16} color="#7c3aed" />
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#5b21b6', margin: 0 }}>
                HUNTIQ AI Meeting Preparation Brief
              </h3>
            </div>

            <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
              {meeting.aiPrepBrief.keyTakeaway}
            </p>

            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Buying Signals to Mention */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '12px', border: '1px solid #ede9fe' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>
                  🎯 Signals to Reference
                </span>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                  {meeting.aiPrepBrief.recentSignals.map((sig, idx) => (
                    <li key={idx} style={{ marginTop: '4px' }}>{sig}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Questions */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '12px', border: '1px solid #ede9fe' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>
                  💡 Suggested Discovery Questions
                </span>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                  {meeting.aiPrepBrief.suggestedQuestions.map((q, idx) => (
                    <li key={idx} style={{ marginTop: '4px' }}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Agenda & Attendees */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Agenda items */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #eaecf0' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                Call Agenda (30 Mins)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {meeting.agenda.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                    <CheckCircle2 size={14} color="#059669" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendee Info */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #eaecf0' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                Key Attendee
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: meeting.contactAvatarBg,
                  color: meeting.contactAvatarColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800
                }}>
                  {meeting.contactName.split(' ').map(n => n[0]).join('')}
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {meeting.contactName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {meeting.contactRole} at {meeting.companyName}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToPipeline();
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Kanban size={12} />
                  <span>View in Pipeline</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
