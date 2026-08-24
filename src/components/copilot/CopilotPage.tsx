import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { CopilotSidebar } from './CopilotSidebar';
import { CopilotWelcome } from './CopilotWelcome';
import { CopilotInputBar } from './CopilotInputBar';
import { ActionCard } from './ActionCard';
import type { ActionCardData } from './ActionCard';
import { OpportunityCard } from './OpportunityCard';
import type { OpportunityCardData } from './OpportunityCard';
import { EvidenceDrawer } from './EvidenceDrawer';
import { CompanyResearchModal } from '../dashboard/CompanyResearchModal';
import { 
  Bot, 
  Trash2, 
  ChevronDown, 
  Menu, 
  Brain, 
  Zap, 
  Microscope, 
  CheckCircle, 
  Copy 
} from 'lucide-react';
import { copilotEngine } from '../../engine';

interface CopilotPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  text: string;
  actionCard?: ActionCardData;
  opportunities?: OpportunityCardData[];
  crmConfirmation?: {
    company: string;
    stage: string;
    dealValue: string;
    isConfirmed: boolean;
  };
  outreachDraft?: {
    target: string;
    company: string;
    subject: string;
    body: string;
  };
}

export const CopilotPage: React.FC<CopilotPageProps> = ({ onNavigate, onGoToOnboarding }) => {
  const [currentChatId, setCurrentChatId] = useState('chat-1');
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<'fast' | 'reasoning' | 'research'>('reasoning');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Inspection drawers
  const [inspectingEvidence, setInspectingEvidence] = useState<OpportunityCardData | null>(null);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);

  // Messages list state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'user',
      timestamp: '10:42 AM',
      text: 'Which prospects should I contact today?'
    },
    {
      id: 'm-2',
      sender: 'bot',
      timestamp: '10:42 AM',
      text: 'I queried our continuous market radar and cross-referenced your **Peak Consulting ICP** (HR Strategy, $25K deals). I found **7 high-priority opportunities** with recent timing triggers. Here are the top 3 with immediate buying intent:',
      opportunities: [
        {
          id: 'opp-1',
          rank: 1,
          name: 'Acme Technologies',
          score: 94,
          badge: 'HOT',
          industry: 'Technology & Cloud',
          location: 'Lagos, Nigeria',
          size: '250–500 employees',
          whyNow: 'Hiring 38 new employees + opened second office + appointed new COO 18 days ago.',
          evidence: ['38 new job postings', 'New Abuja office', 'COO addition'],
          bestContact: {
            name: 'Jane Smith',
            role: 'Head of People',
            confidence: '94%'
          }
        },
        {
          id: 'opp-2',
          rank: 2,
          name: 'FinServe Ltd',
          score: 91,
          badge: 'HOT',
          industry: 'Financial Services',
          location: 'Lagos, Nigeria',
          size: '200–500 employees',
          whyNow: 'Announced geographic expansion into Ghana & Kenya + closed $8M Growth round.',
          evidence: ['Regional expansion', 'Funding round', 'HR Director role opened'],
          bestContact: {
            name: 'Michael Okoro',
            role: 'HR Director',
            confidence: '91%'
          }
        },
        {
          id: 'opp-3',
          rank: 3,
          name: 'Delta Systems',
          score: 87,
          badge: 'HIGH',
          industry: 'Software Infrastructure',
          location: 'Abuja, Nigeria',
          size: '100–250 employees',
          whyNow: 'Active research detected on management scaling frameworks in last 7 days.',
          evidence: ['Intent surge', 'Series A completion', 'CTO hiring'],
          bestContact: {
            name: 'David Jonah',
            role: 'CTO / Co-Founder',
            confidence: '88%'
          }
        }
      ]
    }
  ]);

  const handleSendMessage = (inputText: string) => {
    const userMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    setTimeout(() => {
      const result = copilotEngine.executePrompt(inputText);
      let botMsg: Message;

      if (result.intent === 'SEARCH') {
        botMsg = {
          id: `m-bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.message,
          actionCard: {
            id: `act-${Date.now()}`,
            type: 'search',
            status: 'proposed',
            title: `Prospect Search: ${result.companies?.length || 4} Matched Accounts`,
            parameters: {
              industry: 'Target ICP Sectors',
              location: 'West Africa & Global Hubs',
              size: '50 – 500 employees',
              signals: ['Hiring Surge', 'Expansion & Regional Licensing']
            }
          },
          opportunities: result.companies?.map((c, idx) => ({
            id: c.id,
            rank: idx + 1,
            name: c.name,
            score: c.opportunityScore,
            badge: c.opportunityScore >= 90 ? 'HOT' : 'HIGH',
            industry: c.industry,
            location: c.location,
            size: `${c.employees} employees`,
            whyNow: c.activeSignals?.[0]?.title || 'Active expansion triggers detected.',
            evidence: c.activeSignals?.map(s => s.title) || ['Hiring spike', 'Funding momentum'],
            bestContact: {
              name: 'Head of Operations',
              role: 'Decision Maker',
              confidence: '94%'
            }
          }))
        };
      } else if (result.intent === 'RESEARCH' && result.researchData) {
        const d = result.researchData;
        botMsg = {
          id: `m-bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.message,
          opportunities: [
            {
              id: d.company.id,
              rank: 1,
              name: d.company.name,
              score: d.company.opportunityScore,
              badge: 'HOT',
              industry: d.company.industry,
              location: d.company.location,
              size: `${d.company.employees} employees`,
              whyNow: d.executiveSummary,
              evidence: d.painPoints.slice(0, 3),
              bestContact: {
                name: d.decisionMakers[0]?.name || 'Jane Smith',
                role: d.decisionMakers[0]?.role || 'Head of People',
                confidence: `${d.decisionMakers[0]?.confidence || 94}%`
              }
            }
          ]
        };
      } else if (result.intent === 'OUTREACH' && result.outreachData) {
        botMsg = {
          id: `m-bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.message,
          outreachDraft: {
            target: 'Babafemi Lawson (Head of People & Ops)',
            company: 'Paystack',
            subject: result.outreachData.email.subject,
            body: result.outreachData.email.body
          }
        };
      } else if (result.intent === 'CRM_ACTION') {
        botMsg = {
          id: `m-bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.message,
          crmConfirmation: {
            company: 'Paystack',
            stage: 'Qualified Pipeline',
            dealValue: '$18,000 ARR',
            isConfirmed: true
          }
        };
      } else if (result.intent === 'PRIORITIZE' && result.companies) {
        botMsg = {
          id: `m-bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.message,
          opportunities: result.companies.map((c, idx) => ({
            id: c.id,
            rank: idx + 1,
            name: c.name,
            score: c.opportunityScore,
            badge: c.opportunityScore >= 90 ? 'HOT' : 'HIGH',
            industry: c.industry,
            location: c.location,
            size: `${c.employees} employees`,
            whyNow: c.activeSignals?.[0]?.title || 'Recent high-intent trigger detected.',
            evidence: c.activeSignals?.map(s => s.title) || ['Hiring spike', 'Expansion'],
            bestContact: {
              name: 'Executive Contact',
              role: 'Head of Department',
              confidence: '92%'
            }
          }))
        };
      } else {
        botMsg = {
          id: `m-bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.message
        };
      }

      setMessages((prev) => [...prev, botMsg]);
      setIsLoading(false);
    }, 600);
  };

  const handleExecuteAction = (actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.actionCard && msg.actionCard.id === actionId) {
          return {
            ...msg,
            actionCard: {
              ...msg.actionCard,
              status: 'running'
            }
          };
        }
        return msg;
      })
    );

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.actionCard && msg.actionCard.id === actionId) {
            return {
              ...msg,
              actionCard: {
                ...msg.actionCard,
                status: 'completed',
                results: {
                  totalFound: 50,
                  highIntent: 14,
                  hotOpportunities: 6
                }
              }
            };
          }
          return msg;
        })
      );
    }, 1200);
  };

  const handleConfirmCrm = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.crmConfirmation) {
          return {
            ...m,
            crmConfirmation: {
              ...m.crmConfirmation,
              isConfirmed: true
            }
          };
        }
        return m;
      })
    );
  };

  const handleCopyDraft = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraftId(id);
    setTimeout(() => setCopiedDraftId(null), 2000);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f4f6fa',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Left Global Navigation Sidebar */}
      <DashboardSidebar
        activeNav="copilot"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Inner Conversation History Sidebar (Collapsible) */}
      {isHistoryOpen && (
        <CopilotSidebar
          currentChatId={currentChatId}
          onSelectChat={(id) => setCurrentChatId(id)}
          onNewChat={() => {
            setMessages([]);
            setCurrentChatId(`chat-${Date.now()}`);
          }}
        />
      )}

      {/* Main Chat Canvas Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#ffffff',
        overflow: 'hidden'
      }}>
        {/* Top Chat Bar */}
        <header style={{
          height: '60px',
          padding: '0 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          {/* Left Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              title={isHistoryOpen ? 'Hide History' : 'Show History'}
              style={{
                background: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#475569',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Menu size={16} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  AI Sales Copilot
                </h1>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  backgroundColor: '#ede9fe',
                  color: '#6d28d9',
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  Autonomous Agent
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Context: Peak Consulting (HR Strategy • $25K Deal Size • Lagos & US)
              </span>
            </div>
          </div>

          {/* Right Model Selector & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Model Router Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                {selectedModel === 'reasoning' && <Brain size={14} color="#7c3aed" />}
                {selectedModel === 'fast' && <Zap size={14} color="#d97706" />}
                {selectedModel === 'research' && <Microscope size={14} color="#0284c7" />}
                <span>
                  {selectedModel === 'reasoning' ? 'Reasoning Model (Deep Intent)' : selectedModel === 'fast' ? 'Fast Hunter (Low Latency)' : '360° Research Agent'}
                </span>
                <ChevronDown size={13} color="#94a3b8" />
              </button>

              {isModelDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 40,
                  minWidth: '220px',
                  overflow: 'hidden'
                }}>
                  {[
                    { id: 'reasoning', label: 'Reasoning Model', desc: 'Deep strategic timing & opportunity scoring', icon: <Brain size={14} color="#7c3aed" /> },
                    { id: 'fast', label: 'Fast Hunter', desc: 'Instant filters & prospect lookups', icon: <Zap size={14} color="#d97706" /> },
                    { id: 'research', label: '360° Research Agent', desc: 'Multi-source dossier compilation', icon: <Microscope size={14} color="#0284c7" /> },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id as any);
                        setIsModelDropdownOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: selectedModel === m.id ? '#f5f3ff' : 'transparent',
                        borderBottom: '1px solid #f8fafc'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        {m.icon}
                        <span>{m.label}</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                        {m.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setMessages([])}
              title="Clear conversation"
              style={{
                background: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </header>

        {/* Chat Messages Body Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {messages.length === 0 ? (
            <CopilotWelcome onSelectPrompt={handleSendMessage} />
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '12px'
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                    marginTop: '2px'
                  }}>
                    <Bot size={18} />
                  </div>
                )}

                <div style={{
                  maxWidth: '780px',
                  width: msg.opportunities || msg.actionCard || msg.outreachDraft || msg.crmConfirmation ? '100%' : 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {/* Bubble Content */}
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: msg.sender === 'user' ? '#4f46e5' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                    border: msg.sender === 'user' ? 'none' : '1px solid #eaecf0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    fontSize: '13.5px',
                    lineHeight: 1.55
                  }}>
                    <div dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />

                    {/* Action Card Render */}
                    {msg.actionCard && (
                      <ActionCard
                        action={msg.actionCard}
                        onExecute={handleExecuteAction}
                        onViewResults={() => onNavigate('opportunities')}
                      />
                    )}

                    {/* Structured Opportunities Grid / List */}
                    {msg.opportunities && msg.opportunities.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                        {msg.opportunities.map((opp) => (
                          <OpportunityCard
                            key={opp.id}
                            opp={opp}
                            onViewCompany={(name) => setResearchedCompany(name)}
                            onDraftOutreach={(o) => handleSendMessage(`Draft a personalized outreach email for ${o.name}.`)}
                            onViewEvidence={(o) => setInspectingEvidence(o)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Outreach Draft Card */}
                    {msg.outreachDraft && (
                      <div style={{
                        marginTop: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                            To: {msg.outreachDraft.target}
                          </span>
                          <button
                            onClick={() => handleCopyDraft(msg.id, msg.outreachDraft!.body)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            <Copy size={12} />
                            <span>{copiedDraftId === msg.id ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                          {msg.outreachDraft.subject}
                        </div>
                        <pre style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '12px',
                          color: '#334155',
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit',
                          lineHeight: 1.5,
                          margin: 0
                        }}>
                          {msg.outreachDraft.body}
                        </pre>
                      </div>
                    )}

                    {/* CRM Confirmation Card */}
                    {msg.crmConfirmation && (
                      <div style={{
                        marginTop: '12px',
                        backgroundColor: msg.crmConfirmation.isConfirmed ? '#ecfdf5' : '#f8fafc',
                        border: `1px solid ${msg.crmConfirmation.isConfirmed ? '#a7f3d0' : '#cbd5e1'}`,
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                            {msg.crmConfirmation.company} → Stage: {msg.crmConfirmation.stage}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {msg.crmConfirmation.isConfirmed ? 'CRM pipeline deal record updated successfully.' : 'Consequential Action: Requires verification.'}
                          </div>
                        </div>

                        {msg.crmConfirmation.isConfirmed ? (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#059669',
                            fontSize: '12px',
                            fontWeight: 700
                          }}>
                            <CheckCircle size={15} />
                            Updated
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirmCrm(msg.id)}
                            style={{
                              backgroundColor: '#4f46e5',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 14px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Confirm Update
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span style={{
                    fontSize: '10.5px',
                    color: '#94a3b8',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    padding: '0 4px'
                  }}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#6366f1', fontSize: '13px', paddingLeft: '44px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1', animation: 'ping 1s infinite' }} />
              <span>HUNTIQ Copilot is scanning the intelligence graph...</span>
            </div>
          )}
        </div>

        {/* Floating Bottom Input Bar */}
        <CopilotInputBar
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Evidence Drawer for Score Inspection */}
      <EvidenceDrawer
        opp={inspectingEvidence}
        onClose={() => setInspectingEvidence(null)}
      />

      {/* 360° Company Intelligence Report Modal */}
      <CompanyResearchModal
        companyName={researchedCompany}
        onClose={() => setResearchedCompany(null)}
      />
    </div>
  );
};
