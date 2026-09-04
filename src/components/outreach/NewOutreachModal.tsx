import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send,
  Loader2,
  Wand2,
  Mail,
  MessageSquare,
  Phone,
  Copy,
  Check,
  Target,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import type { OutreachItem, ProspectPitchPayload, OutreachChannel } from '../../types/outreach';
import { geminiService } from '../../services/geminiService';
import { synthesizePitch } from '../../services/pitchSynthesisService';
import { useHuntiq } from '../../context/HuntiqContext';

interface NewOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOutreach: (outreach: Partial<OutreachItem>) => Promise<void> | void;
  initialPayload?: ProspectPitchPayload | null;
}

export const NewOutreachModal: React.FC<NewOutreachModalProps> = ({
  isOpen,
  onClose,
  onCreateOutreach,
  initialPayload
}) => {
  const { currentUser, formatCurrency } = useHuntiq();
  const [channel, setChannel] = useState<OutreachChannel>('email');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Managing Director / Business Owner');
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isIntelExpanded, setIsIntelExpanded] = useState(true);

  // Synthesized multi-channel templates cache
  const [channelTemplates, setChannelTemplates] = useState<{
    email: { subject: string; body: string };
    linkedin: { subject: string; body: string };
    phone: { subject: string; body: string };
  }>({
    email: { subject: '', body: '' },
    linkedin: { subject: '', body: '' },
    phone: { subject: '', body: '' }
  });

  // Hydrate from initialPayload when opened
  useEffect(() => {
    if (isOpen) {
      if (initialPayload) {
        const cName = initialPayload.companyName || '';
        const ctName = initialPayload.contactName || 'Managing Director / Business Owner';
        const ctRole = initialPayload.contactRole || 'Managing Director / Owner';
        const dName = initialPayload.domain || (cName ? `${cName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : '');
        const eMail = initialPayload.email || (ctName && dName ? `${ctName.toLowerCase().split(' ')[0]}@${dName}` : `contact@${dName || 'company.com'}`);
        const pNum = initialPayload.phone || '';

        setCompanyName(cName);
        setContactName(ctName);
        setContactRole(ctRole);
        setDomain(dName);
        setEmail(eMail);
        setPhone(pNum);

        const synthesized = synthesizePitch(initialPayload, currentUser?.fullName || 'Ayoola Ade');
        const templates = {
          email: { subject: synthesized.subject, body: synthesized.emailBody },
          linkedin: { subject: `${cName} x HUNTIQ: Commercial Search Benchmark`, body: synthesized.linkedInBody },
          phone: { subject: 'Cold Call Battlecard & Discovery Opener', body: synthesized.callScript }
        };
        setChannelTemplates(templates);

        const activeChan = channel === 'email' ? 'email' : channel === 'linkedin' ? 'linkedin' : 'phone';
        setSubject(templates[activeChan].subject);
        setContent(templates[activeChan].body);
      } else {
        setCompanyName('');
        setContactName('');
        setContactRole('Head of Operations');
        setDomain('');
        setEmail('');
        setPhone('');
        setSubject('');
        setContent('');
      }
    }
  }, [isOpen, initialPayload, currentUser?.fullName, channel]);

  const handleChannelSwitch = (newChannel: OutreachChannel) => {
    setChannel(newChannel);
    if (initialPayload) {
      const selected = channelTemplates[newChannel === 'email' ? 'email' : newChannel === 'linkedin' ? 'linkedin' : 'phone'];
      if (selected) {
        setSubject(selected.subject);
        setContent(selected.body);
      }
    }
  };

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
        initialPayload?.commercialIntentKeywords?.[0]
          ? `outranked by ${initialPayload.topCompetitors?.[0]?.name || 'competitors'} for "${initialPayload.commercialIntentKeywords[0]}"`
          : 'recent digital growth gap and commercial search opportunity',
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

  const handleCopyPitch = () => {
    const fullText = subject ? `Subject: ${subject}\n\n${content}` : content;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        domain: domain.trim() || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        email: email.trim() || `contact@${domain || companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}`,
        phone: phone.trim() || undefined,
        subject: subject.trim() || 'Commercial Opportunity & Search Growth Brief',
        lastMessageSnippet: content.trim(),
        channel,
        opportunityScore: initialPayload?.opportunityScore || 85,
        campaignName: initialPayload?.recommendedPackage || 'Turnkey SEO & Client Acquisition'
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
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '680px',
        maxWidth: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          flexShrink: 0
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {initialPayload ? `Pitch Prospect: ${initialPayload.companyName}` : 'Start New Outreach Thread'}
                </h3>
                {initialPayload && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0'
                  }}>
                    Intel Loaded
                  </span>
                )}
              </div>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                {initialPayload 
                  ? 'All gathered audit, competitor and SEO intelligence is pre-formulated below'
                  : 'Initiate personalized direct outreach backed by signal intelligence'}
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
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
          {/* GATHERED INTELLIGENCE DOSSIER BANNER (when launched from Find Prospects) */}
          {initialPayload && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '18px'
            }}>
              <div 
                onClick={() => setIsIntelExpanded(!isIntelExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={15} color="#4f46e5" />
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                    Gathered Intelligence Briefing
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#4f46e5',
                    backgroundColor: '#eef2ff',
                    padding: '2px 7px',
                    borderRadius: '6px'
                  }}>
                    {initialPayload.opportunityScore ? `Opportunity ${initialPayload.opportunityScore}/100` : 'High Priority'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
                  <span>{isIntelExpanded ? 'Hide Briefing' : 'Show Briefing'}</span>
                  {isIntelExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {isIntelExpanded && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Grid 1: Keywords Missed & Competitor */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                    {/* Missed Keywords */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '10px', border: '1px solid #eaecf0' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Target size={12} color="#ef4444" />
                        <span>Search Terms Outranked On:</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {initialPayload.commercialIntentKeywords && initialPayload.commercialIntentKeywords.length > 0 ? (
                          initialPayload.commercialIntentKeywords.map((kw, i) => (
                            <span key={i} style={{
                              fontSize: '10.5px',
                              fontWeight: 600,
                              backgroundColor: '#fef2f2',
                              color: '#991b1b',
                              border: '1px solid #fee2e2',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              &ldquo;{kw}&rdquo;
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Commercial organic search queries</span>
                        )}
                      </div>
                    </div>

                    {/* Competitors */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '10px', border: '1px solid #eaecf0' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={12} color="#3b82f6" />
                        <span>Top Winning Competitor:</span>
                      </div>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>
                        {initialPayload.topCompetitors?.[0]?.name || 'Direct Competitors'}
                        <span style={{ fontSize: '10.5px', color: '#059669', marginLeft: '6px', fontWeight: 600 }}>
                          ({initialPayload.topCompetitors?.[0]?.rank || '#1 on Google'})
                        </span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                        {initialPayload.district || 'Commercial District'} • Capturing search volume
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Offer & Estimated Deal Value */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    border: '1px solid #eaecf0',
                    fontSize: '11px'
                  }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Recommended Package: </span>
                      <strong style={{ color: '#0f172a' }}>{initialPayload.recommendedPackage || 'Turnkey Modernization Suite'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Estimated Deal Value: </span>
                      <strong style={{ color: '#059669' }}>{formatCurrency(initialPayload.estimatedValue || 18000)}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Channel Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              Outreach Channel & Format
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleChannelSwitch('email')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: channel === 'email' ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                  backgroundColor: channel === 'email' ? '#eef2ff' : '#ffffff',
                  color: channel === 'email' ? '#4f46e5' : '#475569'
                }}
              >
                <Mail size={14} />
                <span>Email Pitch</span>
              </button>

              <button
                type="button"
                onClick={() => handleChannelSwitch('linkedin')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: channel === 'linkedin' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: channel === 'linkedin' ? '#f0f9ff' : '#ffffff',
                  color: channel === 'linkedin' ? '#0284c7' : '#475569'
                }}
              >
                <MessageSquare size={14} />
                <span>LinkedIn InMail</span>
              </button>

              <button
                type="button"
                onClick={() => handleChannelSwitch('phone')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: channel === 'phone' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                  backgroundColor: channel === 'phone' ? '#ecfdf5' : '#ffffff',
                  color: channel === 'phone' ? '#059669' : '#475569'
                }}
              >
                <Phone size={14} />
                <span>Call Battlecard</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Row 1: Target Company & Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Target Company <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Hospital"
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
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Contact Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Managing Director"
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

              {/* Row 2: Role & Contact Detail */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="e.g. Managing Director / Partner"
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
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {channel === 'phone' ? 'Phone Number' : 'Email Address'}
                  </label>
                  <input
                    type="text"
                    value={channel === 'phone' ? phone : email}
                    onChange={(e) => channel === 'phone' ? setPhone(e.target.value) : setEmail(e.target.value)}
                    placeholder={channel === 'phone' ? '+234 801 234 5678' : 'contact@company.com'}
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

              {/* Subject Line (visible for email and linkedin) */}
              {channel !== 'phone' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                      {channel === 'email' ? 'Email Subject Line' : 'InMail Subject Hook'}
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
                          <span>Regenerate with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Quick question regarding search ranking vs competitor"
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
              )}

              {/* Pitch Content / Script */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                    {channel === 'phone' ? 'Cold Call Discovery Battlecard' : 'Personalized Pitch Message'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyPitch}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: copied ? '#059669' : '#4f46e5',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Review or edit your customized pitch..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Attached Deliverable preview badge */}
              {initialPayload?.leadMagnet && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}>
                  <FileText size={14} color="#16a34a" />
                  <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: 600 }}>
                    Attached Lead Magnet: <strong>{initialPayload.leadMagnet.title}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
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

              <div style={{ display: 'flex', gap: '8px' }}>
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
                      <span>Dispatching Outreach...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>{initialPayload ? 'Dispatch Pitch & Track' : 'Send Initial Outreach'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
