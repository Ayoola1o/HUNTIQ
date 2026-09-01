import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send,
  Loader2,
  Wand2
} from 'lucide-react';
import type { OutreachItem } from '../../types/outreach';
import { geminiService } from '../../services/geminiService';

interface NewOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOutreach: (outreach: OutreachItem) => void;
}

export const NewOutreachModal: React.FC<NewOutreachModalProps> = ({
  isOpen,
  onClose,
  onCreateOutreach
}) => {
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Head of Operations');
  const [companyName, setCompanyName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  const handleAutoDraft = async () => {
    if (!companyName.trim()) {
      alert('Please enter a company name first to generate contextual outreach.');
      return;
    }
    setIsDrafting(true);
    try {
      const draft = await geminiService.generateOutreach(
        companyName,
        contactName || 'Decision Maker',
        contactRole || 'Head of People & Operations',
        'recent hiring activity and growth momentum',
        'Executive & Direct'
      );
      setSubject(draft.subject);
      setContent(draft.body);
    } catch {
      // Handled inside geminiService
    } finally {
      setIsDrafting(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !companyName.trim() || !content.trim()) return;

    const newOutreach: OutreachItem = {
      id: `outreach-${Date.now()}`,
      contactName,
      contactRole,
      companyName,
      domain: `${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      email: `${contactName.toLowerCase().split(' ')[0]}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      avatarBg: '#dbeafe',
      avatarColor: '#1e40af',
      subject: subject || 'Quick Question regarding growth',
      lastMessageSnippet: content,
      lastMessageTime: 'Just now',
      status: 'scheduled',
      channel: 'email',
      opportunityScore: 92,
      unread: false,
      thread: [
        {
          id: `msg-${Date.now()}`,
          sender: 'me',
          senderName: 'Ayoola Ade',
          timestamp: 'Just now',
          channel: 'email',
          content
        }
      ]
    };

    onCreateOutreach(newOutreach);
    onClose();
  };

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
        width: '580px',
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
                Compose Sales Outreach
              </h3>
              <p style={{ fontSize: '11px', color: '#a5b4fc', margin: '2px 0 0 0' }}>
                AI-personalized 1-on-1 prospect message
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <X size={18} color="#ffffff" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Contact Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Oluwaseun Adewale"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Contact Role
              </label>
              <input
                type="text"
                placeholder="e.g. VP People & Operations"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Paystack, Flutterwave, Moniepoint"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Subject Line
            </label>
            <input
              type="text"
              placeholder="e.g. Scaling engineering leadership at Flutterwave"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                Message Content *
              </label>
              <button
                type="button"
                onClick={handleAutoDraft}
                disabled={isDrafting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
                  border: '1px solid #c7d2fe',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#4f46e5',
                  cursor: isDrafting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDrafting ? (
                  <Loader2 size={12} className="spin" />
                ) : (
                  <Wand2 size={12} color="#6366f1" />
                )}
                <span>{isDrafting ? 'Drafting with Gemini...' : '✨ Auto-Draft with Gemini'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Write your email or let AI draft your opener based on signals..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
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
              <Send size={14} />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
