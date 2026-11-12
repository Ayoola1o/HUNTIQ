import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, ArrowUpRight, Building2, CalendarDays, Check, CheckCheck,
  Clock3, FileText, Inbox, Kanban, Mail, MoreHorizontal,
  Search, Send, UserRound, X
} from 'lucide-react';
import type { OutreachItem } from '../../types/outreach';
import { getLeadOutreachContext, type LeadOutreachContext } from '../../api/outreach';
import { emailBodyText } from './emailBodyText';

interface OutreachConversationViewProps {
  conversations: OutreachItem[];
  activeConversationId: string | null;
  onSelectConversation: (item: OutreachItem) => void;
  onSendMessage: (conversationId: string, text: string, requestId: string) => Promise<void>;
  onCreateDealFromOutreach: (item: OutreachItem) => void;
  onScheduleMeetingFromOutreach: (item: OutreachItem) => void;
  onNavigateToResearch: (companyName: string) => void;
}

type InboxTab = 'inbox' | 'replies' | 'due_today' | 'scheduled';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';

export const OutreachConversationView: React.FC<OutreachConversationViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onCreateDealFromOutreach,
  onScheduleMeetingFromOutreach,
  onNavigateToResearch
}) => {
  const [activeTab, setActiveTab] = useState<InboxTab>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [leadContext, setLeadContext] = useState<LeadOutreachContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [showMobileList, setShowMobileList] = useState(true);
  const sendRequestId = useRef('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return conversations.filter(conversation => {
      if (activeTab === 'replies' && conversation.status !== 'replied') return false;
      if (activeTab === 'due_today' && conversation.status !== 'due_today') return false;
      if (activeTab === 'scheduled' && conversation.status !== 'scheduled') return false;
      if (!query) return true;
      return [
        conversation.contactName, conversation.contactRole, conversation.companyName,
        conversation.email, conversation.subject, conversation.lastMessageSnippet,
        conversation.leadId, ...conversation.thread.map(message => message.content)
      ].some(value => value?.toLowerCase().includes(query));
    });
  }, [conversations, activeTab, searchQuery]);

  const activeConversation = filteredList.find(c => c.id === activeConversationId) || filteredList[0] || null;

  useEffect(() => {
    setReplyText('');
    sendRequestId.current = '';
    setLeadContext(null);
    setContextError(null);
    setContextLoading(false);
    if (!activeConversation?.leadId) return;

    let cancelled = false;
    setContextLoading(true);
    getLeadOutreachContext(activeConversation.leadId)
      .then(context => { if (!cancelled) setLeadContext(context); })
      .catch(error => { if (!cancelled) setContextError(error?.message || 'Could not load saved lead context.'); })
      .finally(() => { if (!cancelled) setContextLoading(false); });
    return () => { cancelled = true; };
  }, [activeConversation?.id, activeConversation?.leadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [activeConversation?.id, activeConversation?.thread.length]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!replyText.trim() || !activeConversation || sending) return;
    if (activeConversation.channel === 'email' && (!activeConversation.email || activeConversation.emailStatus !== 'verified')) return;
    const submittedText = replyText;
    setSending(true);
    if (!sendRequestId.current) sendRequestId.current = crypto.randomUUID();
    try {
      await onSendMessage(activeConversation.id, submittedText, sendRequestId.current);
      sendRequestId.current = '';
      setReplyText(previous => previous === submittedText ? '' : previous);
    } catch {
      // The parent shows the server error. Keep the draft and request ID available for safe retry.
    } finally {
      setSending(false);
    }
  };

  const tabItems: { id: InboxTab; label: string; count: number }[] = [
    { id: 'inbox', label: 'All', count: conversations.length },
    { id: 'replies', label: 'Replies', count: conversations.filter(item => item.status === 'replied').length },
    { id: 'due_today', label: 'Due today', count: conversations.filter(item => item.status === 'due_today').length },
    { id: 'scheduled', label: 'Scheduled', count: conversations.filter(item => item.status === 'scheduled').length },
  ];

  return (
    <div className={`outreach-workspace${showMobileList ? '' : ' mobile-thread'}`}>
      <style>{`
        .outreach-workspace{margin:0 24px 24px;display:grid;grid-template-columns:280px minmax(0,1fr) 284px;height:min(760px,calc(100vh - 276px));min-height:510px;overflow:hidden;background:#fff;border:1px solid #e5e9f1;border-radius:16px;box-shadow:0 8px 28px rgba(25,38,64,.055);color:#182238}
        .outreach-inbox{display:flex;min-width:0;flex-direction:column;background:#fbfcfe;border-right:1px solid #e9edf4}
        .outreach-inbox-head{padding:16px 15px 12px;background:#fff;border-bottom:1px solid #edf0f5}
        .outreach-tabs{display:flex;gap:3px;padding:3px;background:#f3f5f9;border-radius:9px}
        .outreach-tab{flex:1;min-width:0;border:0;border-radius:7px;background:transparent;color:#758198;padding:7px 3px;font-size:10px;font-weight:700;cursor:pointer}
        .outreach-tab.active{color:#444bc1;background:#fff;box-shadow:0 1px 4px #1f293710}
        .outreach-search{display:flex;align-items:center;gap:8px;margin-top:12px;padding:9px 10px;background:#f8f9fc;border:1px solid #e5e9f1;border-radius:9px;color:#8994a8}
        .outreach-search input{width:100%;border:0;outline:0;background:transparent;color:#29364d;font-family:inherit;font-size:12px}
        .outreach-list{overflow:auto;flex:1}
        .outreach-row{display:flex;width:100%;gap:10px;padding:13px 12px;text-align:left;border:0;border-bottom:1px solid #eef1f5;border-left:3px solid transparent;background:#fff;cursor:pointer}
        .outreach-row:hover{background:#f8f9ff}.outreach-row.selected{background:#f0f2ff;border-left-color:#5656d8}
        .outreach-avatar{display:grid;place-items:center;width:36px;height:36px;flex:0 0 36px;border-radius:50%;font-size:11px;font-weight:800}
        .outreach-row-main{min-width:0;flex:1}.outreach-row-top{display:flex;justify-content:space-between;gap:6px;font-size:11px}.outreach-row-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:750;color:#253149}.outreach-row-time{white-space:nowrap;color:#8a95a8;font-size:9px}.outreach-row-company,.outreach-row-subject,.outreach-row-snippet{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.outreach-row-company{margin-top:3px;color:#728097;font-size:10px}.outreach-row-subject{margin-top:8px;color:#35425a;font-size:10px;font-weight:700}.outreach-row-snippet{margin-top:3px;color:#7a869a;font-size:10px}
        .outreach-thread{display:flex;min-width:0;flex-direction:column;background:#fff}.outreach-thread-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 18px;border-bottom:1px solid #eaedf3}.outreach-thread-person{display:flex;min-width:0;align-items:center;gap:10px}.outreach-thread-meta{min-width:0}.outreach-thread-meta strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.outreach-thread-meta span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:3px;color:#78849a;font-size:10px}.outreach-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}.outreach-action{display:inline-flex;align-items:center;gap:6px;border:1px solid #e0e5ed;border-radius:8px;background:#fff;color:#46546b;padding:7px 9px;font-size:10px;font-weight:700;cursor:pointer}.outreach-action:hover{background:#f7f8fc}.outreach-action.primary{background:#4f46d7;border-color:#4f46d7;color:#fff}
        .outreach-linked-banner{display:flex;align-items:center;gap:7px;margin:11px 16px 0;padding:8px 10px;border:1px solid #e7e9f5;border-radius:9px;background:#fafaff;color:#626e85;font-size:10px}.outreach-linked-banner strong{color:#4650b7}.outreach-status-banner{padding:9px 14px;border-top:1px solid #e6eaf1;font-size:11px}.outreach-messages{display:flex;flex:1;flex-direction:column;gap:19px;overflow:auto;padding:18px 20px}.outreach-message{display:flex;max-width:min(82%,720px);flex-direction:column}.outreach-message.mine{align-self:flex-end;align-items:flex-end}.outreach-message.theirs{align-self:flex-start;align-items:flex-start}.outreach-message-meta{display:flex;align-items:center;gap:7px;margin:0 3px 6px;color:#7d899d;font-size:9px}.outreach-message-meta strong{color:#49566d;font-size:10px}.outreach-message-bubble{border:1px solid #e8ecf3;border-radius:14px 14px 14px 4px;background:#f6f8fb;color:#27354b;padding:12px 14px;font-size:12px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}.outreach-message.mine .outreach-message-bubble{border-color:#dfe2ff;border-radius:14px 14px 4px 14px;background:#eff0ff;color:#27315b}.outreach-delivery{display:flex;align-items:center;gap:4px;margin-top:5px;color:#78849a;font-size:9px}.outreach-composer{padding:12px 15px 14px;border-top:1px solid #e9edf3}.outreach-composer-to{display:flex;align-items:center;gap:6px;margin:0 1px 8px;color:#758198;font-size:10px}.outreach-composer textarea{display:block;width:100%;min-height:66px;resize:vertical;border:1px solid #dfe4ed;border-radius:10px;outline:0;padding:10px 11px;color:#29364d;font:12px/1.55 inherit}.outreach-composer textarea:focus{border-color:#8f94e9;box-shadow:0 0 0 3px #5454d410}.outreach-composer-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}.outreach-send{display:inline-flex;align-items:center;gap:7px;border:0;border-radius:8px;background:#4f46d7;color:#fff;padding:9px 13px;font-size:10px;font-weight:750;cursor:pointer}.outreach-send:disabled{cursor:not-allowed;background:#aab0c7}.outreach-context{min-width:0;overflow:auto;border-left:1px solid #e9edf4;background:#fbfcfe;padding:15px}.outreach-context-card{border:1px solid #e7ebf2;border-radius:12px;background:#fff;padding:13px;margin-bottom:11px}.outreach-context-title{display:flex;align-items:center;gap:7px;margin-bottom:10px;color:#647189;font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.outreach-context-value{color:#29364d;font-size:11px;line-height:1.6;overflow-wrap:anywhere}.outreach-evidence{display:block;margin-top:8px;color:#4b53be;font-size:10px;line-height:1.5;text-decoration:none}.outreach-evidence:hover{text-decoration:underline}.outreach-context-foot{margin-top:10px;color:#8590a3;font-size:9px;line-height:1.5}.outreach-empty{display:grid;place-items:center;flex:1;padding:28px;text-align:center;color:#8a95a8;font-size:12px}
        @media(max-width:1200px){.outreach-workspace{grid-template-columns:250px minmax(0,1fr) 250px;margin-left:18px;margin-right:18px}.outreach-action span{display:none}.outreach-action{padding:8px}}
        @media(max-width:930px){.outreach-workspace{grid-template-columns:260px minmax(0,1fr)}.outreach-context{display:none}}
        @media(max-width:650px){.outreach-workspace{display:block;position:relative;height:calc(100vh - 155px);min-height:480px;margin:0 10px 14px}.outreach-inbox{height:100%;border-right:0}.outreach-thread{display:none;height:100%}.outreach-workspace.mobile-thread .outreach-inbox{display:none}.outreach-workspace.mobile-thread .outreach-thread{display:flex}.outreach-mobile-back{display:inline-flex!important}.outreach-actions .optional-action{display:none}.outreach-thread-head{padding:12px}.outreach-messages{padding:14px}.outreach-message{max-width:94%}.outreach-composer{padding:10px}.outreach-tabs .outreach-tab{font-size:9px}}
      `}</style>

      <aside className="outreach-inbox">
        <div className="outreach-inbox-head">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <strong style={{ color: '#243149', fontSize: 13 }}>Conversations</strong>
            <span style={{ color: '#8b95a8', fontSize: 10 }}>{filteredList.length} shown</span>
          </div>
          <div className="outreach-tabs" role="tablist" aria-label="Filter conversations">
            {tabItems.map(tab => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={`outreach-tab${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}{tab.count > 0 ? ` · ${tab.count}` : ''}</button>)}
          </div>
          <label className="outreach-search"><Search size={14}/><input aria-label="Search conversations" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search people, leads, messages"/>{searchQuery && <button aria-label="Clear search" onClick={() => setSearchQuery('')} style={{ display: 'grid', placeItems: 'center', border: 0, background: 'transparent', color: '#8a95a8', cursor: 'pointer' }}><X size={13}/></button>}</label>
        </div>
        <div className="outreach-list">
          {filteredList.length ? filteredList.map(item => {
            const selected = activeConversation?.id === item.id;
            return <button key={item.id} className={`outreach-row${selected ? ' selected' : ''}`} aria-current={selected ? 'true' : undefined} onClick={() => { onSelectConversation(item); setShowMobileList(false); }}>
              <span className="outreach-avatar" style={{ background: item.avatarBg, color: item.avatarColor }}>{initials(item.contactName)}</span>
              <span className="outreach-row-main">
                <span className="outreach-row-top"><strong className="outreach-row-name">{item.contactName}</strong><time className="outreach-row-time">{item.lastMessageTime}</time></span>
                <span className="outreach-row-company">{item.companyName}{item.leadId ? ' · Linked lead' : ''}</span>
                <span className="outreach-row-subject">{item.subject || '(No subject)'}</span>
                <span className="outreach-row-snippet">{item.lastMessageSnippet || 'No message preview available'}</span>
              </span>
              {item.unread && <span aria-label="Unread" style={{ width: 7, height: 7, marginTop: 5, borderRadius: '50%', background: '#4f46d7', flexShrink: 0 }}/ >}
            </button>;
          }) : <div className="outreach-empty"><div><Inbox size={24} style={{ margin: '0 auto 10px', color: '#a4adbc' }}/><div>No conversations match this view.</div></div></div>}
        </div>
      </aside>

      {activeConversation ? <>
        <main className="outreach-thread">
          <header className="outreach-thread-head">
            <button className="outreach-action outreach-mobile-back" onClick={() => setShowMobileList(true)} style={{ display: 'none' }}>← Inbox</button>
            <div className="outreach-thread-person"><span className="outreach-avatar" style={{ width: 40, height: 40, flexBasis: 40, fontSize: 12, background: activeConversation.avatarBg, color: activeConversation.avatarColor }}>{initials(activeConversation.contactName)}</span><div className="outreach-thread-meta"><strong>{activeConversation.contactName}<span style={{ color: '#7e899d', fontWeight: 500 }}> · {activeConversation.contactRole || 'Contact'}</span></strong><span>{activeConversation.companyName} · {activeConversation.email || 'No email on file'}</span></div></div>
            <div className="outreach-actions">
              <button className="outreach-action optional-action" onClick={() => onNavigateToResearch(activeConversation.companyName)} title="Open company research"><Building2 size={13}/><span>Research</span></button>
              <button className="outreach-action optional-action" onClick={() => onScheduleMeetingFromOutreach(activeConversation)} title="Schedule a meeting"><CalendarDays size={13}/><span>Meeting</span></button>
              <button className="outreach-action primary optional-action" onClick={() => onCreateDealFromOutreach(activeConversation)} title="Open pipeline"><Kanban size={13}/><span>Pipeline</span></button>
              <button className="outreach-action" aria-label="More conversation actions" title="More actions"><MoreHorizontal size={15}/></button>
            </div>
          </header>

          {activeConversation.leadId ? <div className="outreach-linked-banner"><Check size={13} color="#45845c"/><span>Linked to lead</span><strong>{activeConversation.leadId.slice(0, 8)}</strong><span>· {activeConversation.researchReportId ? 'saved research attached' : 'research not attached'}</span></div> : <div className="outreach-linked-banner"><AlertCircle size={13} color="#b87927"/><span>This conversation is not linked to a lead.</span></div>}

          {(activeConversation.deliveryStatus === 'failed' || activeConversation.deliveryStatus === 'unknown' || activeConversation.deliveryStatus === 'sending') && <div role="alert" className="outreach-status-banner" style={{ background: activeConversation.deliveryStatus === 'failed' ? '#fff3f2' : '#fff9eb', color: activeConversation.deliveryStatus === 'failed' ? '#9b3026' : '#855a12' }}>{activeConversation.deliveryStatus === 'failed' ? `Gmail rejected this message${activeConversation.deliveryError ? `: ${activeConversation.deliveryError}` : '. It was not marked sent.'}` : activeConversation.deliveryStatus === 'unknown' ? 'Gmail delivery is unconfirmed. Check Gmail Sent before retrying.' : 'Gmail is processing this send attempt.'}</div>}

          <div className="outreach-messages">
            {activeConversation.thread.length ? activeConversation.thread.map(message => {
              const mine = message.sender === 'me';
              return <article className={`outreach-message ${mine ? 'mine' : 'theirs'}`} key={message.id}>
                <div className="outreach-message-meta"><strong>{message.senderName || (mine ? 'You' : activeConversation.contactName)}</strong><time>{formatDate(message.timestamp)}</time><span>· {message.channel}</span></div>
                <div className="outreach-message-bubble">{emailBodyText(message.content) || 'This message has no readable text body.'}</div>
                {mine && <div className="outreach-delivery">{message.deliveryStatus === 'failed' ? <><AlertCircle size={11} color="#b83226"/> Failed to send</> : message.deliveryStatus === 'unknown' ? <><AlertCircle size={11} color="#ad7719"/> Delivery unconfirmed</> : message.deliveryStatus === 'sending' ? <><Clock3 size={11}/> Sending…</> : message.deliveryStatus === 'sent' ? <><CheckCheck size={11}/> Sent</> : null}</div>}
              </article>;
            }) : <div className="outreach-empty">No messages are attached to this conversation yet.</div>}
            <div ref={messagesEndRef}/>
          </div>

          <form className="outreach-composer" onSubmit={handleSend}>
            <div className="outreach-composer-to"><Mail size={12}/><span>Reply via {activeConversation.channel}</span><span>·</span><span>{activeConversation.email || 'No recipient address'}</span>{activeConversation.channel === 'email' && activeConversation.emailStatus === 'verified' && <><Check size={12} color="#198454"/><span style={{ color: '#198454' }}>Verified</span></>}</div>
            <textarea aria-label="Write a reply" placeholder="Write a reply to this conversation…" value={replyText} onChange={event => setReplyText(event.target.value)} disabled={sending}/>
            <div className="outreach-composer-bottom"><span style={{ color: '#8994a7', fontSize: 9 }}>Review your message before sending.</span><button className="outreach-send" type="submit" disabled={sending || !replyText.trim() || (activeConversation.channel === 'email' && (!activeConversation.email || activeConversation.emailStatus !== 'verified'))}><Send size={13}/>{sending ? 'Sending…' : 'Send reply'}</button></div>
          </form>
        </main>

        <aside className="outreach-context">
          <section className="outreach-context-card">
            <div className="outreach-context-title"><Building2 size={13}/>Company</div>
            <div style={{ fontWeight: 750, color: '#29364d', fontSize: 12 }}>{activeConversation.companyName}</div>
            {activeConversation.domain && <a className="outreach-evidence" href={`https://${activeConversation.domain}`} target="_blank" rel="noreferrer">{activeConversation.domain} <ArrowUpRight size={11}/></a>}
            <div className="outreach-context-foot">Conversation channel: {activeConversation.channel}{activeConversation.campaignName ? ` · ${activeConversation.campaignName}` : ''}</div>
          </section>

          <section className="outreach-context-card">
            <div className="outreach-context-title"><UserRound size={13}/>Lead & contact</div>
            {activeConversation.leadId ? <>
              <div className="outreach-context-value"><strong>{leadContext?.lead.companyName || activeConversation.companyName}</strong></div>
              <div className="outreach-context-foot">Lead ID · {activeConversation.leadId}</div>
              {leadContext?.lead.status && <div className="outreach-context-foot">Status · {leadContext.lead.status}</div>}
              {leadContext?.lead.score !== undefined && <div className="outreach-context-foot">Lead score · {leadContext.lead.score}</div>}
              {(leadContext?.lead.summary || leadContext?.lead.reason) && <p className="outreach-context-value" style={{ margin: '10px 0 0' }}>{leadContext.lead.summary || leadContext.lead.reason}</p>}
            </> : <div className="outreach-context-value">No saved lead is linked to this conversation.</div>}
            <div style={{ borderTop: '1px solid #eef0f4', marginTop: 11, paddingTop: 10 }}>
              <div style={{ color: '#303d54', fontSize: 11, fontWeight: 700 }}>{activeConversation.contactName}</div>
              <div className="outreach-context-foot">{activeConversation.contactRole || 'Role not provided'}</div>
              <div className="outreach-context-value" style={{ marginTop: 7 }}>{activeConversation.email || 'Email not provided'}</div>
              {activeConversation.channel === 'email' && <div className="outreach-context-foot" style={{ color: activeConversation.emailStatus === 'verified' ? '#198454' : '#a35d20' }}>{activeConversation.emailStatus === 'verified' ? 'Email verified' : activeConversation.emailStatus === 'unverified' ? 'Email not verified' : 'Email address not found'}</div>}
              {activeConversation.phone && <div className="outreach-context-foot">{activeConversation.phone}</div>}
            </div>
          </section>

          <section className="outreach-context-card">
            <div className="outreach-context-title"><FileText size={13}/>Saved research</div>
            {contextLoading ? <div className="outreach-context-foot">Loading the lead’s saved research…</div> : contextError ? <div className="outreach-context-foot" role="status">{contextError}</div> : leadContext?.report ? <>
              <div className="outreach-context-value" style={{ maxHeight: 136, overflow: 'auto' }}>{leadContext.report.text || 'No research summary was saved.'}</div>
              <div className="outreach-context-foot">Evidence sources · {leadContext.report.sources.length}</div>
              {leadContext.report.sources.slice(0, 5).map((source, index) => <a className="outreach-evidence" key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer">{source.title || source.url} <ArrowUpRight size={11}/></a>)}
            </> : activeConversation.researchReportId ? <div className="outreach-context-foot">A research report is linked. Its details could not be loaded.</div> : <div className="outreach-context-value">No saved research is linked to this lead.</div>}
            {leadContext?.lead.id && <button className="outreach-action" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => onNavigateToResearch(leadContext.lead.companyName)}><FileText size={12}/>Open research</button>}
          </section>

        </aside>
      </> : <div className="outreach-empty" style={{ gridColumn: '2 / 4' }}><div><Inbox size={28} style={{ margin: '0 auto 12px', color: '#a4adbc' }}/><div style={{ color: '#44516a', fontWeight: 700 }}>No conversation selected</div><div style={{ marginTop: 5 }}>Choose a conversation from the inbox to see messages and lead context.</div></div></div>}
    </div>
  );
};
