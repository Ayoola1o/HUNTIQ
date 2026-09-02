import React, { useState } from 'react';
import { 
  X, 
  Send,
  Loader2,
  Wand2
} from 'lucide-react';
import type { OutreachItem } from '../../types/outreach';
import { geminiService } from '../../services/geminiService';

interface NewOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOutreach: (outreach: Partial<OutreachItem>) => Promise<void> | void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !companyName.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateOutreach({
        contactName: contactName.trim(),
        contactRole: contactRole.trim(),
        companyName: companyName.trim(),
        domain: `${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        email: `${contactName.toLowerCase().split(' ')[0]}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        subject: subject.trim() || 'Quick Question regarding growth',
        lastMessageSnippet: content.trim(),
        channel: 'email'
      });
      onClose();
    } catch (err) {
      console.error('Failed to create outreach:', err);
    } finally {
      setIsSubmitting(false);
    }
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
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '540px',
        maxWidth: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Start New Outreach Thread
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                Initiate personalized direct outreach backed by signal intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Row 1: Company & Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Target Company <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Flutterwave"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Contact Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Row 2: Role */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Contact Role
              </label>
              <input
                type="text"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                placeholder="e.g. Head of People / VP Engineering"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Subject */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Email Subject Line
                </label>
                <button
                  type="button"
                  onClick={handleAutoDraft}
                  disabled={isDrafting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: '#4f46e5',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isDrafting ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Drafting with AI...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={12} />
                      <span>Auto-Draft Message with AI</span>
                    </>
                  )}
                </button>
              </div>

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Quick question regarding Acme's expansion"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Message Body */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Message Content <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your initial outreach pitch or click 'Auto-Draft Message with AI' above..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  lineHeight: 1.45,
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!contactName.trim() || !companyName.trim() || !content.trim() || isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: contactName.trim() && companyName.trim() && content.trim() && !isSubmitting ? '#4f46e5' : '#a5b4fc',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: contactName.trim() && companyName.trim() && content.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Send Initial Outreach</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
